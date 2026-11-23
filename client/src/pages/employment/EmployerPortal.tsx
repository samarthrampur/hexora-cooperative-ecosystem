import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { JobPosting, Skill } from '../../types';
import {
  Building2,
  Plus,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const EmployerPortal: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  // New Job Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [experienceYears, setExperienceYears] = useState(1);
  const [location, setLocation] = useState('Nashik Agro Industrial Zone');
  const [salaryRange, setSalaryRange] = useState('₹4.5 - 6.5 LPA');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/employment/employer/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/employment/employer/job', {
        title,
        description,
        requirements,
        employmentType,
        experienceYears,
        location,
        salaryRange,
      });

      setShowPostModal(false);
      setTitle('');
      setDescription('');
      setRequirements('');
      await fetchEmployerData();
    } catch (err: any) {
      alert(err.message || 'Failed to post vacancy.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await api.patch(`/employment/employer/application/${appId}/status`, {
        status,
        employerNotes: `Candidate advanced to ${status} stage by recruiter review.`,
      });
      alert(`Applicant marked as ${status}!`);
      await fetchEmployerData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-emerald-600" />
            Employer Recruitment Management Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish vacancies, filter applicants by verified LMS skills, and manage selection pipelines.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Post New Vacancy
        </button>
      </div>

      {/* Recruiter Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Job Vacancies
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {data?.stats?.totalJobs || 0}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Live recruitment drives</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Candidates Applied
          </span>
          <p className="mt-2 text-2xl font-black text-blue-700">
            {data?.stats?.totalApplicants || 0}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Candidate resumes received</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Shortlisted Candidates
          </span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {data?.stats?.shortlistedApplicants || 0}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Matched with certified skills</p>
        </div>
      </div>

      {/* Jobs & Candidate Review */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Your Active Job Vacancies</h2>

        {data?.jobs?.map((job: any) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                  {job.employmentType}
                </span>
                <span className="text-xs text-slate-500">
                  {job._count?.applications || 0} Applicants
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">{job.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {job.location} • {job.salaryRange}
              </p>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{job.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-700">
                Skills Filter Active: Auto-matches verified LMS candidates
              </span>
              <button
                onClick={() => alert(`Reviewing candidate pipeline for ${job.title}...`)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
              >
                Review Applicants ({job._count?.applications || 0})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Post Vacancy Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Post Vacancy</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter job specifications. Candidates with matching verified LMS credentials will be highlighted.
            </p>

            <form onSubmit={handlePostJob} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Agri-Tech Operations & Sensor Specialist"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PART_TIME">Part Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Experience (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nashik, Pune"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. ₹5.0 - 7.0 LPA"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key responsibilities and day-to-day functions..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requirements & Skills</label>
                <textarea
                  rows={2}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Required educational background and competencies..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  {submitting ? 'Publishing...' : 'Publish Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
