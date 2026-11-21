const storeService = require('../services/storeService');

exports.getRecentVitals = async (req, res) => {
  try {
    const ambulanceId = req.query.ambulanceId || 'AMB-01';
    const limit = parseInt(req.query.limit, 10) || 30;
    const vitals = await storeService.getRecentVitals(ambulanceId, limit);
    res.json({ success: true, count: vitals.length, data: vitals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addVitalReading = async (req, res) => {
  try {
    const { ambulanceId, patientId, heartRate, spo2, temperature, bloodPressure, status, alerts, source } = req.body;
    
    if (heartRate === undefined || spo2 === undefined || temperature === undefined) {
      return res.status(400).json({
        success: false,
        message: 'heartRate, spo2, and temperature are required'
      });
    }

    const reading = await storeService.addVitalReading({
      ambulanceId: ambulanceId || 'AMB-01',
      patientId: patientId || 'PT-1001',
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      temperature: Number(temperature),
      bloodPressure,
      status: status || 'NORMAL',
      alerts: alerts || [],
      source: source || 'MANUAL'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('vitals:update', {
        reading,
        ambulanceId: reading.ambulanceId,
        patientId: reading.patientId
      });
    }

    res.status(201).json({ success: true, data: reading });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
