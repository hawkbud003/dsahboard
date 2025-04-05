#!/bin/bash

# Get the absolute path to the backend directory
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create a temporary file for the cron job
CRON_TEMP=$(mktemp)

# Add the cron job to the temporary file
# This will run the backup command every day at 2 AM
echo "0 2 * * * cd $BACKEND_DIR && python manage.py backup_db >> /tmp/db_backup.log 2>&1" > $CRON_TEMP

# Install the cron job
crontab $CRON_TEMP

# Clean up
rm $CRON_TEMP

echo "Cron job installed successfully. Database will be backed up daily at 2 AM." 