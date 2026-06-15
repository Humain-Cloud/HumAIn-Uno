import { spawn } from 'child_process';

function startServer() {
  console.log(`[${new Date().toISOString()}] Starting Next.js dev server...`);
  
  const child = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '0.0.0.0'], {
    cwd: '/home/z/my-project',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=256' },
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
    console.log(`[${new Date().toISOString()}] Server exited with code=${code} signal=${signal}, restarting in 3s...`);
    setTimeout(startServer, 3000);
  });
}

startServer();
