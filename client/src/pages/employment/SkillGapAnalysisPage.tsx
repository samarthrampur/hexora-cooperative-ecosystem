import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { SkillGapAnalysis } from '../../types';
import {
  Target,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const SkillGapAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || undefined;

  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillGap();
  }, [jobId]);

  const fetchSkillGap = async () => {
    try {
      setLoading(true);
      const url = jobId ? `/employment/skill-gap?jobId=${jobId}` : '/employment/skill-gap';
      const data = await api.get<SkillGapAnalysis>(url);
      setAnalysis(data);
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

  if (!analysis) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-base font-bold text-slate-800">Skill Gap Analysis unavailable</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Intelligent Career Diagnostic</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <Target className="w-6 h-6 mr-2 text-teal-600" />
          AI Skill Gap Analysis & LMS Course Bridge
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Benchmarking your profile against: <span className="font-bold text-slate-800">{analysis.jobTitle}</span>{' '}
          {analysis.companyName && `at ${analysis.companyName}`}.
        </p>
      </div>

      {/* Match Metric Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">
            Overall Competency Match
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-4xl sm:text-5xl font-black text-white">
              {analysis.overallMatchPercentage}%
            </span>
            <span className="text-xs text-slate-300">
              ({analysis.existingSkills.length} of {analysis.existingSkills.length + analysis.missingSkills.length} competencies met)
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-lg">
            Enroll in the recommended LMS capacity courses below to bridge your missing skills and boost your job candidacy to 100%!
          </p>
        </div>

        <div className="w-32 h-32 rounded-full border-8 border-teal-500/30 border-t-teal-400 flex items-center justify-center flex-shrink-0">
          <Target className="w-10 h-10 text-teal-400" />
        </div>
      </div>

      {/* Two Column Skills Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing / Verified Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Existing Skills ({analysis.existingSkills.length})
              </span>
              <span className="text-[10px] font-semibold text-slate-400">On Profile</span>
            </div>

            <div className="space-y-2.5">
              {analysis.existingSkills.length > 0 ? (
                analysis.existingSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-emerald-950">{s.name}</span>
                    {s.isVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        LMS Verified
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No matching skills found on profile.</p>
              )}
            </div>
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center">
                <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                Missing Competencies ({analysis.missingSkills.length})
              </span>
              <span className="text-[10px] font-semibold text-rose-600">Action Required</span>
            </div>

            <div className="space-y-2.5">
              {analysis.missingSkills.length > 0 ? (
                analysis.missingSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-rose-950">{s.name}</span>
                    <span className="text-[10px] font-bold text-rose-700 uppercase">
                      {s.isMandatory ? 'Mandatory' : 'Preferred'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-bold text-center">
                  🎉 No missing skills! You possess 100% of required competencies.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Direct LMS Recommendations to Bridge Skill Gap */}
      {analysis.recommendedCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                Recommended LMS Courses to Bridge Skill Gaps
              </h2>
              <p className="text-xs text-slate-500">
                Completing these courses and earning the certificate will immediately verify these skills on your job profile!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.recommendedCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border-2 border-teal-200 p-5 shadow-xs hover:border-teal-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {c.category?.name}
                    </span>
                    <span className="text-slate-500 font-medium">{c.durationHours} hrs</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700">
                    + Closes Gap Competencies
                  </span>
                  <Link
                    to={`/lms/course/${c.slug}`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center"
                  >
                    <span>Start Course in LMS</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 text-teal-400" />
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
