#!/bin/bash

# Kill any running instances
pkill -f "serve -s dist" || true
pkill -f "node server.js" || true
pkill -f "Metro" || true
pkill -f "react-native start" || true

# Wait a moment
sleep 1

# Start the node server using nohup to keep it running after disconnect
# The & at the end runs it in the background
nohup node server.js > server.log 2>&1 &

# Store the PID for future reference
echo $! > server.pid

# Start the Metro bundler in development mode
echo "Starting Metro bundler in a new terminal window..."
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run start"'

echo "Server restarted on port 5000. Logs in server.log"
echo "Metro bundler started in a new terminal window"