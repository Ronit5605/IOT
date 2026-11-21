import React from 'react';
import { AlertTriangle, Bell, CheckCircle2, Clock, MapPin, Activity } from 'lucide-react';

export default function EmergencyAlertBanner({ alert, onOpenAckModal }) {
  if (!alert) return null;

  const isTriggered = alert.status === 'TRIGGERED';

  return (
    <div className={`p-4 rounded-xl border-2 shadow-lg transition-all ${
      isTriggered
        ? 'bg-red-50 border-red-500 emergency-pulse-border'
        : 'bg-emerald-50 border-emerald-400'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Icon and Details */}
        <div className="flex items-start space-x-3">
          <div className={`p-2.5 rounded-xl ${
            isTriggered ? 'bg-red-600 text-white animate-bounce shadow-md' : 'bg-emerald-600 text-white'
          }`}>
            {isTriggered ? <Bell className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                isTriggered ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
              }`}>
                {isTriggered ? '🚨 CRITICAL EMERGENCY INCOMING' : '✅ ACKNOWLEDGED BY ER'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {new Date(alert.triggeredAt || Date.now()).toLocaleTimeString()}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-1">
              {alert.patientName || 'In-Transit Patient'} &mdash; Ambulance {alert.ambulanceId || 'AMB-01'}
            </h3>

            <p className="text-xs text-red-700 font-semibold mt-0.5">
              Alert Reason: {alert.reason || 'Critical vitals detected'}
            </p>

            {/* Vital snapshot summary */}
            {alert.vitalSnapshot && (
              <div className="flex items-center space-x-4 mt-2 text-xs font-mono font-bold">
                <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  HR: {alert.vitalSnapshot.heartRate || '--'} bpm
                </span>
                <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  SpO2: {alert.vitalSnapshot.spo2 || '--'}%
                </span>
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Temp: {alert.vitalSnapshot.temperature || '--'}°C
                </span>
              </div>
            )}

            {alert.instructions && (
              <div className="mt-2 text-xs text-emerald-800 bg-emerald-100/70 p-2 rounded-lg border border-emerald-300 font-medium">
                <strong>ER Instructions:</strong> {alert.instructions} (by {alert.acknowledgedBy})
              </div>
            )}
          </div>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center space-x-2 self-end md:self-center">
          {isTriggered ? (
            <button
              onClick={() => onOpenAckModal(alert)}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-red-900/40 flex items-center space-x-1.5 transition-all transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acknowledge Emergency</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 bg-white rounded-lg border border-emerald-300">
              Response Team Ready
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
