import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Bot,
} from 'lucide-react';

export const LearnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/lms/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to load LMS dashboard:', err);
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

  const stats = data?.stats || {
    totalEnrolled: 0,
    ongoingCount: 0,
    completedCount: 0,
    certificatesEarned: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Cooperative Capacity Building LMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Learner'}!
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Acquire specialized cooperative governance, sustainable agritech, and operational competencies. Certified skills directly integrate into your employment profile.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/lms/courses"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-colors inline-flex items-center"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              Explore Course Catalogue
            </Link>
            <Link
              to="/lms/ai-assistant"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center border border-white/20"
            >
              <Bot className="w-4 h-4 mr-1.5 text-teal-400" />
              Ask AI Learning Tutor
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Courses</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalEnrolled}</p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center">
            <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
            Active learning path
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.ongoingCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Lessons pending completion</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Courses</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.completedCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">100% curriculum covered</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Certificates</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.certificatesEarned}</p>
          <p className="mt-1 text-[11px] text-teal-600 font-semibold">Verified badges issued</p>
        </div>
      </div>

      {/* Ongoing Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ongoing Learning Programmes</h2>
            <p className="text-xs text-slate-500">Resume your interactive lessons and complete pending assessments.</p>
          </div>
          <Link to="/lms/my-courses" className="text-xs font-bold text-teal-600 hover:text-teal-700">
            View All ({data?.ongoingCourses?.length || 0}) →
          </Link>
        </div>

        {data?.ongoingCourses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.ongoingCourses.map((enr: any) => (
              <div
                key={enr.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      {enr.course.category?.name || 'General'}
                    </span>
                    <span>{enr.course._count?.lessons || 0} Lessons</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {enr.course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {enr.course.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Course Progress</span>
                    <span className="text-teal-600">{Math.round(enr.progressPercent)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${enr.progressPercent}%` }}
                    ></div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/lms/course/${enr.course.slug}`}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center shadow-xs"
                    >
                      <span>Continue Learning</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No ongoing courses at the moment</p>
            <p className="text-xs text-slate-500 mt-1">Explore our catalogue to enroll in cooperative and agritech programs.</p>
            <Link
              to="/lms/courses"
              className="mt-4 inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Browse Catalogue
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Courses (AI & Skill Gap Integrated) */}
      {data?.recommendedCourses?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Recommended for Your Growth</h2>
            </div>
            <span className="text-xs text-slate-500">Based on industry skill requirements</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.recommendedCourses.map((course: any) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {course.category?.name}
                  </span>
                  <h3 className="mt-2 font-bold text-slate-900 text-sm leading-tight">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Skills taught */}
                  {course.courseSkills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {course.courseSkills.slice(0, 2).map((cs: any) => (
                        <span
                          key={cs.skill.id}
                          className="px-2 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-700 rounded-md border border-teal-100"
                        >
                          +{cs.skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    {course.difficulty} • {course.durationHours} hrs
                  </span>
                  <Link
                    to={`/lms/course/${course.slug}`}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
