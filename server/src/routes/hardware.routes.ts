import { Router } from 'express';
import { syncAttendanceFromDevice, getHardwareDevices } from '../controllers/hardware.controller';

const router = Router();

// Device Attendance Sync Endpoint (supports IoT biometric & RFID terminals)
router.post('/attendance-sync', syncAttendanceFromDevice);
router.get('/devices', getHardwareDevices);

export default router;
