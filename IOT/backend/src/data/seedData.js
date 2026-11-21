const initialPatients = [
  {
    patientId: 'PT-1001',
    name: 'Dev Patel',
    age: 48,
    gender: 'Male',
    bloodGroup: 'O+',
    condition: 'Acute Chest Pain / Suspected STEMI',
    triageCategory: 'Red - Immediate',
    medicalHistory: 'Type-2 Diabetes (7 yrs), Hypertension. Prior stent in 2021.',
    emergencyContact: {
      name: 'Ananya Patel',
      phone: '+91 98765 43210',
      relation: 'Spouse'
    },
    ambulanceId: 'AMB-01'
  },
  {
    patientId: 'PT-1002',
    name: 'Aarohi Sharma',
    age: 29,
    gender: 'Female',
    bloodGroup: 'B+',
    condition: 'Severe Respiratory Distress / Hypoxia',
    triageCategory: 'Red - Immediate',
    medicalHistory: 'Chronic Bronchial Asthma, seasonal pollen allergy.',
    emergencyContact: {
      name: 'Vikas Sharma',
      phone: '+91 98450 11223',
      relation: 'Brother'
    },
    ambulanceId: 'AMB-02'
  },
  {
    patientId: 'PT-1003',
    name: 'Col. Vikram Malhotra',
    age: 63,
    gender: 'Male',
    bloodGroup: 'AB+',
    condition: 'Suspected Ischemic Stroke (FAST positive)',
    triageCategory: 'Red - Immediate',
    medicalHistory: 'Hyperlipidemia, mild atrial fibrillation.',
    emergencyContact: {
      name: 'Pooja Malhotra',
      phone: '+91 97321 88990',
      relation: 'Daughter'
    },
    ambulanceId: 'AMB-01'
  }
];

const initialAmbulances = [
  {
    ambulanceId: 'AMB-01',
    vehicleNumber: 'KA-01-EA-108',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 91234 56789',
    paramedicName: 'Paramedic Sarah Jenkins',
    status: 'EN_ROUTE',
    currentLocation: {
      lat: 12.9716,
      lng: 77.5946,
      address: 'MG Road Junction, Bengaluru'
    },
    destinationHospital: {
      name: 'City Central Trauma Center & Super Specialty Hospital',
      lat: 12.9850,
      lng: 77.6100,
      address: 'HAL Old Airport Rd, Bengaluru'
    },
    speed: 52,
    etaMinutes: 9,
    activePatientId: 'PT-1001',
    emergencyStatus: {
      isEmergency: false,
      level: 'NORMAL',
      reason: 'Routine urgent transit',
      triggeredAt: null,
      acknowledged: false,
      acknowledgedAt: null,
      acknowledgedBy: null,
      hospitalNotes: ''
    }
  },
  {
    ambulanceId: 'AMB-02',
    vehicleNumber: 'KA-04-MB-204',
    driverName: 'Mohammed Tariq',
    driverPhone: '+91 94455 66778',
    paramedicName: 'Nurse David Chang',
    status: 'ON_DUTY',
    currentLocation: {
      lat: 12.9352,
      lng: 77.6245,
      address: 'Koramangala Sony World Signal, Bengaluru'
    },
    destinationHospital: {
      name: 'City Central Trauma Center & Super Specialty Hospital',
      lat: 12.9850,
      lng: 77.6100,
      address: 'HAL Old Airport Rd, Bengaluru'
    },
    speed: 40,
    etaMinutes: 16,
    activePatientId: 'PT-1002',
    emergencyStatus: {
      isEmergency: false,
      level: 'NORMAL',
      reason: 'Patient monitoring active',
      triggeredAt: null,
      acknowledged: false,
      acknowledgedAt: null,
      acknowledgedBy: null,
      hospitalNotes: ''
    }
  }
];

const hospitalInfo = {
  hospitalId: 'HOSP-01',
  name: 'City Central Trauma Center & Super Specialty Hospital',
  department: 'Emergency & Critical Care Division (ER / ICU)',
  emergencyHotline: '108 / 080-2555-9999',
  location: {
    lat: 12.9850,
    lng: 77.6100,
    address: 'HAL Old Airport Rd, Bengaluru'
  },
  traumaLevel: 'Level 1 Trauma Center',
  availableBeds: {
    icu: 4,
    emergencyWard: 7,
    ventilators: 3
  }
};

module.exports = {
  initialPatients,
  initialAmbulances,
  hospitalInfo
};
