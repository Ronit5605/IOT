/**
 * Quick IoT Hardware Emulation Script
 * Sends realistic vital sign telemetry to the Smart Ambulance Backend
 * Usage: node test_iot_packet.js [scenario]
 * Example: node test_iot_packet.js critical
 */

const http = require('http');

const scenario = process.argv[2] || 'normal';

let heartRate = 78;
let spo2 = 98;
let temperature = 37.0;

if (scenario.toLowerCase() === 'critical') {
  heartRate = 142;
  spo2 = 88;
  temperature = 38.8;
  console.log('Sending CRITICAL emergency telemetry packet...');
} else {
  console.log('Sending NORMAL vital sign telemetry packet...');
}

const payload = JSON.stringify({
  ambulanceId: 'AMB-01',
  patientId: 'PT-1001',
  heartRate,
  spo2,
  temperature,
  bloodPressure: { systolic: 125, diastolic: 82 },
  lat: 12.9740,
  lng: 77.6020
});

const req = http.request(
  {
    hostname: 'localhost',
    port: 5000,
    path: '/api/iot/data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log(`[Status ${res.statusCode}] Backend Response:`, JSON.parse(data));
    });
  }
);

req.on('error', (err) => {
  console.error('[Error] Could not connect to backend server:', err.message);
  console.error('Make sure backend is running on http://localhost:5000');
});

req.write(payload);
req.end();
