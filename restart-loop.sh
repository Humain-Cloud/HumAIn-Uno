#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=256" node ./node_modules/.bin/next start -p 3000 >> /home/z/my-project/dev.log 2>&1
  echo "$(date): Restarting..." >> /home/z/my-project/dev-restart.log
  sleep 2
done
