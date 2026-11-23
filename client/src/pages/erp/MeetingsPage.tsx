import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Meeting } from '../../types';
import {
  Calendar,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
} from 'lucide-react';

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // New Meeting Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agenda, setAgenda] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('Cooperative Headquarters');
  const [scheduling, setScheduling] = useState(false);

  // Minutes Form
  const [minutesContent, setMinutesContent] = useState('');
  const [attendanceCount, setAttendanceCount] = useState(15);
  const [savingMinutes, setSavingMinutes] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.get<Meeting[]>('/erp/meetings');
      setMeetings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setScheduling(true);
      await api.post('/erp/meetings', {
        title,
        description,
        agenda,
        meetingDate,
        locationOrLink,
      });

      setShowScheduleModal(false);
      setTitle('');
      setDescription('');
      setAgenda('');
      await fetchMeetings();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule meeting.');
    } finally {
      setScheduling(false);
    }
  };

  const handleSaveMinutes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    try {
      setSavingMinutes(true);
      await api.post(`/erp/meetings/${selectedMeeting.id}/minutes`, {
        minutesContent,
        attendanceCount,
        actionItems: ['Review Q4 procurement tenders', 'Distribute certified course directive to field teams'],
        decisions: ['Approved allocation of ₹1,45,000 for solar inverter backup'],
      });

      setShowMinutesModal(false);
      setSelectedMeeting(null);
      setMinutesContent('');
      await fetchMeetings();
    } catch (err: any) {
      alert(err.message || 'Failed to record meeting minutes.');
    } finally {
      setSavingMinutes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-700" />
            Meeting Management & Minutes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize cooperative AGMs, executive board reviews, agendas, and record legally archived minutes.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Schedule Meeting
        </button>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400">Loading meetings...</div>
        ) : meetings.length > 0 ? (
          meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'CONCLUDED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {m.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(m.meetingDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{m.title}</h3>
                {m.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{m.description}</p>
                )}

                <div className="mt-3 flex items-center text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{m.locationOrLink}</span>
                </div>

                {/* Agenda */}
                {m.agenda && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <p className="font-bold text-slate-700 mb-1">Agenda Points:</p>
                    <p className="text-slate-600 whitespace-pre-line text-[11px]">{m.agenda}</p>
                  </div>
                )}

                {/* Recorded Minutes preview */}
                {m.minutes && (
                  <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs">
                    <p className="font-bold text-emerald-900 mb-0.5 flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Recorded Minutes ({m.minutes.attendanceCount} Quorum Members Present)
                    </p>
                    <p className="text-emerald-800 text-[11px] line-clamp-2">{m.minutes.minutesContent}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                {m.status !== 'CONCLUDED' ? (
                  <button
                    onClick={() => {
                      setSelectedMeeting(m);
                      setShowMinutesModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Record Official Minutes
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Minutes Digitally Archived
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No scheduled meetings</h3>
            <p className="text-xs text-slate-500 mt-1">Schedule an AGM or executive meeting to convene members.</p>
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Schedule Cooperative Meeting</h3>
            <p className="text-xs text-slate-500 mb-4">Set meeting date, time, location, and formal agenda.</p>

            <form onSubmit={handleScheduleMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual General Meeting (AGM) 2026"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / Video Link</label>
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="e.g. Nashik Agro Hub Conference Room / Google Meet"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Formal Agenda</label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="1. Review Q3 Audit&#10;2. Dividend distribution&#10;3. IoT Rollout"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  {scheduling ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Minutes Modal */}
      {showMinutesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Record Official Minutes</h3>
            <p className="text-xs text-slate-500 mb-4">
              Archiving minutes for: <span className="font-bold text-slate-800">{selectedMeeting?.title}</span>
            </p>

            <form onSubmit={handleSaveMinutes} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Verified Member Quorum Count</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={attendanceCount}
                  onChange={(e) => setAttendanceCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minutes of Proceedings *</label>
                <textarea
                  required
                  rows={5}
                  value={minutesContent}
                  onChange={(e) => setMinutesContent(e.target.value)}
                  placeholder="Record formal resolutions, member consensus, voting counts, and allocated operational actions..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMinutesModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMinutes}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  {savingMinutes ? 'Archiving...' : 'Sign & Conclude Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
