#!/usr/bin/env node

/**
 * Forever Runner - Simple process manager for 24/7 operation
 * Keeps the server running and auto-restarts on crash
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'server.log');
const errorFile = path.join(logsDir, 'error.log');

function startServer() {
  console.log(`[${new Date().toISOString()}] Starting AquaSense Server...`);

  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Log stdout
  server.stdout.on('data', (data) => {
    const msg = data.toString();
    console.log(msg);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}`);
  });

  // Log stderr
  server.stderr.on('data', (data) => {
    const msg = data.toString();
    console.error(msg);
    fs.appendFileSync(errorFile, `[${new Date().toISOString()}] ${msg}`);
  });

  server.on('close', (code) => {
    console.error(`[${new Date().toISOString()}] Server crashed with code ${code}. Restarting in 5 seconds...`);
    fs.appendFileSync(errorFile, `[${new Date().toISOString()}] Server crashed with code ${code}\n`);
    setTimeout(startServer, 5000);
  });

  server.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, err);
    fs.appendFileSync(errorFile, `[${new Date().toISOString()}] Error: ${err.message}\n`);
    setTimeout(startServer, 5000);
  });

  return server;
}

console.log('🚀 AquaSense Forever Runner - Running in background 24/7');
console.log(`📝 Logs: ${logFile}`);
console.log(`⚠️  Errors: ${errorFile}`);

startServer();

// Handle signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received, exiting gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, exiting gracefully...');
  process.exit(0);
});
