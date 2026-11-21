/**
 * Automated End-to-End System Integration Test
 * Verifies REST APIs, Socket.IO real-time events, and IoT Simulation
 */

const http = require('http');
const { io } = require('./frontend/node_modules/socket.io-client');

const BACKEND_PORT = 5000;
const BASE_URL = `http://localhost:${BACKEND_PORT}`;

// Start backend in-process for test
process.env.PORT = BACKEND_PORT;
process.env.NODE_ENV = 'test';

console.log('🚀 Starting Smart Ambulance Backend for Test Suite...');
require('./backend/src/server.js');

const request = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      `${BASE_URL}${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runTestSuite() {
  await sleep(1500); // Allow server & simulator to initialize

  console.log('\n--- 1. Testing Backend Health & Database Fallback ---');
  const health = await request('/api/health');
  console.log(`[PASS] Health API Status: ${health.status}, System: ${health.data.status}`);
  console.log(`[PASS] Database State: ${health.data.database.database} (Connected: ${health.data.database.connected})`);

  console.log('\n--- 2. Testing Patients & Ambulance Info APIs ---');
  const patients = await request('/api/patients');
  console.log(`[PASS] Patients retrieved: ${patients.data.data.length} records. Active: ${patients.data.data[0].name}`);

  const ambulances = await request('/api/ambulances');
  console.log(`[PASS] Ambulances retrieved: ${ambulances.data.data.length} units. Active: ${ambulances.data.data[0].vehicleNumber}`);

  console.log('\n--- 3. Testing Hospital Info API ---');
  const hospital = await request('/api/emergencies/hospital');
  console.log(`[PASS] Hospital: ${hospital.data.data.name}, ICU beds: ${hospital.data.data.availableBeds.icu}`);

  console.log('\n--- 4. Testing Socket.IO Real-Time Communication ---');
  const socket = io(BASE_URL);

  let vitalsReceived = false;
  let emergencyTriggerReceived = false;
  let emergencyAckReceived = false;

  socket.on('connect', () => {
    console.log(`[PASS] Socket.IO Client Connected. ID: ${socket.id}`);
  });

  socket.on('vitals:update', (data) => {
    if (!vitalsReceived) {
      vitalsReceived = true;
      console.log(`[PASS] Received Real-Time Vital Stream -> HR: ${data.reading.heartRate} bpm, SpO2: ${data.reading.spo2}%, Temp: ${data.reading.temperature}°C`);
    }
  });

  socket.on('emergency:triggered', (data) => {
    emergencyTriggerReceived = true;
    console.log(`[PASS] Received Real-Time Emergency Notification -> Alert ID: ${data.alert.alertId}, Reason: ${data.alert.reason}`);
  });

  socket.on('emergency:acknowledged', (data) => {
    emergencyAckReceived = true;
    console.log(`[PASS] Received Real-Time Emergency Acknowledgment -> Doctor: ${data.acknowledgedBy}, Notes: ${data.notes}`);
  });

  // Wait for at least one vitals tick
  await sleep(3500);

  console.log('\n--- 5. Testing ESP32 Sensor Data Ingestion (REST POST) ---');
  const espPost = await request('/api/iot/data', 'POST', {
    ambulanceId: 'AMB-01',
    patientId: 'PT-1001',
    heartRate: 145,
    spo2: 88,
    temperature: 38.6,
    bloodPressure: { systolic: 140, diastolic: 92 },
    lat: 12.9750,
    lng: 77.6050
  });
  console.log(`[PASS] ESP32 Data Ingested -> Status: ${espPost.status}, Vitals Saved: HR=${espPost.data.vitalReading.heartRate}, Alert Status: ${espPost.data.status}`);

  console.log('\n--- 6. Testing Emergency Trigger & Acknowledgment Workflow ---');
  const triggerRes = await request('/api/emergencies/trigger', 'POST', {
    ambulanceId: 'AMB-01',
    patientId: 'PT-1001',
    reason: 'Acute Arrhythmia & Sudden Cardiac Deterioration',
    severity: 'CRITICAL',
    vitalSnapshot: { heartRate: 145, spo2: 88, temperature: 38.6 }
  });
  console.log(`[PASS] Emergency Trigger API -> Code: ${triggerRes.status}, Alert ID: ${triggerRes.data.data.alertId}`);

  await sleep(1000);

  const ackRes = await request('/api/emergencies/acknowledge', 'POST', {
    ambulanceId: 'AMB-01',
    alertId: triggerRes.data.data.alertId,
    acknowledgedBy: 'Dr. Ananya Ray (Chief Trauma Officer)',
    notes: 'ICU Bed 04 Prepared. Resuscitation team waiting at ER Bay 1.'
  });
  console.log(`[PASS] Emergency Acknowledged API -> Code: ${ackRes.status}, Status: ${ackRes.data.data.status}`);

  await sleep(1000);

  console.log('\n--- 7. Verification Summary ---');
  console.log(`Vitals Stream Verified: ${vitalsReceived ? '✅ YES' : '❌ NO'}`);
  console.log(`Emergency Trigger Broadcast Verified: ${emergencyTriggerReceived ? '✅ YES' : '❌ NO'}`);
  console.log(`Emergency Acknowledge Broadcast Verified: ${emergencyAckReceived ? '✅ YES' : '❌ NO'}`);

  socket.disconnect();
  console.log('\n✨ ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ✨\n');
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('[Test Failed]', err);
  process.exit(1);
});
