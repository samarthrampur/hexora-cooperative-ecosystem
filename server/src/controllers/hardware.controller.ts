import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const syncAttendanceFromDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceIdentifier, apiKey, syncLogs } = req.body;

    if (!deviceIdentifier || !Array.isArray(syncLogs)) {
      res.status(400).json({ error: 'Device identifier and syncLogs array are required.' });
      return;
    }

    // Verify hardware device
    const device = await prisma.hardwareDevice.findUnique({
      where: { deviceIdentifier },
      include: { cooperative: true },
    });

    if (!device) {
      res.status(401).json({ error: 'Unregistered hardware device. Access denied.' });
      return;
    }

    // Update device last sync timestamp
    await prisma.hardwareDevice.update({
      where: { id: device.id },
      data: {
        lastSyncAt: new Date(),
        status: 'ONLINE',
      },
    });

    let processedCount = 0;
    const errors: string[] = [];

    for (const log of syncLogs) {
      const { membershipId, timestamp, verificationMethod } = log;
      const logDate = new Date(timestamp || Date.now());
      const dateStr = logDate.toISOString().split('T')[0];

      // Lookup member by membershipId in this cooperative
      const member = await prisma.member.findFirst({
        where: {
          cooperativeId: device.cooperativeId,
          membershipId,
        },
      });

      if (!member) {
        errors.push(`Member ID ${membershipId} not found in cooperative ${device.cooperative.name}`);
        continue;
      }

      await prisma.attendanceRecord.upsert({
        where: {
          cooperativeId_memberId_date: {
            cooperativeId: device.cooperativeId,
            memberId: member.id,
            date: dateStr,
          },
        },
        create: {
          cooperativeId: device.cooperativeId,
          memberId: member.id,
          date: dateStr,
          status: 'PRESENT',
          checkInTime: logDate,
          verificationMethod: verificationMethod || 'BIOMETRIC_DEVICE',
          deviceId: device.id,
          notes: `Hardware sync from ${device.name}`,
        },
        update: {
          checkOutTime: logDate, // Subsequent swipe on same day updates checkOut
          deviceId: device.id,
        },
      });

      processedCount += 1;
    }

    res.json({
      message: `Successfully synchronized ${processedCount} attendance logs from device "${device.name}".`,
      processedCount,
      errors,
    });
  } catch (error: any) {
    console.error('Hardware Sync Error:', error);
    res.status(500).json({ error: error.message || 'Hardware attendance sync failed.' });
  }
};

export const getHardwareDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const devices = await prisma.hardwareDevice.findMany({
      include: {
        cooperative: { select: { name: true } },
        _count: { select: { attendanceLogs: true } },
      },
    });
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch registered hardware devices.' });
  }
};
