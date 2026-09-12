// config/db.js
// Handles the connection to MongoDB Atlas using Mongoose with resilient retry & diagnostics

const mongoose = require('mongoose');

const RETRY_DELAY_MS = 5000;
let retryTimer = null;
let lastConnectionError = null;

// Disable Mongoose query buffering so operations do not freeze for 10000ms
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 2500);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    lastConnectionError = null;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    return conn;
  } catch (error) {
    lastConnectionError = {
      message: error.message,
      name: error.name,
      timestamp: new Date().toISOString(),
    };

    console.error(`[MongoDB] Connection failed: ${error.message}`);
    if (error.name === 'MongooseServerSelectionError') {
      console.error(
        '[MongoDB] Atlas Cluster firewall blocked the connection. Ensure your current IP is whitelisted in MongoDB Atlas Network Access (or 0.0.0.0/0).'
      );
    }

    if (!retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connectDB();
      }, RETRY_DELAY_MS);
      console.log(`[MongoDB] Will retry connection in ${RETRY_DELAY_MS / 1000}s...`);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost.');
  if (!retryTimer) {
    retryTimer = setTimeout(() => {
      retryTimer = null;
      connectDB();
    }, RETRY_DELAY_MS);
  }
});

const getDbStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return {
    stateCode,
    stateName: states[stateCode] || 'unknown',
    isConnected: stateCode === 1,
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null,
    lastError: lastConnectionError,
  };
};

module.exports = connectDB;
module.exports.getDbStatus = getDbStatus;
