import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceType } from '../../types';
import {
  GraduationCap,
  Building2,
  Briefcase,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const PurposeSelectionScreen: React.FC = () => {
  const { user, selectWorkspace, canAccessWorkspace } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<WorkspaceType | null>(user?.activeWorkspace || null);
  const [loading, setLoading] = useState(false);
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);

  const cards: {
    type: WorkspaceType;
    title: string;
    description: string;
    icon: any;
    themeBorder: string;
    themeHover: string;
    themeAccent: string;
    themeBg: string;
    btnLabel: string;
    badge: string;
    stats: string;
  }[] = [
    {
      type: 'LMS',
      title: 'Learning Management System',
      description:
        'Develop your knowledge, acquire new skills, access structured learning programmes, complete assessments and track your educational progress.',
      icon: GraduationCap,
      themeBorder: 'hover:border-teal-500 hover:shadow-teal-500/10',
      themeHover: 'group-hover:bg-teal-50 group-hover:text-teal-600',
      themeAccent: 'text-teal-600',
      themeBg: 'bg-teal-500',
      btnLabel: 'Enter Learning Workspace',
      badge: 'Capacity Building',
      stats: 'Courses, Quizzes & Verified Badges',
    },
    {
      type: 'ERP',
      title: 'Cooperative Management',
      description:
        'Manage cooperative activities, organize members, coordinate responsibilities, maintain organizational records and monitor operational performance.',
      icon: Building2,
      themeBorder: 'hover:border-blue-600 hover:shadow-blue-600/10',
      themeHover: 'group-hover:bg-blue-50 group-hover:text-blue-700',
      themeAccent: 'text-blue-700',
      themeBg: 'bg-blue-700',
      btnLabel: 'Enter Management Workspace',
      badge: 'Cooperative ERP',
      stats: 'Directory, Attendance, Finance & Hardware Sync',
    },
    {
      type: 'EMPLOYMENT',
      title: 'Employment and Careers',
      description:
        'Discover employment opportunities, build your professional profile, identify your skills, connect with employers and find career opportunities.',
      icon: Briefcase,
      themeBorder: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      themeHover: 'group-hover:bg-emerald-50 group-hover:text-emerald-600',
      themeAccent: 'text-emerald-600',
      themeBg: 'bg-emerald-600',
      btnLabel: 'Enter Employment Workspace',
      badge: 'Talent Ecosystem',
      stats: 'AI Job Matching & Skill Gap Analysis',
    },
  ];

  const handleSelectWorkspace = async (workspace: WorkspaceType) => {
    setSelected(workspace);
    setDeniedMessage(null);

    // Validate access permission
    if (!canAccessWorkspace(workspace)) {
      setDeniedMessage(
        `Your user account (${user?.email}) is not currently assigned to the ${workspace} workspace. Please contact your administrator or request an enrollment elevation.`
      );
      return;
    }

    try {
      setLoading(true);
      await selectWorkspace(workspace);

      // Redirect into the designated workspace environment
      if (workspace === 'LMS') {
        navigate('/lms/dashboard');
      } else if (workspace === 'ERP') {
        navigate('/erp/dashboard');
      } else {
        navigate('/employment/dashboard');
      }
    } catch (err: any) {
      setDeniedMessage(err.message || 'Failed to initialize workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Branding & Purpose Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Purpose-Based Workspace Selection</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">HEXORA</span>. What is your purpose for using our platform?
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
          Choose the workspace that best matches what you want to accomplish. You will enter a dedicated environment designed for your needs.
        </p>
      </div>

      {deniedMessage && (
        <div className="max-w-3xl mx-auto w-full mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start space-x-3 shadow-lg">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-bold">Workspace Access Notice</p>
            <p className="mt-0.5 text-xs text-amber-200/90">{deniedMessage}</p>
          </div>
        </div>
      )}

      {/* 3 Large Interactive Purpose Cards */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = selected === card.type;
          const hasAccess = canAccessWorkspace(card.type);

          return (
            <div
              key={card.type}
              onClick={() => handleSelectWorkspace(card.type)}
              className={`group relative bg-white/95 backdrop-blur-md rounded-2xl p-7 shadow-xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-500 ring-4 ring-teal-500/20 scale-[1.02]'
                  : `border-slate-200/80 ${card.themeBorder} hover:-translate-y-1`
              }`}
            >
              {/* Card Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                  {card.badge}
                </span>
                {!hasAccess && (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Requires Role
                  </span>
                )}
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-teal-600 animate-in zoom-in" />
                )}
              </div>

              {/* Icon & Title */}
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-5 transition-colors duration-200 ${card.themeHover}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-slate-950 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed min-h-[5rem]">
                  {card.description}
                </p>
              </div>

              {/* Sub-features & Enter Button */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2"></span>
                  {card.stats}
                </div>

                <button
                  type="button"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-slate-900 hover:bg-slate-800'
                      : `${card.themeBg} hover:opacity-95`
                  }`}
                >
                  <span>{card.btnLabel}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Helper Note */}
      <div className="max-w-2xl mx-auto text-center mt-12 text-xs text-slate-400 flex items-center justify-center space-x-2">
        <HelpCircle className="w-4 h-4 text-slate-500" />
        <span>
          You can switch workspaces at any time from the top bar dropdown without having to log out.
        </span>
      </div>
    </div>
  );
};
