#!/bin/bash
LOG=/home/z/my-project/dev-monitor.log
echo "$(date): Starting monitor" > $LOG

while true; do
  cd /home/z/my-project
  NODE_OPTIONS="--max-old-space-size=4096" node ./node_modules/.bin/next dev -p 3000 --webpack > /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "$(date): Server exited with code=$EXIT_CODE, signal=$(kill -l $EXIT_CODE 2>/dev/null)" >> $LOG
  sleep 2
done
