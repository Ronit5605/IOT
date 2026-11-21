const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  bloodGroup: { type: String, default: 'O+' },
  condition: { type: String, default: 'Guarded' },
  triageCategory: { type: String, default: 'Red - Immediate' },
  medicalHistory: { type: String, default: 'No known allergies' },
  emergencyContact: {
    name: { type: String, default: 'Family Member' },
    phone: { type: String, default: '+91 98765 43210' },
    relation: { type: String, default: 'Spouse' }
  },
  ambulanceId: { type: String, default: 'AMB-01' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
