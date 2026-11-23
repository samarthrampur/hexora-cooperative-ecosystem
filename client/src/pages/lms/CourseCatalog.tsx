import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Course, CourseCategory } from '../../types';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const CourseCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [search, selectedCategory, selectedDifficulty]);

  const fetchCategories = async () => {
    try {
      const data = await api.get<CourseCategory[]>('/lms/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);

      const data = await api.get<Course[]>(`/lms/courses?${params.toString()}`);
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Course Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured capacity building curriculum designed for modern cooperative members and agritech professionals.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course title, keywords, or topics..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Category Select */}
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Difficulty Select */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = course.enrollments && course.enrollments.length > 0;
            const enrollment = isEnrolled ? course.enrollments![0] : null;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div className="p-6">
                  {/* Category & Difficulty Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">
                      {course.category?.name || 'General'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {course.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Skills Credited Badge */}
                  {course.courseSkills && course.courseSkills.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center">
                        <Award className="w-3 h-3 mr-1 text-teal-600" />
                        Verified Skills Credited:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {course.courseSkills.map((cs) => (
                          <span
                            key={cs.skill.id}
                            className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md"
                          >
                            {cs.skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 flex items-center space-x-3">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {course.durationHours} hrs
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      {course.lessons?.length || 3} Lessons
                    </span>
                  </div>

                  <Link
                    to={`/lms/course/${course.slug}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center transition-colors ${
                      isEnrolled
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{isEnrolled ? (enrollment?.isCompleted ? 'Review' : 'Continue') : 'View Course'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching courses found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different category filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedDifficulty('');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
