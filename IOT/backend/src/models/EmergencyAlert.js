const mongoose = require('mongoose');

const EmergencyAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  ambulanceId: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, default: 'Unknown Patient' },
  vitalSnapshot: {
    heartRate: { type: Number },
    spo2: { type: Number },
    temperature: { type: Number }
  },
  locationSnapshot: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  severity: { 
    type: String, 
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], 
    default: 'CRITICAL' 
  },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['TRIGGERED', 'ACKNOWLEDGED', 'ICU_PREPARED', 'RESOLVED'], 
    default: 'TRIGGERED' 
  },
  triggeredAt: { type: Date, default: Date.now },
  acknowledgedAt: { type: Date },
  acknowledgedBy: { type: String },
  instructions: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyAlert', EmergencyAlertSchema);
