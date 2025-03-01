#!/bin/bash

# Kill any running instances
pkill -f "node server.js" || true

# Wait a moment
sleep 1

# Start the server
node server.js > server.log 2>&1 &

echo "Server restarted. Logs in server.log"