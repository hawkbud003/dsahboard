#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PID file exists
if [ -f "app.pid" ]; then
    PID=$(cat app.pid)
    print_message "Stopping existing application with PID $PID..."
    
    # Check if process is running
    if ps -p $PID > /dev/null; then
        kill $PID
        print_message "Application stopped."
    else
        print_warning "Process with PID $PID not found. Removing PID file."
        rm app.pid
    fi
else
    print_message "No PID file found. No application to stop."
fi

# Start the application with the updated CORS settings
print_message "Starting application with updated CORS settings..."
./run.sh --gunicorn --background

print_message "Application restarted successfully."
print_message "CORS settings have been updated to allow requests from your frontend."
print_message "If you're still experiencing CORS issues, please check your frontend code to ensure it's sending the correct headers." 