import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  CheckSquare,
  Bot,
  PlusCircle,
  Users,
  Network,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Cpu,
  GraduationCap,
  Briefcase,
  Search,
  UserCheck,
  FileSpreadsheet,
  Target,
  Sparkles,
} from 'lucide-react';

interface NavLinkItem {
  to: string;
  label: string;
  icon: any;
  isAi?: boolean;
  isCrossModule?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeWorkspace, hasRole, user } = useAuth();

  const lmsLinks: NavLinkItem[] = [
    { to: '/lms/dashboard', label: 'Learner Dashboard', icon: LayoutDashboard },
    { to: '/lms/courses', label: 'Course Catalogue', icon: BookOpen },
    { to: '/lms/my-courses', label: 'My Enrolled Courses', icon: GraduationCap },
    { to: '/lms/assessments', label: 'Assessments & Quizzes', icon: CheckSquare },
    { to: '/lms/certificates', label: 'Certificates Earned', icon: Award },
    { to: '/lms/ai-assistant', label: 'AI Learning Assistant', icon: Bot, isAi: true },
    ...(hasRole('TRAINER') || hasRole('SUPER_ADMIN')
      ? [{ to: '/lms/trainer', label: 'Trainer Studio', icon: PlusCircle }]
      : []),
  ];

  const erpLinks: NavLinkItem[] = [
    { to: '/erp/dashboard', label: 'ERP Overview', icon: LayoutDashboard },
    { to: '/erp/members', label: 'Member Directory', icon: Users },
    { to: '/erp/departments', label: 'Org Hierarchy & Depts', icon: Network },
    { to: '/erp/tasks', label: 'Task Management', icon: CheckSquare },
    { to: '/erp/attendance', label: 'Attendance & Biometrics', icon: Clock },
    { to: '/erp/meetings', label: 'Meetings & Minutes', icon: Calendar },
    { to: '/erp/financials', label: 'Financial Records', icon: DollarSign },
    { to: '/erp/documents', label: 'Document Archive', icon: FileText },
    { to: '/erp/hardware', label: 'Hardware IoT Devices', icon: Cpu },
    ...(hasRole('COOPERATIVE_ADMIN') || hasRole('SUPER_ADMIN')
      ? [{ to: '/erp/assign-training', label: 'Assign LMS Training', icon: GraduationCap, isCrossModule: true }]
      : []),
  ];

  const employmentLinks: NavLinkItem[] = [
    { to: '/employment/dashboard', label: 'Career Dashboard', icon: LayoutDashboard },
    { to: '/employment/jobs', label: 'Discover Vacancies', icon: Search },
    { to: '/employment/profile', label: 'Candidate Profile & CV', icon: UserCheck },
    { to: '/employment/my-applications', label: 'My Applications', icon: FileSpreadsheet },
    { to: '/employment/skill-gap', label: 'Skill Gap Analyzer', icon: Target, isCrossModule: true },
    { to: '/employment/ai-advisor', label: 'AI Career Assistant', icon: Sparkles, isAi: true },
    ...(hasRole('EMPLOYER') || hasRole('SUPER_ADMIN')
      ? [{ to: '/employment/employer', label: 'Employer Portal', icon: Briefcase }]
      : []),
  ];

  const activeLinks =
    activeWorkspace === 'LMS'
      ? lmsLinks
      : activeWorkspace === 'ERP'
      ? erpLinks
      : employmentLinks;

  const workspaceTheme =
    activeWorkspace === 'LMS'
      ? {
          name: 'Learning Workspace',
          tag: 'LMS Environment',
          activeBg: 'bg-teal-50 text-teal-800 font-semibold border-r-4 border-teal-600',
          hoverBg: 'hover:bg-teal-50/50 hover:text-teal-700',
          accent: 'text-teal-600',
        }
      : activeWorkspace === 'ERP'
      ? {
          name: 'Cooperative ERP',
          tag: 'Management Environment',
          activeBg: 'bg-blue-50 text-blue-900 font-semibold border-r-4 border-blue-800',
          hoverBg: 'hover:bg-blue-50/50 hover:text-blue-800',
          accent: 'text-blue-700',
        }
      : {
          name: 'Employment Ecosystem',
          tag: 'Career Environment',
          activeBg: 'bg-emerald-50 text-emerald-900 font-semibold border-r-4 border-emerald-600',
          hoverBg: 'hover:bg-emerald-50/50 hover:text-emerald-800',
          accent: 'text-emerald-600',
        };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Workspace Context Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Workspace
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 shadow-xs border border-slate-200">
            {activeWorkspace}
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-900">{workspaceTheme.name}</p>
        <p className="text-xs text-slate-500 font-medium">{workspaceTheme.tag}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {activeLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? workspaceTheme.activeBg
                    : `text-slate-600 ${workspaceTheme.hoverBg}`
                }`
              }
            >
              <Icon className={`w-4 h-4 mr-3 flex-shrink-0`} />
              <span className="truncate flex-1">{item.label}</span>
              {item.isAi && (
                <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                  AI
                </span>
              )}
              {item.isCrossModule && (
                <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                  SYNC
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80">
        <div className="text-[11px] text-slate-500">
          <p className="font-semibold text-slate-700">HEXORA Cooperative Portal</p>
          <p className="text-[10px] text-slate-400">SIH26087 Hardware Extensible</p>
        </div>
      </div>
    </aside>
  );
};
