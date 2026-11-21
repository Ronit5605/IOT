import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  AlertTriangle, 
  Send, 
  Code, 
  CheckCircle, 
  Zap, 
  Activity, 
  Droplet, 
  Thermometer 
} from 'lucide-react';
import ESP32SnippetModal from './ESP32SnippetModal';

export default function SimulatorPanel({
  simulatorStatus,
  currentVitals,
  onSetScenario,
  onSetCustomTargets,
  onToggleSimulator,
  onResetRoute,
  onPostESP32Packet,
  onUpdateThresholds
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [customHR, setCustomHR] = useState(currentVitals?.heartRate || 80);
  const [customSpO2, setCustomSpO2] = useState(currentVitals?.spo2 || 98);
  const [customTemp, setCustomTemp] = useState(currentVitals?.temperature || 37.0);

  // Threshold form state
  const [hrCriticalHigh, setHrCriticalHigh] = useState(
    simulatorStatus?.thresholds?.heartRate?.criticalHigh || 130
  );
  const [spo2Critical, setSpo2Critical] = useState(
    simulatorStatus?.thresholds?.spo2?.critical || 90
  );
  const [tempCritical, setTempCritical] = useState(
    simulatorStatus?.thresholds?.temperature?.criticalHigh || 39.2
  );

  const [message, setMessage] = useState(null);

  const showFlashMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApplyCustom = async () => {
    await onSetCustomTargets({
      heartRate: Number(customHR),
      spo2: Number(customSpO2),
      temperature: Number(customTemp)
    });
    showFlashMessage('Custom vitals applied! Sensor data is trending to target.');
  };

  const handleUpdateThresholds = async (e) => {
    e.preventDefault();
    await onUpdateThresholds({
      heartRate: { ...simulatorStatus?.thresholds?.heartRate, criticalHigh: Number(hrCriticalHigh) },
      spo2: { ...simulatorStatus?.thresholds?.spo2, critical: Number(spo2Critical) },
      temperature: { ...simulatorStatus?.thresholds?.temperature, criticalHigh: Number(tempCritical) }
    });
    showFlashMessage('Configurable demo thresholds updated!');
  };

  const handleSendESP32Burst = async () => {
    await onPostESP32Packet({
      ambulanceId: 'AMB-01',
      patientId: 'PT-1001',
      heartRate: Number(customHR),
      spo2: Number(customSpO2),
      temperature: Number(customTemp),
      bloodPressure: { systolic: 135, diastolic: 88 }
    });
    showFlashMessage('HTTP POST /api/iot/data transmitted from simulated ESP32!');
  };

  const scenarios = [
    {
      id: 'NORMAL',
      label: 'Normal Patient',
      desc: 'HR: 72-82 bpm, SpO2: 97-99%, Temp: 36.8-37.2°C',
      color: 'border-emerald-300 bg-emerald-50 text-emerald-800'
    },
    {
      id: 'TACHYCARDIA',
      label: 'Critical Tachycardia / STEMI',
      desc: 'HR: 135-155 bpm, SpO2: 92-95%, Temp: 37.6°C',
      color: 'border-red-300 bg-red-50 text-red-800'
    },
    {
      id: 'HYPOXIA',
      label: 'Severe Hypoxia / Asthma',
      desc: 'HR: 115-125 bpm, SpO2: 80-86%, Temp: 37.1°C',
      color: 'border-sky-300 bg-sky-50 text-sky-800'
    },
    {
      id: 'HIGH_FEVER',
      label: 'Hyperthermia / Sepsis',
      desc: 'HR: 118-130 bpm, SpO2: 93-96%, Temp: 39.5-40.2°C',
      color: 'border-amber-300 bg-amber-50 text-amber-800'
    },
    {
      id: 'CARDIAC_ARREST',
      label: 'Severe Bradycardia / Arrest',
      desc: 'HR: 32-44 bpm, SpO2: 74-82%, Temp: 35.8°C',
      color: 'border-purple-300 bg-purple-50 text-purple-800'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Simulator Control Header */}
      <div className="bg-navy-900 text-white p-5 rounded-2xl border border-navy-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-600 rounded-xl text-white shadow-md">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold tracking-tight">IoT Sensor Simulation Engine</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                simulatorStatus?.isRunning 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {simulatorStatus?.isRunning ? 'Loop Active (3s)' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulates MAX30102 pulse oximeter & DS18B20 temperature telemetry for college demo evaluation
            </p>
          </div>
        </div>

        {/* Global Simulator Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleSimulator}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all ${
              simulatorStatus?.isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-navy-950'
                : 'bg-emerald-500 hover:bg-emerald-600 text-navy-950'
            }`}
          >
            {simulatorStatus?.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{simulatorStatus?.isRunning ? 'Pause Loop' : 'Resume Loop'}</span>
          </button>

          <button
            onClick={onResetRoute}
            title="Reset ambulance GPS route"
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-colors"
          >
            <Code className="w-4 h-4" />
            <span>ESP32 Code & Pinout</span>
          </button>
        </div>
      </div>

      {/* Flash Alert Banner if action performed */}
      {message && (
        <div className="p-3 bg-blue-50 border border-blue-300 text-blue-900 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <Zap className="w-4 h-4 text-blue-600 animate-bounce" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Grid: Preset Scenarios (Left 6 cols), Custom Sliders & Hardware Trigger (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scenario Presets */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-navy-900 text-white">
                <Activity className="w-4 h-4 text-emerald-400" />
              </span>
              <span>Clinical Demo Scenario Presets</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly simulate real patient medical crises to verify real-time hospital notification
            </p>
          </div>

          <div className="space-y-2.5">
            {scenarios.map((sc) => {
              const isSelected = simulatorStatus?.scenario === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => onSetScenario(sc.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-400/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        sc.id === 'NORMAL' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                      }`} />
                      <span className="font-extrabold text-xs text-slate-900">{sc.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Active Scenario
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 pl-5">{sc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Telemetry Sliders & Hardware POST */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Sliders Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Manual Sensor Target Sliders</span>
                </h3>
                <p className="text-xs text-slate-500">Fine-tune values to observe threshold triggers</p>
              </div>
              <button
                onClick={handleApplyCustom}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Apply Targets
              </button>
            </div>

            {/* Heart Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span>Heart Rate</span>
                </span>
                <span className="font-mono text-rose-600 font-bold">{customHR} bpm</span>
              </div>
              <input
                type="range"
                min="40"
                max="170"
                value={customHR}
                onChange={(e) => setCustomHR(e.target.value)}
                className="w-full accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>40 (Bradycardia)</span>
                <span>80 (Normal)</span>
                <span>170 (Critical)</span>
              </div>
            </div>

            {/* SpO2 Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 flex items-center space-x-1">
                  <Droplet className="w-3.5 h-3.5 text-sky-500" />
                  <span>SpO2 Blood Oxygen</span>
                </span>
                <span className="font-mono text-sky-600 font-bold">{customSpO2} %</span>
              </div>
              <input
                type="range"
                min="65"
                max="100"
                value={customSpO2}
                onChange={(e) => setCustomSpO2(e.target.value)}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>65% (Critical Hypoxia)</span>
                <span>90% (Warning)</span>
                <span>100% (Normal)</span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 flex items-center space-x-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Body Temperature</span>
                </span>
                <span className="font-mono text-amber-600 font-bold">{customTemp} °C</span>
              </div>
              <input
                type="range"
                min="34.0"
                max="41.5"
                step="0.1"
                value={customTemp}
                onChange={(e) => setCustomTemp(e.target.value)}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>34.0°C (Hypothermia)</span>
                <span>37.0°C (Normal)</span>
                <span>41.5°C (High Fever)</span>
              </div>
            </div>

            {/* Test ESP32 REST POST Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Inject packet via REST:</span>
              <button
                onClick={handleSendESP32Burst}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transmit ESP32 HTTP POST</span>
              </button>
            </div>
          </div>

          {/* Configurable Demo Thresholds Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Configurable Demo Alert Thresholds</span>
            </h4>

            <form onSubmit={handleUpdateThresholds} className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">HR Critical High</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={hrCriticalHigh}
                    onChange={(e) => setHrCriticalHigh(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <span className="text-slate-400">bpm</span>
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">SpO2 Critical Low</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={spo2Critical}
                    onChange={(e) => setSpo2Critical(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Temp Critical High</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    value={tempCritical}
                    onChange={(e) => setTempCritical(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <span className="text-slate-400">°C</span>
                </div>
              </div>

              <div className="col-span-3 pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors"
                >
                  Save Demo Thresholds
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* ESP32 Hardware Snippet Modal */}
      <ESP32SnippetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

    </div>
  );
}
