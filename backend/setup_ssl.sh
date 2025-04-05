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
    print_message "Usage: sudo ./setup_ssl.sh your-domain.com"
    exit 1
fi

DOMAIN_NAME=$1
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN_NAME"
DEFAULT_CONF="/etc/nginx/sites-enabled/default"

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    print_message "Installing Nginx..."
    apt update
    apt install -y nginx
    if [ $? -ne 0 ]; then
        print_error "Failed to install Nginx."
        exit 1
    fi
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    print_message "Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
    if [ $? -ne 0 ]; then
        print_error "Failed to install Certbot."
        exit 1
    fi
fi

# Remove default Nginx configuration if it exists
if [ -f "$DEFAULT_CONF" ]; then
    print_message "Removing default Nginx configuration..."
    rm $DEFAULT_CONF
fi

# Create a basic Nginx configuration for the domain
print_message "Creating Nginx configuration for $DOMAIN_NAME..."
mkdir -p /etc/nginx/sites-available
cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Create symbolic link to enable the site
if [ ! -f "$NGINX_ENABLED" ]; then
    print_message "Enabling the Nginx site..."
    ln -s $NGINX_CONF $NGINX_ENABLED
fi

# Test Nginx configuration
print_message "Testing Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed. Please check the configuration."
    exit 1
fi

# Restart Nginx
print_message "Restarting Nginx..."
systemctl restart nginx
if [ $? -ne 0 ]; then
    print_error "Failed to restart Nginx. Please check the configuration."
    exit 1
fi

# Obtain SSL certificate
print_message "Obtaining SSL certificate for $DOMAIN_NAME..."
certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME --redirect
if [ $? -ne 0 ]; then
    print_error "Failed to obtain SSL certificate."
    print_message "Please make sure your domain's DNS A record points to this server's IP address."
    print_message "You can try running the command manually:"
    print_message "certbot --nginx -d $DOMAIN_NAME"
    exit 1
fi

print_message "SSL certificate obtained successfully!"
print_message "Your site is now accessible at https://$DOMAIN_NAME/"
print_message "All HTTP traffic is automatically redirected to HTTPS."
print_message "The SSL certificate will automatically renew before expiration." 