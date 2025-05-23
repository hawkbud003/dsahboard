#!/bin/bash

# Wait for database to be ready (if using external database)
# Uncomment and modify if needed
# while ! nc -z $DB_HOST $DB_PORT; do
#   echo "Waiting for database connection..."
#   sleep 2
# done
echo "Setting up database directory..."

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

python manage.py crontab add

# Start Gunicorn
echo "Starting Gunicorn..."
exec "$@" 