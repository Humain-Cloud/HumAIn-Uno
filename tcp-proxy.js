const net = require('net');

const PROXY_PORT = 3000;
const TARGET_PORT = 3001;
const TARGET_HOST = '127.0.0.1';

const server = net.createServer((clientSocket) => {
  const serverSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
    // Once connected to target, pipe data bidirectionally
    clientSocket.pipe(serverSocket);
    serverSocket.pipe(clientSocket);
  });
  
  serverSocket.on('error', () => { clientSocket.destroy(); });
  clientSocket.on('error', () => { serverSocket.destroy(); });
  serverSocket.on('close', () => { clientSocket.destroy(); });
  clientSocket.on('close', () => { serverSocket.destroy(); });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[TCP-PROXY] :${PROXY_PORT} -> :${TARGET_PORT}`);
});

server.on('error', (err) => {
  console.error(`[TCP-PROXY] Error: ${err.message}`);
  process.exit(1);
});

process.on('uncaughtException', () => {});
