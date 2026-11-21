const storeService = require('../services/storeService');

exports.getPatients = async (req, res) => {
  try {
    const patients = await storeService.getPatients();
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await storeService.getPatientById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storeService.updatePatient(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
