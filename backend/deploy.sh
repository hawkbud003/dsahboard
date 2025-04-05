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

# Parse command line arguments
USE_GUNICORN=true
PORT=8000
WORKERS=4
FORCE_VENV_RECREATE=false
SKIP_MIGRATIONS=false
INSTALL_NGINX=true
SETUP_NGINX=true
COLLECT_STATIC=true
CREATE_SUPERUSER=false
SUPERUSER_USERNAME=""
SUPERUSER_EMAIL=""
SUPERUSER_PASSWORD=""
DOMAIN_NAME=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-nginx)
            INSTALL_NGINX=false
            SETUP_NGINX=false
            shift
            ;;
        --no-nginx-setup)
            SETUP_NGINX=false
            shift
            ;;
        --port=*)
            PORT="${1#*=}"
            shift
            ;;
        --workers=*)
            WORKERS="${1#*=}"
            shift
            ;;
        --recreate-venv)
            FORCE_VENV_RECREATE=true
            shift
            ;;
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        --no-collect-static)
            COLLECT_STATIC=false
            shift
            ;;
        --create-superuser)
            CREATE_SUPERUSER=true
            shift
            ;;
        --superuser-username=*)
            SUPERUSER_USERNAME="${1#*=}"
            shift
            ;;
        --superuser-email=*)
            SUPERUSER_EMAIL="${1#*=}"
            shift
            ;;
        --superuser-password=*)
            SUPERUSER_PASSWORD="${1#*=}"
            shift
            ;;
        --domain=*)
            DOMAIN_NAME="${1#*=}"
            shift
            ;;
        *)
            print_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Check if Python is installed
print_message "Checking if Python is installed..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if PostgreSQL is installed
print_message "Checking if PostgreSQL is installed..."
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed or not in PATH. Make sure it's installed and running."
fi

# Create or recreate virtual environment
if [ ! -d "venv" ] || [ "$FORCE_VENV_RECREATE" = true ]; then
    if [ -d "venv" ]; then
        print_message "Removing existing virtual environment..."
        rm -rf venv
    fi
    
    print_message "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        print_error "Failed to create virtual environment. Please check your Python installation."
        exit 1
    fi
    print_message "Virtual environment created successfully."
else
    print_message "Using existing virtual environment."
fi

# Check if activate script exists
if [ ! -f "venv/bin/activate" ]; then
    print_error "Virtual environment activation script not found. Recreating virtual environment..."
    rm -rf venv
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        print_error "Failed to create virtual environment. Please check your Python installation."
        exit 1
    fi
    print_message "Virtual environment recreated successfully."
fi

# Activate virtual environment
print_message "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    print_error "Failed to activate virtual environment."
    exit 1
fi

# Install dependencies
print_message "Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies."
    exit 1
fi

# Install Pillow if not already installed
print_message "Checking for Pillow..."
pip show Pillow &> /dev/null
if [ $? -ne 0 ]; then
    print_message "Installing Pillow..."
    pip install Pillow
    if [ $? -ne 0 ]; then
        print_error "Failed to install Pillow."
        exit 1
    fi
    print_message "Pillow installed successfully."
else
    print_message "Pillow is already installed."
fi

# Check if .env file exists, if not create from example
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_message ".env file created. Please update it with your settings."
    else
        print_error ".env.example file not found. Please create a .env file manually."
        exit 1
    fi
fi

# Create static directory if it doesn't exist
if [ ! -d "static" ]; then
    print_message "Creating static directory..."
    mkdir -p static
fi

# Create staticfiles directory if it doesn't exist
if [ ! -d "staticfiles" ]; then
    print_message "Creating staticfiles directory..."
    mkdir -p staticfiles
fi

# Collect static files if requested
if [ "$COLLECT_STATIC" = true ]; then
    print_message "Collecting static files..."
    python manage.py collectstatic --noinput --clear
    if [ $? -ne 0 ]; then
        print_warning "Failed to collect static files. Continuing anyway..."
    fi
fi

# Run migrations if not skipped
if [ "$SKIP_MIGRATIONS" = false ]; then
    # Make migrations for api app
    print_message "Making migrations for api app..."
    python manage.py makemigrations api
    if [ $? -ne 0 ]; then
        print_warning "Failed to make migrations for api app. Continuing anyway..."
    fi
    
    # Run migrations
    print_message "Running database migrations..."
    python manage.py migrate
    if [ $? -ne 0 ]; then
        print_error "Failed to run migrations. Please check your database settings."
        exit 1
    fi
else
    print_message "Skipping migrations as requested."
fi

