# 🚑 IoT-Based Smart Ambulance and Emergency Communication System

A full-stack, real-time medical IoT web application designed to connect in-transit emergency ambulances directly with hospital Emergency Rooms (ER). The system streams live patient physiological vitals (Heart Rate, SpO2, Temperature, Blood Pressure) and GPS telemetry, automatically detects critical physiological threshold breaches, and enables bi-directional emergency alerting and acknowledgment between paramedics and hospital triage teams.

---

## 🌟 Key Features

### 1. 🚑 Ambulance Dashboard (Paramedic Unit)
- **Live Patient Vital Monitors**: Heart Rate (bpm), SpO2 Saturation (%), Body Temperature (°C), Blood Pressure (mmHg) with normal range indicators and ECG-style waveform graphs.
- **Interactive Leaflet Route Map**: Live OpenStreetMap tracking showing real-time GPS coordinates, vehicle transit speed (km/h), and estimated time of arrival (ETA).
- **Instant Emergency Alert Trigger**: Emergency push button allowing paramedics to broadcast priority alerts (STEMI, Acute Hypoxia, Cardiac Arrest) with attached live vitals snapshot.
- **Bi-Directional Confirmation**: Displays real-time hospital acknowledgment with ICU bed assignment and preparation instructions from ER physicians.
- **Patient Switcher**: Select between pre-loaded patient profiles for quick demonstration.

### 2. 🏥 Hospital ER Dashboard (Trauma & Critical Care)
- **Real-Time Emergency Flasher & Audio Siren**: Visual pulse and Web Audio API emergency buzzer when inbound ambulances flag priority conditions.
- **Comprehensive Patient Triage Record**: View patient medical history, pre-existing comorbidities, blood group, allergies, and emergency next-of-kin contacts.
- **Ambulance Radar & Route Tracking**: Live map tracking incoming ambulance progression and countdown ETA.
- **Emergency Acknowledgment System**: 1-click response to assign ICU beds (e.g., ICU-04, Cath Lab, OT-2), input attending physician notes, and dispatch resuscitation teams.
- **ER Resource Counter**: Live tally of available ICU beds, trauma bays, and ventilators.

### 3. ⚙️ IoT Sensor Simulation Engine & ESP32 Integration
- **Realistic Sensor Telemetry**: Streams data every 3 seconds with subtle physiological drift and random-walk behavior.
- **Preset Clinical Scenarios**:
  - `Normal Patient`: HR ~ 76 bpm, SpO2 ~ 98%, Temp ~ 37.0°C
  - `Critical Tachycardia / STEMI`: HR ~ 142 bpm, SpO2 ~ 93%, Temp ~ 37.6°C
  - `Severe Hypoxia / Asthma`: HR ~ 118 bpm, SpO2 ~ 83%, Temp ~ 37.1°C
  - `High Hyperthermia / Sepsis`: HR ~ 124 bpm, SpO2 ~ 94%, Temp ~ 39.8°C
  - `Cardiac Arrest / Severe Bradycardia`: HR ~ 38 bpm, SpO2 ~ 78%, Temp ~ 35.8°C
- **Custom Vitals Sliders**: Manually adjust Heart Rate, SpO2, and Temperature sliders.
- **Configurable Demo Alert Thresholds**: Adjust demo high/low alert trigger limits.
- **Modular ESP32 Integration**: Standard HTTP REST endpoint (`POST /api/iot/data`) with full Arduino C++ firmware sketch included in `esp32/esp32_ambulance_node.ino`.

### 4. 📋 Incident Audit & Telemetry Logs
- Complete history of all triggered emergency alerts, severity, attending doctor, and timestamped resolution status stored in MongoDB.
- Chronological sensor telemetry feed for clinical audit.

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------------+
|                         IoT Hardware Layer                              |
|  [MAX30102 Pulse/SpO2]   [DS18B20 Temp]   [NEO-6M GPS]   [Alert Button] |
|                             \        /                                  |
|                          ESP32 Microcontroller                          |
|                       (HTTP POST /api/iot/data)                         |
+------------------------------------|------------------------------------+
                                     v
