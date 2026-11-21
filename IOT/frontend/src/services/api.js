import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Patient endpoints
export const getPatients = () => api.get('/patients');
export const getPatientById = (id) => api.get(`/patients/${id}`);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);

// Ambulance endpoints
export const getAmbulances = () => api.get('/ambulances');
export const getAmbulanceById = (id) => api.get(`/ambulances/${id}`);
export const updateAmbulanceLocation = (id, data) => api.post(`/ambulances/${id}/location`, data);

// Vitals endpoints
export const getRecentVitals = (ambulanceId = 'AMB-01', limit = 30) => 
  api.get(`/vitals?ambulanceId=${ambulanceId}&limit=${limit}`);
export const addVitalReading = (data) => api.post('/vitals', data);

// Emergency endpoints
export const getEmergencyAlerts = () => api.get('/emergencies');
export const getHospitalDetails = () => api.get('/emergencies/hospital');
export const triggerEmergency = (data) => api.post('/emergencies/trigger', data);
export const acknowledgeEmergency = (data) => api.post('/emergencies/acknowledge', data);
export const resolveEmergency = (data) => api.post('/emergencies/resolve', data);

// IoT & Simulator endpoints
export const getSimulatorStatus = () => api.get('/iot/simulator/status');
export const setSimulatorScenario = (scenario) => api.post('/iot/simulator/scenario', { scenario });
export const setCustomTargets = (targets) => api.post('/iot/simulator/custom', targets);
export const updateThresholds = (thresholds) => api.post('/iot/simulator/thresholds', { thresholds });
export const toggleSimulation = () => api.post('/iot/simulator/toggle');
export const resetRoute = () => api.post('/iot/simulator/reset-route');
export const postESP32Data = (data) => api.post('/iot/data', data);

// Health
export const getHealth = () => api.get('/health');

export default api;
