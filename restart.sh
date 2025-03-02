#!/bin/bash

# Kill any running instances
pkill -f "serve -s dist" || true

# Wait a moment
sleep 1

# Build the project
npm run build

# Start the server using nohup to keep it running after disconnect
# The & at the end runs it in the background
nohup serve -s dist -l 3000 > server.log 2>&1 &

# Store the PID for future reference
echo $! > server.pid

echo "Server restarted on port 3000. Logs in server.log"