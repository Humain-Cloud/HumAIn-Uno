#!/bin/bash
trap 'echo "Received signal: $@" >> /home/z/my-project/signal.log' SIGHUP SIGINT SIGTERM SIGKILL SIGUSR1 SIGUSR2
NODE_OPTIONS="--max-old-space-size=256" node ./node_modules/.bin/next start -p 3000
EXIT_CODE=$?
echo "Exit code: $EXIT_CODE" >> /home/z/my-project/signal.log
