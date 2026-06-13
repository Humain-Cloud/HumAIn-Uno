const { spawn } = require('child_process');
const { appendFileSync, writeFileSync } = require('fs');

const PID_FILE = '/home/z/my-project/dev.pid';
const LOG = '/home/z/my-project/dev.log';
const RESTART_LOG = '/home/z/my-project/dev-restart.log';

// Clear log
writeFileSync(LOG, '');

function startServer() {
  const msg = new Date().toISOString() + ': Starting Next.js server...\n';
  appendFileSync(RESTART_LOG, msg);
  
  const child = spawn('node', ['./node_modules/.bin/next', 'dev', '-p', '3000', '--webpack'], {
    cwd: '/home/z/my-project',
    env: Object.assign({}, process.env, { NODE_OPTIONS: '--max-old-space-size=4096' }),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  writeFileSync(PID_FILE, String(child.pid));
  
  child.stdout.on('data', function(data) {
    appendFileSync(LOG, data.toString());
  });
  
  child.stderr.on('data', function(data) {
    appendFileSync(LOG, data.toString());
  });
  
  child.on('exit', function(code, signal) {
    var msg = new Date().toISOString() + ': Server exited code=' + code + ' signal=' + signal + '. Restarting in 2s...\n';
    appendFileSync(RESTART_LOG, msg);
    setTimeout(startServer, 2000);
  });
  
  child.on('error', function(err) {
    var msg = new Date().toISOString() + ': Server error: ' + err.message + '. Restarting in 2s...\n';
    appendFileSync(RESTART_LOG, msg);
    setTimeout(startServer, 2000);
  });
}

startServer();

// Keep supervisor alive
setInterval(function() {}, 60000);
