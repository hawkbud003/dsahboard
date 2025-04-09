#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print functions
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root. Please use sudo."
    exit 1
fi

# Check if domain name is provided
if [ -z "$1" ]; then
    print_error "Please provide a domain name as an argument."
    print_message "Usage: sudo ./fix_cors_patch.sh your-domain.com"
    exit 1
fi

DOMAIN_NAME=$1
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN_NAME"

# Check if Nginx configuration file exists
if [ ! -f "$NGINX_CONF" ]; then
    print_error "Nginx configuration file not found: $NGINX_CONF"
    exit 1
fi

# Update the Nginx configuration to include PATCH in Access-Control-Allow-Methods
print_message "Updating Nginx configuration to allow PATCH requests..."
sed -i "s/add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;/add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;/" $NGINX_CONF

# Test Nginx configuration
print_message "Testing Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed. Please check the configuration."
    exit 1
fi

# Reload Nginx to apply changes
print_message "Reloading Nginx to apply changes..."
systemctl reload nginx
if [ $? -ne 0 ]; then
    print_error "Failed to reload Nginx. Please check the configuration."
    exit 1
fi

print_message "CORS configuration updated successfully. PATCH requests are now allowed."
print_message "Your API should now accept PATCH requests from https://frontenddashboard.vercel.app" 