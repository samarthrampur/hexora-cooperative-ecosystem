import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceType } from '../../types';
import {
  GraduationCap,
  Building2,
  Briefcase,
  ChevronDown,
  Bell,
  LogOut,
  User,
  Sparkles,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, activeWorkspace, selectWorkspace, logout } = useAuth();
  const navigate = useNavigate();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const workspaces: {
    type: WorkspaceType;
    label: string;
    sublabel: string;
    icon: any;
    color: string;
    badgeBg: string;
    badgeText: string;
  }[] = [
    {
      type: 'LMS',
      label: 'Learning Management System',
      sublabel: 'Capacity Building & Certifications',
      icon: GraduationCap,
      color: 'text-teal-600',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-700 border-teal-200',
    },
    {
      type: 'ERP',
      label: 'Cooperative ERP',
      sublabel: 'Operations, Members & Governance',
      icon: Building2,
      color: 'text-blue-700',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-800 border-blue-200',
    },
    {
      type: 'EMPLOYMENT',
      label: 'Employment Ecosystem',
      sublabel: 'Skills, Jobs & Talent Network',
      icon: Briefcase,
      color: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700 border-emerald-200',
    },
  ];

  const currentWsConfig = workspaces.find((w) => w.type === activeWorkspace) || workspaces[0];

  const handleSwitchWorkspace = async (ws: WorkspaceType) => {
    setShowWorkspaceMenu(false);
    try {
      await selectWorkspace(ws);
      if (ws === 'LMS') navigate('/lms/dashboard');
      else if (ws === 'ERP') navigate('/erp/dashboard');
      else navigate('/employment/dashboard');
    } catch (err: any) {
      alert(err.message || 'Unable to switch workspace.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/10 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-xl tracking-wider">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  HEXORA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-600">
                  Cooperative Ecosystem
                </span>
              </div>
            </Link>

            {/* Active Workspace Pill */}
            <div className="hidden md:flex items-center ml-4">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${currentWsConfig.badgeBg} ${currentWsConfig.badgeText}`}
              >
                <currentWsConfig.icon className="w-3.5 h-3.5 mr-1.5" />
                <span>{currentWsConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center space-x-3">
            {/* Instant Workspace Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-sm"
              >
                <Layers className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Switch Workspace</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showWorkspaceMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-2 z-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Select Dedicated Workspace
                    </p>
                  </div>
                  <div className="space-y-1">
                    {workspaces.map((ws) => {
                      const isCurrent = ws.type === activeWorkspace;
                      const Icon = ws.icon;
                      return (
                        <button
                          key={ws.type}
                          onClick={() => handleSwitchWorkspace(ws.type)}
                          className={`w-full flex items-start p-2.5 rounded-lg text-left transition-colors ${
                            isCurrent
                              ? 'bg-slate-100 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg mr-3 ${
                              isCurrent ? 'bg-white shadow-sm' : 'bg-slate-100'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${ws.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-900 truncate">
                                {ws.label}
                              </span>
                              {isCurrent && (
                                <CheckCircle className="w-4 h-4 text-emerald-600 ml-1" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{ws.sublabel}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowWorkspaceMenu(false);
                        navigate('/workspace-select');
                      }}
                      className="w-full text-center py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      View Purpose Selection Cards →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Notifications
                    </span>
                    <span className="text-[11px] font-semibold text-teal-600">3 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-teal-50/70 border border-teal-100 rounded-lg">
                      <p className="font-semibold text-slate-800">🎉 Verified Skills Added!</p>
                      <p className="text-slate-600">
                        Your Agritech IoT certificate added 2 verified skills to your Job Profile.
                      </p>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <p className="font-semibold text-slate-800">📋 Q3 Audit Meeting Scheduled</p>
                      <p className="text-slate-600">
                        Green Valley Cooperative executive meeting set for this Friday.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-xs shadow-inner">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.fullName || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {user?.intendedRole?.replace('_', ' ') || 'Member'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md">
                      {user?.intendedRole}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/workspace-select');
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-teal-600" />
                      Workspace Purpose Hub
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <User className="w-4 h-4 mr-2 text-slate-500" />
                      Profile & Security
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
