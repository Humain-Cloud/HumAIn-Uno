#!/bin/bash
# Keep-alive script for Next.js server
while true; do
  HOSTNAME=0.0.0.0 PORT=3000 node /home/z/my-project/.next/standalone/server.js
  echo "Server died at $(date), restarting in 2s..." >> /home/z/my-project/server-restarts.log
  sleep 2
done
