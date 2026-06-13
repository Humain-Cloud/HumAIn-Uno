#!/bin/bash
cd /home/z/my-project/.next/standalone
while true; do
  PORT=3000 HOSTNAME='::' NODE_OPTIONS="--max-old-space-size=256" node server.js 2>&1 | while IFS= read -r line; do
    echo "[$(date '+%H:%M:%S')] $line" >> /home/z/my-project/dev.log
  done
  sleep 1
done
