#!/bin/bash

# Kill any running instances
pkill -f "serve -s dist" || true
pkill -f "node server.js" || true

# Wait a moment
sleep 1

# Build the project
npm run build

# Start the node server using nohup to keep it running after disconnect
# The & at the end runs it in the background
nohup node server.js > server.log 2>&1 &

# Store the PID for future reference
echo $! > server.pid

echo "Server restarted on port 5000. Logs in server.log"