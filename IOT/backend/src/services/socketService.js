const storeService = require('./storeService');

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Join specific role or ambulance room
    socket.on('join', ({ role, ambulanceId }) => {
      if (role) {
        socket.join(`role:${role}`);
      }
      if (ambulanceId) {
        socket.join(`ambulance:${ambulanceId}`);
      }
      socket.emit('joined', { status: 'ok', role, ambulanceId });
    });

    // Emergency triggered via socket
    socket.on('emergency:trigger', async (data) => {
      try {
        const { ambulanceId, patientId, reason, severity, vitalSnapshot, locationSnapshot } = data;
        const ambId = ambulanceId || 'AMB-01';
        const patId = patientId || 'PT-1001';

        const patient = await storeService.getPatientById(patId);
        const ambulance = await storeService.getAmbulanceById(ambId);

        const alert = await storeService.createEmergencyAlert({
          ambulanceId: ambId,
          patientId: patId,
          patientName: patient ? patient.name : 'Unknown Patient',
          reason: reason || 'Paramedic Emergency Alert',
          severity: severity || 'CRITICAL',
          vitalSnapshot: vitalSnapshot || {},
          locationSnapshot: locationSnapshot || (ambulance ? ambulance.currentLocation : {})
        });

        io.emit('emergency:triggered', {
          alert,
          patient,
          ambulance,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('[Socket Trigger Error]', err.message);
      }
    });

    // Emergency acknowledged via socket
    socket.on('emergency:acknowledge', async (data) => {
      try {
        const { ambulanceId, alertId, acknowledgedBy, notes } = data;
        const ambId = ambulanceId || 'AMB-01';

        const updated = await storeService.acknowledgeEmergency(
          ambId,
          alertId,
          acknowledgedBy,
          notes
        );

        const ambulance = await storeService.getAmbulanceById(ambId);

        io.emit('emergency:acknowledged', {
          alertId,
          ambulanceId: ambId,
          acknowledgedBy,
          notes,
          acknowledgedAt: new Date(),
          ambulance
        });
      } catch (err) {
        console.error('[Socket Acknowledge Error]', err.message);
      }
    });

    // Manual location update from client
    socket.on('ambulance:set_location', async (data) => {
      try {
        const { ambulanceId, location, speed, etaMinutes } = data;
        if (location && location.lat && location.lng) {
          await storeService.updateAmbulanceLocation(ambulanceId, location, speed, etaMinutes);
          io.emit('ambulance:location', {
            ambulanceId,
            location,
            speed,
            etaMinutes
          });
        }
      } catch (err) {
        console.error('[Socket Location Error]', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocketIO };
