#!/usr/bin/env python
import os
import django
import json
from django.core.management import call_command

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dsp.settings')
django.setup()

# Create a superuser
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

# Check if superuser already exists
if not User.objects.filter(username='admin').exists():
    User.objects.create(
        username='admin',
        email='admin@example.com',
        password=make_password('admin123'),
        is_staff=True,
        is_superuser=True
    )
    print("Superuser created successfully")
else:
    print("Superuser already exists")

# Export data to JSON
print("Exporting data to JSON...")
with open('initial_data.json', 'w') as f:
    # Export users
    call_command('dumpdata', 'auth.user', '--indent=2', stdout=f)
    
    # Export other models if needed
    # call_command('dumpdata', 'api.YourModel', '--indent=2', stdout=f)

print("Initial data generated successfully") 