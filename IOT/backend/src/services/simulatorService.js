const storeService = require('./storeService');

class SimulatorService {
  constructor() {
    this.intervalId = null;
    this.updateIntervalMs = 3000; // updates every 3 seconds
    this.isRunning = true;
    this.ambulanceId = 'AMB-01';
    this.patientId = 'PT-1001';

    // Simulation presets
    this.currentScenario = 'NORMAL'; // 'NORMAL', 'TACHYCARDIA', 'HYPOXIA', 'HIGH_FEVER', 'CARDIAC_ARREST', 'CUSTOM'
    this.autoAlertOnCritical = true;

    // Configurable thresholds for demo
    this.thresholds = {
      heartRate: { low: 55, high: 105, criticalHigh: 130, criticalLow: 45 },
      spo2: { warning: 94, critical: 90 },
      temperature: { low: 35.5, high: 38.0, criticalHigh: 39.2 }
    };

    // Current live state (with realistic floating base)
    this.currentVitals = {
      heartRate: 76,
      spo2: 98,
      temperature: 37.0,
      bloodPressure: { systolic: 122, diastolic: 82 }
    };

    // Target values for custom mode
    this.customTargets = {
      heartRate: 80,
      spo2: 98,
      temperature: 37.0
    };

    // Pre-defined GPS route towards City Central Trauma Center (Bengaluru coords)
    this.routeWaypoints = [
      { lat: 12.9716, lng: 77.5946, address: 'MG Road Junction, Bengaluru' },
      { lat: 12.9735, lng: 77.6010, address: 'Trinity Circle / Halasuru' },
      { lat: 12.9758, lng: 77.6080, address: 'Old Madras Rd / Ulsoor Lake' },
      { lat: 12.9782, lng: 77.6150, address: 'Indiranagar 100ft Rd Flyover' },
      { lat: 12.9810, lng: 77.6120, address: 'Domlur Intermediate Ring Rd' },
      { lat: 12.9835, lng: 77.6110, address: 'HAL Main Gate Approach' },
      { lat: 12.9850, lng: 77.6100, address: 'City Central Trauma Center ER Bay' }
    ];
    this.currentWaypointIndex = 0;
    this.totalWaypoints = this.routeWaypoints.length;
    this.ambulanceSpeed = 54; // km/h
    this.socketIO = null;
  }

  setSocketIO(io) {
    this.socketIO = io;
  }

  start() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.isRunning = true;
    console.log('[IoT Simulator] Started background sensor loop (every 3s)');
    
    this.intervalId = setInterval(async () => {
      try {
        await this.tick();
      } catch (err) {
        console.error('[Simulator Error]', err.message);
      }
    }, this.updateIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[IoT Simulator] Stopped background sensor loop');
  }

  setScenario(scenarioName) {
    this.currentScenario = scenarioName;
    console.log(`[IoT Simulator] Switched scenario to: ${scenarioName}`);
    // Immediately step towards target
    this.stepVitalsTowardsTarget();
  }

  setCustomTargets(targets) {
    this.currentScenario = 'CUSTOM';
    if (targets.heartRate !== undefined) this.customTargets.heartRate = Number(targets.heartRate);
    if (targets.spo2 !== undefined) this.customTargets.spo2 = Number(targets.spo2);
    if (targets.temperature !== undefined) this.customTargets.temperature = Number(targets.temperature);
  }

  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  resetRoute() {
    this.currentWaypointIndex = 0;
  }

