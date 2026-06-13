#!/bin/bash
# Start Next.js standalone server with optimal settings
# Port 3000 with dual-stack (IPv4+IPv6) for Caddy compatibility
# File-based API cache at /home/z/my-project/.cache-api for resilience

cd /home/z/my-project/.next/standalone
export PORT=3000
export HOSTNAME='::'
export NODE_OPTIONS="--max-old-space-size=256"
exec node server.js 2>&1
