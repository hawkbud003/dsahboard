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
FORCE_VENV_RECREATE=false
SKIP_MIGRATIONS=false
USE_PORT_80=false
RUN_IN_BACKGROUND=false
LOG_FILE="app.log"
PID_FILE="app.pid"

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
        --port80)
            USE_PORT_80=true
            PORT=80
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
        --background)
            RUN_IN_BACKGROUND=true
            shift
            ;;
        --log=*)
            LOG_FILE="${1#*=}"
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

# Check if running on port 80 and if we have sufficient privileges
if [ "$USE_PORT_80" = true ] && [ "$EUID" -ne 0 ]; then
    print_warning "Running on port 80 requires root privileges."
    print_warning "Please run the script with sudo or as an administrator."
    print_warning "Example: sudo ./run.sh --gunicorn --port80"
    read -p "Do you want to continue with port 8000 instead? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_message "Exiting..."
        exit 1
    else
        USE_PORT_80=false
        PORT=8000
    fi
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

# Collect static files
print_message "Collecting static files..."
python manage.py collectstatic --noinput --clear
if [ $? -ne 0 ]; then
    print_warning "Failed to collect static files. Continuing anyway..."
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

# Check if superuser exists
print_message "Checking for superuser..."
python -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser found')" 2>/dev/null || print_warning "Could not check for superuser."

# Function to start the application
start_application() {
    if [ "$USE_GUNICORN" = true ]; then
        print_message "Starting Gunicorn server..."
        print_message "The application will be available at http://127.0.0.1:$PORT/"
        
        # Set up Gunicorn with appropriate options
        GUNICORN_CMD="gunicorn dsp.wsgi:application --bind 0.0.0.0:$PORT --workers $WORKERS"
        
        # Add additional options for production
        if [ "$USE_PORT_80" = true ]; then
            print_message "Running in production mode on port 80"
            GUNICORN_CMD="$GUNICORN_CMD --access-logfile - --error-logfile - --capture-output --log-level info"
        fi
        
        # Run Gunicorn
        if [ "$RUN_IN_BACKGROUND" = true ]; then
            print_message "Running in background mode. Logs will be written to $LOG_FILE"
            print_message "Process ID will be saved to $PID_FILE"
            nohup $GUNICORN_CMD > $LOG_FILE 2>&1 &
            echo $! > $PID_FILE
            print_message "Application started with PID $(cat $PID_FILE)"
        else
            print_message "Press Ctrl+C to stop the server."
            eval $GUNICORN_CMD
        fi
    else
        print_message "Starting Django development server..."
        print_message "The application will be available at http://127.0.0.1:$PORT/"
        
        if [ "$RUN_IN_BACKGROUND" = true ]; then
            print_message "Running in background mode. Logs will be written to $LOG_FILE"
            print_message "Process ID will be saved to $PID_FILE"
            nohup python manage.py runserver 0.0.0.0:$PORT > $LOG_FILE 2>&1 &
            echo $! > $PID_FILE
            print_message "Application started with PID $(cat $PID_FILE)"
        else
            print_message "Press Ctrl+C to stop the server."
            python manage.py runserver 0.0.0.0:$PORT
        fi
    fi
}

# Start the application
start_application 