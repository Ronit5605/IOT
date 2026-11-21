const storeService = require('../services/storeService');

exports.getEmergencyAlerts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const alerts = await storeService.getEmergencyAlerts(limit);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.triggerEmergency = async (req, res) => {
  try {
    const { ambulanceId, patientId, reason, severity, vitalSnapshot, locationSnapshot } = req.body;
    const ambId = ambulanceId || 'AMB-01';
    const patId = patientId || 'PT-1001';

    const patient = await storeService.getPatientById(patId);
    const ambulance = await storeService.getAmbulanceById(ambId);

    const alert = await storeService.createEmergencyAlert({
      ambulanceId: ambId,
      patientId: patId,
      patientName: patient ? patient.name : 'Unknown Patient',
      reason: reason || 'Paramedic Triggered Emergency Alert',
      severity: severity || 'CRITICAL',
      vitalSnapshot: vitalSnapshot || (ambulance ? ambulance.lastVitals : {}),
      locationSnapshot: locationSnapshot || (ambulance ? ambulance.currentLocation : {})
    });

    // Broadcast instant real-time emergency alert to Hospital Dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:triggered', {
        alert,
        patient,
        ambulance,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency alert dispatched to Hospital Central ER',
      data: alert
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.acknowledgeEmergency = async (req, res) => {
  try {
    const { ambulanceId, alertId, acknowledgedBy, notes } = req.body;
    const ambId = ambulanceId || 'AMB-01';

    const updatedAlert = await storeService.acknowledgeEmergency(
      ambId,
      alertId,
      acknowledgedBy || 'Dr. Ananya Ray (Chief Trauma Officer)',
      notes || 'ICU Bed 04 Prepared. Trauma & Resuscitation Team waiting at ER Bay 1.'
    );

    const ambulance = await storeService.getAmbulanceById(ambId);

    // Broadcast acknowledgment in real-time to Ambulance Dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:acknowledged', {
        alertId: alertId || (updatedAlert ? updatedAlert.alertId : null),
        ambulanceId: ambId,
        acknowledgedBy: acknowledgedBy || 'Dr. Ananya Ray (Chief Trauma Officer)',
        notes: notes || 'ICU Bed 04 Prepared. Trauma & Resuscitation Team waiting at ER Bay 1.',
        acknowledgedAt: new Date(),
        ambulance
      });
    }

    res.json({
      success: true,
      message: 'Emergency successfully acknowledged and broadcasted to ambulance',
      data: updatedAlert
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.resolveEmergency = async (req, res) => {
  try {
    const { ambulanceId, alertId } = req.body;
    const ambId = ambulanceId || 'AMB-01';
    await storeService.resolveEmergency(ambId, alertId);

    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:resolved', {
        ambulanceId: ambId,
        alertId,
        resolvedAt: new Date()
      });
    }

    res.json({ success: true, message: 'Emergency marked as resolved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getHospitalDetails = async (req, res) => {
  try {
    const info = storeService.getHospitalInfo();
    res.json({ success: true, data: info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
