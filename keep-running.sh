#!/bin/bash
# Robust server restart script
cd /home/z/my-project
LOG=/home/z/my-project/dev.log
RESTART_LOG=/home/z/my-project/dev-restart.log

while true; do
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ): Starting server..." >> $RESTART_LOG
  NODE_OPTIONS="--max-old-space-size=4096" node ./node_modules/.bin/next dev -p 3000 --webpack > $LOG 2>&1
  EXIT=$?
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ): Server exited (code=$EXIT). Restarting in 1s..." >> $RESTART_LOG
  sleep 1
done
