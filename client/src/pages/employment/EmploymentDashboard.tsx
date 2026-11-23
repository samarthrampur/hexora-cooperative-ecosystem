import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Briefcase,
  Search,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const EmploymentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/employment/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const candidate = data?.candidate;
  const stats = data?.stats || {
    totalApplications: 0,
    verifiedSkills: 0,
    totalSkills: 0,
    activeJobsAvailable: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Employment & Talent Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Career Portal for {user?.fullName || 'Candidate'}
          </h1>
          <p className="mt-1 text-xs text-slate-300 max-w-xl">
            Match with verified cooperative, agritech, and cold-chain opportunities. Your completed LMS certifications automatically strengthen your profile credentials.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/employment/jobs"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center transition-colors"
          >
            <Search className="w-4 h-4 mr-1.5" />
            Discover Vacancies
          </Link>
          <Link
            to="/employment/skill-gap"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors flex items-center"
          >
            <Target className="w-4 h-4 mr-1.5 text-teal-300" />
            Skill Gap Analyzer
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Openings</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.activeJobsAvailable}</p>
          <p className="mt-1 text-[11px] text-slate-500">Matching agritech & coop roles</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Skills</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.verifiedSkills}</p>
          <p className="mt-1 text-[11px] text-teal-600 font-semibold">Certified by HEXORA LMS</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Applications</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalApplications}</p>
          <p className="mt-1 text-[11px] text-slate-500">Active pipeline candidacies</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Skill Competencies</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalSkills}</p>
          <p className="mt-1 text-[11px] text-slate-500">Mapped on your candidate profile</p>
        </div>
      </div>

      {/* Recommended Jobs (AI Matched based on skills!) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
              Intelligent Career Matches
            </h2>
            <p className="text-xs text-slate-500">
              Ranked dynamically by matching your verified skills against employer specifications.
            </p>
          </div>
          <Link to="/employment/jobs" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
            View All Vacancies →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.recommendedJobs?.map((job: any) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Match Score Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Target className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {job.matchScore}% Match
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {job.employmentType?.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                  {job.title}
                </h3>

                <p className="text-xs font-bold text-slate-700 mt-1 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.employer?.companyName}
                </p>

                <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.location} • {job.salaryRange || 'Competitive'}
                </p>

                {/* Match reason notice */}
                {job.matchingReasons?.length > 0 && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                    <p className="font-semibold text-slate-700">Match Reason:</p>
                    <p className="text-slate-500 leading-tight mt-0.5">{job.matchingReasons[0]}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/employment/skill-gap?jobId=${job.id}`}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center"
                >
                  Skill Gap <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
                <Link
                  to={`/employment/job/${job.id}`}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
