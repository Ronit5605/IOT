import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, HeartPulse, Send } from 'lucide-react';

export default function EmergencyTriggerModal({
  isOpen,
  onClose,
  onTrigger,
  patient,
  ambulance,
  currentVitals
}) {
  const [reason, setReason] = useState('Acute Arrhythmia & Sudden Deterioration');
  const [severity, setSeverity] = useState('CRITICAL');
  const [customNote, setCustomNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const presetReasons = [
    'Acute Arrhythmia & Sudden Deterioration',
    'Severe Respiratory Failure / Rapid Desaturation (SpO2 < 85%)',
    'Cardiac Arrest / CPR Initiated in Transit',
    'Hypovolemic Shock / Severe Trauma Hemorrhage',
    'Anaphylactic Reaction / Airway Compromise'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const finalReason = customNote ? `${reason} - ${customNote}` : reason;
    await onTrigger({
      reason: finalReason,
      severity,
      vitalSnapshot: {
        heartRate: currentVitals.heartRate,
        spo2: currentVitals.spo2,
        temperature: currentVitals.temperature
      },
      locationSnapshot: ambulance?.currentLocation || {}
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Trigger Priority Emergency Alert</h3>
              <p className="text-xs text-red-100">Dispatches real-time siren & triage alert to Hospital ER</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Patient and Ambulance summary banner */}
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-700">Patient:</span>{' '}
              <span className="font-bold text-red-800">{patient?.name || 'Dev Patel'}</span>{' '}
              ({patient?.age || 48}y / {patient?.bloodGroup || 'O+'})
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-700">Ambulance:</span>{' '}
              <span className="font-bold text-blue-700">{ambulance?.vehicleNumber || 'KA-01-EA-108'}</span>
            </div>
          </div>

          {/* Current Live Vitals to be transmitted */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Live Vitals Snapshot (Auto-attached)
            </label>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                <div className="text-slate-500">Heart Rate</div>
                <div className="text-base font-bold text-rose-600">{currentVitals?.heartRate || 76} bpm</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                <div className="text-slate-500">SpO2</div>
                <div className="text-base font-bold text-sky-600">{currentVitals?.spo2 || 98}%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                <div className="text-slate-500">Temperature</div>
                <div className="text-base font-bold text-amber-600">{currentVitals?.temperature || 37.0}°C</div>
              </div>
            </div>
          </div>

          {/* Severity selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Triage Priority Severity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['CRITICAL', 'HIGH', 'MODERATE'].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setSeverity(level)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    severity === level
                      ? level === 'CRITICAL'
                        ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                        : level === 'HIGH'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400'
                        : 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-400'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Reason presets */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Select Primary Medical Reason
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {presetReasons.map((r, i) => (
                <label
                  key={i}
                  className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    reason === r ? 'bg-red-50 border-red-300 text-red-900 font-semibold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="emergencyReason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional note */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Paramedic Notes / Special Equipment Needed (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Prepare defibrillator and intubation kit at ER bay"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30 flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Transmitting...' : 'Send Immediate ER Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
