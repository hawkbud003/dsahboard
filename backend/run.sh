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
USE_GUNICORN=false
PORT=8000
WORKERS=4

while [[ $# -gt 0 ]]; do
    case $1 in
        --gunicorn)
            USE_GUNICORN=true
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
        *)
            print_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed or not in PATH. Make sure it's installed and running."
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
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

# Create staticfiles directory if it doesn't exist
if [ ! -d "staticfiles" ]; then
    print_message "Creating staticfiles directory..."
    mkdir -p staticfiles
fi

# Collect static files
print_message "Collecting static files..."
python manage.py collectstatic --noinput --clear
if [ $? -ne 0 ]; then
    print_warning "Failed to collect static files. Continuing anyway..."
fi

# Run migrations
print_message "Running database migrations..."
python manage.py migrate
if [ $? -ne 0 ]; then
    print_error "Failed to run migrations. Please check your database settings."
    exit 1
fi

# Check if superuser exists
print_message "Checking for superuser..."
python -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser found')" 2>/dev/null || print_warning "Could not check for superuser."

# Run the application
if [ "$USE_GUNICORN" = true ]; then
    print_message "Starting Gunicorn server..."
    print_message "The application will be available at http://127.0.0.1:$PORT/"
    print_message "Press Ctrl+C to stop the server."
    gunicorn dsp.wsgi:application --bind 0.0.0.0:$PORT --workers $WORKERS
else
    print_message "Starting Django development server..."
    print_message "The application will be available at http://127.0.0.1:$PORT/"
    print_message "Press Ctrl+C to stop the server."
    python manage.py runserver 0.0.0.0:$PORT
fi 