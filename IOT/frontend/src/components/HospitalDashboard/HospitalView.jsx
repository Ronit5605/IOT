import React, { useState } from 'react';
import EmergencyAlertBanner from './EmergencyAlertBanner';
import ERReadinessModal from './ERReadinessModal';
import PatientTriageCard from './PatientTriageCard';
import RouteMap from '../AmbulanceDashboard/RouteMap';
import VitalsChart from '../AmbulanceDashboard/VitalsChart';
import VitalCard from '../AmbulanceDashboard/VitalCard';
import { 
  Hospital, 
  Bed, 
  Activity, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Heart, 
  Droplet, 
  Thermometer, 
  Gauge,
  PhoneCall,
  UserPlus
} from 'lucide-react';

export default function HospitalView({
  hospital,
  ambulance,
  patient,
  currentVitals,
  vitalsHistory,
  emergencyAlerts,
  activeEmergency,
  onAcknowledgeEmergency
}) {
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedAlertForAck, setSelectedAlertForAck] = useState(null);

  const handleOpenAckModal = (alert) => {
    setSelectedAlertForAck(alert || activeEmergency);
    setAckModalOpen(true);
  };

  const isEmergencyActive = activeEmergency && activeEmergency.status === 'TRIGGERED';

  return (
    <div className="space-y-6">

      {/* Hospital Command Center Header Bar */}
      <div className="bg-navy-900 text-white p-5 rounded-2xl border border-navy-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-md">
            <Hospital className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold tracking-tight">
                {hospital?.name || 'City Central Trauma Center & Super Specialty Hospital'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LEVEL 1 TRAUMA
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {hospital?.department || 'Emergency & Critical Care Division (ER / ICU)'} &bull; Hotline: {hospital?.emergencyHotline}
            </p>
          </div>
        </div>

        {/* ER Resource Status Pill Boxes */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">ICU Beds</div>
            <div className="text-base font-extrabold text-emerald-400">
              {hospital?.availableBeds?.icu || 4} Available
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Ventilators</div>
            <div className="text-base font-extrabold text-sky-400">
              {hospital?.availableBeds?.ventilators || 3} Ready
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Trauma Bays</div>
            <div className="text-base font-extrabold text-amber-400">
              {hospital?.availableBeds?.emergencyWard || 7} Open
            </div>
          </div>
        </div>
      </div>

      {/* Active Emergency Alert Banner (Highlighted if active) */}
      {activeEmergency ? (
        <EmergencyAlertBanner
          alert={activeEmergency}
          onOpenAckModal={handleOpenAckModal}
        />
      ) : (
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Hospital Central ER Status:</span>
            <span>All monitored inbound ambulances are operating under normal conditions.</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Emergency Channel 108 Live</span>
        </div>
      )}

      {/* Real-time Incoming Patient Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard
          title="Patient Heart Rate"
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
          changeTrend="Live Stream"
        />

        <VitalCard
          title="Patient SpO2 Level"
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
          title="Patient Temperature"
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
          changeTrend="Telemetry Node"
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
          changeTrend="NIBP"
        />
      </div>

      {/* Main ER Command Layout: Left Triage & Waveform (7 cols), Right Map & ETA (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Triage Record & Telemetry Waveform */}
        <div className="lg:col-span-7 space-y-6">
          <PatientTriageCard
            patient={patient}
            ambulance={ambulance}
            currentVitals={currentVitals}
          />
          <VitalsChart data={vitalsHistory} />
        </div>

        {/* Right Side: Ambulance Route Map & Incoming Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="h-[360px]">
            <RouteMap
              ambulance={ambulance}
              hospital={hospital}
              isEmergency={Boolean(activeEmergency && activeEmergency.status === 'TRIGGERED')}
            />
          </div>

          {/* Quick Dispatch Action Box for ER Team */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Emergency Acknowledgment & Team Action</span>
              <span className="text-[11px] font-mono text-emerald-600">ER Bay 1 Active</span>
            </h4>

            {isEmergencyActive ? (
              <button
                onClick={() => handleOpenAckModal(activeEmergency)}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-900/30 flex items-center justify-center space-x-2 transition-transform active:scale-98 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge Emergency & Dispatch Team</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Trauma Bay standby. Awaiting paramedic alerts.</span>
                <button
                  onClick={() => handleOpenAckModal(activeEmergency)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Manual ER Memo
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Acknowledgment Modal */}
      <ERReadinessModal
        isOpen={ackModalOpen}
        onClose={() => setAckModalOpen(false)}
        alert={selectedAlertForAck}
        onAcknowledge={onAcknowledgeEmergency}
      />

    </div>
  );
}
