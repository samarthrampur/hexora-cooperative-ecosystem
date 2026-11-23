import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Certificate } from '../../types';
import { Award, CheckCircle2, ArrowRight } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/lms/dashboard');
      setCerts(res.certificates || []);
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
          Certificates Earned
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official competency credentials verified by HEXORA Cooperative Academy.
        </p>
      </div>

      {certs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certs.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    #{c.certificateNumber}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Grade: {c.grade}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {c.course?.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Issued on {new Date(c.issuedAt).toLocaleDateString()} by {c.issuingOrg}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-teal-700 font-semibold flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-teal-600" />
                  Verified on Employment Profile
                </span>
                <Link
                  to={`/lms/certificate/${c.certificateNumber}`}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center shadow-xs"
                >
                  <span>View Certificate</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No certificates earned yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete all lessons in a course and score 70% or higher on the assessment to earn your official credential.
          </p>
          <Link
            to="/lms/courses"
            className="mt-4 inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Explore Courses
          </Link>
        </div>
      )}
    </div>
  );
};