# Create superuser if requested
if [ "$CREATE_SUPERUSER" = true ]; then
    print_message "Creating superuser..."
    
    # Check if superuser already exists
    python -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser found')" 2>/dev/null | grep -q "Superuser exists"
    
    if [ $? -ne 0 ]; then
        # If username is not provided, use a default
        if [ -z "$SUPERUSER_USERNAME" ]; then
            SUPERUSER_USERNAME="admin"
        fi
        
        # If email is not provided, use a default
        if [ -z "$SUPERUSER_EMAIL" ]; then
            SUPERUSER_EMAIL="admin@example.com"
        fi
        
        # If password is not provided, use a default
        if [ -z "$SUPERUSER_PASSWORD" ]; then
            SUPERUSER_PASSWORD="admin123"
            print_warning "Using default superuser password: $SUPERUSER_PASSWORD"
        fi
        
        # Create superuser
        echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('$SUPERUSER_USERNAME', '$SUPERUSER_EMAIL', '$SUPERUSER_PASSWORD')" | python manage.py shell
        if [ $? -ne 0 ]; then
            print_error "Failed to create superuser."
            exit 1
        fi
        print_message "Superuser created successfully."
    else
        print_message "Superuser already exists."
    fi
fi

# Install and configure Nginx if requested
if [ "$INSTALL_NGINX" = true ]; then
    print_message "Checking if Nginx is installed..."
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
fi

# Configure Nginx if requested
if [ "$SETUP_NGINX" = true ]; then
    print_message "Creating Nginx configuration for the Django application..."
    NGINX_CONF="/etc/nginx/sites-available/django_app"
    NGINX_ENABLED="/etc/nginx/sites-enabled/django_app"
    DEFAULT_CONF="/etc/nginx/sites-enabled/default"

    # Remove default Nginx configuration if it exists
    if [ -f "$DEFAULT_CONF" ]; then
        print_message "Removing default Nginx configuration..."
        sudo rm $DEFAULT_CONF
    fi

    # Check if domain name is provided
    if [ -z "$DOMAIN_NAME" ]; then
        print_warning "No domain name provided. Using server IP address for configuration."
        DOMAIN_NAME="143.110.177.153"  # Default to the IP address you provided
    fi

    # Install certbot if not already installed
    print_message "Checking if Certbot is installed..."
    if ! command -v certbot &> /dev/null; then
        print_message "Installing Certbot for SSL certificate..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
        if [ $? -ne 0 ]; then
            print_warning "Failed to install Certbot. Continuing without SSL..."
            USE_SSL=false
        else
            print_message "Certbot installed successfully."
            USE_SSL=true
        fi
    else
        print_message "Certbot is already installed."
        USE_SSL=true
    fi

    # Create the configuration file
    sudo tee $NGINX_CONF > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    # SSL configuration will be added by Certbot

    # Handle preflight requests
    location = /options {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    # Handle OPTIONS requests
    if (\$request_method = 'OPTIONS') {
        return 204;
    }

    location / {
        proxy_pass http://127.0.0.1:$PORT;
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
        
        # CORS headers for static files
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }

    location /media/ {
        alias /var/www/media/;
        
        # CORS headers for media files
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
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

    # Copy static files to Nginx directory
    if [ "$COLLECT_STATIC" = true ]; then
        print_message "Copying static files to Nginx directory..."
        sudo cp -r staticfiles/* /var/www/static/
    fi

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

    # Obtain SSL certificate if Certbot is available
    if [ "$USE_SSL" = true ]; then
        print_message "Obtaining SSL certificate for $DOMAIN_NAME..."
        sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME --redirect
        if [ $? -ne 0 ]; then
            print_warning "Failed to obtain SSL certificate. Your site will still work but without HTTPS."
        else
            print_message "SSL certificate obtained successfully."
        fi
    fi
fi

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

# Start the application with Gunicorn
print_message "Starting the application with Gunicorn on port $PORT..."
gunicorn dsp.wsgi:application --bind 0.0.0.0:$PORT --workers $WORKERS --access-logfile - --error-logfile - --capture-output --log-level info --daemon
echo $! > app.pid
print_message "Application started with PID $(cat app.pid)"

print_message "Deployment completed successfully."
print_message "Your application is now running with Gunicorn on port $PORT."
if [ "$SETUP_NGINX" = true ]; then
    print_message "Nginx is listening on port 80 and forwarding requests to Gunicorn on port $PORT."
    if [ "$USE_SSL" = true ]; then
        print_message "HTTPS is enabled. The application is accessible at https://$DOMAIN_NAME/"
        print_message "All HTTP traffic is automatically redirected to HTTPS."
    else
        print_message "HTTPS is not enabled. The application is accessible at http://$DOMAIN_NAME/"
        print_message "To enable HTTPS, run the script again with a valid domain name: ./deploy.sh --domain=your-domain.com"
    fi
    print_message "CORS headers have been properly configured in Nginx."
else
    print_message "The application is accessible at http://$DOMAIN_NAME:$PORT/"
fi
print_message "If you're experiencing CORS issues, please check your frontend code to ensure it's sending the correct headers." 