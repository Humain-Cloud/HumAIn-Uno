const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const PORT = 3001;
const app = next({ dev: false });
const handle = app.getRequestHandler();

let activeRequests = 0;
const MAX_CONCURRENT = 3;
const requestQueue = [];

function processQueue() {
  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT) {
    const { req, res, parsedUrl } = requestQueue.shift();
    executeRequest(req, res, parsedUrl);
  }
}

function executeRequest(req, res, parsedUrl) {
  activeRequests++;
  res.setTimeout(60000);
  
  handle(req, res, parsedUrl).then(() => {
    activeRequests--;
    processQueue();
  }).catch((err) => {
    console.error('Request error:', err.message);
    activeRequests--;
    if (!res.headersSent) {
      try { res.writeHead(500); res.end('Error'); } catch(e) {}
    }
    processQueue();
  });
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Static assets: no rate limit
    if (parsedUrl.pathname.startsWith('/_next/static/') || 
        parsedUrl.pathname.startsWith('/_next/image') ||
        parsedUrl.pathname.endsWith('.ico') ||
        parsedUrl.pathname.endsWith('.svg') ||
        parsedUrl.pathname.endsWith('.woff2')) {
      handle(req, res, parsedUrl).catch(() => {
        if (!res.headersSent) { res.writeHead(500); res.end(); }
      });
      return;
    }
    
    // Rate limit page/API requests
    if (activeRequests >= MAX_CONCURRENT) {
      requestQueue.push({ req, res, parsedUrl });
      setTimeout(() => {
        const idx = requestQueue.findIndex(r => r.req === req);
        if (idx !== -1) {
          requestQueue.splice(idx, 1);
          if (!res.headersSent) {
            res.writeHead(503, { 'Retry-After': '2' });
            res.end('Busy');
          }
        }
      }, 15000);
      return;
    }
    
    executeRequest(req, res, parsedUrl);
  });

  server.timeout = 60000;
  server.keepAliveTimeout = 3000;
  server.headersTimeout = 65000;
  server.requestTimeout = 60000;
  server.maxRequestsPerSocket = 50;

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`> Server on :${PORT} (max ${MAX_CONCURRENT} page requests)`);
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err.message);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err.message);
});
