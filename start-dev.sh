#!/bin/bash
cd /home/z/my-project
while true; do
  echo "$(date): Starting Next.js dev server..." >> /home/z/my-project/dev-restart.log
  NODE_OPTIONS="--max-old-space-size=4096" node ./node_modules/.bin/next dev -p 3000 --webpack > /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "$(date): Server exited with code $EXIT_CODE. Restarting in 2s..." >> /home/z/my-project/dev-restart.log
  sleep 2
done