+-------------------------------------------------------------------------+
|                        Backend Layer (Node.js & Express)                |
|  - REST APIs: /api/patients, /api/ambulances, /api/vitals, /emergencies |
|  - IoT Ingestion & Simulator Service (Every 3s loop)                    |
|  - Real-time Socket.IO Server (ws://localhost:5000)                     |
|  - Database: MongoDB (Mongoose) + High-Availability Fallback Store      |
+------------------------------------|------------------------------------+
                                     v
+-------------------------------------------------------------------------+
|                       Frontend Layer (React & Vite)                     |
|  - Modern Medical Dashboard (White & Navy-Blue Theme, Red Flashers)     |
|  - Interactive Recharts Waveform Graph                                  |
|  - Leaflet Map with OpenStreetMap Custom Animated Markers               |
|  - Web Audio API Emergency Siren & Acknowledgment Chime                 |
|  [Ambulance Dashboard] <--- Real-time Sync ---> [Hospital ER Dashboard] |
+-------------------------------------------------------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, Recharts, React-Leaflet, Leaflet, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO 4.8, Morgan, CORS, Dotenv |
| **Database** | MongoDB with Mongoose Schemas (with resilient In-Memory fallback for zero-setup demo reliability) |
| **IoT / Microcontroller** | ESP32 DevKit V1, MAX30102 (HR/SpO2), DS18B20 (Temperature), NEO-6M (GPS), Arduino IDE |
| **Mapping** | Leaflet + OpenStreetMap Cartography |

---

## 🚀 Installation & Execution Guide

### Prerequisites
- **Node.js** (v18+ or v20+ recommended)
- **npm** (v9+)
- **MongoDB** (Optional: application connects automatically to local MongoDB on port 27017 or falls back gracefully to in-memory mode)

---

### Step 1: Install Dependencies
Open your terminal in the project root directory:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

### Step 2: Start the Backend Server
In terminal window #1:

```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000` with Socket.IO enabled.*

---

### Step 3: Start the Frontend Application
In terminal window #2:

```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

Open your web browser and navigate to:
👉 **`http://localhost:5173`**

---

### Step 4: Run Automated End-to-End Test Suite (Optional)
To verify all REST endpoints, MongoDB connection, Socket.IO real-time sync, and simulated ESP32 packet ingestion in one command:

```bash
node test_system.js
```

---

## 🧪 Demonstration Walkthrough (College Presentation)

1. **Ambulance Live Telemetry**:
   - Open `http://localhost:5173`. You will see the **Ambulance Dashboard**.
   - Notice the live Heart Rate, SpO2, and Temperature updating automatically every 3 seconds.
   - Watch the Leaflet map animate the ambulance GPS location towards City Central Trauma Center.

2. **Trigger Priority Emergency**:
   - Click the red **"Broadcast Emergency Alert"** button on the Ambulance screen.
   - Select a reason (e.g., *Acute Arrhythmia & Sudden Deterioration*) and click **Send Immediate ER Alert**.
   - The emergency buzzer siren sounds, and the screen pulses red.

3. **Hospital ER View**:
   - Click the **Hospital ER Dashboard** tab (or open in a second browser window side-by-side!).
   - Notice the urgent emergency flasher banner with patient clinical triage data, diagnosis, and live vitals snapshot.

4. **Hospital Acknowledgment**:
   - On the Hospital dashboard, click **"Acknowledge Emergency & Dispatch Team"**.
   - Select an assigned ICU bed (e.g., `ICU-04 (Trauma)`) and enter instructions.
   - Click **Confirm ER Acknowledgment**.
   - Notice that the alarm stops, a pleasant confirmation chime rings, and the ambulance dashboard immediately displays:
     *"✅ Hospital Acknowledged Alert: [ICU-04] Trauma team on standby with defib & ventilator."*

5. **IoT Sensor Simulator & Hardware Controls**:
   - Click the **IoT Sensor Simulator** tab.
   - Switch between clinical presets: *Normal*, *Critical Tachycardia*, *Severe Hypoxia*, or *Cardiac Arrest*.
   - Move the custom sliders to test custom physiological readings.
   - Click **"Transmit ESP32 HTTP POST"** to simulate an external microcontroller payload.
   - Click **"ESP32 Code & Pinout"** to show examiners the complete Arduino C++ code and circuit wiring diagram!

---

## 📡 REST API Reference

### Vitals & Sensor Endpoints
- `GET /api/vitals?ambulanceId=AMB-01&limit=30` - Retrieve recent vital readings.
- `POST /api/vitals` - Record new vital reading.
- `POST /api/iot/data` - Primary ESP32 ingestion endpoint (accepts `heartRate`, `spo2`, `temperature`, `lat`, `lng`).

### Emergency Endpoints
- `GET /api/emergencies` - Retrieve emergency incidents audit list.
- `GET /api/emergencies/hospital` - Retrieve trauma center department & bed capacity.
- `POST /api/emergencies/trigger` - Dispatch priority emergency alert.
- `POST /api/emergencies/acknowledge` - ER doctor acknowledgment with ICU bed assignment.
- `POST /api/emergencies/resolve` - Clear emergency state upon arrival.

### Patient & Ambulance Endpoints
- `GET /api/patients` - List registered patients.
- `GET /api/ambulances` - List active ambulances and GPS locations.
- `POST /api/ambulances/:id/location` - Update GPS coordinates.

---

## ⚡ Socket.IO Real-Time Events

| Event Name | Direction | Payload Description |
|---|---|---|
| `vitals:update` | Server ➔ Clients | Periodic live vital readings (every 3s) |
| `ambulance:location` | Server ➔ Clients | Live GPS coordinates, speed, and ETA countdown |
| `emergency:triggered` | Server ➔ Hospital | Priority emergency alert with vitals snapshot |
| `emergency:acknowledged` | Server ➔ Ambulance | ER doctor instructions and ICU bed assignment |
| `emergency:resolved` | Server ➔ Clients | Reset emergency state to normal |

---

## 🔌 ESP32 Circuit Connections

| ESP32 Pin | Sensor / Module | Sensor Pin | Description |
|---|---|---|---|
| **GPIO 21** | MAX30102 | SDA | I2C Data line for pulse oximeter |
| **GPIO 22** | MAX30102 | SCL | I2C Clock line for pulse oximeter |
| **GPIO 4** | DS18B20 | DATA | OneWire temperature probe (with 4.7kΩ pull-up) |
| **GPIO 16 (RX2)** | NEO-6M GPS | TX | GPS Serial Receive |
| **GPIO 17 (TX2)** | NEO-6M GPS | RX | GPS Serial Transmit |
| **GPIO 18** | Push Button | Leg 1 | Manual Emergency Trigger (Active LOW) |
| **GPIO 19** | Active Buzzer | Positive | Warning buzzer for local alerts |
| **3.3V & GND** | All Modules | VCC / GND | Power rails |

The complete compilable Arduino sketch is located at:
`esp32/esp32_ambulance_node.ino`

---

## 🎓 College Viva & Evaluation Talking Points

1. **Why Leaflet over Google Maps?**
   *Leaflet with OpenStreetMap is open-source, lightweight, eliminates expensive API billing keys, and performs flawlessly in local networks and offline demonstrations.*
2. **Why Socket.IO over HTTP Polling?**
   *HTTP polling introduces network overhead and latency. In critical emergency medical scenarios, sub-second latency is essential so hospital trauma teams receive alerts the instant a patient's heart rate or oxygen drops.*
3. **How does the system operate without physical hardware?**
   *A built-in background physiological simulator mimics real human heart rate variability (HRV), SpO2 fluctuations, and GPS progression. Evaluators can also inject external packets using the `/api/iot/data` REST endpoint.*
4. **How is data persistence handled?**
   *Data is modeled using MongoDB and Mongoose schemas. If a local MongoDB daemon is not detected during evaluation, an in-memory high-availability fallback keeps the demonstration running without crashing.*

---

## 📄 License
MIT License. Developed for IoT & Healthcare Academic Engineering Projects.
