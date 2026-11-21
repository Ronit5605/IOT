const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_ambulance';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // Timeout fast if no local mongo daemon
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${uri}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${error.message}).`);
    console.warn(`[MongoDB Info] Operating in High-Availability In-Memory Store mode for seamless demonstration.`);
    console.warn(`[MongoDB Tip] To connect to real MongoDB, start mongod or set MONGODB_URI in backend/.env`);
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  database: isConnected ? mongoose.connection.name : 'In-Memory Demo Store',
  host: isConnected ? mongoose.connection.host : 'localhost (in-memory)'
});

module.exports = {
  connectDB,
  getDBStatus,
  isMongoConnected: () => isConnected
};
