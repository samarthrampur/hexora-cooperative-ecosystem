import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  CheckSquare,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Cpu,
  GraduationCap,
} from 'lucide-react';

export const ERPDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchERPData();
  }, []);

  const fetchERPData = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/erp/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to load ERP dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const coop = data?.cooperative;
  const stats = data?.stats || {
    totalMembers: 0,
    activeMembers: 0,
    pendingTasks: 0,
    todayAttendance: 0,
    attendanceRate: 0,
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  };

  return (
    <div className="space-y-8">
      {/* Cooperative Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Cooperative ERP Environment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {coop?.name || 'Green Valley Agro Producers Cooperative'}
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Reg. No: <span className="font-mono font-semibold text-blue-300">{coop?.registrationNumber}</span> • {coop?.type} Cooperative • {coop?.city}, {coop?.state}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/erp/assign-training"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center transition-colors"
          >
            <GraduationCap className="w-4 h-4 mr-1.5" />
            Assign LMS Course
          </Link>
          <Link
            to="/erp/attendance"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors flex items-center"
          >
            <Clock className="w-4 h-4 mr-1.5 text-blue-400" />
            Attendance Tracker
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Members</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalMembers}</p>
          <p className="mt-1 text-[11px] text-slate-500">{stats.activeMembers} active voting members</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Attendance</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.todayAttendance}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">{stats.attendanceRate}% check-in rate</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Tasks</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.pendingTasks}</p>
          <p className="mt-1 text-[11px] text-slate-500">Operational tasks in progress</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Treasury</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            ₹{stats.netBalance.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Income: ₹{stats.totalIncome.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Two-Column Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Operational Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-blue-700" />
                <h2 className="text-base font-bold text-slate-900">Operational Tasks</h2>
              </div>
              <Link to="/erp/tasks" className="text-xs font-bold text-blue-700 hover:text-blue-800">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recentTasks?.map((task: any) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{task.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Assigned: {task.assignedMember?.user?.fullName || 'Unassigned'} • Due:{' '}
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Meetings & Governance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-700" />
                <h2 className="text-base font-bold text-slate-900">Governance & Meetings</h2>
              </div>
              <Link to="/erp/meetings" className="text-xs font-bold text-blue-700 hover:text-blue-800">
                Full Calendar →
              </Link>
            </div>

            <div className="space-y-3">
              {data?.upcomingMeetings?.map((m: any) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{m.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(m.meetingDate).toLocaleString()} • {m.locationOrLink}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center">
              <Cpu className="w-4 h-4 mr-1 text-teal-600" />
              Biometric IoT Gateway: ONLINE
            </span>
            <Link to="/erp/hardware" className="font-bold text-teal-600 hover:text-teal-700">
              Device Telemetry →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
