import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'hexora_fallback_secret_key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, intendedRole } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Full name, email, and password are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRole = intendedRole || 'LEARNER';

    // Determine initial workspace permissions based on role
    // Everyone gets LMS for capacity building.
    // ERP admins and members get ERP. Job seekers and employers get Employment.
    const initialWorkspaces: ('LMS' | 'ERP' | 'EMPLOYMENT')[] = ['LMS'];
    if (['COOPERATIVE_ADMIN', 'COOPERATIVE_MEMBER', 'SUPER_ADMIN'].includes(validRole)) {
      initialWorkspaces.push('ERP');
    }
    if (['JOB_SEEKER', 'EMPLOYER', 'SUPER_ADMIN', 'LEARNER'].includes(validRole)) {
      initialWorkspaces.push('EMPLOYMENT');
    }

    // Create user in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email: email.toLowerCase(),
          passwordHash,
          phone: phone || null,
          intendedRole: validRole,
          activeWorkspace: validRole.includes('COOPERATIVE') ? 'ERP' : validRole === 'EMPLOYER' ? 'EMPLOYMENT' : 'LMS',
          hasSelectedPurpose: false, // New users will encounter the Purpose Selection screen!
        },
      });

      // Find or create role
      let roleRecord = await tx.role.findUnique({ where: { name: validRole } });
      if (!roleRecord) {
        roleRecord = await tx.role.create({
          data: { name: validRole, description: `Role for ${validRole}` },
        });
      }

      // Assign UserRole
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      });

      // Grant initial workspace access records
      for (const ws of Array.from(new Set(initialWorkspaces))) {
        await tx.workspaceAccess.create({
          data: {
            userId: user.id,
            workspace: ws,
          },
        });
      }

      // If registered as Job Seeker or Learner, initialize Candidate Profile
      if (['JOB_SEEKER', 'LEARNER'].includes(validRole)) {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
            headline: `${validRole === 'JOB_SEEKER' ? 'Aspiring Professional' : 'Enthusiastic Learner'} seeking growth`,
            experienceYears: 0,
          },
        });
      }

      // Send initial welcome notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to HEXORA!',
          message: 'Your account is ready. Please select your workspace purpose to begin.',
          type: 'SUCCESS',
        },
      });

      return user;
    });

    // Fetch complete user with roles
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

    // Check authorization
    const hasAccess = req.user.workspaceAccess.some(
      (w: any) => w.workspace === workspace
    );
    const isSuperAdmin = req.user.userRoles.some(
      (ur: any) => ur.role.name === 'SUPER_ADMIN'
    );

    if (!hasAccess && !isSuperAdmin) {
      // Auto-grant or check permission policy
      // If a learner or member wants employment or LMS, we can grant access
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

    // Update active workspace and mark purpose selected
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
  // Demo safe forgot password
  res.json({
    message: `If an account with ${email} exists, a password reset link has been dispatched to your inbox.`,
  });
};
