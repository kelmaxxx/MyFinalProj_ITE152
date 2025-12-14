import os

class Config:
    # MySQL Connection Settings
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'kelma'
    MYSQL_PORT = 3306
    
    # Backup Settings
    BACKUP_DIR = os.path.join(os.path.dirname(__file__), 'backups')
    METADATA_FILE = os.path.join(BACKUP_DIR, 'backup_metadata.json')
    RESTORE_STATS_FILE = os.path.join(BACKUP_DIR, 'restore_stats.json')
    
    # System Databases (protected from deletion)
    SYSTEM_DATABASES = [
        'information_schema',
        'mysql',
        'performance_schema',
        'sys'
    ]
    
    # Flask Settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    JSON_SORT_KEYS = False
