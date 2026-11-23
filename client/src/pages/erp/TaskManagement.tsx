import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Task, Member } from '../../types';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  User,
} from 'lucide-react';

export const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New task form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [assignedToMemberId, setAssignedToMemberId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [tasksData, membersData] = await Promise.all([
        api.get<Task[]>('/erp/tasks'),
        api.get<Member[]>('/erp/members'),
      ]);
      setTasks(tasksData);
      setMembers(membersData);
      if (membersData.length > 0) setAssignedToMemberId(membersData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/erp/tasks', {
        title,
        description,
        priority,
        assignedToMemberId: assignedToMemberId || undefined,
        dueDate: dueDate || undefined,
      });

      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      const updatedTasks = await api.get<Task[]>('/erp/tasks');
      setTasks(updatedTasks);
    } catch (err: any) {
      alert(err.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/erp/tasks/${taskId}/status`, { status: newStatus });
      const updatedTasks = await api.get<Task[]>('/erp/tasks');
      setTasks(updatedTasks);
    } catch (err) {
      alert('Failed to update task.');
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <CheckSquare className="w-6 h-6 mr-2 text-blue-700" />
            Operational Task Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate cooperative activities, assign responsibilities, and monitor completion timelines.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Assign New Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              Pending ({pendingTasks.length})
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    Start →
                  </button>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                {task.description && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Assigned: {task.assignedMember?.user?.fullName || 'Unassigned'}</span>
                  {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              In Progress ({inProgressTasks.length})
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    Complete ✓
                  </button>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                {task.description && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Assigned: {task.assignedMember?.user?.fullName || 'Unassigned'}</span>
                  {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Completed ({completedTasks.length})
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/90 p-4 rounded-xl border border-emerald-100 shadow-xs opacity-90"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Finished
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-700 line-through leading-snug">{task.title}</h4>
                <div className="mt-2 text-[10px] text-slate-400">
                  Completed by {task.assignedMember?.user?.fullName || 'Member'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Assign Operational Task</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create an organizational action item and assign it to a cooperative member.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inspect cold room temperature calibration"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed instructions and execution parameters..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Member</label>
                <select
                  value={assignedToMemberId}
                  onChange={(e) => setAssignedToMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user.fullName} ({m.membershipId} - {m.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  {submitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
