import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Certificate } from '../../types';
import { Award, Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CertificateView: React.FC = () => {
  const { certNumber } = useParams<{ certNumber: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCert();
  }, [certNumber]);

  const fetchCert = async () => {
    try {
      setLoading(true);
      const data = await api.get<Certificate>(`/lms/certificate/${certNumber}`);
      setCert(data);
    } catch (err) {
      console.error('Failed to load certificate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-base font-bold text-slate-800">Certificate not found</p>
        <Link to="/lms/dashboard" className="mt-2 text-xs text-teal-600 font-bold inline-block">
          ← Back to LMS Dashboard
        </Link>
      </div>
    );
  }

  const skills: string[] = cert.skillsCredited ? JSON.parse(cert.skillsCredited) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/lms/dashboard"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print / Save PDF
        </button>
      </div>

      {/* Official Certificate Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-14 shadow-2xl border-8 border-slate-900/10 relative overflow-hidden print:border-none print:shadow-none">
        {/* Subtle Ornamental Border */}
        <div className="absolute inset-2 border-2 border-dashed border-teal-600/30 rounded-2xl pointer-events-none"></div>

        <div className="relative text-center space-y-6">
          {/* Hexora Emblem */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-teal-600 shadow-xl shadow-teal-500/20 mx-auto">
            <span className="text-white font-black text-3xl">H</span>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-teal-600">
              {cert.issuingOrg || 'HEXORA Cooperative Academy'}
            </p>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 mt-1 tracking-tight">
              Certificate of Competency
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Official Verification ID: <span className="font-mono font-bold text-slate-700">{cert.certificateNumber}</span>
            </p>
          </div>

          <div className="py-2">
            <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">
              This is to certify that
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 underline decoration-teal-500 underline-offset-8">
              {cert.user?.fullName || 'Verified Learner'}
            </h2>
          </div>

          <div className="max-w-xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
            has successfully fulfilled all curriculum requirements, continuous module evaluations, and the comprehensive final assessment for the accredited program:
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-2">
              "{cert.course?.title}"
            </p>
          </div>

          {/* Verified Skills Credited */}
          {skills.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Verified Cross-Module Competencies Issued
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full flex items-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Signatures & Issue Date */}
          <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="font-bold text-slate-800">
                {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">Date of Issuance</p>
            </div>
            <div>
              <div className="font-serif italic text-base font-bold text-slate-900">
                Dr. Priya Nair
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">Director of Academics & Standards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
