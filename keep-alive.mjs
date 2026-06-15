import { spawn } from 'child_process';

const RESTART_DELAY = 1000;
let child = null;
let restarts = 0;

function start() {
  restarts++;
  console.log(`[keep-alive] Starting Next.js (attempt #${restarts}) - ${new Date().toISOString()}`);
  
  child = spawn('node', ['server.js'], {
    cwd: '/home/z/my-project/.next/standalone',
    env: {
      ...process.env,
      PORT: '3000',
      HOSTNAME: '0.0.0.0',
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=256',
    },
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    console.log(`[keep-alive] Server exited (code=${code}, signal=${signal}) - restarting in ${RESTART_DELAY}ms`);
    child = null;
    setTimeout(start, RESTART_DELAY);
  });
}

process.on('SIGINT', () => { if (child) child.kill(); process.exit(0); });
process.on('SIGTERM', () => { if (child) child.kill(); process.exit(0); });

// Keep event loop alive
setInterval(() => {}, 30000);

start();
