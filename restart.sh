#!/bin/bash

# Restart script for Gaia Terminal
# This script will kill any running instances, rebuild the app, and restart the server

echo "====== Gaia Terminal Restart Script ======"
echo "$(date)"
echo "--------------------------------"

# Kill any running node processes for our app
echo "Stopping existing node processes..."
pkill -f "node server.js" || echo "No node server processes found"

# Install dependencies if needed
if [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the app
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed! Exiting."
  exit 1
fi

# Get available port starting from 5000
PORT=5000
while netstat -tuln | grep -q ":$PORT "; do
  echo "Port $PORT is in use, trying next port..."
  PORT=$((PORT+1))
done

# Update the port in server.js
echo "Updating server port to $PORT..."
sed -i "s/const PORT = process.env.PORT || [0-9]\\+;/const PORT = process.env.PORT || $PORT;/" server.js

# Start the server
echo "Starting server on port $PORT..."
nohup node server.js > server.log 2>&1 &
SERVER_PID=$!

# Verify server is running
sleep 2
if ps -p $SERVER_PID > /dev/null; then
  echo "Server started successfully with PID $SERVER_PID!"
  echo "App is available at http://$(hostname -I | awk '{print $1}'):$PORT"
else
  echo "Failed to start server!"
  exit 1
fi

echo "--------------------------------"
echo "Restart completed successfully."