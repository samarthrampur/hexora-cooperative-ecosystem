import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CourseCategory, Skill } from '../../types';
import { PlusCircle, BookOpen, CheckCircle, Award, Users } from 'lucide-react';

export const TrainerDashboard: React.FC = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('BEGINNER');
  const [durationHours, setDurationHours] = useState(3.0);
  const [objectives, setObjectives] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const cats = await api.get<CourseCategory[]>('/lms/categories');
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);

      // Fetch jobs to get skills or fetch courses
      const jobs = await api.get<any[]>('/employment/jobs');
      const allSkills: Skill[] = [];
      jobs.forEach((j) => {
        j.jobSkills?.forEach((js: any) => {
          if (!allSkills.some((s) => s.id === js.skill.id)) {
            allSkills.push(js.skill);
          }
        });
      });
      setSkills(allSkills);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    try {
      setSubmitting(true);
      await api.post('/lms/course', {
        title,
        description,
        categoryId,
        difficulty,
        durationHours,
        objectives,
        skillIds: selectedSkills,
      });

      setSuccessMsg(`Course "${title}" created and published to the catalogue successfully!`);
      setTitle('');
      setDescription('');
      setObjectives('');
      setSelectedSkills([]);
    } catch (err: any) {
      alert(err.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <PlusCircle className="w-6 h-6 mr-2 text-teal-600" />
          Trainer Studio & Course Creator
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Design capacity building curriculums and attach verified competency badges for cooperative members.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center font-semibold">
          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Course Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cooperative Microfinance & NABARD Scheme Operations"
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Duration (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Course Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comprehensive overview of topics covered, practical applications, and industry relevance..."
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Learning Objectives
          </label>
          <textarea
            rows={2}
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Key takeaway skills and capabilities acquired..."
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          ></textarea>
        </div>

        {/* Cross-Module Verified Skills Attachment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center">
            <Award className="w-3.5 h-3.5 mr-1 text-teal-600" />
            Attach Credited Verified Skills (Integrates to Employment Profile)
          </label>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => {
              const isSelected = selectedSkills.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleToggleSkill(s.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-teal-500 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Course to Catalogue'}
          </button>
        </div>
      </form>
    </div>
  );
};
