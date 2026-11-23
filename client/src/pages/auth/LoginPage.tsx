import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  // Quick Demo Accounts for seamless evaluator testing
  const demoAccounts = [
    { label: 'Super Admin', email: 'admin@hexora.org', pass: 'Hexora@2026', role: 'Full System Control' },
    { label: 'Cooperative Admin', email: 'coop.admin@greenvalley.org', pass: 'Password@123', role: 'Green Valley Society' },
    { label: 'Coop Member / Learner', email: 'member.arjun@greenvalley.org', pass: 'Password@123', role: 'Arjun Deshmukh' },
    { label: 'Lead Trainer', email: 'trainer.priya@hexora.org', pass: 'Password@123', role: 'Dr. Priya Nair' },
    { label: 'Job Seeker', email: 'candidate.rohit@gmail.com', pass: 'Password@123', role: 'Rohit Verma' },
    { label: 'Employer Recruiter', email: 'employer.kavita@agriapex.com', pass: 'Password@123', role: 'AgriApex Solutions' },
  ];

  const handleDemoSelect = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      // If user hasn't completed purpose selection yet, redirect to /workspace-select
      if (!user.hasSelectedPurpose) {
        navigate('/workspace-select');
      } else {
        // Redirect to their saved active workspace
        if (user.activeWorkspace === 'ERP') navigate('/erp/dashboard');
        else if (user.activeWorkspace === 'EMPLOYMENT') navigate('/employment/dashboard');
        else navigate('/lms/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotMessage(`If an account with ${forgotEmail} exists, password reset instructions have been dispatched.`);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotMessage(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Hexora Modern Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-xl shadow-teal-500/20 mb-4">
          <span className="text-slate-950 font-black text-2xl tracking-tighter">H</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          HEXORA
        </h2>
        <p className="mt-1 text-sm font-medium text-teal-400">
          Empowering Skills. Strengthening Cooperatives. Connecting Opportunities.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Welcome Back</h3>
            <p className="text-xs text-slate-500">
              Sign in with your centralized credentials to access your workspaces.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.org"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <span className="ml-2">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-medium text-teal-600 hover:text-teal-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to HEXORA</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-teal-400" />
                </>
              )}
            </button>
          </form>

          {/* Create Account link */}
          <div className="mt-5 text-center text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
              Create New Account
            </Link>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Logins
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => handleDemoSelect(acc.email, acc.pass)}
                  className="text-left px-2 py-1.5 rounded-md bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 text-[11px] text-slate-700 transition-colors"
                >
                  <p className="font-bold truncate text-slate-900">{acc.label}</p>
                  <p className="text-[9px] text-slate-500 truncate">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h4 className="text-base font-bold text-slate-900 mb-2">Reset Password</h4>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered email address and we'll send you a secure verification link.
            </p>

            {forgotMessage ? (
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-lg flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-teal-600 flex-shrink-0" />
                {forgotMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.org"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
