// Persistent server with auto-restart for Humain-Uno
const PORT = 3000;
const STANDALONE_DIR = "/home/z/my-project/.next/standalone";

let child: ReturnType<typeof Bun.spawn> | null = null;
let restartCount = 0;

function startServer() {
  restartCount++;
  console.log(`[persistent-server] Starting Next.js (attempt #${restartCount}) at ${new Date().toISOString()}`);
  
  child = Bun.spawn([
    "node", 
    `${STANDALONE_DIR}/server.js`
  ], {
    env: {
      ...Bun.env,
      PORT: "3000",
      HOSTNAME: "0.0.0.0",
      NODE_ENV: "production",
    },
    cwd: STANDALONE_DIR,
    stdout: "inherit",
    stderr: "inherit",
  });

  child.exited.then((code) => {
    console.log(`[persistent-server] Next.js exited with code ${code} at ${new Date().toISOString()}`);
    console.log(`[persistent-server] Restarting in 2 seconds...`);
    setTimeout(startServer, 2000);
  });
}

// Handle signals
process.on("SIGINT", () => {
  console.log("[persistent-server] Received SIGINT, shutting down...");
  if (child) child.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("[persistent-server] Received SIGTERM, shutting down...");
  if (child) child.kill();
  process.exit(0);
});

startServer();
