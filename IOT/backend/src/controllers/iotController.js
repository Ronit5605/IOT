const simulatorService = require('../services/simulatorService');

exports.receiveESP32Data = async (req, res) => {
  try {
    const { ambulanceId, patientId, heartRate, spo2, temperature, bloodPressure, lat, lng } = req.body;

    if (heartRate === undefined || spo2 === undefined || temperature === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: heartRate, spo2, and temperature are required'
      });
    }

    const result = await simulatorService.injectSensorReading({
      ambulanceId: ambulanceId || 'AMB-01',
      patientId: patientId || 'PT-1001',
      heartRate,
      spo2,
      temperature,
      bloodPressure
    });

    if (lat !== undefined && lng !== undefined) {
      const storeService = require('../services/storeService');
      await storeService.updateAmbulanceLocation(ambulanceId || 'AMB-01', { lat, lng });
      const io = req.app.get('io');
      if (io) {
        io.emit('ambulance:location', {
          ambulanceId: ambulanceId || 'AMB-01',
          location: { lat, lng }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'ESP32 sensor packet received and broadcasted',
      vitalReading: result.reading,
      status: result.status,
      alerts: result.alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSimulatorStatus = (req, res) => {
  try {
    const status = simulatorService.getStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.setScenario = (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) {
      return res.status(400).json({ success: false, message: 'scenario name is required' });
    }
    simulatorService.setScenario(scenario);
    res.json({
      success: true,
      message: `Simulation scenario changed to ${scenario}`,
      data: simulatorService.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.setCustomTargets = (req, res) => {
  try {
    const { heartRate, spo2, temperature } = req.body;
    simulatorService.setCustomTargets({ heartRate, spo2, temperature });
    res.json({
      success: true,
      message: 'Custom vitals targets applied',
      data: simulatorService.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateThresholds = (req, res) => {
  try {
    const { thresholds } = req.body;
    if (thresholds) {
      simulatorService.setThresholds(thresholds);
    }
    res.json({
      success: true,
      message: 'Demo thresholds updated',
      thresholds: simulatorService.thresholds
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleSimulation = (req, res) => {
  try {
    if (simulatorService.isRunning) {
      simulatorService.stop();
    } else {
      simulatorService.start();
    }
    res.json({
      success: true,
      isRunning: simulatorService.isRunning,
      message: simulatorService.isRunning ? 'Simulator started' : 'Simulator paused'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.resetRoute = (req, res) => {
  try {
    simulatorService.resetRoute();
    res.json({ success: true, message: 'Ambulance route reset to start' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
