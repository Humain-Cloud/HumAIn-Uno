const http = require('http');
const net = require('net');
const { execSync } = require('child_process');

const PROXY_PORT = 3000;
const TARGET_PORT = 3001;
const TARGET_HOST = '127.0.0.1';

const server = http.createServer((req, res) => {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` },
    timeout: 60000,
  };

  const bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(bodyChunks);
    const proxyReq = http.request(options, (proxyRes) => {
      if (!res.destroyed) {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    });
    proxyReq.on('error', () => {
      if (!res.destroyed) { res.writeHead(502); res.end(); }
    });
    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (!res.destroyed) { res.writeHead(504); res.end(); }
    });
    if (body.length > 0) proxyReq.end(body);
    else proxyReq.end();
  });
  req.on('error', () => {});
});

// WebSocket support
server.on('upgrade', (req, socket, head) => {
  const proxy = net.connect(TARGET_PORT, TARGET_HOST, () => {
    proxy.write(head);
    proxy.pipe(socket);
    socket.pipe(proxy);
  });
  proxy.on('error', () => socket.destroy());
  socket.on('error', () => proxy.destroy());
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[PROXY] :${PROXY_PORT} -> :${TARGET_PORT}`);
});

server.on('error', (err) => {
  console.error(`[PROXY] Error: ${err.message}`);
  process.exit(1);
});

process.on('uncaughtException', () => {});
