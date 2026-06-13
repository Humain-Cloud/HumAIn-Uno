#!/bin/bash
# Warmup script: pre-cache API responses right after server starts
# This reduces memory usage for subsequent requests since cached data 
# is served from file cache without hitting the database

MAX_RETRIES=10
RETRY_DELAY=1

for i in $(seq 1 $MAX_RETRIES); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
    echo "[$(date)] Server is up, warming up cache..." >> /home/z/my-project/dev.log
    
    # Warm up API caches one at a time (less memory pressure than parallel)
    curl -s http://localhost:3000/api/stats > /dev/null 2>&1
    sleep 0.5
    curl -s "http://localhost:3000/api/knowledge?page=1&pageSize=20" > /dev/null 2>&1
    sleep 0.5
    curl -s http://localhost:3000/api/categories > /dev/null 2>&1
    
    echo "[$(date)] Cache warmup complete" >> /home/z/my-project/dev.log
    exit 0
  fi
  sleep $RETRY_DELAY
done

echo "[$(date)] Warmup failed - server not responding" >> /home/z/my-project/dev.log
exit 1
