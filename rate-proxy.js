const http = require('http');
const net = require('net');

const PROXY_PORT = 3000;
const TARGET = { host: '127.0.0.1', port: 3001 };

let activeRequests = 0;
let requestQueue = [];
let lastRequestTime = 0;
const MIN_INTERVAL = 100; // ms between requests
const MAX_CONCURRENT = 3;

function processQueue() {
  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT) {
    const now = Date.now();
    const waitTime = Math.max(0, MIN_INTERVAL - (now - lastRequestTime));
    if (waitTime > 0) {
      setTimeout(processQueue, waitTime);
      break;
    }
    const { req, res } = requestQueue.shift();
    forwardRequest(req, res);
  }
}

function forwardRequest(req, res) {
  activeRequests++;
  lastRequestTime = Date.now();
  
  const bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(bodyChunks);
    const options = {
      hostname: TARGET.host,
      port: TARGET.port,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `${TARGET.host}:${TARGET.port}` },
      timeout: 60000,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      const chunks = [];
      proxyRes.on('data', chunk => chunks.push(chunk));
      proxyRes.on('end', () => {
        const responseBody = Buffer.concat(chunks);
        if (!res.destroyed) {
          try {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(responseBody);
          } catch(e) {}
        }
        activeRequests--;
        processQueue();
      });
      proxyRes.on('error', () => {
        activeRequests--;
        try { res.writeHead(502); res.end(); } catch(e) {}
        processQueue();
      });
    });

    proxyReq.on('error', () => {
      activeRequests--;
      try { res.writeHead(502); res.end(); } catch(e) {}
      processQueue();
    });

    proxyReq.on('timeout', () => {
      activeRequests--;
      proxyReq.destroy();
      try { res.writeHead(504); res.end(); } catch(e) {}
      processQueue();
    });

    if (body.length > 0) {
      proxyReq.end(body);
    } else {
      proxyReq.end();
    }
  });
  req.on('error', () => {
    activeRequests--;
    processQueue();
  });
}

const server = http.createServer((req, res) => {
  if (activeRequests >= MAX_CONCURRENT) {
    requestQueue.push({ req, res });
    // Timeout queued requests after 30s
    setTimeout(() => {
      const idx = requestQueue.findIndex(p => p.req === req);
      if (idx !== -1) {
        requestQueue.splice(idx, 1);
        try { res.writeHead(503); res.end('Busy'); } catch(e) {}
      }
    }, 30000);
    return;
  }
  forwardRequest(req, res);
});

// WebSocket upgrade handling
server.on('upgrade', (req, socket, head) => {
  const proxySocket = net.connect(TARGET.port, TARGET.host, () => {
    const headers = [
      `HTTP/${req.httpVersion} 101 Switching Protocols`,
    ];
    proxySocket.write(head);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  proxySocket.on('error', () => socket.destroy());
  socket.on('error', () => proxySocket.destroy());
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[RATE-PROXY] :${PROXY_PORT} -> :${TARGET.port} (max ${MAX_CONCURRENT} concurrent, ${MIN_INTERVAL}ms interval)`);
});

process.on('uncaughtException', (err) => {
  console.error('[RATE-PROXY] Uncaught:', err.message);
});
