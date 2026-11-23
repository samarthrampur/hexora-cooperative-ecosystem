import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      // We can query course detail that contains assessments
      const courses = await api.get<any[]>('/lms/courses');
      // Find course with this assessment
      let targetAssess: any = null;
      for (const c of courses) {
        const fullCourse = await api.get<any>(`/lms/course/${c.id}`);
        const found = fullCourse.assessments?.find((a: any) => a.id === assessmentId);
        if (found) {
          targetAssess = { ...found, courseTitle: fullCourse.title };
          break;
        }
      }
      setAssessment(targetAssess);
    } catch (err) {
      console.error('Failed to load assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment) return;

    try {
      setSubmitting(true);
      const res = await api.post<any>(`/lms/assessment/${assessment.id}/submit`, { answers });
      setResult(res);

      if (res.passed) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-base font-bold text-slate-800">Assessment not found</p>
        <Link to="/lms/courses" className="mt-2 text-xs text-teal-600 font-bold inline-block">
          ← Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Assessment Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
          <Link to="/lms/dashboard" className="hover:text-teal-600">
            LMS
          </Link>
          <span>/</span>
          <span>{assessment.courseTitle}</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {assessment.title}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Passing Threshold: <span className="font-bold text-teal-600">{assessment.passingScore}%</span> • Time Limit:{' '}
          <span className="font-semibold text-slate-700">{assessment.timeLimitMinutes} minutes</span>
        </p>
      </div>

      {/* Result Display Card if submitted */}
      {result && (
        <div
          className={`p-6 rounded-2xl border shadow-md ${
            result.passed
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
              : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-2xl ${
                result.passed ? 'bg-emerald-500 text-white shadow-md' : 'bg-rose-500 text-white'
              }`}
            >
              {result.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
            <div className="flex-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  result.passed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                }`}
              >
                {result.passed ? 'Assessment Passed' : 'Assessment Incomplete'}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                You Scored {result.score}%
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{result.submission?.feedback}</p>

              {result.passed && result.certificate && (
                <div className="mt-4 pt-4 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-emerald-900">
                    <p className="font-bold flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                      Certificate #{result.certificate.certificateNumber} Generated!
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Cross-module sync active: Verified skills applied to your Employment profile.
                    </p>
                  </div>
                  <Link
                    to={`/lms/certificate/${result.certificate.certificateNumber}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    View Official Certificate →
                  </Link>
                </div>
              )}

              {!result.passed && (
                <button
                  onClick={() => setResult(null)}
                  className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Reattempt Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Form (visible before pass or on retake) */}
      {!result?.passed && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {assessment.questions?.map((q: any, idx: number) => {
            const options: string[] = JSON.parse(q.optionsJson || '[]');
            const selectedOption = answers[q.id];

            return (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                    Question {idx + 1} of {assessment.questions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{q.points} pt</span>
                </div>

                <p className="text-sm font-bold text-slate-900 mb-4">{q.questionText}</p>

                <div className="space-y-2">
                  {options.map((opt: string) => {
                    const isChecked = selectedOption === opt;
                    return (
                      <label
                        key={opt}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`w-full p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-500'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={isChecked}
                          onChange={() => handleSelectOption(q.id, opt)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                        <span className={`text-xs font-medium ${isChecked ? 'text-teal-950 font-bold' : 'text-slate-700'}`}>
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || Object.keys(answers).length === 0}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Submit Assessment for Grading</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-teal-400" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
