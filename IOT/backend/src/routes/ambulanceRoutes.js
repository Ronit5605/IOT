const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulanceController');

router.get('/', ambulanceController.getAmbulances);
router.get('/:id', ambulanceController.getAmbulanceById);
router.put('/:id', ambulanceController.updateAmbulance);
router.post('/:id/location', ambulanceController.updateLocation);

module.exports = router;
