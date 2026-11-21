import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { Activity, Droplet, Thermometer } from 'lucide-react';

export default function VitalsChart({ data = [] }) {
  const [activeMetric, setActiveMetric] = useState('heartRate'); // 'heartRate', 'spo2', 'temperature'

  // Format chart data with short time labels
  const formattedData = data.map((item, idx) => {
    const timeStr = item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : `${idx}`;
    return {
      ...item,
      timeLabel: timeStr
    };
  });

  const metricConfigs = {
    heartRate: {
      title: 'Heart Rate (ECG Pulse)',
      unit: 'bpm',
      color: '#E11D48',
      fillColor: '#FFE4E6',
      domain: [40, 160],
      refLines: [
        { y: 60, label: 'Low (60)', color: '#F59E0B' },
        { y: 100, label: 'High (100)', color: '#F59E0B' },
        { y: 130, label: 'Critical (>130)', color: '#DC2626' }
      ],
      icon: Activity
    },
    spo2: {
      title: 'Blood Oxygen Saturation (SpO2)',
      unit: '%',
      color: '#0284C7',
      fillColor: '#E0F2FE',
      domain: [70, 100],
      refLines: [
        { y: 95, label: 'Normal (95%)', color: '#10B981' },
        { y: 90, label: 'Critical (<90%)', color: '#DC2626' }
      ],
      icon: Droplet
    },
    temperature: {
      title: 'Body Temperature',
      unit: '°C',
      color: '#D97706',
      fillColor: '#FEF3C7',
      domain: [35, 41],
      refLines: [
        { y: 37.0, label: 'Normal (37.0°C)', color: '#10B981' },
        { y: 38.5, label: 'Fever (38.5°C)', color: '#DC2626' }
      ],
      icon: Thermometer
    }
  };

  const currentConfig = metricConfigs[activeMetric];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-navy-900 text-white">
              <Activity className="w-4 h-4 text-emerald-400" />
            </span>
            <span>Real-Time Vital Signs Waveform</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Live streaming patient telemetry telemetry window (30-point cache)</p>
        </div>

        {/* Metric Switcher Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveMetric('heartRate')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeMetric === 'heartRate'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>Heart Rate</span>
          </button>

          <button
            onClick={() => setActiveMetric('spo2')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeMetric === 'spo2'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-sky-500" />
            <span>SpO2</span>
          </button>

          <button
            onClick={() => setActiveMetric('temperature')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeMetric === 'temperature'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>Temperature</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full mt-4">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="timeLabel" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                tickLine={false} 
              />
              <YAxis 
                domain={currentConfig.domain} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                unit={` ${currentConfig.unit}`}
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B192C', 
                  borderRadius: '0.5rem', 
                  color: '#fff', 
                  fontSize: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                }}
                formatter={(val) => [`${val} ${currentConfig.unit}`, currentConfig.title]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              
              {currentConfig.refLines.map((ref, idx) => (
                <ReferenceLine 
                  key={idx} 
                  y={ref.y} 
                  stroke={ref.color} 
                  strokeDasharray="4 4" 
                  label={{ 
                    value: ref.label, 
                    fill: ref.color, 
                    fontSize: 9, 
                    position: 'insideBottomRight' 
                  }} 
                />
              ))}

              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={currentConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#gradient-${activeMetric})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Waiting for real-time telemetry stream...
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time sampling every 3 seconds</span>
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Metric: {currentConfig.title} ({currentConfig.unit})
        </span>
      </div>
    </div>
  );
}
