const Patient = require('../models/Patient');
const Ambulance = require('../models/Ambulance');
const VitalReading = require('../models/VitalReading');
const EmergencyAlert = require('../models/EmergencyAlert');
const { isMongoConnected } = require('../config/db');
const { initialPatients, initialAmbulances, hospitalInfo } = require('../data/seedData');

// In-Memory storage fallback
let memPatients = JSON.parse(JSON.stringify(initialPatients));
let memAmbulances = JSON.parse(JSON.stringify(initialAmbulances));
let memVitals = [];
let memAlerts = [];

// Seed database if MongoDB is active
const initData = async () => {
  if (isMongoConnected()) {
    try {
      const patientCount = await Patient.countDocuments();
      if (patientCount === 0) {
        await Patient.insertMany(initialPatients);
        console.log('[Store] Seeded sample patients into MongoDB.');
      }

      const ambulanceCount = await Ambulance.countDocuments();
      if (ambulanceCount === 0) {
        await Ambulance.insertMany(initialAmbulances);
        console.log('[Store] Seeded sample ambulances into MongoDB.');
      }
    } catch (err) {
      console.error('[Store Seed Error]', err.message);
    }
  } else {
    console.log('[Store] Initialized In-Memory store with sample patients & ambulances.');
  }
};

const storeService = {
  initData,

  // --- Patients ---
  async getPatients() {
    if (isMongoConnected()) {
      return await Patient.find({}).lean();
    }
    return memPatients;
  },

  async getPatientById(patientId) {
    if (isMongoConnected()) {
      return await Patient.findOne({ patientId }).lean();
    }
    return memPatients.find(p => p.patientId === patientId) || null;
  },

  async updatePatient(patientId, updateData) {
    if (isMongoConnected()) {
      return await Patient.findOneAndUpdate({ patientId }, updateData, { new: true }).lean();
    }
    const idx = memPatients.findIndex(p => p.patientId === patientId);
    if (idx !== -1) {
      memPatients[idx] = { ...memPatients[idx], ...updateData, updatedAt: new Date() };
      return memPatients[idx];
    }
    return null;
  },

  // --- Ambulances ---
  async getAmbulances() {
    if (isMongoConnected()) {
      return await Ambulance.find({}).lean();
    }
    return memAmbulances;
  },

  async getAmbulanceById(ambulanceId) {
    if (isMongoConnected()) {
      return await Ambulance.findOne({ ambulanceId }).lean();
    }
    return memAmbulances.find(a => a.ambulanceId === ambulanceId) || null;
  },

  async updateAmbulance(ambulanceId, updateData) {
    if (isMongoConnected()) {
      return await Ambulance.findOneAndUpdate({ ambulanceId }, updateData, { new: true }).lean();
    }
    const idx = memAmbulances.findIndex(a => a.ambulanceId === ambulanceId);
    if (idx !== -1) {
      memAmbulances[idx] = { ...memAmbulances[idx], ...updateData, updatedAt: new Date() };
      return memAmbulances[idx];
    }
    return null;
  },

  async updateAmbulanceLocation(ambulanceId, location, speed, etaMinutes) {
    const update = {
      'currentLocation.lat': location.lat,
      'currentLocation.lng': location.lng,
      ...(location.address ? { 'currentLocation.address': location.address } : {}),
      ...(speed !== undefined ? { speed } : {}),
      ...(etaMinutes !== undefined ? { etaMinutes } : {})
    };

    if (isMongoConnected()) {
      return await Ambulance.findOneAndUpdate({ ambulanceId }, { $set: update }, { new: true }).lean();
    }

    const amb = memAmbulances.find(a => a.ambulanceId === ambulanceId);
    if (amb) {
      amb.currentLocation = {
        ...amb.currentLocation,
        lat: location.lat,
        lng: location.lng,
        ...(location.address ? { address: location.address } : {})
      };
      if (speed !== undefined) amb.speed = speed;
      if (etaMinutes !== undefined) amb.etaMinutes = etaMinutes;
      amb.updatedAt = new Date();
      return amb;
    }
    return null;
  },

  // --- Vitals ---
  async addVitalReading(vitalData) {
    const reading = {
      readingId: vitalData.readingId || `VIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ambulanceId: vitalData.ambulanceId || 'AMB-01',
      patientId: vitalData.patientId || 'PT-1001',
      heartRate: Number(vitalData.heartRate),
      spo2: Number(vitalData.spo2),
      temperature: Number(vitalData.temperature),
      bloodPressure: vitalData.bloodPressure || { systolic: 120, diastolic: 80 },
      status: vitalData.status || 'NORMAL',
      alerts: vitalData.alerts || [],
      source: vitalData.source || 'SIMULATION',
      timestamp: vitalData.timestamp ? new Date(vitalData.timestamp) : new Date()
    };

    if (isMongoConnected()) {
      try {
        const doc = new VitalReading(reading);
        await doc.save();
      } catch (err) {
        console.error('[Store Error saving vital to MongoDB]', err.message);
      }
    }

    // Keep recent 100 in memory for fast retrieval
    memVitals.unshift(reading);
    if (memVitals.length > 200) memVitals.pop();

    return reading;
  },

  async getRecentVitals(ambulanceId = 'AMB-01', limit = 30) {
    if (isMongoConnected()) {
      try {
        const docs = await VitalReading.find({ ambulanceId })
          .sort({ timestamp: -1 })
          .limit(limit)
          .lean();
        if (docs && docs.length > 0) return docs.reverse();
      } catch (e) {
        // Fallback to mem
      }
    }
    const filtered = memVitals.filter(v => v.ambulanceId === ambulanceId);
    return filtered.slice(0, limit).reverse();
  },

  // --- Emergencies ---
  async createEmergencyAlert(alertData) {
    const alert = {
      alertId: alertData.alertId || `ALERT-${Date.now()}`,
      ambulanceId: alertData.ambulanceId,
      patientId: alertData.patientId,
      patientName: alertData.patientName || 'Dev Patel',
      vitalSnapshot: alertData.vitalSnapshot || {},
      locationSnapshot: alertData.locationSnapshot || {},
      severity: alertData.severity || 'CRITICAL',
      reason: alertData.reason || 'Patient Condition Deteriorated',
      status: 'TRIGGERED',
      triggeredAt: new Date(),
      acknowledgedAt: null,
      acknowledgedBy: null,
      instructions: alertData.instructions || ''
    };

    if (isMongoConnected()) {
      try {
        const doc = new EmergencyAlert(alert);
        await doc.save();
      } catch (err) {
        console.error('[Store Error saving alert]', err.message);
      }
    }

    memAlerts.unshift(alert);

    // Update ambulance emergency state
    await this.updateAmbulance(alert.ambulanceId, {
      emergencyStatus: {
        isEmergency: true,
        level: alert.severity,
        reason: alert.reason,
        triggeredAt: alert.triggeredAt,
        acknowledged: false,
        acknowledgedAt: null,
        acknowledgedBy: null,
        hospitalNotes: ''
      }
    });

    return alert;
  },

  async getEmergencyAlerts(limit = 50) {
    if (isMongoConnected()) {
      try {
        return await EmergencyAlert.find({}).sort({ triggeredAt: -1 }).limit(limit).lean();
      } catch (err) {
        // Fallback
      }
    }
    return memAlerts.slice(0, limit);
  },

  async acknowledgeEmergency(ambulanceId, alertId, acknowledgedBy, notes) {
    const now = new Date();
    let updatedAlert = null;

    if (isMongoConnected()) {
      try {
        const query = alertId ? { alertId } : { ambulanceId, status: 'TRIGGERED' };
        updatedAlert = await EmergencyAlert.findOneAndUpdate(
          query,
          {
            status: 'ACKNOWLEDGED',
            acknowledgedAt: now,
            acknowledgedBy: acknowledgedBy || 'ER Attending Physician',
            instructions: notes || 'ICU Bed 04 Prepared. Trauma Team on standby.'
          },
          { new: true, sort: { triggeredAt: -1 } }
        ).lean();
      } catch (err) {
        console.error('[Store Error acknowledging in Mongo]', err.message);
      }
    }

    // In-Memory update
    const alert = memAlerts.find(a => 
      (alertId ? a.alertId === alertId : a.ambulanceId === ambulanceId && a.status === 'TRIGGERED')
    );
    if (alert) {
      alert.status = 'ACKNOWLEDGED';
      alert.acknowledgedAt = now;
      alert.acknowledgedBy = acknowledgedBy || 'ER Attending Physician';
      alert.instructions = notes || 'ICU Bed 04 Prepared. Trauma Team on standby.';
      if (!updatedAlert) updatedAlert = alert;
    }

    // Update ambulance status
    const ambulance = await this.getAmbulanceById(ambulanceId);
    if (ambulance) {
      await this.updateAmbulance(ambulanceId, {
        emergencyStatus: {
          ...ambulance.emergencyStatus,
          acknowledged: true,
          acknowledgedAt: now,
          acknowledgedBy: acknowledgedBy || 'ER Attending Physician',
          hospitalNotes: notes || 'ICU Bed 04 Prepared. Trauma Team on standby.'
        }
      });
    }

    return updatedAlert || {
      ambulanceId,
      status: 'ACKNOWLEDGED',
      acknowledgedAt: now,
      acknowledgedBy,
      instructions: notes
    };
  },

  async resolveEmergency(ambulanceId, alertId) {
    if (isMongoConnected()) {
      try {
        await EmergencyAlert.findOneAndUpdate(
          { alertId },
          { status: 'RESOLVED' }
        );
      } catch (e) {}
    }

    const alert = memAlerts.find(a => a.alertId === alertId || a.ambulanceId === ambulanceId);
    if (alert) alert.status = 'RESOLVED';

    await this.updateAmbulance(ambulanceId, {
      emergencyStatus: {
        isEmergency: false,
        level: 'NORMAL',
        reason: 'Emergency Resolved / Patient Delivered to ER',
        triggeredAt: null,
        acknowledged: false,
        acknowledgedAt: null,
        acknowledgedBy: null,
        hospitalNotes: 'Patient successfully handed over to Emergency Ward.'
      }
    });

    return { success: true };
  },

  getHospitalInfo() {
    return hospitalInfo;
  }
};

module.exports = storeService;
