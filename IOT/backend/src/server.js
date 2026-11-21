require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const { connectDB, getDBStatus } = require('./config/db');
const storeService = require('./services/storeService');
const simulatorService = require('./services/simulatorService');
const { setupSocketIO } = require('./services/socketService');

// Route imports
const patientRoutes = require('./routes/patientRoutes');
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const iotRoutes = require('./routes/iotRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration with CORS enabled
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Provide io instance to route controllers via req.app.get('io')
app.set('io', io);

// Health and System Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'IoT Smart Ambulance and Emergency Communication System',
    timestamp: new Date(),
    database: getDBStatus(),
    simulator: simulatorService.getStatus()
  });
});

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/iot', iotRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    project: 'IoT-Based Smart Ambulance and Emergency Communication System API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/patients',
      '/api/ambulances',
      '/api/vitals',
      '/api/emergencies',
      '/api/iot/vitals',
      '/api/iot/simulator/status'
    ]
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Initialize Server, DB and Simulation
const startServer = async () => {
  try {
    await connectDB();
    await storeService.initData();

    // Wire up Socket.IO
    setupSocketIO(io);
    simulatorService.setSocketIO(io);

    // Start background IoT sensor simulation
    simulatorService.start();

    server.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚑 Smart Ambulance & Emergency Server Started`);
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`⚡ Socket.IO Server: ws://localhost:${PORT}`);
      console.log(`🏥 Hospital Emergency Hotline Active`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
