import React, { useState } from 'react';
import { CheckCircle2, X, Hospital, Bed, UserCheck, ShieldCheck } from 'lucide-react';

export default function ERReadinessModal({ isOpen, onClose, alert, onAcknowledge }) {
  const [doctorName, setDoctorName] = useState('Dr. Ananya Ray (Chief Trauma Officer)');
  const [bedNumber, setBedNumber] = useState('ICU-04');
  const [notes, setNotes] = useState('ICU Bed 04 Prepared. Trauma team on standby with defib & ventilator.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !alert) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onAcknowledge({
      ambulanceId: alert.ambulanceId,
      alertId: alert.alertId,
      acknowledgedBy: doctorName,
      notes: `[${bedNumber}] ${notes}`
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-emerald-500 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Acknowledge Incoming Emergency</h3>
              <p className="text-xs text-emerald-100">Dispatches preparation confirmation to ambulance crew</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Ambulance:</span>
              <span className="font-bold text-slate-800">{alert.ambulanceId}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-800">{alert.patientName}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-slate-500">Emergency Reason:</span>
              <span className="font-semibold text-red-600">{alert.reason}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Attending ER Physician Name
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Assigned ICU / Trauma Bed
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['ICU-01', 'ICU-04 (Trauma)', 'Resuscitation Bay', 'OT-2'].map((bed) => (
                <button
                  type="button"
                  key={bed}
                  onClick={() => setBedNumber(bed)}
                  className={`py-2 px-2 text-[11px] font-bold rounded-lg border text-center transition-all ${
                    bedNumber === bed
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {bed}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              ER Preparation Instructions & Readiness Message
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Trauma bay ready, cardiologist notified, blood bank prepared."
              required
            />
          </div>

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
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{submitting ? 'Transmitting...' : 'Confirm ER Acknowledgment'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
