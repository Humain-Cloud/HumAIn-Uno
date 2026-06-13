#!/bin/bash
# Supervisor: restarts the Next.js server when it crashes
while true; do
  /home/z/my-project/start-server.sh >> /home/z/my-project/dev.log 2>&1
  echo "[$(date)] Server exited, restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
