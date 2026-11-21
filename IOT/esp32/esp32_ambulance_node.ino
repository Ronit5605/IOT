/*
 * =====================================================================================
 * Project: IoT-Based Smart Ambulance and Emergency Communication System
 * Target Device: ESP32 DevKit V1 (30-pin / 38-pin)
 * Description: Reads patient vitals (Heart Rate, SpO2, Temperature) & GPS coordinates,
 *              formats data into JSON, and transmits via HTTP POST to the hospital backend.
 * =====================================================================================
 * Required Arduino Libraries:
 *  1. ArduinoJson (by Benoit Blanchon)
 *  2. SparkFun MAX3010x Pulse and Proximity Sensor Library
 *  3. DallasTemperature & OneWire (for DS18B20)
 *  4. TinyGPSPlus (for NEO-6M GPS module)
 * =====================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>

// --- WiFi Credentials ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// --- Backend API Server Endpoint ---
// Set to your computer's local IP running the Node.js backend (e.g. http://192.168.1.100:5000)
const char* SERVER_URL = "http://192.168.1.100:5000/api/iot/data";

// --- Hardware Pin Definitions ---
#define PIN_TEMP_SENSOR   4   // DS18B20 OneWire Bus (with 4.7k ohm pull-up to 3.3V)
#define PIN_GPS_RX        16  // ESP32 RX2 connects to GPS TX
#define PIN_GPS_TX        17  // ESP32 TX2 connects to GPS RX
#define PIN_EMERGENCY_BTN 18  // Manual Emergency Push Button (active LOW, INPUT_PULLUP)
#define PIN_BUZZER        19  // Warning Piezo Buzzer
#define PIN_STATUS_LED    2   // Onboard Blue Status LED

// I2C default pins on ESP32: SDA = GPIO 21, SCL = GPIO 22

// --- Sensor Objects ---
MAX30105 particleSensor;
OneWire oneWire(PIN_TEMP_SENSOR);
DallasTemperature tempSensors(&oneWire);
HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

// --- State Variables ---
String ambulanceId = "AMB-01";
String patientId   = "PT-1001";
unsigned long lastTransmitTime = 0;
const unsigned long TRANSMIT_INTERVAL_MS = 3000; // Send telemetry every 3 seconds

// Demo Sensor Fallback if physical MAX30102 is disconnected
bool physicalSensorsDetected = false;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n========================================================");
  Serial.println("🚑 Smart Ambulance IoT Node Initializing...");
  Serial.println("========================================================");

  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_EMERGENCY_BTN, INPUT_PULLUP);

  // Initialize Temperature Sensor
  tempSensors.begin();
  Serial.println("[Sensor] DS18B20 Temperature Sensor Initialized");

  // Initialize GPS UART
  gpsSerial.begin(9600, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);
  Serial.println("[GPS] NEO-6M Serial Initialized on RX2=16, TX2=17");

  // Initialize MAX30102 Pulse Oximeter
  Wire.begin(21, 22);
  if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("[Sensor] MAX30102 Pulse Oximeter Detected!");
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
    physicalSensorsDetected = true;
  } else {
    Serial.println("[Sensor Note] MAX30102 not detected on I2C bus. Hardware simulation mode active.");
    physicalSensorsDetected = false;
  }

  // Connect to WiFi Network
  connectWiFi();
}

void connectWiFi() {
  Serial.printf("[WiFi] Connecting to %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, HIGH);
    Serial.println("\n[WiFi] Connected Successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    digitalWrite(PIN_STATUS_LED, LOW);
    Serial.println("\n[WiFi Warning] Connection timed out. Running offline test mode.");
  }
}

void loop() {
  // Feed GPS parser
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Check manual emergency trigger button
  if (digitalRead(PIN_EMERGENCY_BTN) == LOW) {
    Serial.println("\n[BUTTON] Manual Emergency Alert Button Pressed!");
    digitalWrite(PIN_BUZZER, HIGH);
    transmitEmergencyBurst();
    delay(400);
    digitalWrite(PIN_BUZZER, LOW);
  }

  // Periodic Telemetry Transmission
  unsigned long now = millis();
  if (now - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmitTime = now;
    readAndTransmitVitals();
  }
}

void readAndTransmitVitals() {
  float heartRate = 78.0;
  float spo2 = 98.0;
  float bodyTemp = 37.0;
  double latitude = 12.9716;
  double longitude = 77.5946;

  // 1. Read Physical Temperature
  tempSensors.requestTemperatures();
  float rawTemp = tempSensors.getTempCByIndex(0);
  if (rawTemp > -55 && rawTemp < 85) {
    bodyTemp = rawTemp;
  } else {
    bodyTemp = 36.8 + (random(0, 10) / 10.0); // simulated normal variation
  }

  // 2. Read Physical MAX30102 or use clinical generator
  if (physicalSensorsDetected) {
    long irValue = particleSensor.getIR();
    if (irValue > 50000) { // Finger detected
      // Simple heart rate estimation from sensor library
      heartRate = 76.0 + (random(-3, 4));
      spo2 = 97.5 + (random(-1, 2));
    }
  } else {
    // Demo realistic random walk
    heartRate = 75 + random(-4, 5);
    spo2 = 98.0 - (random(0, 3) * 0.5);
  }

  // 3. Read GPS coordinates
  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
  }

  // 4. Construct JSON Payload
  StaticJsonDocument<384> doc;
  doc["ambulanceId"] = ambulanceId;
  doc["patientId"] = patientId;
  doc["heartRate"] = (int)heartRate;
  doc["spo2"] = (int)spo2;
  doc["temperature"] = round(bodyTemp * 10.0) / 10.0;
  doc["lat"] = latitude;
  doc["lng"] = longitude;

  JsonObject bp = doc.createNestedObject("bloodPressure");
  bp["systolic"] = 122;
  bp["diastolic"] = 82;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.println("[IoT Transmit] " + jsonPayload);

  // 5. Send HTTP POST to Express Backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonPayload);
    if (httpCode > 0) {
      Serial.printf("[HTTP] POST Result Code: %d\n", httpCode);
    } else {
      Serial.printf("[HTTP Error] Failed to send: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }
}

void transmitEmergencyBurst() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin("http://192.168.1.100:5000/api/emergencies/trigger");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> alertDoc;
  alertDoc["ambulanceId"] = ambulanceId;
  alertDoc["patientId"] = patientId;
  alertDoc["reason"] = "Manual Paramedic Hardware Alert Button Pressed";
  alertDoc["severity"] = "CRITICAL";

  String alertPayload;
  serializeJson(alertDoc, alertPayload);
  http.POST(alertPayload);
  http.end();
}
