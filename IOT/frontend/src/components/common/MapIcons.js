import L from 'leaflet';

// Custom SVG Ambulance Marker Icon
export const createAmbulanceIcon = (isEmergency = false) => {
  return L.divIcon({
    className: 'custom-ambulance-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${isEmergency ? '<span class="absolute -top-1 -right-1 flex h-4 w-4"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span></span>' : ''}
        <div class="w-10 h-10 rounded-full ${isEmergency ? 'bg-red-600 border-2 border-white emergency-pulse-border' : 'bg-blue-600 border-2 border-white'} shadow-lg flex items-center justify-center text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5m1.5-9H17V6h-4v3.5H9.5V6H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.2a3 3 0 0 0 5.6 0h2.4a3 3 0 0 0 5.6 0h.2a1 1 0 0 0 1-1v-4.5l-2.5-3.5M6 18.5A1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 15.5 1.5 1.5 0 0 1 7.5 17 1.5 1.5 0 0 1 6 18.5M10.5 8H12v2h2v1.5h-2v2h-1.5v-2h-2V10h2V8Z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Custom SVG Hospital Marker Icon
export const createHospitalIcon = () => {
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-11 h-11 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};
