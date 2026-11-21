import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import AmbulanceView from './components/AmbulanceDashboard/AmbulanceView';
import HospitalView from './components/HospitalDashboard/HospitalView';
import SimulatorPanel from './components/IoTSimulator/SimulatorPanel';
import EmergencyHistory from './components/RecordsView/EmergencyHistory';
import { soundAlert } from './components/common/AudioAlert';
import { getSocket, joinRoom } from './services/socket';
import {
  getPatients,
  getAmbulances,
  getRecentVitals,
  getEmergencyAlerts,
  getHospitalDetails,
  getSimulatorStatus,
  getHealth,
  triggerEmergency,
  acknowledgeEmergency,
  resolveEmergency,
  setSimulatorScenario,
  setCustomTargets,
  toggleSimulation,
  resetRoute,
  postESP32Data,
  updateThresholds
} from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('ambulance'); // 'ambulance', 'hospital', 'simulator', 'records'
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // Core Data
  const [ambulance, setAmbulance] = useState(null);
  const [patient, setPatient] = useState(null);
  const [allPatients, setAllPatients] = useState([]);
  const [hospital, setHospital] = useState(null);
  const [currentVitals, setCurrentVitals] = useState({
    heartRate: 78,
    spo2: 98,
    temperature: 37.0,
    bloodPressure: { systolic: 120, diastolic: 80 }
  });
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [simulatorStatus, setSimulatorStatus] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          patientsRes,
          ambRes,
          vitalsRes,
          alertsRes,
          hospRes,
          simRes,
          healthRes
        ] = await Promise.allSettled([
          getPatients(),
          getAmbulances(),
          getRecentVitals('AMB-01', 30),
          getEmergencyAlerts(),
          getHospitalDetails(),
          getSimulatorStatus(),
          getHealth()
        ]);

        if (patientsRes.status === 'fulfilled' && patientsRes.value.data.success) {
          const list = patientsRes.value.data.data;
          setAllPatients(list);
          if (list.length > 0) setPatient(list[0]);
        }

        if (ambRes.status === 'fulfilled' && ambRes.value.data.success) {
          const ambList = ambRes.value.data.data;
          if (ambList.length > 0) {
            setAmbulance(ambList[0]);
            if (ambList[0].emergencyStatus?.isEmergency) {
              setActiveEmergency(ambList[0].emergencyStatus);
            }
          }
        }

        if (vitalsRes.status === 'fulfilled' && vitalsRes.value.data.success) {
          const vList = vitalsRes.value.data.data;
          setVitalsHistory(vList);
          if (vList.length > 0) {
            const latest = vList[vList.length - 1];
            setCurrentVitals({
              heartRate: latest.heartRate,
              spo2: latest.spo2,
              temperature: latest.temperature,
              bloodPressure: latest.bloodPressure || { systolic: 120, diastolic: 80 }
            });
          }
        }

        if (alertsRes.status === 'fulfilled' && alertsRes.value.data.success) {
          const alList = alertsRes.value.data.data;
          setEmergencyAlerts(alList);
          const active = alList.find(a => a.status === 'TRIGGERED');
          if (active) setActiveEmergency(active);
        }

        if (hospRes.status === 'fulfilled' && hospRes.value.data.success) {
          setHospital(hospRes.value.data.data);
        }

        if (simRes.status === 'fulfilled' && simRes.value.data.success) {
          setSimulatorStatus(simRes.value.data.data);
        }

        if (healthRes.status === 'fulfilled') {
          setDbStatus(healthRes.value.data.database);
        }
      } catch (err) {
        console.error('[Initialization Error]', err);
      }
    };

    fetchInitialData();
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setSocketConnected(true);
      joinRoom('paramedic', 'AMB-01');
      joinRoom('hospital', 'HOSP-01');
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    // Live vitals stream event
    const handleVitalsUpdate = (payload) => {
      const reading = payload.reading;
      if (!reading) return;

      setCurrentVitals({
        heartRate: reading.heartRate,
        spo2: reading.spo2,
        temperature: reading.temperature,
        bloodPressure: reading.bloodPressure || { systolic: 120, diastolic: 80 }
      });

      setVitalsHistory((prev) => {
        const next = [...prev, reading];
        if (next.length > 30) next.shift();
        return next;
      });
    };

    // Live ambulance GPS location movement
    const handleLocationUpdate = (payload) => {
      setAmbulance((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentLocation: payload.location || prev.currentLocation,
          speed: payload.speed !== undefined ? payload.speed : prev.speed,
          etaMinutes: payload.etaMinutes !== undefined ? payload.etaMinutes : prev.etaMinutes
        };
      });
    };

    // Emergency triggered event
    const handleEmergencyTriggered = (payload) => {
      const alert = payload.alert;
      setActiveEmergency(alert);
      setEmergencyAlerts((prev) => [alert, ...prev]);

      // Sound buzzer siren
      soundAlert.playEmergencySiren();

      setAmbulance((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          emergencyStatus: {
            isEmergency: true,
            level: alert?.severity || 'CRITICAL',
            reason: alert?.reason || 'Critical vitals detected',
            triggeredAt: alert?.triggeredAt || new Date(),
            acknowledged: false
          }
        };
      });
    };

    // Emergency acknowledged event
    const handleEmergencyAcknowledged = (payload) => {
      soundAlert.stopEmergencySiren();
      soundAlert.playAckChime();

      setActiveEmergency((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'ACKNOWLEDGED',
          acknowledgedBy: payload.acknowledgedBy,
          instructions: payload.notes,
          acknowledgedAt: payload.acknowledgedAt
        };
      });

      setEmergencyAlerts((prev) =>
        prev.map((a) =>
          a.alertId === payload.alertId
            ? {
                ...a,
                status: 'ACKNOWLEDGED',
                acknowledgedBy: payload.acknowledgedBy,
                instructions: payload.notes,
                acknowledgedAt: payload.acknowledgedAt
              }
            : a
        )
      );

      setAmbulance((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          emergencyStatus: {
            ...prev.emergencyStatus,
            acknowledged: true,
            acknowledgedBy: payload.acknowledgedBy,
            hospitalNotes: payload.notes,
            acknowledgedAt: payload.acknowledgedAt
          }
        };
      });
    };

    // Emergency resolved event
    const handleEmergencyResolved = () => {
      soundAlert.stopEmergencySiren();
      setActiveEmergency(null);
      setAmbulance((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          emergencyStatus: {
            isEmergency: false,
            level: 'NORMAL',
            reason: '',
            acknowledged: false,
            acknowledgedBy: null,
            hospitalNotes: ''
          }
        };
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('vitals:update', handleVitalsUpdate);
    socket.on('ambulance:location', handleLocationUpdate);
    socket.on('emergency:triggered', handleEmergencyTriggered);
    socket.on('emergency:acknowledged', handleEmergencyAcknowledged);
    socket.on('emergency:resolved', handleEmergencyResolved);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('vitals:update', handleVitalsUpdate);
      socket.off('ambulance:location', handleLocationUpdate);
      socket.off('emergency:triggered', handleEmergencyTriggered);
      socket.off('emergency:acknowledged', handleEmergencyAcknowledged);
      socket.off('emergency:resolved', handleEmergencyResolved);
    };
  }, []);

  // Handlers
  const handleTriggerEmergency = async (alertPayload) => {
    try {
      const payload = {
        ambulanceId: ambulance?.ambulanceId || 'AMB-01',
        patientId: patient?.patientId || 'PT-1001',
        reason: alertPayload.reason,
        severity: alertPayload.severity,
        vitalSnapshot: alertPayload.vitalSnapshot,
        locationSnapshot: alertPayload.locationSnapshot
      };
      await triggerEmergency(payload);
    } catch (err) {
      console.error('[Trigger Emergency Error]', err);
    }
  };

  const handleAcknowledgeEmergency = async (ackPayload) => {
    try {
      await acknowledgeEmergency(ackPayload);
    } catch (err) {
      console.error('[Acknowledge Emergency Error]', err);
    }
  };

  const handleResolveEmergency = async (ambId) => {
    try {
      await resolveEmergency({ ambulanceId: ambId, alertId: activeEmergency?.alertId });
    } catch (err) {
      console.error('[Resolve Emergency Error]', err);
    }
  };

  const handleSelectPatient = (patientId) => {
    const p = allPatients.find((item) => item.patientId === patientId);
    if (p) setPatient(p);
  };

  const handleSetScenario = async (scenario) => {
    try {
      const res = await setSimulatorScenario(scenario);
      if (res.data.success) {
        setSimulatorStatus(res.data.data);
      }
    } catch (err) {
      console.error('[Set Scenario Error]', err);
    }
  };

  const handleSetCustomTargets = async (targets) => {
    try {
      const res = await setCustomTargets(targets);
      if (res.data.success) {
        setSimulatorStatus(res.data.data);
      }
    } catch (err) {
      console.error('[Custom Targets Error]', err);
    }
  };

  const handleToggleSimulator = async () => {
    try {
      const res = await toggleSimulation();
      if (res.data.success) {
        setSimulatorStatus((prev) => ({
          ...prev,
          isRunning: res.data.isRunning
        }));
      }
    } catch (err) {
      console.error('[Toggle Simulator Error]', err);
    }
  };

  const handleResetRoute = async () => {
    try {
      await resetRoute();
    } catch (err) {
      console.error('[Reset Route Error]', err);
    }
  };

  const handlePostESP32Packet = async (packet) => {
    try {
      await postESP32Data(packet);
    } catch (err) {
      console.error('[Post ESP32 Data Error]', err);
    }
  };

  const handleUpdateThresholds = async (thresh) => {
    try {
      const res = await updateThresholds(thresh);
      if (res.data.success) {
        setSimulatorStatus((prev) => ({
          ...prev,
          thresholds: res.data.thresholds
        }));
      }
    } catch (err) {
      console.error('[Update Thresholds Error]', err);
    }
  };

  const activeEmergencyCount = emergencyAlerts.filter((a) => a.status === 'TRIGGERED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        socketConnected={socketConnected}
        activeEmergencyCount={activeEmergencyCount}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        dbStatus={dbStatus}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'ambulance' && (
          <AmbulanceView
            ambulance={ambulance}
            patient={patient}
            allPatients={allPatients}
            onSelectPatient={handleSelectPatient}
            vitalsHistory={vitalsHistory}
            currentVitals={currentVitals}
            onTriggerEmergency={handleTriggerEmergency}
            onResolveEmergency={handleResolveEmergency}
            hospital={hospital}
          />
        )}

        {currentTab === 'hospital' && (
          <HospitalView
            hospital={hospital}
            ambulance={ambulance}
            patient={patient}
            currentVitals={currentVitals}
            vitalsHistory={vitalsHistory}
            emergencyAlerts={emergencyAlerts}
            activeEmergency={activeEmergency}
            onAcknowledgeEmergency={handleAcknowledgeEmergency}
          />
        )}

        {currentTab === 'simulator' && (
          <SimulatorPanel
            simulatorStatus={simulatorStatus}
            currentVitals={currentVitals}
            onSetScenario={handleSetScenario}
            onSetCustomTargets={handleSetCustomTargets}
            onToggleSimulator={handleToggleSimulator}
            onResetRoute={handleResetRoute}
            onPostESP32Packet={handlePostESP32Packet}
            onUpdateThresholds={handleUpdateThresholds}
          />
        )}

        {currentTab === 'records' && (
          <EmergencyHistory
            alerts={emergencyAlerts}
            vitalsHistory={vitalsHistory}
          />
        )}

      </main>

      {/* Modern Medical Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">
              IoT Smart Ambulance & Emergency Communication System
            </span>
            <span>&bull;</span>
            <span>React &bull; Vite &bull; Tailwind &bull; Express &bull; MongoDB &bull; Leaflet &bull; Socket.IO</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Demo Mode Ready</span>
            <span>&bull;</span>
            <button
              onClick={() => setCurrentTab('simulator')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Test IoT Simulator
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
