import os
import boto3
import logging
from django.conf import settings
from pathlib import Path
import time

# Configure logging
logger = logging.getLogger(__name__)

# S3 configuration
S3_BUCKET = settings.AWS_STORAGE_BUCKET_NAME
DB_S3_KEY = 'db/db.sqlite3'
LOCAL_DB_PATH = Path(settings.BASE_DIR) / 'db.sqlite3'

def get_s3_client():
    """Get an S3 client using credentials from settings"""
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )

def upload_db_to_s3():
    """Upload the local SQLite database to S3"""
    try:
        if not os.path.exists(LOCAL_DB_PATH):
            logger.warning(f"Local database file not found at {LOCAL_DB_PATH}")
            return False
        
        s3_client = get_s3_client()
        
        # Upload the file
        s3_client.upload_file(
            str(LOCAL_DB_PATH),
            S3_BUCKET,
            DB_S3_KEY
        )
        
        logger.info(f"Successfully uploaded database to s3://{S3_BUCKET}/{DB_S3_KEY}")
        return True
    except Exception as e:
        logger.error(f"Error uploading database to S3: {str(e)}")
        return False

def download_db_from_s3():
    """Download the SQLite database from S3"""
    try:
        s3_client = get_s3_client()
        
        # Check if the database exists in S3
        try:
            s3_client.head_object(Bucket=S3_BUCKET, Key=DB_S3_KEY)
        except s3_client.exceptions.ClientError:
            logger.warning(f"Database not found in S3 at s3://{S3_BUCKET}/{DB_S3_KEY}")
            return False
        
        # Download the file
        s3_client.download_file(
            S3_BUCKET,
            DB_S3_KEY,
            str(LOCAL_DB_PATH)
        )
        
        logger.info(f"Successfully downloaded database from s3://{S3_BUCKET}/{DB_S3_KEY}")
        return True
    except Exception as e:
        logger.error(f"Error downloading database from S3: {str(e)}")
        return False

def sync_db_with_s3():
    """Sync the local database with S3"""
    try:
        # First, try to download the database from S3
        if download_db_from_s3():
            logger.info("Database synced from S3")
            return True
        else:
            # If no database exists in S3, upload the local one
            if os.path.exists(LOCAL_DB_PATH):
                if upload_db_to_s3():
                    logger.info("Local database uploaded to S3")
                    return True
                else:
                    logger.error("Failed to upload local database to S3")
                    return False
            else:
                logger.warning("No database found locally or in S3")
                return False
    except Exception as e:
        logger.error(f"Error syncing database with S3: {str(e)}")
        return False

def backup_db_to_s3():
    """Create a backup of the database in S3 with timestamp"""
    try:
        if not os.path.exists(LOCAL_DB_PATH):
            logger.warning(f"Local database file not found at {LOCAL_DB_PATH}")
            return False
        
        s3_client = get_s3_client()
        
        # Create a backup key with timestamp
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        backup_key = f'db/backups/db_{timestamp}.sqlite3'
        
        # Upload the file
        s3_client.upload_file(
            str(LOCAL_DB_PATH),
            S3_BUCKET,
            backup_key
        )
        
        logger.info(f"Successfully created database backup at s3://{S3_BUCKET}/{backup_key}")
        return True
    except Exception as e:
        logger.error(f"Error creating database backup in S3: {str(e)}")
        return False 