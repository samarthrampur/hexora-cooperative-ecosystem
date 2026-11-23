import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          The requested route does not exist in the HEXORA ecosystem.
        </p>

        <div className="mt-6">
          <Link
            to="/workspace-select"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center justify-center"
          >
            <Layers className="w-4 h-4 mr-2" />
            Go to Workspace Selection
          </Link>
        </div>
      </div>
    </div>
  );
};
