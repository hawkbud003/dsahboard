from django.core.management.base import BaseCommand
from db_s3_manager import sync_db_with_s3, backup_db_to_s3
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Syncs the SQLite database with S3 and optionally creates a backup'

    def add_arguments(self, parser):
        parser.add_argument(
            '--backup',
            action='store_true',
            help='Create a backup of the database in S3',
        )

    def handle(self, *args, **options):
        self.stdout.write('Syncing database with S3...')
        
        # Sync the database with S3
        if sync_db_with_s3():
            self.stdout.write(self.style.SUCCESS('Database synced with S3 successfully'))
        else:
            self.stdout.write(self.style.ERROR('Failed to sync database with S3'))
        
        # Create a backup if requested
        if options['backup']:
            self.stdout.write('Creating database backup...')
            if backup_db_to_s3():
                self.stdout.write(self.style.SUCCESS('Database backup created successfully'))
            else:
                self.stdout.write(self.style.ERROR('Failed to create database backup')) 