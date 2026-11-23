import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Member, Course } from '../../types';
import {
  GraduationCap,
  Users,
  Send,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const AssignTrainingDirective: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, coursesData] = await Promise.all([
        api.get<Member[]>('/erp/members'),
        api.get<Course[]>('/lms/courses'),
      ]);
      setMembers(membersData);
      setCourses(coursesData);
      if (membersData.length > 0) setSelectedMemberId(membersData[0].id);
      if (coursesData.length > 0) setSelectedCourseId(coursesData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSuccessMsg(null);
      const res = await api.post<any>('/erp/assign-training', {
        memberId: selectedMemberId,
        courseId: selectedCourseId,
        dueDate: dueDate || undefined,
      });

      setSuccessMsg(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to assign training.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Cross-Module Integration Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <GraduationCap className="w-6 h-6 mr-2 text-blue-700" />
          Assign LMS Capacity Training to Member
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          As a Cooperative Administrator, assign targeted skill development courses to your members. The platform auto-enrolls the member, sends an in-app directive, and tracks their completion.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center font-semibold">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAssign} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Select Cooperative Member *
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.user.fullName} ({m.membershipId} - {m.designation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Select LMS Course Curriculum *
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.category?.name} • {c.difficulty})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Target Completion Deadline
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-1.5 text-teal-400" />
            {submitting ? 'Assigning...' : 'Dispatch Training Directive'}
          </button>
        </div>
      </form>
    </div>
  );
};
