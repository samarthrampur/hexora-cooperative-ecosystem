import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Shield, Layers, Award } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <User className="w-6 h-6 mr-2 text-teal-600" />
          Centralized Account Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Unified user credentials shared across LMS, Cooperative ERP, and Employment workspaces.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{user?.fullName}</h2>
            <p className="text-xs text-slate-500 flex items-center mt-0.5">
              <Mail className="w-3.5 h-3.5 mr-1" />
              {user?.email}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-bold bg-teal-50 text-teal-800 rounded-md border border-teal-200">
              Role: {user?.intendedRole}
            </span>
          </div>
        </div>

        {/* Workspace Authorizations */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
            <Layers className="w-4 h-4 mr-1 text-teal-600" />
            Authorized Workspaces
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['LMS', 'ERP', 'EMPLOYMENT'].map((ws) => {
              const hasAccess = user?.workspaceAccess?.some((w) => w.workspace === ws);
              return (
                <div
                  key={ws}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    hasAccess
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <span className="text-xs font-extrabold text-slate-900">{ws} Workspace</span>
                  <span
                    className={`mt-2 text-[10px] font-bold ${
                      hasAccess ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {hasAccess ? '✓ Authorized' : 'No Permission'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
