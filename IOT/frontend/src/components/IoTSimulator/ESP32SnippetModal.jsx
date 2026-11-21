import React, { useState } from 'react';
import { X, Cpu, Copy, Check, Terminal, ExternalLink, HardDrive } from 'lucide-react';

export default function ESP32SnippetModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlExample = `curl -X POST http://localhost:5000/api/iot/data \\
  -H "Content-Type: application/json" \\
  -d '{
    "ambulanceId": "AMB-01",
    "patientId": "PT-1001",
    "heartRate": 138,
    "spo2": 88,
    "temperature": 38.6,
    "bloodPressure": { "systolic": 145, "diastolic": 92 },
    "lat": 12.9780,
    "lng": 77.6090
  }'`;

  const arduinoSnippet = `// ========================================================
// Smart Ambulance IoT Node - ESP32 Arduino Sketch
// Reads: MAX30102 (Heart Rate & SpO2) + DS18B20 (Temperature) + NEO-6M GPS
// Transmits to Express Backend via HTTP POST JSON
// ========================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.100:5000/api/iot/data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected. IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Read real sensors (or simulated values)
    float heartRate = 78.0;   // from MAX30102
    float spo2 = 98.0;        // from MAX30102
    float temperature = 37.0; // from DS18B20 or LM35

    StaticJsonDocument<256> doc;
    doc["ambulanceId"] = "AMB-01";
    doc["patientId"] = "PT-1001";
    doc["heartRate"] = heartRate;
    doc["spo2"] = spo2;
    doc["temperature"] = temperature;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);
    Serial.printf("HTTP Code: %d\\n", httpResponseCode);
    http.end();
  }
  delay(3000); // 3-second telemetry interval
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-navy-900 px-6 py-4 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">ESP32 Hardware & REST API Integration Guide</h3>
              <p className="text-xs text-slate-300">Modular C++ Arduino sketch & IoT endpoint payload</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-navy-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Circuit Pinout Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Recommended Hardware Pinout</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="p-2.5">Sensor Component</th>
                    <th className="p-2.5">Function</th>
                    <th className="p-2.5">ESP32 Pin Connection</th>
                    <th className="p-2.5">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-2.5 font-semibold">MAX30100 / MAX30102</td>
                    <td className="p-2.5">Heart Rate (Pulse) & SpO2</td>
                    <td className="p-2.5 font-mono">SDA: GPIO 21, SCL: GPIO 22</td>
                    <td className="p-2.5">I2C (3.3V)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">DS18B20 / LM35</td>
                    <td className="p-2.5">Patient Body Temperature</td>
                    <td className="p-2.5 font-mono">Data: GPIO 4 (4.7kΩ pullup)</td>
                    <td className="p-2.5">OneWire / Analog</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">NEO-6M GPS Module</td>
                    <td className="p-2.5">Live Ambulance Coordinates</td>
                    <td className="p-2.5 font-mono">TX: GPIO 16 (RX2), RX: GPIO 17 (TX2)</td>
                    <td className="p-2.5">UART Serial (9600 baud)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ESP32 Arduino Sketch Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Arduino C++ Firmware (esp32_ambulance_node.ino)
              </span>
              <button
                onClick={() => copyToClipboard(arduinoSnippet, 'arduino')}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold"
              >
                {copied === 'arduino' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'arduino' ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3 bg-navy-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-navy-800">
              {arduinoSnippet}
            </pre>
          </div>

          {/* cURL API Test */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>REST API Hardware Ingestion Endpoint</span>
              </span>
              <button
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold"
              >
                {copied === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'curl' ? 'Copied!' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="p-3 bg-navy-950 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-navy-800">
              {curlExample}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Sketch file saved at: <code className="font-mono text-slate-700">esp32/esp32_ambulance_node.ino</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
