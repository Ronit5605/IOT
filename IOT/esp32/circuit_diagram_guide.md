# ESP32 Circuit & Hardware Integration Guide

This document describes how to connect physical biomedical sensors and a GPS module to an ESP32 microcontroller for real-world deployment in the **IoT-Based Smart Ambulance and Emergency Communication System**.

---

## 1. Hardware Bill of Materials (BOM)

| Component | Description | Operating Voltage | Interface |
|---|---|---|---|
| **ESP32 DevKit V1** | 30-pin / 38-pin Dual Core WiFi + Bluetooth MCU | 3.3V / 5V | MicroUSB / UART |
| **MAX30102 / MAX30100** | Optical Pulse Oximeter & Heart Rate Sensor | 3.3V | I2C (SDA / SCL) |
| **DS18B20 (Waterproof probe)** | Digital Body Temperature Sensor | 3.3V - 5V | OneWire (4.7kΩ resistor) |
| **NEO-6M GPS Module** | GPS Receiver with Ceramic Antenna | 3.3V - 5V | UART Serial (TX / RX) |
| **Push Button** | Paramedic Emergency Trigger | 3.3V | Digital GPIO (Internal Pull-Up) |
| **Active Buzzer** | Warning Buzzer for Critical Alerts | 3.3V | Digital GPIO |
| **Breadboard & Jumpers** | Prototyping Wires | - | - |

---

## 2. Complete Wiring & Pinout Table

| ESP32 Pin | Sensor / Module | Sensor Pin | Notes |
|---|---|---|---|
| **3V3** | MAX30102, DS18B20, NEO-6M | VCC | 3.3V Power Rail |
| **GND** | All Sensors & Modules | GND | Common Ground Rail |
| **GPIO 21** | MAX30102 | **SDA** | I2C Data Line |
| **GPIO 22** | MAX30102 | **SCL** | I2C Clock Line |
| **GPIO 4** | DS18B20 Temp Probe | **DATA / DQ** | Add 4.7kΩ pull-up resistor between GPIO 4 and 3V3 |
| **GPIO 16 (RX2)** | NEO-6M GPS | **TX** | ESP32 HardwareSerial 2 RX |
| **GPIO 17 (TX2)** | NEO-6M GPS | **RX** | ESP32 HardwareSerial 2 TX |
| **GPIO 18** | Push Button | Leg 1 | Leg 2 connects to GND (Active LOW) |
| **GPIO 19** | Piezo Buzzer | Positive (+) | Negative connects to GND |
| **GPIO 2** | Onboard LED | - | WiFi status indicator |

---

## 3. Circuit Schematic Representation

```
                    +-----------------------------+
                    |       ESP32 DevKit V1       |
                    |                             |
[MAX30102 SDA] <--->| GPIO 21              GPIO 4 |<---> [DS18B20 Data] + 4.7k Pullup
[MAX30102 SCL] <--->| GPIO 22             GPIO 16 |<---> [NEO-6M GPS TX]
                    |                     GPIO 17 |<---> [NEO-6M GPS RX]
[EMG Button]   <--->| GPIO 18             GPIO 19 |<---> [Active Buzzer (+)]
                    | 3V3                     GND |
                    +-----------------------------+
                      |                        |
                      +---- 3.3V Rail          +---- Common GND Rail
```

---

## 4. Arduino IDE Setup Instructions

1. Open **Arduino IDE** (v2.x recommended).
2. Go to **File > Preferences** and add the following URL to *Additional Boards Manager URLs*:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Open **Tools > Board > Boards Manager**, search for `esp32` by Espressif Systems, and click **Install**.
4. Open **Sketch > Include Library > Manage Libraries...** and install:
   - `ArduinoJson` (v6 or v7 by Benoit Blanchon)
   - `SparkFun MAX3010x Pulse and Proximity Sensor Library`
   - `DallasTemperature` (by Miles Burton)
   - `OneWire` (by Paul Stoffregen)
   - `TinyGPSPlus` (by Mikal Hart)
5. Connect your ESP32 via USB and select the COM port under **Tools > Port**.
6. Open `esp32_ambulance_node.ino`, update `WIFI_SSID`, `WIFI_PASSWORD`, and `SERVER_URL`.
7. Click **Upload**.

---

## 5. REST Ingestion API Testing Without Hardware

You can verify the backend receives and broadcasts real telemetry packets using `curl` or Python:

```bash
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/iot/data" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"ambulanceId":"AMB-01","patientId":"PT-1001","heartRate":134,"spo2":89,"temperature":38.4,"lat":12.9750,"lng":77.6050}'
```

The data will immediately render on the **Ambulance Dashboard** and trigger a critical alarm on the **Hospital ER Dashboard** in real time!
