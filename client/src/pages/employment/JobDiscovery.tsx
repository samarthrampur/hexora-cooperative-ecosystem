import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { JobPosting } from '../../types';
import {
  Search,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Target,
  ArrowRight,
  Filter,
  Award,
} from 'lucide-react';

export const JobDiscovery: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [search, setSearch] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [search, employmentType, location]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (employmentType) params.append('employmentType', employmentType);
      if (location) params.append('location', location);

      const data = await api.get<JobPosting[]>(`/employment/jobs?${params.toString()}`);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <Briefcase className="w-6 h-6 mr-2 text-emerald-600" />
          Discover Employment & Cooperative Vacancies
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect with agricultural collectives, logistics enterprises, and precision agritech companies.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles, skills, or enterprise name..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Employment Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="PART_TIME">Part Time</option>
          <option value="INTERNSHIP">Internship</option>
        </select>

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Filter by city (e.g. Nashik, Pune)"
          className="px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Searching vacancies...</div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {job.employmentType?.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                    {job.location}
                  </span>
                  {job.salaryRange && (
                    <span className="text-[11px] font-semibold text-slate-700">
                      • {job.salaryRange}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {job.title}
                </h3>

                <p className="text-xs font-bold text-slate-700 mt-1 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.employer?.companyName}
                </p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills Badges */}
                {job.jobSkills && job.jobSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.jobSkills.map((js) => (
                      <span
                        key={js.skill.id}
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md"
                      >
                        {js.skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions & Match Pillar */}
              <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
                <Link
                  to={`/employment/skill-gap?jobId=${job.id}`}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center"
                >
                  <Target className="w-3.5 h-3.5 mr-1" />
                  Analyze Skill Gap
                </Link>

                <Link
                  to={`/employment/job/${job.id}`}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center w-full sm:w-auto md:w-full justify-center"
                >
                  <span>View & Apply</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No vacancies found</h3>
            <p className="text-xs text-slate-500 mt-1">Try modifying your filter parameters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
