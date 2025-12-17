# Backup Model - Deep Dive Explanation

## 📄 models/backup_model.py - Backup & Restore Operations

### Purpose
Manages database backups and restores using MySQL's `mysqldump` and `mysql` command-line tools.

---

## 🔧 Core Methods Explained

### 1. `backup_database(database, table=None)`

#### Purpose
Creates a backup of entire database or single table as an SQL file.

#### Code Breakdown

```python
@staticmethod
def backup_database(database, table=None):
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
```
- **timestamp**: Creates unique filename like `20240115_143052`
- `strftime`: Formats datetime as string
- Format: Year-Month-Day_Hour-Minute-Second

```python
if table:
    filename = f"{database}_{table}_{timestamp}.sql"
else:
    filename = f"{database}_{timestamp}.sql"
```
- **Conditional filename**: Different name for table vs database backup
- Examples:
  - Database: `mydb_20240115_143052.sql`
  - Table: `mydb_users_20240115_143052.sql`

```python
backup_path = os.path.join(Config.BACKUP_DIR, filename)
```
- Full path to backup file
- Example: `backups/mydb_20240115_143052.sql`

```python
cmd = [
    'mysqldump',
    '-h', Config.MYSQL_HOST,
    '-u', Config.MYSQL_USER,
    f'-p{Config.MYSQL_PASSWORD}',
    '--routines',
    '--triggers',
    '--events',
]
```
- **Command array**: Each element is separate argument
- `mysqldump`: MySQL's backup utility (external program)
- `-h`: Host (localhost)
- `-u`: Username (root)
- `-p`: Password (no space after -p!)
- `--routines`: Include stored procedures
- `--triggers`: Include triggers
- `--events`: Include scheduled events

```python
if table:
    cmd.extend([database, table])
else:
    cmd.append(database)
```
- **Conditional arguments**:
  - Full backup: `mysqldump [options] database_name`
  - Table backup: `mysqldump [options] database_name table_name`

```python
with open(backup_path, 'w', encoding='utf-8') as f:
    process = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
```
- **subprocess.run()**: Executes external command (mysqldump)
- `stdout=f`: Redirects output to file
- `stderr=subprocess.PIPE`: Captures error messages
- `text=True`: Handle output as text (not bytes)
- **Context manager (with)**: Automatically closes file

```python
if process.returncode != 0:
    if os.path.exists(backup_path):
        os.remove(backup_path)
    raise Exception(f"Backup failed: {process.stderr}")
```
- **Error handling**:
  - `returncode != 0`: Command failed
  - Deletes incomplete backup file
  - Raises exception with error message

```python
file_size = os.path.getsize(backup_path)
```
- Gets size of backup file in bytes

```python
metadata = {
    'filename': filename,
    'database': database,
    'table': table,
    'timestamp': timestamp,
    'size': file_size,
    'created_at': datetime.now().isoformat()
}
```
- **Metadata dictionary**: Information about backup
- `isoformat()`: Standard date format (2024-01-15T14:30:52.123456)

```python
BackupModel._save_metadata(metadata)
```
- Saves metadata to JSON file for tracking

```python
return metadata
```
- Returns backup information to caller

---

### 2. `restore_backup(filename, target_database=None)`

#### Purpose
Restores database from backup SQL file.

#### Code Breakdown

```python
backup_path = os.path.join(Config.BACKUP_DIR, filename)

if not os.path.exists(backup_path):
    raise Exception(f"Backup file not found: {filename}")
```
- Checks if backup file exists
- Raises error if file missing

```python
metadata = BackupModel.get_metadata()
backup_info = next((b for b in metadata if b['filename'] == filename), None)
```
- Gets backup metadata
- **Generator expression**: Finds matching backup
- `next()`: Gets first match or None
- Equivalent to:
```python
backup_info = None
for b in metadata:
    if b['filename'] == filename:
        backup_info = b
        break
```

```python
source_database = backup_info['database'] if backup_info else None
database_to_restore = target_database or source_database
```
- **Database selection logic**:
  1. Use target_database if specified
  2. Otherwise use original database name
  3. Allows restoring to different database

```python
if not database_to_restore:
    raise Exception("Could not determine target database for restore")
```
- Safety check: Must know which database to restore to

```python
connection = DatabaseModel.get_connection()
cursor = connection.cursor()
cursor.execute("SHOW DATABASES")
existing_databases = [db[0] for db in cursor.fetchall()]
```
- Checks if target database exists

```python
if database_to_restore not in existing_databases:
    cursor.execute(f"CREATE DATABASE `{database_to_restore}`")
    connection.commit()
```
- Creates database if it doesn't exist
- Allows restoring to new database

```python
cmd = [
    'mysql',
    '-h', Config.MYSQL_HOST,
    '-u', Config.MYSQL_USER,
    f'-p{Config.MYSQL_PASSWORD}',
    database_to_restore
]
```
- **mysql CLI**: MySQL's restore utility
- Similar to mysqldump but for importing

```python
with open(backup_path, 'r', encoding='utf-8') as f:
    process = subprocess.run(cmd, stdin=f, stderr=subprocess.PIPE, text=True)
```
- **stdin=f**: Pipes file content as input to mysql command
- Reads SQL file and executes commands

```python
if process.returncode != 0:
    raise Exception(f"Restore failed: {process.stderr}")
```
- Error handling for failed restore

```python
BackupModel._update_restore_stats(filename, database_to_restore)
```
- Tracks restore statistics

---

