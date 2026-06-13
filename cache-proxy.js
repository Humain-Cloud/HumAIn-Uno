const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const PORT = 3000;
const NEXT_PORT = 3001;
const CACHE = new Map();
const CACHE_TTL = 60000; // 1 minute

let nextProcess = null;
let nextReady = false;
let restartCount = 0;

function startNext() {
  if (nextProcess) return;
  
  console.log('[proxy] Starting Next.js on port', NEXT_PORT);
  nextProcess = spawn('node', ['./node_modules/.bin/next', 'dev', '-p', String(NEXT_PORT), '--webpack'], {
    cwd: '/home/z/my-project',
    env: Object.assign({}, process.env, { NODE_OPTIONS: '--max-old-space-size=4096' }),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  nextProcess.stdout.on('data', (data) => {
    const text = data.toString();
    fs.appendFileSync('/home/z/my-project/dev.log', text);
    if (text.includes('Ready in')) {
      nextReady = true;
      console.log('[proxy] Next.js is ready');
    }
  });
  
  nextProcess.stderr.on('data', (data) => {
    fs.appendFileSync('/home/z/my-project/dev.log', data.toString());
  });
  
  nextProcess.on('exit', (code) => {
    console.log('[proxy] Next.js exited with code', code);
    nextProcess = null;
    nextReady = false;
    restartCount++;
    // Restart after 2 seconds
    setTimeout(startNext, 2000);
  });
}

function proxyRequest(req, res) {
  const cacheKey = req.url;
  const cached = CACHE.get(cacheKey);
  
  // If we have a fresh cache, serve it
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    res.writeHead(cached.status, cached.headers);
    res.end(cached.body);
    return;
  }
  
  // If Next.js is not ready, serve from cache (even stale)
  if (!nextReady) {
    if (cached) {
      res.writeHead(cached.status, cached.headers);
      res.end(cached.body);
    } else {
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end('<h1>Server is starting...</h1><p>Please refresh in a few seconds.</p>');
    }
    return;
  }
  
  // Proxy to Next.js
  const options = {
    hostname: 'localhost',
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    let body = [];
    proxyRes.on('data', (chunk) => body.push(chunk));
    proxyRes.on('end', () => {
      body = Buffer.concat(body);
      // Cache the response
      if (proxyRes.statusCode === 200) {
        CACHE.set(cacheKey, {
          status: proxyRes.statusCode,
          headers: proxyRes.headers,
          body: body,
          time: Date.now()
        });
      }
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      res.end(body);
    });
  });
  
  proxyReq.on('error', (err) => {
    console.error('[proxy] Error:', err.message);
    nextReady = false;
    if (cached) {
      res.writeHead(cached.status, cached.headers);
      res.end(cached.body);
    } else {
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end('<h1>Server error</h1><p>Please try again in a moment.</p>');
    }
  });
  
  proxyReq.end();
}

// Start the proxy server
const server = http.createServer(proxyRequest);
server.listen(PORT, () => {
  console.log('[proxy] Cache proxy listening on port', PORT);
  fs.writeFileSync('/home/z/my-project/dev.pid', String(process.pid));
});

// Start Next.js
startNext();

// Keep alive
setInterval(() => {
  fs.writeFileSync('/home/z/my-project/proxy-alive', Date.now().toString());
}, 5000);
