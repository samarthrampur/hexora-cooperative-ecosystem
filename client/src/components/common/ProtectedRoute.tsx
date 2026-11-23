import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceType } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredWorkspace?: WorkspaceType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredWorkspace,
}) => {
  const { user, token, isLoading, activeWorkspace, canAccessWorkspace } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Verifying HEXORA Session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if first-login purpose selection is required
  if (!user.hasSelectedPurpose && location.pathname !== '/workspace-select') {
    return <Navigate to="/workspace-select" replace />;
  }

  // Check workspace specific authorization
  if (requiredWorkspace && !canAccessWorkspace(requiredWorkspace)) {
    return <Navigate to="/access-denied" state={{ requiredWorkspace }} replace />;
  }

  return children;
};
