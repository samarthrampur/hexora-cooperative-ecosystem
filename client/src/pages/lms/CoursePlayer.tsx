import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Course, Lesson } from '../../types';
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Award,
  Clock,
  BookOpen,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export const CoursePlayer: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [updatingLesson, setUpdatingLesson] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [idOrSlug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.get<Course>(`/lms/course/${idOrSlug}`);
      setCourse(data);
      if (data.lessons && data.lessons.length > 0) {
        setActiveLesson(data.lessons[0]);
      }
    } catch (err) {
      console.error('Failed to load course:', err);
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = course?.enrollments && course.enrollments.length > 0;
  const enrollment = isEnrolled ? course.enrollments![0] : null;

  const handleEnroll = async () => {
    if (!course) return;
    try {
      setEnrolling(true);
      await api.post('/lms/enroll', { courseId: course.id });
      await fetchCourse();
    } catch (err: any) {
      alert(err.message || 'Failed to enroll in course.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleLessonComplete = async (lessonId: string, currentStatus: boolean) => {
    try {
      setUpdatingLesson(true);
      await api.post(`/lms/lesson/${lessonId}/progress`, { isCompleted: !currentStatus });
      await fetchCourse();
    } catch (err: any) {
      alert('Failed to update progress.');
    } finally {
      setUpdatingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-base font-bold text-slate-800">Course not found</p>
        <Link to="/lms/courses" className="mt-2 text-xs text-teal-600 font-bold inline-block">
          ← Back to Catalogue
        </Link>
      </div>
    );
  }

  const isLessonCompleted = (lesson: Lesson) => {
    return lesson.progresses && lesson.progresses.length > 0 && lesson.progresses[0].isCompleted;
  };

  const currentLessonCompleted = activeLesson ? isLessonCompleted(activeLesson) : false;

  return (
    <div className="space-y-6">
      {/* Course Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to="/lms/courses" className="hover:text-teal-600">
              Courses
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">{course.category?.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {course.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Instructor: <span className="font-semibold text-slate-700">{course.instructor?.fullName}</span> •{' '}
            {course.durationHours} hours total • {course.lessons?.length || 0} lessons
          </p>
        </div>

        <div>
          {!isEnrolled ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              {enrolling ? 'Enrolling...' : 'Enroll in Course'}
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Progress
                </span>
                <p className="text-sm font-extrabold text-teal-600">
                  {Math.round(enrollment?.progressPercent || 0)}%
                </p>
              </div>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${enrollment?.progressPercent || 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout: Player on Left, Lessons Curriculum on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lesson Player and Material */}
        <div className="lg:col-span-2 space-y-5">
          {activeLesson ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Media Player Area */}
              {activeLesson.contentType === 'VIDEO' ? (
                <div className="aspect-video bg-slate-950 flex items-center justify-center relative">
                  <iframe
                    className="w-full h-full"
                    src={activeLesson.contentUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <FileText className="w-8 h-8 text-teal-300" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">
                      Interactive Reading Lesson
                    </span>
                    <h2 className="text-lg font-bold text-white">{activeLesson.title}</h2>
                  </div>
                </div>
              )}

              {/* Lesson Body & Interactive Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {activeLesson.title}
                  </h2>
                  {isEnrolled && (
                    <button
                      onClick={() => handleToggleLessonComplete(activeLesson.id, currentLessonCompleted ?? false)}
                      disabled={updatingLesson}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors ${
                        currentLessonCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {currentLessonCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 mr-1" />
                          <span>Mark Complete</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                  {activeLesson.contentBody || 'No text study guide attached to this lesson.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-600">Please select a lesson to begin.</p>
            </div>
          )}

          {/* Assessment Ready Callout */}
          {course.assessments && course.assessments.length > 0 && (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-teal-500 text-white rounded-xl shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Course Assessment & Certification</h3>
                  <p className="text-xs text-slate-600">
                    Score {course.assessments[0].passingScore}% or higher to issue your verified credential and skill badges.
                  </p>
                </div>
              </div>
              <Link
                to={`/lms/assessment/${course.assessments[0].id}`}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap"
              >
                Take Assessment →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Course Curriculum Playlist */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>Curriculum Chapters</span>
              <span className="text-xs text-teal-600 font-bold">
                {course.lessons?.length || 0} Lessons
              </span>
            </h3>

            <div className="space-y-2">
              {course.lessons?.map((lesson, idx) => {
                const isSelected = activeLesson?.id === lesson.id;
                const completed = isLessonCompleted(lesson);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold leading-snug truncate ${
                          isSelected ? 'text-teal-900' : 'text-slate-800'
                        }`}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lesson.contentType} • {lesson.durationMinutes} mins
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credited Skills Info Card */}
          {course.courseSkills && course.courseSkills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />
                Cross-Module Verified Skills
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Completing this course verifies these skills directly in your Employment Ecosystem profile:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {course.courseSkills.map((cs) => (
                  <span
                    key={cs.skill.id}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200"
                  >
                    ✓ {cs.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
