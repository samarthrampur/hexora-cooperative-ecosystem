import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const requireWorkspace = (requiredWorkspace: 'LMS' | 'ERP' | 'EMPLOYMENT') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const hasAccess = req.user.workspaceAccess.some(
      (w: any) => w.workspace === requiredWorkspace
    );

    // Super Admin has universal access
    const isSuperAdmin = req.user.userRoles.some(
      (ur: any) => ur.role.name === 'SUPER_ADMIN'
    );

    if (!hasAccess && !isSuperAdmin) {
      res.status(403).json({
        error: `Access Denied. You do not have permissions to access the ${requiredWorkspace} workspace. Please contact your organization administrator to request access.`,
        workspace: requiredWorkspace,
      });
      return;
    }

    next();
  };
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const userRoles = req.user.userRoles.map((ur: any) => ur.role.name);
    
    // Super Admin bypass
    if (userRoles.includes('SUPER_ADMIN')) {
      return next();
    }

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        error: `Unauthorized action. Required roles: ${allowedRoles.join(', ')}`,
        currentRoles: userRoles,
      });
      return;
    }

    next();
  };
};
