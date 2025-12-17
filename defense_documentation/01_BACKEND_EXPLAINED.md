# Backend Code Explanation

## 📄 app.py - Main Application Entry Point

### Purpose
This is the **heart of your application** - it initializes Flask, registers all API routes, and starts the web server.

### Code Breakdown

```python
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
```
- **Flask**: The web framework that handles HTTP requests/responses
- **jsonify**: Converts Python dictionaries to JSON format for API responses
- **request**: Accesses incoming HTTP request data (POST body, query params)
- **send_from_directory**: Serves static files (HTML, CSS, JS)
- **CORS**: Allows frontend to call backend from different origins

```python
app = Flask(__name__, static_folder='static', static_url_path='')
app.config.from_object(Config)
CORS(app)
```
- Creates Flask app instance
- `static_folder='static'`: Tells Flask where to find HTML/CSS/JS files
- `static_url_path=''`: Makes static files accessible at root URL
- Loads configuration from `Config` class
- Enables CORS for API access

```python
app.register_blueprint(database_bp, url_prefix='/api/databases')
app.register_blueprint(backup_bp, url_prefix='/api/backups')
app.register_blueprint(user_bp, url_prefix='/api/users')
```
- **Blueprints** are modular route containers
- Each blueprint groups related API endpoints
- `url_prefix` adds a prefix to all routes in that blueprint
- Example: `database_bp` routes become `/api/databases/*`

```python
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')
```
- When you visit `http://localhost:5000/`, this serves the main HTML page

```python
@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'MySQL DBMS API is running'})
```
- Health check endpoint to verify server is running
- Returns JSON response with status

```python
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404
```
- Catches all 404 errors (wrong URLs)
- Returns JSON error instead of HTML error page

```python
if __name__ == '__main__':
    os.makedirs(app.config['BACKUP_DIR'], exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
```
- Creates backup directory if it doesn't exist
- `debug=True`: Enables auto-reload and detailed error messages
- `host='0.0.0.0'`: Allows access from any IP address
- `port=5000`: Server runs on port 5000

---

## 📄 config.py - Configuration Settings

### Purpose
Centralized configuration file - all settings in one place.

### Code Breakdown

```python
class Config:
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'kelma'
    MYSQL_PORT = 3306
```
- **Connection settings** for MySQL database
- Change these to match your MySQL setup

```python
BACKUP_DIR = os.path.join(os.path.dirname(__file__), 'backups')
METADATA_FILE = os.path.join(BACKUP_DIR, 'backup_metadata.json')
RESTORE_STATS_FILE = os.path.join(BACKUP_DIR, 'restore_stats.json')
```
- `os.path.dirname(__file__)`: Gets directory where config.py is located
- `os.path.join()`: Safely combines path components (works on Windows/Linux)
- Creates paths for backup storage and metadata files

```python
SYSTEM_DATABASES = [
    'information_schema',
    'mysql',
    'performance_schema',
    'sys'
]
```
- **Protected databases** that should never be deleted
- These are MySQL's internal databases

```python
SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
```
- Used by Flask for session security
- Tries to get from environment variable first, falls back to default

---

## 📄 models/database_model.py - Database Operations Logic

### Purpose
Handles all database-related operations (CRUD - Create, Read, Update, Delete).

### Key Methods Explained

#### 1. `get_connection(database=None)`
```python
@staticmethod
def get_connection(database=None):
    try:
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            port=Config.MYSQL_PORT,
            database=database
        )
        return connection
    except Error as e:
        raise Exception(f"Database connection failed: {str(e)}")
```
- **@staticmethod**: Method doesn't need class instance to be called
- Creates connection to MySQL server
- `database=None`: Optional parameter - connects to specific database or just server
- Returns connection object for executing queries
- **Error handling**: Catches connection errors and raises meaningful exception

