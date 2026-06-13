#!/bin/bash
# Minimal server keep-alive - runs as a separate process group
while true; do
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    cd /home/z/my-project/.next/standalone
    PORT=3000 HOSTNAME='::' NODE_OPTIONS="--max-old-space-size=256" nohup node server.js >> /home/z/my-project/dev.log 2>&1 &
  fi
  sleep 3
done
