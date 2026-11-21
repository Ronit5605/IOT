import React, { useState } from 'react';
import VitalCard from './VitalCard';
import VitalsChart from './VitalsChart';
import RouteMap from './RouteMap';
import EmergencyTriggerModal from './EmergencyTriggerModal';
import { 
  Heart, 
  Droplet, 
  Thermometer, 
  Gauge, 
  AlertOctagon, 
  CheckCircle, 
  User, 
  Phone, 
  Ambulance, 
  Hospital, 
  Clock, 
  ShieldCheck, 
  Radio, 
  Sparkles 
} from 'lucide-react';

export default function AmbulanceView({
  ambulance,
  patient,
  allPatients,
  onSelectPatient,
  vitalsHistory,
  currentVitals,
  vitalStatus,
  onTriggerEmergency,
  onResolveEmergency,
  hospital
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const emergencyState = ambulance?.emergencyStatus || {};
  const isEmergency = emergencyState.isEmergency;
  const isAcknowledged = emergencyState.acknowledged;

  return (
    <div className="space-y-6">
      
      {/* Emergency Status Banner */}
      {isEmergency ? (
        <div className={`p-4 rounded-xl border-2 transition-all shadow-md ${
          isAcknowledged 
            ? 'bg-emerald-50 border-emerald-500 text-emerald-950' 
            : 'bg-red-50 border-red-500 emergency-pulse-border text-red-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${isAcknowledged ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white animate-bounce'}`}>
                {isAcknowledged ? <CheckCircle className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-base uppercase tracking-wide">
                    {isAcknowledged ? '✅ Hospital Acknowledged Alert' : '🚨 EMERGENCY ALERT BROADCASTED'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isAcknowledged ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-900 animate-pulse'
                  }`}>
                    {emergencyState.level || 'CRITICAL'}
                  </span>
                </div>
                <p className="text-xs mt-1">
                  <strong>Reason:</strong> {emergencyState.reason || 'Critical vitals threshold violation'}
                </p>
                {isAcknowledged && (
                  <div className="mt-2 text-xs font-semibold text-emerald-800 bg-white/80 p-2 rounded-lg border border-emerald-300">
                    <span className="text-emerald-900">Dr. Notes ({emergencyState.acknowledgedBy || 'ER Attending'}):</span>{' '}
                    {emergencyState.hospitalNotes || 'Trauma bay prepared. Surgical team standing by.'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              <button
                onClick={() => onResolveEmergency(ambulance?.ambulanceId)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
              >
                Mark Resolved / Reset
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">Telemetry Active:</span>
            <span>Continuous IoT vital streaming to Hospital Central ER</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/20 flex items-center space-x-1.5 transition-all transform active:scale-95"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Trigger Emergency</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Details Grid: Patient Card & Ambulance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Information Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">In-Transit Patient Profile</h3>
                <p className="text-xs text-slate-500">ID: {patient?.patientId || 'PT-1001'}</p>
              </div>
            </div>

            {/* Patient Selector for demo */}
            <select
              value={patient?.patientId || 'PT-1001'}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {allPatients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name} ({p.condition.split('/')[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Full Name</span>
              <span className="font-bold text-slate-800 text-sm">{patient?.name || 'Dev Patel'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded-lg px-3 text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Age</div>
                <div className="font-bold text-slate-800">{patient?.age || 48} yrs</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Gender</div>
                <div className="font-bold text-slate-800">{patient?.gender || 'Male'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Blood Grp</div>
                <div className="font-extrabold text-red-700">{patient?.bloodGroup || 'O+'}</div>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Primary Clinical Diagnosis</span>
              <span className="font-bold text-slate-800 bg-red-50 text-red-800 px-2 py-1 rounded inline-block text-xs border border-red-200">
                {patient?.condition || 'Acute Chest Pain / STEMI'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Known Medical History</span>
              <p className="text-slate-700 leading-relaxed font-medium">
                {patient?.medicalHistory || 'Type-2 Diabetes, Hypertension. Prior stent (2021).'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Next of Kin: {patient?.emergencyContact?.name || 'Ananya Patel'}</span>
              </span>
              <span className="font-mono text-slate-700 font-semibold">
                {patient?.emergencyContact?.phone || '+91 98765 43210'}
              </span>
            </div>
          </div>
        </div>

        {/* Ambulance & Paramedic Unit Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Ambulance Unit AMB-01</h3>
                  <p className="text-xs text-slate-500">{ambulance?.vehicleNumber || 'KA-01-EA-108'}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                EN_ROUTE
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Paramedic In-Charge:</span>
                <span className="font-semibold text-slate-800">{ambulance?.paramedicName || 'Nurse Sarah Jenkins'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Driver:</span>
                <span className="font-semibold text-slate-800">{ambulance?.driverName || 'Rajesh Kumar'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination Hospital:</span>
                <span className="font-bold text-blue-700">{hospital?.name || 'City Central Trauma Center'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hospital Emergency Hotline:</span>
                <span className="font-mono font-bold text-red-600">{hospital?.emergencyHotline || '108 / 080-2555-9999'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-slate-500">IoT ESP32 Node:</span>
              <span className="font-semibold text-slate-700">Online & Broadcasting</span>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline"
            >
              Raise Alert
            </button>
          </div>
        </div>

        {/* Quick Emergency Action Trigger Box */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white p-5 rounded-xl shadow-lg flex flex-col justify-between border border-navy-800">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Paramedic Action Control</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Socket.IO Direct</span>
            </div>

            <h4 className="text-lg font-bold text-white mt-2">Emergency Communication</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Instantly transmit high-priority alert with live patient telemetry to the Emergency Department doctors before arrival.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-navy-800">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2 transition-all transform active:scale-98"
            >
              <AlertOctagon className="w-5 h-5 animate-pulse" />
              <span>Broadcast Emergency Alert</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4 Core Vitals Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard
          title="Heart Rate"
          value={currentVitals?.heartRate}
          unit="bpm"
          status={
            currentVitals?.heartRate > 120 || currentVitals?.heartRate < 50
              ? 'CRITICAL'
              : currentVitals?.heartRate > 100 || currentVitals?.heartRate < 60
              ? 'WARNING'
              : 'NORMAL'
          }
          icon={Heart}
          normalRange="60 - 100 bpm"
          changeTrend="Live Pulse"
        />

        <VitalCard
          title="SpO2 Saturation"
          value={currentVitals?.spo2}
          unit="%"
          status={
            currentVitals?.spo2 <= 90
              ? 'CRITICAL'
              : currentVitals?.spo2 < 95
              ? 'WARNING'
              : 'NORMAL'
          }
          icon={Droplet}
          normalRange="95 - 100%"
          changeTrend="Pulse Oximeter"
        />

        <VitalCard
          title="Body Temperature"
          value={currentVitals?.temperature}
          unit="°C"
          status={
            currentVitals?.temperature >= 39.0 || currentVitals?.temperature < 35.5
              ? 'CRITICAL'
              : currentVitals?.temperature > 37.8
              ? 'WARNING'
              : 'NORMAL'
          }
          icon={Thermometer}
          normalRange="36.5 - 37.5 °C"
          changeTrend="Digital Sensor"
        />

        <VitalCard
          title="Blood Pressure"
          value={
            currentVitals?.bloodPressure
              ? `${currentVitals.bloodPressure.systolic}/${currentVitals.bloodPressure.diastolic}`
              : '120/80'
          }
          unit="mmHg"
          status={
            currentVitals?.bloodPressure?.systolic > 150
              ? 'CRITICAL'
              : currentVitals?.bloodPressure?.systolic > 130
              ? 'WARNING'
              : 'NORMAL'
          }
          icon={Gauge}
          normalRange="120/80 mmHg"
          changeTrend="NIBP Monitor"
        />
      </div>

      {/* Chart and Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real-time Waveform Chart (7 cols) */}
        <div className="lg:col-span-7">
          <VitalsChart data={vitalsHistory} />
        </div>

        {/* Live GPS Route Map (5 cols) */}
        <div className="lg:col-span-5">
          <RouteMap
            ambulance={ambulance}
            hospital={hospital}
            isEmergency={isEmergency}
          />
        </div>

      </div>

      {/* Emergency Trigger Modal */}
      <EmergencyTriggerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onTrigger={onTriggerEmergency}
        patient={patient}
        ambulance={ambulance}
        currentVitals={currentVitals}
      />

    </div>
  );
}
