#!/bin/bash
# Health check - restarts dev server if not responding
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
if [ "$RESPONSE" != "200" ]; then
  echo "$(date): Server not responding (code=$RESPONSE), restarting..." >> /home/z/my-project/server-manager.log
  bash /home/z/my-project/server-manager.sh >> /home/z/my-project/server-manager.log 2>&1
  sleep 5
  # Verify it started
  NEW_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  echo "$(date): After restart, response code=$NEW_RESPONSE" >> /home/z/my-project/server-manager.log
fi
