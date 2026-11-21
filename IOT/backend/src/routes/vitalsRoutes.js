const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');

router.get('/', vitalsController.getRecentVitals);
router.post('/', vitalsController.addVitalReading);

module.exports = router;
