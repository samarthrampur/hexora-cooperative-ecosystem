import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Member, Department } from '../../types';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  CheckCircle,
  Filter,
  UserCheck,
} from 'lucide-react';

export const MemberDirectory: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Member Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Active Member');
  const [departmentId, setDepartmentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [search, selectedDept]);

  const fetchDepartments = async () => {
    try {
      const data = await api.get<Department[]>('/erp/departments');
      setDepartments(data);
      if (data.length > 0) setDepartmentId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDept) params.append('departmentId', selectedDept);

      const data = await api.get<Member[]>(`/erp/members?${params.toString()}`);
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/erp/members', {
        fullName,
        email,
        phone,
        designation,
        departmentId: departmentId || undefined,
      });

      setShowAddModal(false);
      setFullName('');
      setEmail('');
      setPhone('');
      await fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-700" />
            Member Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered voting cooperative members, designations, and departmental allocations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Register New Member
        </button>
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
            placeholder="Search by member name, membership ID, or email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Membership ID</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading member records...
                  </td>
                </tr>
              ) : members.length > 0 ? (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                          {m.user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{m.user.fullName}</p>
                          <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                            <Mail className="w-3 h-3 mr-1" />
                            {m.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-700">
                      {m.membershipId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                      {m.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {m.department?.name || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(m.joinDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No cooperative members found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Add Cooperative Member</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter member identity details. An automatic membership ID will be generated.
            </p>

            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dnyaneshwar Bhor"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@greenvalley.org"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Field Agronomist / Produce Sorter"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  {submitting ? 'Registering...' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
