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

# Check if running on Digital Ocean
print_message "Checking if running on Digital Ocean..."
if [ -f "/etc/digitalocean" ]; then
    print_message "Running on Digital Ocean droplet."
else
    print_warning "Not running on a Digital Ocean droplet. This script is designed for Digital Ocean."
fi

# Check if nginx is installed
print_message "Checking if nginx is installed..."
if command -v nginx &> /dev/null; then
    print_message "Nginx is already installed."
else
    print_message "Nginx is not installed. Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
    if [ $? -ne 0 ]; then
        print_error "Failed to install Nginx. Please install it manually."
        exit 1
    fi
    print_message "Nginx installed successfully."
fi

# Create Nginx configuration for the Django application
print_message "Creating Nginx configuration for the Django application..."
NGINX_CONF="/etc/nginx/sites-available/django_app"
NGINX_ENABLED="/etc/nginx/sites-enabled/django_app"

# Create the configuration file
sudo tee $NGINX_CONF > /dev/null << EOF
server {
    listen 80;
    server_name _;  # Match all server names

    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers for proxied requests
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }

    location /static/ {
        alias /var/www/static/;
    }

    location /media/ {
        alias /var/www/media/;
    }
}
EOF

# Create symbolic link to enable the site
if [ ! -f "$NGINX_ENABLED" ]; then
    print_message "Enabling the Nginx site..."
    sudo ln -s $NGINX_CONF $NGINX_ENABLED
fi

# Create directories for static and media files
print_message "Creating directories for static and media files..."
sudo mkdir -p /var/www/static
sudo mkdir -p /var/www/media
sudo chown -R www-data:www-data /var/www/static
sudo chown -R www-data:www-data /var/www/media

# Check if the application is running
print_message "Checking if the application is running..."
if [ -f "app.pid" ]; then
    PID=$(cat app.pid)
    if ps -p $PID > /dev/null; then
        print_message "Application is running with PID $PID."
        print_message "Stopping the application to restart with the correct port..."
        kill $PID
        rm app.pid
    else
        print_warning "Application is not running. PID file exists but process is not found."
        rm app.pid
    fi
else
    print_warning "Application is not running. No PID file found."
fi

# Start the application with Gunicorn on port 8000
print_message "Starting the application with Gunicorn on port 8000..."
./run.sh --gunicorn --port=8000 --background

# Test Nginx configuration
print_message "Testing Nginx configuration..."
sudo nginx -t
if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed. Please check the configuration."
    exit 1
fi

# Restart Nginx
print_message "Restarting Nginx..."
sudo systemctl restart nginx
if [ $? -ne 0 ]; then
    print_error "Failed to restart Nginx. Please check the configuration."
    exit 1
fi

print_message "CORS fix completed."
print_message "Your application is now running with Nginx as a reverse proxy."
print_message "The application is accessible at http://your-server-ip/"
print_message "Nginx is listening on port 80 and forwarding requests to Gunicorn on port 8000."
print_message "CORS headers have been properly configured in Nginx."
print_message "If you're still experiencing CORS issues, please check your frontend code to ensure it's sending the correct headers." 