#!/bin/bash
# Auto-restart supervisor for Next.js dev server on port 3000
# Keeps restarting the server whenever it crashes

LOG="/home/z/my-project/supervisor.log"
RESTART_COUNT=0

echo "[$(date)] Supervisor starting..." > "$LOG"

while true; do
    if ! ss -tlnp 2>/dev/null | grep -q ":3000 "; then
        RESTART_COUNT=$((RESTART_COUNT + 1))
        echo "[$(date)] Restart #$RESTART_COUNT: Starting Next.js dev server on 3000..." >> "$LOG"
        
        cd /home/z/my-project && NODE_OPTIONS="--max-old-space-size=256" npx next dev -p 3000 --webpack >> /home/z/my-project/dev.log 2>&1
        EXIT_CODE=$?
        
        echo "[$(date)] Server exited with code $EXIT_CODE" >> "$LOG"
        
        # Wait a bit before restarting
        sleep 3
    else
        # Server is running, check periodically
        sleep 5
    fi
done
