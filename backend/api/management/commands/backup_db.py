from django.core.management.base import BaseCommand
from db_s3_manager import backup_db_to_s3
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Creates a backup of the SQLite database in S3'

    def handle(self, *args, **options):
        self.stdout.write('Creating database backup in S3...')
        
        if backup_db_to_s3():
            self.stdout.write(self.style.SUCCESS('Database backup created successfully'))
        else:
            self.stdout.write(self.style.ERROR('Failed to create database backup')) 