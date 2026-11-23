import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const requiredWorkspace = (location.state as any)?.requiredWorkspace || 'requested';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your account <span className="font-semibold text-slate-900">({user?.email})</span> with role{' '}
          <span className="font-semibold text-teal-600">{user?.intendedRole}</span> is not authorized to enter the{' '}
          <span className="font-bold text-slate-900">{requiredWorkspace}</span> workspace.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Purpose selection and access permissions are strictly role-governed in HEXORA to maintain organization isolation.
        </p>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => navigate('/workspace-select')}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center"
          >
            <Layers className="w-4 h-4 mr-2" />
            Return to Purpose Selection
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