  stepVitalsTowardsTarget() {
    let targetHR = 75;
    let targetSpO2 = 98;
    let targetTemp = 37.0;

    switch (this.currentScenario) {
      case 'NORMAL':
        targetHR = 76 + (Math.random() * 6 - 3);
        targetSpO2 = 98 + (Math.random() * 2 - 1);
        targetTemp = 36.9 + (Math.random() * 0.4 - 0.2);
        break;
      case 'TACHYCARDIA':
        targetHR = 142 + (Math.random() * 12 - 6);
        targetSpO2 = 93 + (Math.random() * 3 - 1.5);
        targetTemp = 37.6 + (Math.random() * 0.4 - 0.2);
        break;
      case 'HYPOXIA':
        targetHR = 118 + (Math.random() * 8 - 4);
        targetSpO2 = 83 + (Math.random() * 4 - 2);
        targetTemp = 37.1 + (Math.random() * 0.4 - 0.2);
        break;
      case 'HIGH_FEVER':
        targetHR = 124 + (Math.random() * 8 - 4);
        targetSpO2 = 94 + (Math.random() * 2 - 1);
        targetTemp = 39.8 + (Math.random() * 0.6 - 0.3);
        break;
      case 'CARDIAC_ARREST':
        targetHR = 38 + (Math.random() * 8 - 4);
        targetSpO2 = 78 + (Math.random() * 4 - 2);
        targetTemp = 35.8 + (Math.random() * 0.4 - 0.2);
        break;
      case 'CUSTOM':
        targetHR = this.customTargets.heartRate;
        targetSpO2 = this.customTargets.spo2;
        targetTemp = this.customTargets.temperature;
        break;
      default:
        targetHR = 78;
        targetSpO2 = 98;
        targetTemp = 37.0;
    }

    // Smooth transition (ease towards target with subtle sensor noise)
    const noiseHR = (Math.random() * 2 - 1);
    const noiseSpO2 = (Math.random() * 0.8 - 0.4);
    const noiseTemp = (Math.random() * 0.1 - 0.05);

    this.currentVitals.heartRate = Math.round(
      this.currentVitals.heartRate * 0.65 + (targetHR + noiseHR) * 0.35
    );

    this.currentVitals.spo2 = Math.min(100, Math.max(60, Math.round(
      (this.currentVitals.spo2 * 0.65 + (targetSpO2 + noiseSpO2) * 0.35) * 10
    ) / 10));

    this.currentVitals.temperature = Math.round(
      (this.currentVitals.temperature * 0.7 + (targetTemp + noiseTemp) * 0.3) * 10
    ) / 10;

    // Adjust Blood Pressure based on HR
    if (this.currentVitals.heartRate > 120) {
      this.currentVitals.bloodPressure = { systolic: 155, diastolic: 96 };
    } else if (this.currentVitals.heartRate < 50) {
      this.currentVitals.bloodPressure = { systolic: 85, diastolic: 55 };
    } else {
      this.currentVitals.bloodPressure = { systolic: 120, diastolic: 80 };
    }
  }

  evaluateAlerts() {
    const alerts = [];
    let status = 'NORMAL';

    const { heartRate, spo2, temperature } = this.currentVitals;
    const { thresholds } = this;

    // Heart Rate Checks
    if (heartRate >= thresholds.heartRate.criticalHigh) {
      alerts.push(`Critical Tachycardia: Heart Rate ${heartRate} bpm (> ${thresholds.heartRate.criticalHigh})`);
      status = 'CRITICAL';
    } else if (heartRate <= thresholds.heartRate.criticalLow) {
      alerts.push(`Severe Bradycardia: Heart Rate ${heartRate} bpm (< ${thresholds.heartRate.criticalLow})`);
      status = 'CRITICAL';
    } else if (heartRate > thresholds.heartRate.high) {
      alerts.push(`Elevated Heart Rate: ${heartRate} bpm`);
      if (status !== 'CRITICAL') status = 'WARNING';
    } else if (heartRate < thresholds.heartRate.low) {
      alerts.push(`Low Heart Rate: ${heartRate} bpm`);
      if (status !== 'CRITICAL') status = 'WARNING';
    }

    // SpO2 Checks
    if (spo2 <= thresholds.spo2.critical) {
      alerts.push(`Severe Hypoxemia: SpO2 ${spo2}% (<= ${thresholds.spo2.critical}%)`);
      status = 'CRITICAL';
    } else if (spo2 <= thresholds.spo2.warning) {
      alerts.push(`Low Oxygen Saturation: SpO2 ${spo2}%`);
      if (status !== 'CRITICAL') status = 'WARNING';
    }

    // Temperature Checks
    if (temperature >= thresholds.temperature.criticalHigh) {
      alerts.push(`High Hyperthermia / Fever: ${temperature} °C`);
      status = 'CRITICAL';
    } else if (temperature > thresholds.temperature.high) {
      alerts.push(`Mild Fever: ${temperature} °C`);
      if (status !== 'CRITICAL') status = 'WARNING';
    } else if (temperature < thresholds.temperature.low) {
      alerts.push(`Hypothermia Detected: ${temperature} °C`);
      if (status !== 'CRITICAL') status = 'WARNING';
    }

    return { status, alerts };
  }

  advanceGPS() {
    if (this.routeWaypoints.length === 0) return null;

    // Advance slowly towards destination
    this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.routeWaypoints.length;
    const currentLoc = this.routeWaypoints[this.currentWaypointIndex];

    // Calculate remaining ETA based on remaining waypoints
    const remainingSteps = this.routeWaypoints.length - 1 - this.currentWaypointIndex;
    const etaMinutes = Math.max(1, remainingSteps * 2);

    return {
      location: currentLoc,
      speed: Math.round(45 + Math.random() * 15),
      etaMinutes
    };
  }

