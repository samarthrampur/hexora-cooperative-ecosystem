import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRoleType } from '../../types';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building2,
  Briefcase,
  Users,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    intendedRole: 'LEARNER' as UserRoleType,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roles: { value: UserRoleType; label: string; desc: string; icon: any }[] = [
    { value: 'LEARNER', label: 'Learner', desc: 'Acquire verified skills & earn certificates', icon: GraduationCap },
    { value: 'COOPERATIVE_MEMBER', label: 'Cooperative Member', desc: 'Participate in cooperative tasks & meetings', icon: Users },
    { value: 'COOPERATIVE_ADMIN', label: 'Cooperative Admin', desc: 'Govern & manage cooperative society operations', icon: Building2 },
    { value: 'TRAINER', label: 'Trainer / Assessor', desc: 'Publish courses & assess candidate learning', icon: ShieldCheck },
    { value: 'JOB_SEEKER', label: 'Job Seeker', desc: 'Discover jobs matching certified skills', icon: Briefcase },
    { value: 'EMPLOYER', label: 'Employer / Recruiter', desc: 'Post vacancies & evaluate skilled talent', icon: Building2 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        intendedRole: formData.intendedRole,
      });

      // Redirect immediately to the Dedicated Purpose Selection Screen!
      navigate('/workspace-select');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-lg shadow-teal-500/20 mb-3">
          <span className="text-slate-950 font-black text-xl">H</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Join the HEXORA Ecosystem
        </h2>
        <p className="mt-1 text-sm font-medium text-teal-400">
          Create one account to access Learning, Cooperative ERP, and Employment.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.org"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* User Category Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Intended User Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roles.map((r) => {
                  const isSelected = formData.intendedRole === r.value;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, intendedRole: r.value })}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-teal-600' : 'text-slate-500'}`} />
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                        {r.label}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-teal-400" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-600">
            Already registered on HEXORA?{' '}
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
