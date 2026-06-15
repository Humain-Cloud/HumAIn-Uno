import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const PID_FILE = '/home/z/my-project/.zscripts/dev.pid';

function startServer() {
  console.log(`[forever] Starting Next.js dev server at ${new Date().toISOString()}`);
  
  const child = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '0.0.0.0'], {
    cwd: '/home/z/my-project',
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  child.on('exit', (code, signal) => {
    console.log(`[forever] Server exited with code=${code} signal=${signal} at ${new Date().toISOString()}`);
    console.log('[forever] Restarting in 3 seconds...');
    setTimeout(startServer, 3000);
  });

  // Write child PID
  writeFileSync(PID_FILE, String(child.pid));
  console.log(`[forever] Server PID: ${child.pid}`);
}

// Keep the parent process alive with a heartbeat
setInterval(() => {
  // Heartbeat - do nothing, just keep event loop alive
}, 10000);

startServer();
