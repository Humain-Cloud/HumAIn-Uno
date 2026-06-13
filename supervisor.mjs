import { spawn } from 'child_process';
import { appendFileSync, writeFileSync } from 'fs';

const PID_FILE = '/home/z/my-project/dev.pid';
const LOG = '/home/z/my-project/dev.log';
const RESTART_LOG = '/home/z/my-project/dev-restart.log';

function startServer() {
  const msg = `${new Date().toISOString()}: Starting Next.js server...\n`;
  appendFileSync(RESTART_LOG, msg);
  
  const child = spawn('node', ['./node_modules/.bin/next', 'dev', '-p', '3000', '--webpack'], {
    cwd: '/home/z/my-project',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Write PID
  writeFileSync(PID_FILE, String(child.pid));
  
  // Pipe output to log
  let logStream = null;
  try {
    const { openSync } = await import('fs');
    // Use simple approach
  } catch(e) {}
  
  child.stdout.on('data', (data) => {
    appendFileSync(LOG, data);
  });
  
  child.stderr.on('data', (data) => {
    appendFileSync(LOG, data);
  });
  
  child.on('exit', (code, signal) => {
    const msg = `${new Date().toISOString()}: Server exited code=${code} signal=${signal}. Restarting in 2s...\n`;
    appendFileSync(RESTART_LOG, msg);
    setTimeout(startServer, 2000);
  });
  
  child.on('error', (err) => {
    const msg = `${new Date().toISOString()}: Server error: ${err.message}. Restarting in 2s...\n`;
    appendFileSync(RESTART_LOG, msg);
    setTimeout(startServer, 2000);
  });
}

startServer();

// Keep supervisor alive
setInterval(() => {}, 60000);
