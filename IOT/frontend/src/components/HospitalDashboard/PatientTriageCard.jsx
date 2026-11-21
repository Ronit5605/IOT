import React from 'react';
import { User, AlertCircle, Heart, Droplet, Thermometer, ShieldAlert, Phone, Clock, FileText } from 'lucide-react';

export default function PatientTriageCard({ patient, ambulance, currentVitals }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-navy-900 text-white rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Incoming Patient Triage Record</h3>
            <p className="text-xs text-slate-500">ID: {patient?.patientId || 'PT-1001'} &bull; Ambulance: {ambulance?.vehicleNumber}</p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300">
          {patient?.triageCategory || 'Red - Immediate'}
        </span>
      </div>

      {/* Patient demographics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Patient Name</span>
          <span className="font-extrabold text-slate-800 text-sm">{patient?.name || 'Dev Patel'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Age / Gender</span>
          <span className="font-bold text-slate-700">{patient?.age} yrs / {patient?.gender}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Blood Group</span>
          <span className="font-extrabold text-red-600 text-sm">{patient?.bloodGroup}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Transit ETA</span>
          <span className="font-extrabold text-blue-700 text-sm">{ambulance?.etaMinutes || 8} mins</span>
        </div>
      </div>

      {/* Primary Diagnosis & History */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-slate-500 font-semibold block mb-1">Primary Emergency Condition:</span>
          <div className="p-2.5 rounded-lg bg-red-50 text-red-900 border border-red-200 font-bold">
            {patient?.condition || 'Acute Myocardial Infarction / STEMI'}
          </div>
        </div>

        <div>
          <span className="text-slate-500 font-semibold block mb-1">Pre-existing Medical History:</span>
          <p className="p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
            {patient?.medicalHistory || 'Type-2 Diabetes, Hypertension. Prior coronary stent.'}
          </p>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center space-x-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>Emergency Contact: {patient?.emergencyContact?.name} ({patient?.emergencyContact?.relation})</span>
        </span>
        <span className="font-mono font-bold text-slate-800">
          {patient?.emergencyContact?.phone}
        </span>
      </div>
    </div>
  );
}
