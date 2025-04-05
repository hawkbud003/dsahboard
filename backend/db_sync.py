import os
import django
import logging
from pathlib import Path

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dsp.settings')
django.setup()

from db_s3_manager import sync_db_with_s3, backup_db_to_s3

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """
    Main function to sync the database with S3 during deployment
    """
    logger.info("Starting database sync with S3...")
    
    # Sync the database with S3
    if sync_db_with_s3():
        logger.info("Database synced with S3 successfully")
        
        # Create a backup
        if backup_db_to_s3():
            logger.info("Database backup created successfully")
        else:
            logger.error("Failed to create database backup")
    else:
        logger.error("Failed to sync database with S3")

if __name__ == "__main__":
    main() 