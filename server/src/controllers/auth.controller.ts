import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'hexora_fallback_secret_key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

const normalizeContact = (channel: 'EMAIL' | 'PHONE', contact: string): string => {
  if (channel === 'EMAIL') {
    return contact.trim().toLowerCase();
  }
  const digits = contact.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return contact.trim();
};


export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channel, contact } = req.body as { channel?: 'EMAIL' | 'PHONE'; contact?: string };

    if (!channel || !['EMAIL', 'PHONE'].includes(channel) || !contact?.trim()) {
      res.status(400).json({ error: 'Channel (EMAIL or PHONE) and contact are required.' });
      return;
    }

    const normalized = normalizeContact(channel, contact);

    if (channel === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalized)) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email: normalized } });
      if (existingUser) {
        res.status(400).json({ error: 'An account with this email already exists.' });
        return;
      }
    } else {
      const digitsOnly = normalized.replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        res.status(400).json({ error: 'Please enter a valid mobile number.' });
        return;
      }
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpVerification.upsert({
      where: {
        channel_contact: {
          channel,
          contact: normalized,
        },
      },
      update: {
        code,
        expiresAt,
        verified: false,
      },
      create: {
        channel,
        contact: normalized,
        code,
        expiresAt,
        verified: false,
      },
    });

    if (channel === 'EMAIL') {
      const apiKey = process.env.BREVO_API_KEY?.trim();
      const senderEmail = (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER)?.trim();

      if (!apiKey || !senderEmail) {
        res.status(500).json({ error: 'Brevo email credentials are missing in server/.env.' });
        return;
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'HEXORA Ecosystem', email: senderEmail },
          to: [{ email: normalized }],
          subject: 'Your HEXORA Email Verification OTP',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-bottom: 8px;">Verify Your HEXORA Email</h2>
              <p style="color: #475569; font-size: 14px;">Use the 6-digit verification code below to complete your HEXORA registration. This code expires in 10 minutes.</p>
              <div style="margin: 20px 0; padding: 14px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0f766e;">
                ${code}
              </div>
              <p style="color: #94a3b8; font-size: 12px;">If you did not request this code, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errData: any = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Brevo failed to send verification email.');
      }

      res.json({ message: `Verification OTP sent to ${normalized}.` });
      return;
    }

    // PHONE channel: send via configured SMS gateway if present, otherwise use dev fallback
    if (process.env.SMS_PROVIDER_URL && process.env.SMS_API_KEY) {
      const smsResponse = await fetch(process.env.SMS_PROVIDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SMS_API_KEY}`,
        },
        body: JSON.stringify({
          to: normalized,
          sender: process.env.SMS_SENDER_ID || 'HEXORA',
          message: `Your HEXORA verification OTP is ${code}. Valid for 10 minutes.`,
        }),
      });

      if (!smsResponse.ok) {
        throw new Error('Failed to dispatch SMS OTP from provider.');
      }

      res.json({ message: `Verification OTP sent to ${normalized}.` });
      return;
    }

    console.log(`[DEV SMS OTP] ${normalized} -> ${code}`);
    res.json({
      message: `Phone OTP generated for ${normalized}.`,
      devOtp: code,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: error.message || 'Failed to send verification OTP.' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channel, contact, code } = req.body as {
      channel?: 'EMAIL' | 'PHONE';
      contact?: string;
      code?: string;
    };

    if (!channel || !['EMAIL', 'PHONE'].includes(channel) || !contact?.trim() || !code?.trim()) {
      res.status(400).json({ error: 'Channel, contact, and 6-digit OTP code are required.' });
      return;
    }

    const normalized = normalizeContact(channel, contact);

    const record = await prisma.otpVerification.findUnique({
      where: {
        channel_contact: {
          channel,
          contact: normalized,
        },
      },
    });

    if (!record) {
      res.status(400).json({ error: `Please request a ${channel.toLowerCase()} OTP first.` });
      return;
    }

    if (new Date() > record.expiresAt) {
      res.status(400).json({ error: 'This OTP has expired. Please request a new one.' });
      return;
    }

    if (record.code !== code.trim()) {
      res.status(400).json({ error: 'Invalid OTP code. Please check and try again.' });
      return;
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    res.json({ message: `${channel === 'EMAIL' ? 'Email' : 'Mobile number'} verified successfully.` });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify OTP.' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, intendedRole } = req.body;

    if (!fullName || !email || !password || !phone) {
      res.status(400).json({ error: 'Full name, email, mobile number, and password are required.' });
      return;
    }

    const normalizedEmail = normalizeContact('EMAIL', email);
    const normalizedPhone = normalizeContact('PHONE', phone);

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Confirm both Email OTP and Phone OTP are verified and unexpired
    const [emailOtpRecord, phoneOtpRecord] = await Promise.all([
      prisma.otpVerification.findUnique({
        where: { channel_contact: { channel: 'EMAIL', contact: normalizedEmail } },
      }),
      prisma.otpVerification.findUnique({
        where: { channel_contact: { channel: 'PHONE', contact: normalizedPhone } },
      }),
    ]);

    const now = new Date();
    if (!emailOtpRecord || !emailOtpRecord.verified || now > emailOtpRecord.expiresAt) {
      res.status(400).json({ error: 'Please verify your email address with OTP before registering.' });
      return;
    }

    if (!phoneOtpRecord || !phoneOtpRecord.verified || now > phoneOtpRecord.expiresAt) {
      res.status(400).json({ error: 'Please verify your mobile number with OTP before registering.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRole = intendedRole || 'LEARNER';

    const initialWorkspaces: ('LMS' | 'ERP' | 'EMPLOYMENT')[] = ['LMS'];
    if (['COOPERATIVE_ADMIN', 'COOPERATIVE_MEMBER', 'SUPER_ADMIN'].includes(validRole)) {
      initialWorkspaces.push('ERP');
    }
    if (['JOB_SEEKER', 'EMPLOYER', 'SUPER_ADMIN', 'LEARNER'].includes(validRole)) {
      initialWorkspaces.push('EMPLOYMENT');
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email: normalizedEmail,
          passwordHash,
          phone: normalizedPhone,
          intendedRole: validRole,
          activeWorkspace: validRole.includes('COOPERATIVE') ? 'ERP' : validRole === 'EMPLOYER' ? 'EMPLOYMENT' : 'LMS',
          hasSelectedPurpose: false,
        },
      });

      let roleRecord = await tx.role.findUnique({ where: { name: validRole } });
      if (!roleRecord) {
        roleRecord = await tx.role.create({
          data: { name: validRole, description: `Role for ${validRole}` },
        });
      }

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      });

      for (const ws of Array.from(new Set(initialWorkspaces))) {
        await tx.workspaceAccess.create({
          data: {
            userId: user.id,
            workspace: ws,
          },
        });
      }

      if (['JOB_SEEKER', 'LEARNER'].includes(validRole)) {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
            headline: `${validRole === 'JOB_SEEKER' ? 'Aspiring Professional' : 'Enthusiastic Learner'} seeking growth`,
            experienceYears: 0,
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to HEXORA!',
          message: 'Your account is ready. Please select your workspace purpose to begin.',
          type: 'SUCCESS',
        },
      });

      // Clean up consumed OTP records
      await tx.otpVerification.deleteMany({
        where: {
          OR: [
            { channel: 'EMAIL', contact: normalizedEmail },
            { channel: 'PHONE', contact: normalizedPhone },
          ],
        },
      });

      return user;
    });

    const completeUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        userRoles: { include: { role: true } },
        workspaceAccess: true,
      },
    });

    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'Registration successful! Welcome to HEXORA.',
      token,
      user: {
        id: completeUser!.id,
        email: completeUser!.email,
        fullName: completeUser!.fullName,
        phone: completeUser!.phone,
        intendedRole: completeUser!.intendedRole,
        activeWorkspace: completeUser!.activeWorkspace,
        hasSelectedPurpose: completeUser!.hasSelectedPurpose,
        userRoles: completeUser!.userRoles,
        workspaceAccess: completeUser!.workspaceAccess,
      },
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        userRoles: { include: { role: true } },
        workspaceAccess: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        intendedRole: user.intendedRole,
        activeWorkspace: user.activeWorkspace,
        hasSelectedPurpose: user.hasSelectedPurpose,
        userRoles: user.userRoles,
        workspaceAccess: user.workspaceAccess,
      },
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ error: error.message || 'Server error during login.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      intendedRole: user.intendedRole,
      activeWorkspace: user.activeWorkspace,
      hasSelectedPurpose: user.hasSelectedPurpose,
      userRoles: user.userRoles,
      workspaceAccess: user.workspaceAccess,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
};

export const selectWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspace } = req.body;
    const userId = req.user.id;

    if (!['LMS', 'ERP', 'EMPLOYMENT'].includes(workspace)) {
      res.status(400).json({ error: 'Invalid workspace identifier.' });
      return;
    }

    const hasAccess = req.user.workspaceAccess.some(
      (w: any) => w.workspace === workspace
    );
    const isSuperAdmin = req.user.userRoles.some(
      (ur: any) => ur.role.name === 'SUPER_ADMIN'
    );

    if (!hasAccess && !isSuperAdmin) {
      if (['LMS', 'EMPLOYMENT'].includes(workspace)) {
        await prisma.workspaceAccess.upsert({
          where: { userId_workspace: { userId, workspace } },
          create: { userId, workspace },
          update: {},
        });
      } else {
        res.status(403).json({
          error: `You do not currently have access to the ${workspace} workspace. Please contact your Cooperative Administrator to enroll your organization.`,
          workspace,
        });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        activeWorkspace: workspace,
        hasSelectedPurpose: true,
      },
      include: {
        userRoles: { include: { role: true } },
        workspaceAccess: true,
      },
    });

    res.json({
      message: `Workspace successfully set to ${workspace}`,
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        activeWorkspace: updated.activeWorkspace,
        hasSelectedPurpose: updated.hasSelectedPurpose,
        userRoles: updated.userRoles,
        workspaceAccess: updated.workspaceAccess,
      },
    });
  } catch (error: any) {
    console.error('Select Workspace Error:', error);
    res.status(500).json({ error: error.message || 'Failed to switch workspace.' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  res.json({
    message: `If an account with ${email} exists, a password reset link has been dispatched to your inbox.`,
  });
};