const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// ESP32 sensor data ingestion endpoint
router.post('/data', iotController.receiveESP32Data);
router.post('/vitals', iotController.receiveESP32Data);

// Simulator controls
router.get('/simulator/status', iotController.getSimulatorStatus);
router.post('/simulator/scenario', iotController.setScenario);
router.post('/simulator/custom', iotController.setCustomTargets);
router.post('/simulator/thresholds', iotController.updateThresholds);
router.post('/simulator/toggle', iotController.toggleSimulation);
router.post('/simulator/reset-route', iotController.resetRoute);

module.exports = router;
