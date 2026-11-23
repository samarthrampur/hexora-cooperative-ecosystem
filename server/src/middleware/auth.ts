import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No authorization token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'hexora_fallback_secret_key';

    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: { role: true },
        },
        workspaceAccess: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid token. User no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Authentication failed. Invalid or expired token.' });
  }
};
