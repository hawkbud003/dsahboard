#!/bin/sh
# filepath: /Users/abhishekkumar/campaignManager/backend/entrypoint.sh

# Apply database migrations
python manage.py migrate --noinput




# Then execute the container’s main process (what’s set as CMD in the Dockerfile)
exec "$@"