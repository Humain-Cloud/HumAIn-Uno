#!/bin/bash
trap 'echo "[$(date)] Received signal: $?" >> /home/z/my-project/crash.log' EXIT SIGHUP SIGINT SIGTERM SIGKILL SIGSEGV SIGBUS SIGABRT
echo "[$(date)] Starting Next.js..." >> /home/z/my-project/crash.log
exec npx next dev -p 3000
