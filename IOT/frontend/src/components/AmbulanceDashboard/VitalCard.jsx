import React from 'react';
import { Heart, Activity, Thermometer, Droplet, Gauge, AlertTriangle } from 'lucide-react';

export default function VitalCard({ title, value, unit, status, icon: Icon, normalRange, changeTrend }) {
  // Determine styles based on status
  let cardBg = 'bg-white border-slate-200';
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let valueColor = 'text-slate-900';
  let iconBg = 'bg-blue-50 text-blue-600';
  let isAlert = false;

  if (status === 'CRITICAL') {
    cardBg = 'bg-red-50/70 border-red-300 emergency-pulse-border ring-2 ring-red-400';
    badgeClass = 'bg-red-600 text-white animate-pulse font-bold';
    valueColor = 'text-red-700';
    iconBg = 'bg-red-600 text-white';
    isAlert = true;
  } else if (status === 'WARNING') {
    cardBg = 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300';
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    valueColor = 'text-amber-800';
    iconBg = 'bg-amber-500 text-white';
  }

  return (
    <div className={`p-4 rounded-xl border shadow-sm transition-all duration-300 relative overflow-hidden ${cardBg}`}>
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${iconBg} transition-colors`}>
            <Icon className={`w-5 h-5 ${isAlert ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
            <div className="text-[11px] text-slate-400">Normal: {normalRange}</div>
          </div>
        </div>

        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badgeClass}`}>
          {status}
        </span>
      </div>

      {/* Main value display */}
      <div className="mt-2 flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-3xl font-extrabold tracking-tight font-mono ${valueColor}`}>
            {value !== undefined && value !== null ? value : '--'}
          </span>
          <span className="text-sm font-semibold text-slate-500">{unit}</span>
        </div>

        {changeTrend && (
          <span className="text-xs font-medium text-slate-500 flex items-center space-x-0.5">
            <span>{changeTrend}</span>
          </span>
        )}
      </div>

      {/* Critical alert banner inside card */}
      {isAlert && (
        <div className="mt-2 pt-2 border-t border-red-200 flex items-center space-x-1 text-[11px] font-bold text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
          <span>Threshold exceeded! Hospital notified.</span>
        </div>
      )}
    </div>
  );
}
