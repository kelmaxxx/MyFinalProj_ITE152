import subprocess
import os
import json
from datetime import datetime
from config import Config
from models.database_model import DatabaseModel

class BackupModel:
    
    @staticmethod
    def get_metadata():
        """Load backup metadata from JSON file"""
        if os.path.exists(Config.METADATA_FILE):
            with open(Config.METADATA_FILE, 'r') as f:
                return json.load(f)
        return []
    
    @staticmethod
    def save_metadata(metadata):
        """Save backup metadata to JSON file"""
        with open(Config.METADATA_FILE, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    @staticmethod
    def add_backup_entry(database, table, filename, size):
        """Add a new backup entry to metadata"""
        metadata = BackupModel.get_metadata()
        entry = {
            'filename': filename,
            'database': database,
            'table': table if table else 'Full Database',
            'timestamp': datetime.now().isoformat(),
            'size': size
        }
        metadata.insert(0, entry)  # Add to beginning for recent first
        BackupModel.save_metadata(metadata)
        return entry
    
    @staticmethod
    def remove_backup_entry(filename):
        """Remove backup entry from metadata"""
        metadata = BackupModel.get_metadata()
        metadata = [m for m in metadata if m['filename'] != filename]
        BackupModel.save_metadata(metadata)
    
    @staticmethod
    def backup_database(database_name, table_name=None):
        """Backup database or specific table using mysqldump"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        if table_name:
            filename = f"{database_name}_{table_name}_{timestamp}.sql"
        else:
            filename = f"{database_name}_{timestamp}.sql"
        
        filepath = os.path.join(Config.BACKUP_DIR, filename)
        
        # Build mysqldump command
        cmd = [
            'mysqldump',
            f'--host={Config.MYSQL_HOST}',
            f'--user={Config.MYSQL_USER}',
            f'--password={Config.MYSQL_PASSWORD}',
            database_name
        ]
        
        if table_name:
            cmd.append(table_name)
        
        try:
            with open(filepath, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, 
                                       text=True, check=True)
            
            file_size = os.path.getsize(filepath)
            BackupModel.add_backup_entry(database_name, table_name, filename, file_size)
            
            return {
                'filename': filename,
                'size': file_size,
                'path': filepath
            }
        except subprocess.CalledProcessError as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            raise Exception(f"Backup failed: {e.stderr}")
    
    @staticmethod
    def _load_restore_count():
        """Load restore count from stats file"""
        try:
            if os.path.exists(Config.RESTORE_STATS_FILE):
                with open(Config.RESTORE_STATS_FILE, 'r') as f:
                    data = json.load(f)
                    return int(data.get('total_restored', 0))
        except Exception:
            pass
        return 0

    @staticmethod
    def _save_restore_count(count):
        """Persist restore count to stats file"""
        try:
            with open(Config.RESTORE_STATS_FILE, 'w') as f:
                json.dump({'total_restored': int(count)}, f, indent=2)
        except Exception:
            pass

    @staticmethod
    def restore_backup(filename, target_database=None):
        """Restore database from backup file"""
        filepath = os.path.join(Config.BACKUP_DIR, filename)
        
        if not os.path.exists(filepath):
            raise Exception("Backup file not found")
        
        # Extract database name from filename if not provided
        if not target_database:
            target_database = filename.split('_')[0]
        
        cmd = [
            'mysql',
            f'--host={Config.MYSQL_HOST}',
            f'--user={Config.MYSQL_USER}',
            # Do not pass password via CLI, use env to avoid warnings and exposure
            target_database
        ]

        # Ensure target database exists (create if missing)
        try:
            # Will raise if cannot connect or cannot create
            DatabaseModel.create_database(target_database)
        except Exception:
            # Ignore if it already exists or creation fails due to existence
            pass
        
        env = os.environ.copy()
        # Use MYSQL_PWD to avoid CLI warning and leaking credentials
        env['MYSQL_PWD'] = str(Config.MYSQL_PASSWORD)
        
        try:
            with open(filepath, 'r') as f:
                result = subprocess.run(
                    cmd,
                    stdin=f,
                    stderr=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    text=True,
                    check=True,
                    env=env
                )
            # Increment persistent restore count
            try:
                count = BackupModel._load_restore_count()
                BackupModel._save_restore_count(count + 1)
            except Exception:
                # Non-fatal if stats update fails
                pass
            return True
        except subprocess.CalledProcessError as e:
            raise Exception(f"Restore failed: {e.stderr or e.stdout}")
    
    @staticmethod
    def delete_backup(filename):
        """Delete backup file and metadata"""
        filepath = os.path.join(Config.BACKUP_DIR, filename)
        
        if os.path.exists(filepath):
            os.remove(filepath)
        
        BackupModel.remove_backup_entry(filename)
        return True
    
    @staticmethod
    def get_backup_stats():
        """Get backup statistics"""
        metadata = BackupModel.get_metadata()
        
        databases_backed_up = set()
        
        for entry in metadata:
            databases_backed_up.add(entry['database'])
        
        # Load persistent restore count
        total_restored = BackupModel._load_restore_count()

        # Compute total tables across non-system databases using optimized query
        total_tables = 0
        try:
            connection = DatabaseModel.get_connection('information_schema')
            cursor = connection.cursor()
            
            # Single optimized query to count all tables
            system_dbs = "','".join(Config.SYSTEM_DATABASES)
            query = f"""
                SELECT COUNT(*) 
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA NOT IN ('{system_dbs}')
                AND TABLE_TYPE = 'BASE TABLE'
            """
            cursor.execute(query)
            result = cursor.fetchone()
            total_tables = result[0] if result else 0
            
            cursor.close()
            connection.close()
        except Exception as e:
            print(f"Error counting tables: {e}")
            total_tables = 0
        
        return {
            'total_backups': len(metadata),
            'databases_backed_up': len(databases_backed_up),
            'total_restored': total_restored,
            'total_tables': total_tables
        }
