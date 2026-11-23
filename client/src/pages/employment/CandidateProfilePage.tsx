import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CandidateProfile, Skill } from '../../types';
import {
  UserCheck,
  Award,
  ShieldCheck,
  Briefcase,
  MapPin,
  GraduationCap,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [educationLevel, setEducationLevel] = useState('BACHELORS');
  const [currentCity, setCurrentCity] = useState('');
  const [careerPreferences, setCareerPreferences] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get<CandidateProfile>('/employment/profile');
      setProfile(data);
      setHeadline(data.headline || '');
      setBio(data.bio || '');
      setExperienceYears(data.experienceYears || 0);
      setEducationLevel(data.educationLevel || 'BACHELORS');
      setCurrentCity(data.currentCity || '');
      setCareerPreferences(data.careerPreferences || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      await api.put('/employment/profile', {
        headline,
        bio,
        experienceYears,
        educationLevel,
        currentCity,
        careerPreferences,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      await fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <UserCheck className="w-6 h-6 mr-2 text-emerald-600" />
          Professional Candidate Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your centralized employment credential. Verified skills earned via HEXORA LMS are automatically showcased to employers.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center font-semibold">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          Profile updated successfully!
        </div>
      )}

      {/* Verified Skills Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center">
          <Award className="w-4 h-4 mr-1.5 text-teal-600" />
          Verified LMS Credential Badges
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Competencies verified through curriculum completion and passing accredited certification exams:
        </p>

        <div className="flex flex-wrap gap-2">
          {profile?.candidateSkills && profile.candidateSkills.length > 0 ? (
            profile.candidateSkills.map((cs) => (
              <div
                key={cs.id}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center ${
                  cs.isVerified
                    ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {cs.isVerified && <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />}
                <span>{cs.skill.name}</span>
                <span className="ml-1.5 text-[10px] uppercase font-normal text-slate-500">
                  ({cs.proficiency})
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400 py-2">
              No skills registered yet. Complete an LMS course to earn certified badges!
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Professional Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Certified Agritech Operations Specialist & Cooperative Agronomist"
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Education Level
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="DIPLOMA">Diploma</option>
              <option value="BACHELORS">Bachelor's Degree</option>
              <option value="MASTERS">Master's Degree</option>
              <option value="SECONDARY">Higher Secondary</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Current City
            </label>
            <input
              type="text"
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              placeholder="e.g. Nashik, Maharashtra"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Professional Biography
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Highlight your hands-on field experience, cooperative participation, and practical technical background..."
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Career Preferences
          </label>
          <input
            type="text"
            value={careerPreferences}
            onChange={(e) => setCareerPreferences(e.target.value)}
            placeholder="e.g. Precision Agritech, Cold Chain Logistics, Cooperative Audits"
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5 text-teal-400" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
