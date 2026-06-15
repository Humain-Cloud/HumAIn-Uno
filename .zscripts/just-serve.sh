#!/bin/bash
cd /home/z/my-project
while true; do
  PORT=3000 HOSTNAME=0.0.0.0 NODE_OPTIONS="--max-old-space-size=256" node .next/standalone/server.js 2>&1
  echo "Server died at $(date), restarting..." >> /home/z/my-project/server-restart.log
  sleep 2
done
