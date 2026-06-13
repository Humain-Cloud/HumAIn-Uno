const http = require('http');

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 3001,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxy.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502);
      res.end('Backend unavailable');
    }
  });
  
  req.pipe(proxy);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Mini proxy :3000 -> :3001');
});

process.on('uncaughtException', () => {});
