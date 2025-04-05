#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Sync database with S3
echo "Syncing database with S3..."
python db_sync.py

# Create staticfiles directory if it doesn't exist
mkdir -p staticfiles

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Verify static files were collected
echo "Verifying static files..."
ls -la staticfiles/rest_framework/css/

# Initialize in-memory database for Vercel
echo "Initializing in-memory database..."
export VERCEL=1
python manage.py migrate
python manage.py loaddata initial_data.json || echo "No initial data to load" 