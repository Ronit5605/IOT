import React, { useState } from 'react';
import { ClipboardList, ShieldAlert, CheckCircle2, Clock, Activity, FileText, Download } from 'lucide-react';

export default function EmergencyHistory({ alerts = [], vitalsHistory = [] }) {
  const [activeTab, setActiveTab] = useState('emergencies'); // 'emergencies' or 'vitals'

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-2 bg-navy-900 text-white rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </span>
            <span>Emergency Incident Logs & Telemetry Records</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of patient vitals telemetry and emergency acknowledgments stored in database
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('emergencies')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'emergencies'
                ? 'bg-white text-navy-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Emergency Incidents ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'vitals'
                ? 'bg-white text-navy-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recent Telemetry Logs ({vitalsHistory.length})
          </button>
        </div>
      </div>

      {/* Emergencies Table */}
      {activeTab === 'emergencies' ? (
        <div className="overflow-x-auto">
          {alerts.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Alert ID</th>
                  <th className="p-3">Ambulance</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Triggered Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">ER Acknowledgment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {alerts.map((a, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-700">{a.alertId}</td>
                    <td className="p-3 font-semibold">{a.ambulanceId}</td>
                    <td className="p-3 font-semibold">{a.patientName || 'Dev Patel'}</td>
                    <td className="p-3 max-w-xs truncate" title={a.reason}>
                      {a.reason}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        a.severity === 'CRITICAL' 
                          ? 'bg-red-100 text-red-800 border border-red-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {a.severity || 'CRITICAL'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(a.triggeredAt || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        a.status === 'ACKNOWLEDGED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'RESOLVED'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-red-600 text-white animate-pulse'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {a.acknowledgedBy ? (
                        <div>
                          <div className="font-semibold text-emerald-700">{a.acknowledgedBy}</div>
                          <div className="text-[10px] text-slate-400">{a.instructions}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending ER Review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No emergency incidents recorded yet during this session.
            </div>
          )}
        </div>
      ) : (
        /* Vitals Telemetry Table */
        <div className="overflow-x-auto">
          {vitalsHistory.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Ambulance</th>
                  <th className="p-3">Heart Rate (bpm)</th>
                  <th className="p-3">SpO2 (%)</th>
                  <th className="p-3">Temperature (°C)</th>
                  <th className="p-3">Blood Pressure</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Data Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {vitalsHistory.slice().reverse().map((v, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-slate-500">
                      {v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : '--'}
                    </td>
                    <td className="p-3 font-semibold">{v.ambulanceId || 'AMB-01'}</td>
                    <td className={`p-3 font-bold ${v.heartRate > 120 || v.heartRate < 50 ? 'text-red-600' : 'text-slate-800'}`}>
                      {v.heartRate} bpm
                    </td>
                    <td className={`p-3 font-bold ${v.spo2 <= 90 ? 'text-red-600' : 'text-slate-800'}`}>
                      {v.spo2} %
                    </td>
                    <td className={`p-3 font-bold ${v.temperature >= 39.0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {v.temperature} °C
                    </td>
                    <td className="p-3">
                      {v.bloodPressure ? `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}` : '120/80'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : v.status === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {v.status || 'NORMAL'}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {v.source || 'SIMULATION'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No vital readings received yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
