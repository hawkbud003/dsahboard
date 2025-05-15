import os
import boto3
from datetime import datetime
from django.conf import settings
import shutil

def backup_database_to_s3():
    """
    Creates a backup of the SQLite database and uploads it to S3
    """
    try:
        # Get the database file path
        db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
        
        # Create a backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'db_backup_{timestamp}.sqlite3'
        backup_path = os.path.join(settings.BASE_DIR, backup_filename)
        
        # Create a copy of the database file
        shutil.copy2(db_path, backup_path)
        
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # Upload to S3
        s3_client.upload_file(
            backup_path,
            settings.AWS_STORAGE_BUCKET_NAME,
            f'database_backups/{backup_filename}'
        )
        
        # Remove the local backup file
        os.remove(backup_path)
        
        return True, f"Successfully backed up database to S3 as {backup_filename}"
        
    except Exception as e:
        return False, f"Error backing up database: {str(e)}" 