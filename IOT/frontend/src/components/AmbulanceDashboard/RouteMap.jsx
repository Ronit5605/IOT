import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { createAmbulanceIcon, createHospitalIcon } from '../common/MapIcons';
import { Navigation, Clock, Gauge, MapPin } from 'lucide-react';

// Subcomponent to smoothly pan map when coordinates change
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 1.0 });
    }
  }, [center, map]);
  return null;
}

export default function RouteMap({ ambulance, hospital, isEmergency }) {
  const defaultAmbPos = [12.9716, 77.5946];
  const defaultHospPos = [12.9850, 77.6100];

  const ambPos = ambulance?.currentLocation?.lat && ambulance?.currentLocation?.lng
    ? [ambulance.currentLocation.lat, ambulance.currentLocation.lng]
    : defaultAmbPos;

  const hospPos = hospital?.location?.lat && hospital?.location?.lng
    ? [hospital.location.lat, hospital.location.lng]
    : defaultHospPos;

  const polylineCoords = [ambPos, hospPos];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      {/* Map Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Live Ambulance GPS Tracking</h4>
            <p className="text-xs text-slate-500">Route to {hospital?.name || 'Trauma Center'}</p>
          </div>
        </div>

        {/* Speed and ETA Badges */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
            <Gauge className="w-3.5 h-3.5 text-blue-600" />
            <span>{ambulance?.speed || 48} km/h</span>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>ETA: {ambulance?.etaMinutes || 8} min</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative flex-1 min-h-[300px] w-full rounded-lg overflow-hidden border border-slate-200">
        <MapContainer
          center={ambPos}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapRecenter center={ambPos} />

          {/* Ambulance Marker */}
          <Marker position={ambPos} icon={createAmbulanceIcon(isEmergency)}>
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-blue-700 flex items-center space-x-1">
                  <span>🚑 {ambulance?.vehicleNumber || 'KA-01-EA-108'}</span>
                </div>
                <div className="text-slate-600 mt-1">
                  Speed: <strong>{ambulance?.speed || 48} km/h</strong>
                </div>
                <div className="text-slate-600">
                  Location: {ambulance?.currentLocation?.address || 'Transit Corridor'}
                </div>
                {isEmergency && (
                  <div className="mt-1 text-red-600 font-bold uppercase text-[10px]">
                    CRITICAL EMERGENCY ACTIVE
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Hospital Destination Marker */}
          <Marker position={hospPos} icon={createHospitalIcon()}>
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-emerald-700 flex items-center space-x-1">
                  <span>🏥 {hospital?.name || 'City Central Trauma Center'}</span>
                </div>
                <div className="text-slate-600 mt-1">Level 1 Emergency & Trauma Unit</div>
                <div className="text-emerald-600 font-semibold text-[11px] mt-1">
                  ICU Bed Assigned & Ready
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Navigation Route Line */}
          <Polyline
            positions={polylineCoords}
            color={isEmergency ? '#DC2626' : '#2563EB'}
            weight={4}
            dashArray="6, 8"
            opacity={0.8}
          />
        </MapContainer>

        {/* Floating Location Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-md border border-slate-200 text-xs flex items-center justify-between z-[400]">
          <div className="flex items-center space-x-2 truncate">
            <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="text-slate-700 truncate font-medium">
              {ambulance?.currentLocation?.address || 'Indiranagar 100ft Rd, Bengaluru'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap ml-2">
            GPS Sync Active
          </span>
        </div>
      </div>
    </div>
  );
}
