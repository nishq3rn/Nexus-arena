// server.js
// Entry point of the NEXUS ARENA backend API

const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { getDbStatus } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// ---- Global Middleware ----
app.use(cors());
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ---- Database Health & Diagnostic Route ----
app.get('/api/health', (req, res) => {
  const db = getDbStatus();
  res.status(db.isConnected ? 200 : 503).json({
    status: db.isConnected ? 'OK' : 'DEGRADED',
    message: db.isConnected
      ? 'Nexus Arena API engine is operational'
      : 'Nexus Arena API engine running in degraded state (MongoDB connection offline)',
    database: db.stateName,
    dbConnected: db.isConnected,
    host: db.host,
    dbName: db.dbName,
    lastError: db.lastError ? db.lastError.message : null,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Manual database reconnection trigger
app.all('/api/health/reconnect', async (req, res) => {
  await connectDB();
  const db = getDbStatus();
  res.json({
    message: 'Reconnection attempt dispatched',
    database: db.stateName,
    dbConnected: db.isConnected,
    lastError: db.lastError ? db.lastError.message : null,
  });
});

// ---- Database Connection Guard Middleware ----
// Prevents requests from hanging when the database connection is not established
const dbGuard = (req, res, next) => {
  const db = getDbStatus();
  if (!db.isConnected) {
    return res.status(503).json({
      message:
        'Database connection offline or establishing. Please verify your MongoDB Atlas cluster IP whitelist (add 0.0.0.0/0 or your current IP in Network Access).',
      error: 'DATABASE_OFFLINE',
      dbState: db.stateName,
      lastError: db.lastError ? db.lastError.message : null,
    });
  }
  next();
};

// ---- API Routes (Guarded by DB connection check) ----
app.use('/api/auth', dbGuard, require('./routes/authRoutes'));
app.use('/api/users', dbGuard, require('./routes/userRoutes'));
app.use('/api/tournaments', dbGuard, require('./routes/tournamentRoutes'));
app.use('/api/registrations', dbGuard, require('./routes/registrationRoutes'));
app.use('/api/matches', dbGuard, require('./routes/matchRoutes'));
app.use('/api/leaderboard', dbGuard, require('./routes/leaderboardRoutes'));
app.use('/api/results', dbGuard, require('./routes/resultRoutes'));
app.use('/api/dashboard', dbGuard, require('./routes/dashboardRoutes'));

// Serve the frontend folder as static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---- Error Handling Middleware (must be last) ----
app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = Number(process.env.PORT) || 5001;

// Auto-open browser helper so project runs in 1 terminal with 1 command
let hasOpenedBrowser = false;
const openBrowser = (url) => {
  if (hasOpenedBrowser || process.env.AUTO_OPEN === 'false') return;
  hasOpenedBrowser = true;
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
      ? 'start'
      : 'xdg-open';
  exec(`${command} ${url}`, () => {});
};

// Resilient port listener: automatically tries next port if current one is occupied
const startServer = (port, attempts = 0) => {
  const server = app.listen(port);

  server.on('listening', () => {
    const targetUrl = `http://localhost:${port}/tournaments.html`;
    console.log('====================================================');
    console.log(`[NEXUS ARENA] Full-Stack Engine active on port ${port}`);
    if (attempts > 0) {
      console.log(`ℹ️ (Port ${DEFAULT_PORT} was already in use. Auto-switched to ${port} without crashing)`);
    }
    console.log(`👉 Access Web App:        http://localhost:${port}`);
    console.log(`👉 Tournaments Directory: ${targetUrl}`);
    console.log(`👉 Operative Login:       http://localhost:${port}/login.html`);
    console.log('====================================================');

    // Automatically launch browser to web app
    setTimeout(() => openBrowser(targetUrl), 600);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempts < 10) {
        console.warn(`[NEXUS ARENA] Port ${port} is occupied. Automatically falling back to port ${port + 1}...`);
        startServer(port + 1, attempts + 1);
      } else {
        console.error(`[NEXUS ARENA] Could not allocate an open port after 10 attempts.`);
        process.exit(1);
      }
    } else {
      console.error(`[NEXUS ARENA] Server startup error:`, err);
    }
  });
};

startServer(DEFAULT_PORT);
