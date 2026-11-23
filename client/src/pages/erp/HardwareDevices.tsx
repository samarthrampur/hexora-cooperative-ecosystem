import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Cpu,
  Wifi,
  Radio,
  CheckCircle2,
  Clock,
  Play,
  Terminal,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const HardwareDevices: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/hardware/devices');
      setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSync = async (deviceIdentifier: string) => {
    try {
      setSimulating(true);
      setSyncResult(null);

      // Simulate sending biometric swipe packets to hardware attendance-sync endpoint
      const payload = {
        deviceIdentifier,
        apiKey: 'demo_biometric_key',
        syncLogs: [
          {
            membershipId: 'MEM-002', // Arjun Deshmukh
            timestamp: new Date().toISOString(),
            verificationMethod: 'BIOMETRIC_DEVICE',
          },
        ],
      };

      const res = await api.post<any>('/hardware/attendance-sync', payload);
      setSyncResult(res.message);
      await fetchDevices();
    } catch (err: any) {
      alert(err.message || 'Hardware simulation failed.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <Cpu className="w-6 h-6 mr-2 text-blue-700" />
          Hardware & IoT Biometric Extensibility Layer
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official Problem Statement SIH26087 Hardware Track Integration. Sync physical biometric terminals, RFID gates, and telemetry nodes.
        </p>
      </div>

      {syncResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          {syncResult}
        </div>
      )}

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-slate-400">Loading devices...</div>
        ) : devices.length > 0 ? (
          devices.map((dev) => (
            <div
              key={dev.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    ID: {dev.deviceIdentifier}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    {dev.status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{dev.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Location: {dev.location}</p>
                <p className="text-xs text-slate-500 mt-0.5">Type: {dev.type}</p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Associated Cooperative:</span>
                    <span className="font-bold text-slate-800">{dev.cooperative?.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Logs Ingested:</span>
                    <span className="font-bold text-blue-700">{dev._count?.attendanceLogs || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Last Telemetry Heartbeat:</span>
                    <span className="font-medium text-slate-500">
                      {dev.lastSyncAt ? new Date(dev.lastSyncAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Biotrack IoT Pro Firmware v3.2</span>
                <button
                  onClick={() => handleSimulateSync(dev.deviceIdentifier)}
                  disabled={simulating}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 mr-1 text-teal-400" />
                  {simulating ? 'Ingesting Swipes...' : 'Simulate Biometric Swipe'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-slate-500">No hardware devices registered.</div>
        )}
      </div>

      {/* Hardware Interface Specification Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>IoT Hardware Developer Documentation</span>
        </div>

        <h3 className="text-lg font-bold text-white">
          External Biometric / RFID Terminal Sync API
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          Physical attendance terminals (e.g., ZKTeco, BioMini, or ESP32-based RFID readers) dispatch periodic JSON batches to synchronize worker and member attendance.
        </p>

        <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800">
          <pre>{`POST /api/hardware/attendance-sync
Content-Type: application/json

{
  "deviceIdentifier": "HEX-BIO-NASHIK-01",
  "apiKey": "secure_device_secret_token",
  "syncLogs": [
    {
      "membershipId": "MEM-002",
      "timestamp": "2026-11-23T08:45:00Z",
      "verificationMethod": "BIOMETRIC_DEVICE"
    }
  ]
}`}</pre>
        </div>
      </div>
    </div>
  );
};