  async tick() {
    this.stepVitalsTowardsTarget();
    const { status, alerts } = this.evaluateAlerts();

    // Advance GPS location
    const gpsInfo = this.advanceGPS();
    if (gpsInfo) {
      await storeService.updateAmbulanceLocation(
        this.ambulanceId,
        gpsInfo.location,
        gpsInfo.speed,
        gpsInfo.etaMinutes
      );
    }

    // Save reading
    const reading = await storeService.addVitalReading({
      ambulanceId: this.ambulanceId,
      patientId: this.patientId,
      heartRate: this.currentVitals.heartRate,
      spo2: this.currentVitals.spo2,
      temperature: this.currentVitals.temperature,
      bloodPressure: this.currentVitals.bloodPressure,
      status,
      alerts,
      source: 'SIMULATION'
    });

    // Check if auto-alert should trigger on critical reading
    const ambulance = await storeService.getAmbulanceById(this.ambulanceId);
    if (
      this.autoAlertOnCritical &&
      status === 'CRITICAL' &&
      ambulance &&
      !ambulance.emergencyStatus?.isEmergency
    ) {
      const patient = await storeService.getPatientById(this.patientId);
      const alert = await storeService.createEmergencyAlert({
        ambulanceId: this.ambulanceId,
        patientId: this.patientId,
        patientName: patient ? patient.name : 'Dev Patel',
        vitalSnapshot: {
          heartRate: this.currentVitals.heartRate,
          spo2: this.currentVitals.spo2,
          temperature: this.currentVitals.temperature
        },
        locationSnapshot: gpsInfo ? gpsInfo.location : ambulance.currentLocation,
        severity: 'CRITICAL',
        reason: alerts.join('; ') || 'Patient vitals reached critical threshold'
      });

      if (this.socketIO) {
        this.socketIO.emit('emergency:triggered', {
          alert,
          ambulanceId: this.ambulanceId,
          timestamp: new Date()
        });
        console.log(`[IoT Auto-Alert] Critical emergency alert triggered automatically for ${this.ambulanceId}`);
      }
    }

    // Emit live vitals and location through Socket.IO
    if (this.socketIO) {
      this.socketIO.emit('vitals:update', {
        reading,
        ambulanceId: this.ambulanceId,
        patientId: this.patientId
      });

      if (gpsInfo) {
        this.socketIO.emit('ambulance:location', {
          ambulanceId: this.ambulanceId,
          location: gpsInfo.location,
          speed: gpsInfo.speed,
          etaMinutes: gpsInfo.etaMinutes
        });
      }
    }
  }

  // Allow external IoT ESP32 payload injection
  async injectSensorReading(payload) {
    const { ambulanceId, patientId, heartRate, spo2, temperature, bloodPressure } = payload;
    const ambId = ambulanceId || this.ambulanceId;
    const patId = patientId || this.patientId;

    if (heartRate !== undefined) this.currentVitals.heartRate = Number(heartRate);
    if (spo2 !== undefined) this.currentVitals.spo2 = Number(spo2);
    if (temperature !== undefined) this.currentVitals.temperature = Number(temperature);
    if (bloodPressure) this.currentVitals.bloodPressure = bloodPressure;

    const { status, alerts } = this.evaluateAlerts();

    const reading = await storeService.addVitalReading({
      ambulanceId: ambId,
      patientId: patId,
      heartRate: this.currentVitals.heartRate,
      spo2: this.currentVitals.spo2,
      temperature: this.currentVitals.temperature,
      bloodPressure: this.currentVitals.bloodPressure,
      status,
      alerts,
      source: 'ESP32_SENSOR'
    });

    if (this.socketIO) {
      this.socketIO.emit('vitals:update', {
        reading,
        ambulanceId: ambId,
        patientId: patId
      });
    }

    return { reading, status, alerts };
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      scenario: this.currentScenario,
      autoAlertOnCritical: this.autoAlertOnCritical,
      thresholds: this.thresholds,
      currentVitals: this.currentVitals,
      customTargets: this.customTargets,
      currentWaypointIndex: this.currentWaypointIndex,
      ambulanceId: this.ambulanceId,
      patientId: this.patientId
    };
  }
}

module.exports = new SimulatorService();
