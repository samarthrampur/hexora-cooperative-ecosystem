import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { GraduationCap, ArrowRight, BookOpen, Clock, CheckCircle } from 'lucide-react';

export const MyCoursesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/lms/dashboard');
      const all = [...(res.ongoingCourses || []), ...(res.completedCourses || [])];
      setEnrollments(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Enrolled Courses
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track continuous learning progress and resume lesson modules.
        </p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((enr: any) => (
            <div
              key={enr.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {enr.course.category?.name}
                  </span>
                  {enr.isCompleted ? (
                    <span className="text-emerald-600 font-bold flex items-center text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-blue-600 font-bold text-[11px]">In Progress</span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {enr.course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{enr.course.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Progress</span>
                  <span className="text-teal-600">{Math.round(enr.progressPercent)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${enr.progressPercent}%` }}
                  ></div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/lms/course/${enr.course.slug}`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center"
                  >
                    <span>{enr.isCompleted ? 'Review Course' : 'Resume Learning'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">You are not enrolled in any courses yet</h3>
          <p className="text-xs text-slate-500 mt-1">Explore our course catalogue to begin your capacity building journey.</p>
          <Link
            to="/lms/courses"
            className="mt-4 inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Browse Catalogue
          </Link>
        </div>
      )}
    </div>
  );
};
