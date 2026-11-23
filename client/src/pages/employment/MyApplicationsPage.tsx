import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { JobApplication } from '../../types';
import {
  FileSpreadsheet,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.get<JobApplication[]>('/employment/my-applications');
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <FileSpreadsheet className="w-6 h-6 mr-2 text-emerald-600" />
          My Job Applications
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time status tracking across employer review, shortlisting, and selection pipelines.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading applications...</div>
        ) : applications.length > 0 ? (
          applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status?.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {app.jobPosting?.title}
                </h3>

                <p className="text-xs font-bold text-slate-700 mt-1 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {app.jobPosting?.employer?.companyName} • {app.jobPosting?.location}
                </p>

                {app.employerNotes && (
                  <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                    <span className="font-bold">Employer Feedback: </span>
                    {app.employerNotes}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to={`/employment/job/${app.jobPostingId}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  View Job Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active applications</h3>
            <p className="text-xs text-slate-500 mt-1">Discover open positions matching your verified skills and apply.</p>
            <Link
              to="/employment/jobs"
              className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Discover Vacancies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
