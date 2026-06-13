#!/bin/bash
# Server Manager - starts/restarts the Next.js dev server
cd /home/z/my-project

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null
pkill -f "next start" 2>/dev/null
sleep 2

# Start the dev server
NODE_OPTIONS="--max-old-space-size=4096" node ./node_modules/.bin/next dev -p 3000 --webpack > /home/z/my-project/dev.log 2>&1 &
echo $! > /home/z/my-project/dev.pid
disown

echo "$(date): Dev server started with PID $(cat /home/z/my-project/dev.pid)" >> /home/z/my-project/server-manager.log
