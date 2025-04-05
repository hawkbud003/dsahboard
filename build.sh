#!/bin/bash

# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Sync database with S3
echo "Syncing database with S3..."
python db_sync.py

# Create static directory if it doesn't exist
mkdir -p static

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Return to the root directory
cd .. 