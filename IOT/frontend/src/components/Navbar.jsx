import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Ambulance, 
  Hospital, 
  Cpu, 
  ClipboardList, 
  Radio, 
  Volume2, 
  VolumeX, 
  ShieldAlert,
  Database
} from 'lucide-react';
import { soundAlert } from './common/AudioAlert';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  socketConnected, 
  activeEmergencyCount,
  isMuted,
  setIsMuted,
  dbStatus
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    const muted = soundAlert.toggleMute();
    setIsMuted(muted);
  };

  const navItems = [
    { id: 'ambulance', label: 'Ambulance Dashboard', icon: Ambulance, badge: null },
    { 
      id: 'hospital', 
      label: 'Hospital ER Dashboard', 
      icon: Hospital, 
      badge: activeEmergencyCount > 0 ? activeEmergencyCount : null 
    },
    { id: 'simulator', label: 'IoT Sensor Simulator', icon: Cpu, badge: 'Live' },
    { id: 'records', label: 'Emergency Logs', icon: ClipboardList, badge: null }
  ];

  return (
    <header className="bg-navy-900 border-b border-navy-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Project Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-2 rounded-xl shadow-lg flex items-center justify-center ring-2 ring-red-400/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SmartAmbulance</span>
                <span className="text-xs uppercase px-2 py-0.5 rounded-full font-semibold bg-blue-600/30 text-blue-300 border border-blue-500/30">
                  IoT v1.0
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Emergency Communication & Telemetry Network
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      typeof item.badge === 'number' 
                        ? 'bg-red-500 text-white animate-bounce' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Database indicator */}
            <div 
              title={dbStatus?.database || 'Database'} 
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-navy-800 text-xs text-slate-300 border border-navy-700"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>{dbStatus?.connected ? 'MongoDB' : 'Demo DB'}</span>
            </div>

            {/* Socket Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-navy-800 text-xs text-slate-300 border border-navy-700">
              <span className={`w-2 h-2 rounded-full ${
                socketConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-400'
              }`} />
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{socketConnected ? 'Online' : 'Reconnecting'}</span>
            </div>

            {/* Mute Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
              className={`p-2 rounded-lg transition-colors border ${
                isMuted 
                  ? 'bg-navy-800 border-navy-700 text-slate-400 hover:text-white' 
                  : 'bg-blue-600/30 border-blue-500/40 text-blue-300 hover:bg-blue-600/50'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Clock */}
            <div className="hidden sm:block text-right border-l border-navy-800 pl-3">
              <div className="text-xs font-mono font-semibold text-slate-200">{time}</div>
              <div className="text-[10px] text-slate-400 uppercase">Live IST</div>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex overflow-x-auto py-2 border-t border-navy-800 space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 bg-navy-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-[9px] px-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
