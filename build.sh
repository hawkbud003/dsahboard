#!/bin/bash

# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Return to the root directory
cd .. 