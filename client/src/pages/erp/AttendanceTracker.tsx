import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AttendanceRecord, Member } from '../../types';
import {
  Clock,
  CheckCircle2,
  Cpu,
  Calendar,
  UserCheck,
  Smartphone,
  Plus,
} from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  // Check-in form
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [status, setStatus] = useState<'PRESENT' | 'LATE' | 'HALF_DAY'>('PRESENT');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchInitialData = async () => {
    try {
      const membersData = await api.get<Member[]>('/erp/members');
      setMembers(membersData);
      if (membersData.length > 0) setSelectedMemberId(membersData[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>(`/erp/attendance?date=${date}`);
      setRecords(res.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/erp/attendance', {
        memberId: selectedMemberId,
        status,
        notes,
      });

      setShowCheckInModal(false);
      setNotes('');
      await fetchAttendance();
    } catch (err: any) {
      alert(err.message || 'Failed to record attendance.');
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
            <Clock className="w-6 h-6 mr-2 text-blue-700" />
            Attendance & Biometric Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily member check-in verification synced with hardware IoT terminals and manual logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Check-In
          </button>
        </div>
      </div>

      {/* Hardware Status Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">Hardware Extensibility Layer Active</p>
            <p className="text-blue-700 text-[11px]">
              Accepting real-time biometric and RFID swipes from endpoint <code>/api/hardware/attendance-sync</code>
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-white text-emerald-700 font-bold rounded-lg border border-blue-200 self-start sm:self-auto flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          Terminal Connected
        </span>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Membership ID</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Check-In Time</th>
                <th className="px-6 py-3.5">Verification Method</th>
                <th className="px-6 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading attendance logs for {date}...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      {r.member?.user?.fullName || 'Member'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-600">
                      {r.member?.membershipId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.verificationMethod === 'BIOMETRIC_DEVICE'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.verificationMethod === 'BIOMETRIC_DEVICE' ? (
                          <>
                            <Cpu className="w-3 h-3 mr-1" />
                            Biometric IoT
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Manual Log
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{r.notes || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No attendance records for {date}. Use the "Record Check-In" button to add a record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Record Member Attendance</h3>
            <p className="text-xs text-slate-500 mb-4">
              Manually authenticate member check-in for {date}.
            </p>

            <form onSubmit={handleRecordAttendance} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Member *</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user.fullName} ({m.membershipId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attendance Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late Check-in</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Verification Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Field inspection check-in"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  {submitting ? 'Recording...' : 'Submit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
