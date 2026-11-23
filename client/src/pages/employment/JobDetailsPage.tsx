import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { JobPosting } from '../../types';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Target,
  ArrowLeft,
  CheckCircle2,
  Award,
  Send,
  FileText,
} from 'lucide-react';

export const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/employment/job/${jobId}`);
      setJob(data);
      if (data.hasApplied) setAppliedSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApplying(true);
      await api.post(`/employment/job/${jobId}/apply`, { coverLetter });
      setShowApplyModal(false);
      setAppliedSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-base font-bold text-slate-800">Job posting not found</p>
        <Link to="/employment/jobs" className="mt-2 text-xs text-emerald-600 font-bold inline-block">
          ← Back to Vacancies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/employment/jobs"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Vacancies
        </Link>
      </div>

      {/* Main Job Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
              {job.employmentType?.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {job.location}
            </span>
            {job.salaryRange && (
              <span className="text-xs font-bold text-slate-700">• {job.salaryRange}</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {job.title}
          </h1>

          <p className="text-sm font-bold text-slate-700 mt-1 flex items-center">
            <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
            {job.employer?.companyName} • {job.employer?.industry?.replace('_', ' ')}
          </p>
        </div>

        <div>
          {appliedSuccess ? (
            <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
              Application Submitted
            </div>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center transition-all"
            >
              <Send className="w-4 h-4 mr-1.5 text-teal-400" />
              Apply for this Position
            </button>
          )}
        </div>
      </div>

      {/* AI Skill Match & Gap Callout Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs">
              <Target className="w-3.5 h-3.5 mr-1" />
              {job.matchScore}% Match
            </span>
            <span className="text-xs font-bold text-emerald-900">AI Compatibility Analysis</span>
          </div>
          <div className="mt-2 space-y-1">
            {job.matchingReasons?.map((reason: string, i: number) => (
              <p key={i} className="text-xs text-emerald-800 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 flex-shrink-0" />
                {reason}
              </p>
            ))}
          </div>
        </div>

        <Link
          to={`/employment/skill-gap?jobId=${job.id}`}
          className="px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 text-xs font-bold rounded-xl shadow-xs border border-teal-200 flex items-center self-start sm:self-auto whitespace-nowrap"
        >
          View Skill Gap Analysis →
        </Link>
      </div>

      {/* Job Details Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 mb-2">Role Overview & Responsibilities</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {job.requirements && (
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-2">Qualifications & Experience</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
          </div>
        )}

        {/* Required Skills */}
        {job.jobSkills && job.jobSkills.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 mb-3">Required Competencies</h2>
            <div className="flex flex-wrap gap-2">
              {job.jobSkills.map((js: any) => (
                <span
                  key={js.skill.id}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {js.skill.name} {js.isMandatory && '• Mandatory'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Apply to {job.employer?.companyName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Position: <span className="font-bold text-slate-800">{job.title}</span>. Your verified HEXORA LMS credentials will be attached automatically.
            </p>

            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Note / Remarks</label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and describe how your verified skills and cooperative experience make you an ideal candidate..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                <span className="font-bold text-slate-800">Attached Profile Credentials:</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your LMS Certificates, verified skill badges, and candidate education records will be submitted to the employer.
                </p>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  {applying ? 'Submitting Application...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