### 3. `get_metadata()`

#### Purpose
Retrieves list of all backup metadata.

```python
@staticmethod
def get_metadata():
    if not os.path.exists(Config.METADATA_FILE):
        return []
    
    try:
        with open(Config.METADATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []
```
- Reads metadata from JSON file
- Returns empty list if file doesn't exist or is invalid
- **json.load()**: Parses JSON into Python list/dict

---

### 4. `_save_metadata(new_backup)`

#### Purpose
Appends new backup info to metadata file.

```python
@staticmethod
def _save_metadata(new_backup):
    metadata = BackupModel.get_metadata()
    metadata.append(new_backup)
    
    os.makedirs(Config.BACKUP_DIR, exist_ok=True)
    
    with open(Config.METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
```
- **Private method** (underscore prefix): Internal use only
- Gets existing metadata
- Adds new backup to list
- Creates backup directory if needed
- Saves updated metadata
- `indent=2`: Pretty-prints JSON with 2-space indentation

---

### 5. `delete_backup(filename)`

#### Purpose
Deletes backup file and its metadata.

```python
@staticmethod
def delete_backup(filename):
    backup_path = os.path.join(Config.BACKUP_DIR, filename)
    
    if os.path.exists(backup_path):
        os.remove(backup_path)
```
- Deletes physical SQL file
- Checks existence first to avoid error

```python
metadata = BackupModel.get_metadata()
metadata = [b for b in metadata if b['filename'] != filename]
```
- **List comprehension filter**: Removes deleted backup from metadata
- Keeps all backups except the one being deleted

```python
with open(Config.METADATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2)
```
- Saves updated metadata without deleted backup

---

### 6. `get_backup_stats()`

#### Purpose
Calculates statistics about backups and databases.

```python
@staticmethod
def get_backup_stats():
    metadata = BackupModel.get_metadata()
    databases = DatabaseModel.get_all_databases()
```
- Gets backup metadata and database list

```python
total_tables = 0
for db in databases:
    try:
        tables = DatabaseModel.get_tables(db)
        total_tables += len(tables)
    except:
        pass
```
- Counts total tables across all databases
- **try-except**: Ignores errors for inaccessible databases

```python
restore_stats = BackupModel._get_restore_stats()
```
- Gets restore statistics from separate file

```python
return {
    'total_databases': len(databases),
    'total_backups': len(metadata),
    'total_tables': total_tables,
    'recent_backups': metadata[-5:] if metadata else [],
    'restore_stats': restore_stats
}
```
- **Dictionary return**: Multiple statistics
- `metadata[-5:]`: Last 5 backups (Python slice notation)
- Returns comprehensive statistics object

---

### 7. `_update_restore_stats(filename, database)`

#### Purpose
Tracks when backups are restored.

```python
@staticmethod
def _update_restore_stats(filename, database):
    stats = BackupModel._get_restore_stats()
    
    restore_entry = {
        'filename': filename,
        'database': database,
        'restored_at': datetime.now().isoformat()
    }
    
    stats.append(restore_entry)
```
- Creates restore record with timestamp
- Appends to existing stats

```python
with open(Config.RESTORE_STATS_FILE, 'w', encoding='utf-8') as f:
    json.dump(stats, f, indent=2)
```
- Saves updated restore statistics

---

## 🔑 Key Concepts to Understand

### 1. **subprocess.run() Explained**
```python
subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
```
- **Executes external programs** from Python
- `cmd`: List of command and arguments
- `stdout=f`: Where to send output (file or PIPE)
- `stderr=subprocess.PIPE`: Capture errors
- `text=True`: Treat as text (not binary data)

### 2. **Why List for Command?**
```python
cmd = ['mysqldump', '-h', 'localhost', '-u', 'root']
```
- **Safer than string**: Avoids shell injection
- Each element is separate argument
- No need to escape spaces or special characters

### 3. **File Context Managers (with)**
```python
with open(file, 'r') as f:
    data = f.read()
# File automatically closed here
```
- **Automatic cleanup**: Closes file even if error occurs
- Better than manual open/close

### 4. **JSON Serialization**
- **json.dump()**: Python → JSON file
- **json.load()**: JSON file → Python
- Converts between Python objects and JSON format

### 5. **Generator Expressions**
```python
backup_info = next((b for b in metadata if b['filename'] == filename), None)
```
- **Memory efficient**: Doesn't create intermediate list
- Stops at first match
- Returns None if no match found

### 6. **Private Methods (_prefix)**
```python
def _save_metadata(self):
```
- Convention: "Internal use only"
- Not enforced by Python, just naming convention
- Signals: "Don't call this from outside the class"

---

## 🎯 Flow Diagrams

### Backup Flow
```
1. User clicks "Backup Database"
2. Frontend → POST /api/backups {database: "mydb"}
3. backup_controller.py → BackupModel.backup_database()
4. Generate filename with timestamp
5. Execute mysqldump command
6. Save SQL output to file
7. Create metadata entry
8. Save metadata to JSON
9. Return backup info to frontend
10. Frontend shows success message
```

### Restore Flow
```
1. User clicks "Restore"
2. Frontend → POST /api/backups/restore {filename: "mydb_20240115.sql"}
3. backup_controller.py → BackupModel.restore_backup()
4. Check if backup file exists
5. Get metadata to find original database
6. Check if target database exists (create if not)
7. Execute mysql command with SQL file as input
8. Update restore statistics
9. Return success to frontend
10. Frontend shows success message
```