#### 2. `get_all_databases()`
```python
@staticmethod
def get_all_databases():
    connection = None
    try:
        connection = DatabaseModel.get_connection()
        cursor = connection.cursor()
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall() 
                    if db[0] not in Config.SYSTEM_DATABASES]
        return databases
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
```
- Gets list of all databases from MySQL
- `cursor = connection.cursor()`: Creates cursor for executing queries
- `cursor.execute("SHOW DATABASES")`: Runs SQL command
- `cursor.fetchall()`: Gets all results
- **List comprehension**: Filters out system databases
- **finally block**: Always closes connection, even if error occurs

#### 3. `create_database(database_name)`
```python
@staticmethod
def create_database(database_name):
    connection = None
    try:
        connection = DatabaseModel.get_connection()
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE `{database_name}`")
        connection.commit()
        return True
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
```
- Creates new database
- **Backticks** (`) around database name: Allows names with special characters
- `connection.commit()`: Saves changes to database
- Returns `True` on success

#### 4. `drop_database(database_name)`
```python
@staticmethod
def drop_database(database_name):
    if database_name in Config.SYSTEM_DATABASES:
        raise Exception("Cannot drop system database")
    
    connection = None
    try:
        connection = DatabaseModel.get_connection()
        cursor = connection.cursor()
        cursor.execute(f"DROP DATABASE `{database_name}`")
        connection.commit()
        return True
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
```
- Deletes database
- **Security check**: Prevents deletion of system databases
- Raises exception if trying to delete protected database

#### 5. `get_tables(database_name)`
```python
@staticmethod
def get_tables(database_name):
    connection = None
    try:
        connection = DatabaseModel.get_connection(database_name)
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        return tables
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
```
- Gets all tables in specific database
- Connects to specific database, then shows tables
- Returns list of table names

#### 6. `create_table(database_name, table_name, columns)`
```python
@staticmethod
def create_table(database_name, table_name, columns):
    connection = None
    try:
        connection = DatabaseModel.get_connection(database_name)
        cursor = connection.cursor()
        
        column_defs = ', '.join([f"`{col['name']}` {col['type']}" for col in columns])
        query = f"CREATE TABLE `{table_name}` ({column_defs})"
        
        cursor.execute(query)
        connection.commit()
        return True
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
```
- Creates table with specified columns
- **columns**: List of dictionaries like `[{'name': 'id', 'type': 'INT PRIMARY KEY'}, ...]`
- Builds SQL dynamically from column definitions
- Example generated SQL: `CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100))`

#### 7. `get_table_structure(database_name, table_name)`
```python
@staticmethod
def get_table_structure(database_name, table_name):
    connection = None
    try:
        connection = DatabaseModel.get_connection(database_name)
        cursor = connection.cursor()
        cursor.execute(f"DESCRIBE `{table_name}`")
        columns = cursor.fetchall()
        
        structure = []
        for col in columns:
            structure.append({
                'field': col[0],      # Column name
                'type': col[1],       # Data type
                'null': col[2],       # Can be NULL?
                'key': col[3],        # Primary/Foreign key?
                'default': col[4],    # Default value
                'extra': col[5]       # AUTO_INCREMENT, etc.
            })
        return structure
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
```
- Gets detailed structure of table
- `DESCRIBE` returns column information
- Converts tuple results to dictionary for easier frontend use

---

## 🔑 Key Concepts to Remember

### 1. **Why @staticmethod?**
- Methods don't need instance variables
- Can be called without creating class object: `DatabaseModel.get_all_databases()`
- Organizes related functions in a class

### 2. **Why try-finally?**
- Ensures database connections always close
- Prevents connection leaks (running out of connections)
- Even if error occurs, finally block runs

### 3. **Why connection.commit()?**
- Changes (INSERT, UPDATE, DELETE, CREATE, DROP) need commit
- Read operations (SELECT, SHOW) don't need commit
- Ensures changes are saved to database

### 4. **SQL Injection Prevention**
- Using backticks around names
- In production, should use parameterized queries for user input
- Current code is safe because names come from controlled sources

### 5. **List Comprehension**
```python
databases = [db[0] for db in cursor.fetchall() if db[0] not in Config.SYSTEM_DATABASES]
```
- Shorter version of:
```python
databases = []
for db in cursor.fetchall():
    if db[0] not in Config.SYSTEM_DATABASES:
        databases.append(db[0])
```
