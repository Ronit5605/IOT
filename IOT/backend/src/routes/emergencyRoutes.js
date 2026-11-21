const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

router.get('/', emergencyController.getEmergencyAlerts);
router.get('/hospital', emergencyController.getHospitalDetails);
router.post('/trigger', emergencyController.triggerEmergency);
router.post('/acknowledge', emergencyController.acknowledgeEmergency);
router.post('/resolve', emergencyController.resolveEmergency);

module.exports = router;
