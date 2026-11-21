const mongoose = require('mongoose');

const AmbulanceSchema = new mongoose.Schema({
  ambulanceId: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, default: 'Rajesh Kumar' },
  driverPhone: { type: String, default: '+91 91234 56789' },
  paramedicName: { type: String, default: 'Nurse Sarah Jenkins' },
  status: { 
    type: String, 
    enum: ['ON_DUTY', 'EN_ROUTE', 'IDLE', 'EMERGENCY_DISPATCHED'], 
    default: 'EN_ROUTE' 
  },
  currentLocation: {
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 },
    address: { type: String, default: 'Indiranagar 100ft Rd, Bengaluru' }
  },
  destinationHospital: {
    name: { type: String, default: 'City Central Trauma Center' },
    lat: { type: Number, default: 12.9850 },
    lng: { type: Number, default: 77.6100 }
  },
  speed: { type: Number, default: 48 }, // km/h
  etaMinutes: { type: Number, default: 12 },
  activePatientId: { type: String, default: 'PT-1001' },
  emergencyStatus: {
    isEmergency: { type: Boolean, default: false },
    level: { type: String, enum: ['NORMAL', 'WARNING', 'CRITICAL'], default: 'NORMAL' },
    reason: { type: String, default: 'Normal monitoring' },
    triggeredAt: { type: Date, default: null },
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date, default: null },
    acknowledgedBy: { type: String, default: null },
    hospitalNotes: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Ambulance', AmbulanceSchema);
