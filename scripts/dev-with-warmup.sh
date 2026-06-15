#!/bin/bash
# Development server startup with warmup
# This script starts the Next.js dev server and warms up key routes
# to reduce compilation overhead when the browser connects.

cd /home/z/my-project

# Kill any existing server
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Clear old cache
rm -rf .next 2>/dev/null || true

echo "Starting Next.js dev server (webpack mode, 1024MB heap)..."
NODE_OPTIONS='--max-old-space-size=1024' node ./node_modules/.bin/next dev -p 3000 -H 0.0.0.0 --webpack > /home/z/my-project/dev.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
echo "Waiting for server to start..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null; then
    echo "Server is ready!"
    break
  fi
  sleep 2
done

# Warm up routes one at a time with delays to prevent OOM
echo "Warming up routes..."
sleep 3

echo "  Warming / ..."
curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null && echo "  ✓ / OK" || echo "  ✗ / failed"
sleep 5

echo "  Warming /api/stats ..."
curl -s -o /dev/null http://127.0.0.1:3000/api/stats 2>/dev/null && echo "  ✓ /api/stats OK" || echo "  ✗ /api/stats failed"
sleep 5

echo "  Warming /api/knowledge ..."
curl -s -o /dev/null "http://127.0.0.1:3000/api/knowledge?page=1&pageSize=6" 2>/dev/null && echo "  ✓ /api/knowledge OK" || echo "  ✗ /api/knowledge failed"
sleep 5

echo "  Warming /api/categories ..."
curl -s -o /dev/null http://127.0.0.1:3000/api/categories 2>/dev/null && echo "  ✓ /api/categories OK" || echo "  ✗ /api/categories failed"
sleep 3

echo "Warmup complete! Server is ready at http://localhost:3000"
echo "Memory usage:"
free -m | head -2
