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

# Create a basic Nginx configuration for the domain (HTTP only)
print_message "Creating initial Nginx configuration for $DOMAIN_NAME..."
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
certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
if [ $? -ne 0 ]; then
    print_error "Failed to obtain SSL certificate."
    print_message "Please make sure your domain's DNS A record points to this server's IP address."
    print_message "You can try running the command manually:"
    print_message "certbot --nginx -d $DOMAIN_NAME"
    exit 1
fi

# Now that we have the certificate, let's update the Nginx configuration to include HTTPS
print_message "Updating Nginx configuration to include HTTPS..."
cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://frontenddashboard.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://frontenddashboard.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }
    
    # Specific location for API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers for API
        add_header 'Access-Control-Allow-Origin' 'https://frontenddashboard.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }
}
EOF

# Test Nginx configuration again
print_message "Testing updated Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed after SSL setup. Please check the configuration."
    exit 1
fi

# Restart Nginx
print_message "Restarting Nginx with SSL configuration..."
systemctl restart nginx
if [ $? -ne 0 ]; then
    print_error "Failed to restart Nginx with SSL configuration."
    exit 1
fi

print_message "SSL certificate obtained successfully!"
print_message "Your site is now accessible at https://$DOMAIN_NAME/"
print_message "All HTTP traffic is automatically redirected to HTTPS."
print_message "The SSL certificate will automatically renew before expiration." 