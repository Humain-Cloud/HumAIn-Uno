#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS='--max-old-space-size=256' npx next dev -p 3000 -H 0.0.0.0 >> /home/z/my-project/dev.log 2>&1
  echo "Server crashed at $(date), restarting in 3s..." >> /home/z/my-project/dev.log
  sleep 3
done
