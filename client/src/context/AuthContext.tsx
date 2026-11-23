import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, WorkspaceType, UserRoleType } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeWorkspace: WorkspaceType;
  login: (email: string, password: string) => Promise<User>;
  register: (formData: any) => Promise<User>;
  logout: () => void;
  selectWorkspace: (workspace: WorkspaceType) => Promise<void>;
  hasRole: (role: UserRoleType) => boolean;
  canAccessWorkspace: (workspace: WorkspaceType) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hexora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeWorkspace: WorkspaceType = (user?.activeWorkspace as WorkspaceType) || 'LMS';

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('hexora_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.get<User>('/auth/me');
      setUser(userData);
    } catch (err) {
      console.warn('Session check failed, logging out:', err);
      localStorage.removeItem('hexora_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('hexora_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData: any): Promise<User> => {
    const data = await api.post<{ token: string; user: User }>('/auth/register', formData);
    localStorage.setItem('hexora_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('hexora_token');
    setUser(null);
    setToken(null);
  };

  const selectWorkspace = async (workspace: WorkspaceType) => {
    const data = await api.post<{ user: User }>('/auth/select-workspace', { workspace });
    setUser((prev) => (prev ? { ...prev, activeWorkspace: workspace, hasSelectedPurpose: true } : data.user));
  };

  const hasRole = (role: UserRoleType): boolean => {
    if (!user) return false;
    if (user.userRoles?.some((ur) => ur.role.name === 'SUPER_ADMIN')) return true;
    return user.userRoles?.some((ur) => ur.role.name === role) || user.intendedRole === role;
  };

  const canAccessWorkspace = (workspace: WorkspaceType): boolean => {
    if (!user) return false;
    if (hasRole('SUPER_ADMIN')) return true;
    return user.workspaceAccess?.some((w) => w.workspace === workspace) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        activeWorkspace,
        login,
        register,
        logout,
        selectWorkspace,
        hasRole,
        canAccessWorkspace,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
