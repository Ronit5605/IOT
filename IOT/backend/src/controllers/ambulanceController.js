const storeService = require('../services/storeService');

exports.getAmbulances = async (req, res) => {
  try {
    const ambulances = await storeService.getAmbulances();
    res.json({ success: true, data: ambulances });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAmbulanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const ambulance = await storeService.getAmbulanceById(id);
    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }
    res.json({ success: true, data: ambulance });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAmbulance = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storeService.updateAmbulance(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, speed, etaMinutes } = req.body;
    if (!location || location.lat === undefined || location.lng === undefined) {
      return res.status(400).json({ success: false, message: 'location with lat and lng is required' });
    }
    const updated = await storeService.updateAmbulanceLocation(id, location, speed, etaMinutes);
    
    // Broadcast via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('ambulance:location', {
        ambulanceId: id,
        location,
        speed,
        etaMinutes
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
