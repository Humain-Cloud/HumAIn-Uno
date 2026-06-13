#!/bin/bash
# Check if server is running, restart if not
if ! pgrep -f "next-server" > /dev/null 2>&1; then
  echo "[$(date)] Server not running, starting..." >> /home/z/my-project/dev.log
  cd /home/z/my-project/.next/standalone
  PORT=3000 HOSTNAME='::' NODE_OPTIONS="--max-old-space-size=64 --jitless" nohup node server.js >> /home/z/my-project/dev.log 2>&1 &
  echo "[$(date)] Server started PID=$!" >> /home/z/my-project/dev.log
fi
