const mongoose = require('mongoose');

const VitalReadingSchema = new mongoose.Schema({
  readingId: { type: String, required: true },
  ambulanceId: { type: String, required: true },
  patientId: { type: String, required: true },
  heartRate: { type: Number, required: true }, // bpm (normal: 60-100)
  spo2: { type: Number, required: true },      // % (normal: 95-100)
  temperature: { type: Number, required: true }, // °C (normal: 36.5 - 37.5)
  bloodPressure: {
    systolic: { type: Number, default: 120 },
    diastolic: { type: Number, default: 80 }
  },
  status: { 
    type: String, 
    enum: ['NORMAL', 'WARNING', 'CRITICAL'], 
    default: 'NORMAL' 
  },
  alerts: [{ type: String }],
  source: { 
    type: String, 
    enum: ['ESP32_SENSOR', 'SIMULATION', 'MANUAL'], 
    default: 'SIMULATION' 
  },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('VitalReading', VitalReadingSchema);
