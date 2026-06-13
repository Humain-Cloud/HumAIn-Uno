const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<!DOCTYPE html><html><body><h1>Humain-Uno</h1><p>Proxy Active</p></body></html>');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Echo server on port 3000');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err.message);
});
