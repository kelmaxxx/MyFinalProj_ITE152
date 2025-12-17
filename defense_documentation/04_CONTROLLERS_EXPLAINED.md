# Controllers - API Layer Explanation

## 📄 What Are Controllers?

**Controllers** are the **API layer** that sits between the frontend and the models. They:
1. Receive HTTP requests from frontend
2. Validate request data
3. Call model methods to do the work
4. Return JSON responses to frontend

Think of them as **traffic directors** that route requests to the right place.

---

## 🔷 Blueprint Pattern Explained

### What is a Blueprint?
A **Blueprint** is Flask's way to organize routes into modules.

### Without Blueprints (Messy)
```python
# Everything in one file - hard to maintain
@app.route('/api/databases')
def get_databases():
    ...

@app.route('/api/backups')
def get_backups():
    ...

@app.route('/api/users')
def get_users():
    ...
```

### With Blueprints (Clean)
```python
# Separate files, organized by feature
# controllers/database_controller.py
database_bp = Blueprint('database', __name__)

@database_bp.route('')
def get_databases():
    ...

# controllers/backup_controller.py
backup_bp = Blueprint('backup', __name__)

@backup_bp.route('')
def get_backups():
    ...
```

Then register in app.py:
```python
app.register_blueprint(database_bp, url_prefix='/api/databases')
app.register_blueprint(backup_bp, url_prefix='/api/backups')
```

---

## 📄 controllers/database_controller.py

### Blueprint Setup
```python
from flask import Blueprint, jsonify, request
from models.database_model import DatabaseModel

database_bp = Blueprint('database', __name__)
```
- **Blueprint('database', __name__)**: Creates reusable module
- Name 'database' is internal identifier
- Import DatabaseModel to access data operations

---

### Route 1: Get All Databases
```python
@database_bp.route('', methods=['GET'])
def get_databases():
    """Get all databases"""
    try:
        databases = DatabaseModel.get_all_databases()
        return jsonify({'success': True, 'databases': databases})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Understanding the Route:**
- `@database_bp.route('')`: Empty route because blueprint has prefix
- Full URL becomes: `/api/databases` (prefix + route)
- `methods=['GET']`: Only accepts GET requests

**What It Does:**
1. Calls model to get databases
2. Returns JSON: `{"success": true, "databases": ["db1", "db2"]}`
3. If error: Returns JSON with error message and HTTP 500 status

**HTTP Status Codes:**
- `200 OK`: Success (default, not specified)
- `500 Internal Server Error`: Something went wrong

---

### Route 2: Create Database
```python
@database_bp.route('', methods=['POST'])
def create_database():
    """Create a new database"""
    try:
        data = request.get_json()
        database_name = data.get('name')
        
        if not database_name:
            return jsonify({'success': False, 'error': 'Database name is required'}), 400
        
        DatabaseModel.create_database(database_name)
        return jsonify({'success': True, 'message': f'Database {database_name} created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Understanding POST Requests:**
- Same URL as GET (`/api/databases`) but different method
- `request.get_json()`: Parses JSON body from request
- Example request body: `{"name": "mydb"}`

**Validation:**
```python
if not database_name:
    return jsonify({'success': False, 'error': 'Database name is required'}), 400
```
- Checks if name was provided
- Returns `400 Bad Request`: Client sent invalid data

**Success Response:**
```json
{
  "success": true,
  "message": "Database mydb created successfully"
}
```

---

### Route 3: Delete Database
```python
@database_bp.route('/<database_name>', methods=['DELETE'])
def drop_database(database_name):
    """Drop a database"""
    try:
        DatabaseModel.drop_database(database_name)
        return jsonify({'success': True, 'message': f'Database {database_name} dropped successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Understanding URL Parameters:**
- `/<database_name>`: Variable in URL
- URL: `/api/databases/mydb` → `database_name = "mydb"`
- Parameter automatically passed to function

**DELETE Method:**
- RESTful convention for deletion
- No request body needed
- Database name comes from URL

---

### Route 4: Get Tables in Database
```python
@database_bp.route('/<database_name>/tables', methods=['GET'])
def get_tables(database_name):
    """Get all tables in a database"""
    try:
        tables = DatabaseModel.get_tables(database_name)
        return jsonify({'success': True, 'tables': tables})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**URL Structure:**
- Route: `/<database_name>/tables`
- Full URL: `/api/databases/mydb/tables`
- Nested resource pattern: Database → Tables

---

### Route 5: Create Table
```python
@database_bp.route('/<database_name>/tables', methods=['POST'])
def create_table(database_name):
    """Create a new table"""
    try:
        data = request.get_json()
        table_name = data.get('name')
        columns = data.get('columns')
        
        if not table_name or not columns:
            return jsonify({'success': False, 'error': 'Table name and columns are required'}), 400
        
        DatabaseModel.create_table(database_name, table_name, columns)
        return jsonify({'success': True, 'message': f'Table {table_name} created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Request Body Example:**
```json
{
  "name": "users",
  "columns": [
    {"name": "id", "type": "INT PRIMARY KEY AUTO_INCREMENT"},
    {"name": "username", "type": "VARCHAR(100)"},
    {"name": "email", "type": "VARCHAR(255)"}
  ]
}
```

**Multiple Validations:**
```python
if not table_name or not columns:
```
- Checks both fields are present
- Short-circuit evaluation: If `table_name` is empty, doesn't check `columns`

---

### Route 6: Get Table Structure
```python
@database_bp.route('/<database_name>/tables/<table_name>/structure', methods=['GET'])
def get_table_structure(database_name, table_name):
    """Get table structure"""
    try:
        structure = DatabaseModel.get_table_structure(database_name, table_name)
        return jsonify({'success': True, 'structure': structure})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Multiple URL Parameters:**
- Route: `/<database_name>/tables/<table_name>/structure`
- URL: `/api/databases/mydb/tables/users/structure`
- Both parameters passed to function

---

## 📄 controllers/backup_controller.py

### Route 1: Get Backup Metadata
```python
@backup_bp.route('/metadata', methods=['GET'])
def get_metadata():
    """Get all backup metadata"""
    try:
        metadata = BackupModel.get_metadata()
        return jsonify({'success': True, 'backups': metadata})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**URL:** `/api/backups/metadata`
- Returns list of all backups with their info

---

### Route 2: Get Backup Statistics
```python
@backup_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get backup statistics"""
    try:
        stats = BackupModel.get_backup_stats()
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**URL:** `/api/backups/stats`
- Returns aggregated statistics (total databases, backups, etc.)

---

### Route 3: Create Backup
```python
@backup_bp.route('', methods=['POST'])
def create_backup():
    """Create a new backup"""
    try:
        data = request.get_json()
        database = data.get('database')
        table = data.get('table')
        
        if not database:
            return jsonify({'success': False, 'error': 'Database name is required'}), 400
        
        result = BackupModel.backup_database(database, table)
        return jsonify({
            'success': True, 
            'message': 'Backup created successfully',
            'backup': result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Request Body Examples:**

Full database backup:
```json
{
  "database": "mydb"
}
```

Single table backup:
```json
{
  "database": "mydb",
  "table": "users"
}
```

**Optional Parameters:**
- `table` is optional (can be omitted for full backup)
- `data.get('table')` returns `None` if not present

---

### Route 4: Restore Backup
```python
@backup_bp.route('/restore', methods=['POST'])
def restore_backup():
    """Restore from backup"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        target_database = data.get('target_database')
        
        if not filename:
            return jsonify({'success': False, 'error': 'Filename is required'}), 400
        
        BackupModel.restore_backup(filename, target_database)
        return jsonify({
            'success': True, 
            'message': 'Database restored successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Request Body:**
```json
{
  "filename": "mydb_20240115_143052.sql",
  "target_database": "mydb_restored"  // Optional
}
```

---

### Route 5: Delete Backup
```python
@backup_bp.route('/<filename>', methods=['DELETE'])
def delete_backup(filename):
    """Delete a backup file"""
    try:
        BackupModel.delete_backup(filename)
        return jsonify({
            'success': True, 
            'message': 'Backup deleted successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**URL:** `/api/backups/mydb_20240115.sql`
- Filename in URL (DELETE method)

---

## 📄 controllers/user_controller.py

### Route 1: Get All Users
```python
@user_bp.route('', methods=['GET'])
def get_users():
    """Get all MySQL users"""
    try:
        users = UserModel.get_all_users()
        return jsonify({'success': True, 'users': users})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

---

### Route 2: Create User
```python
@user_bp.route('', methods=['POST'])
def create_user():
    """Create a new MySQL user"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        host = data.get('host', 'localhost')
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password are required'}), 400
        
        UserModel.create_user(username, password, host)
        return jsonify({
            'success': True, 
            'message': f'User {username}@{host} created successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Default Value:**
```python
host = data.get('host', 'localhost')
```
- If `host` not in request, defaults to `'localhost'`
- `.get(key, default)` method

---

### Route 3: Delete User
```python
@user_bp.route('/<username>', methods=['DELETE'])
def drop_user(username):
    """Drop a MySQL user"""
    try:
        host = request.args.get('host', 'localhost')
        UserModel.drop_user(username, host)
        return jsonify({
            'success': True, 
            'message': f'User {username}@{host} dropped successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**Query Parameters:**
```python
host = request.args.get('host', 'localhost')
```
- **request.args**: URL query parameters
- URL: `/api/users/john?host=localhost`
- `?host=localhost` is query parameter

**Difference:**
- `request.get_json()`: POST body data
- `request.args`: URL query parameters

---

### Route 4: Grant Privileges
```python
@user_bp.route('/<username>/privileges/grant', methods=['POST'])
def grant_privileges(username):
    """Grant privileges to user"""
    try:
        data = request.get_json()
        host = data.get('host', 'localhost')
        database = data.get('database')
        privileges = data.get('privileges')
        
        if not database or not privileges:
            return jsonify({'success': False, 'error': 'Database and privileges are required'}), 400
        
        UserModel.grant_privileges(username, host, database, privileges)
        return jsonify({
            'success': True, 
            'message': 'Privileges granted successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

**URL:** `/api/users/john/privileges/grant`

**Request Body:**
```json
{
  "host": "localhost",
  "database": "mydb",
  "privileges": ["SELECT", "INSERT", "UPDATE"]
}
```

---

## 🔑 Key Concepts

### 1. **RESTful API Design**
```
GET    /api/databases           → List all
POST   /api/databases           → Create new
DELETE /api/databases/:name     → Delete one
GET    /api/databases/:name/tables → Get nested resource
```

**REST Principles:**
- Use HTTP methods correctly (GET, POST, DELETE)
- URLs represent resources
- Consistent URL structure
- JSON for data exchange

---

### 2. **Error Handling Pattern**
```python
try:
    # Do something
    return jsonify({'success': True, 'data': result})
except Exception as e:
    return jsonify({'success': False, 'error': str(e)}), 500
```

**Why This Pattern?**
- Catches all errors
- Returns consistent JSON format
- Includes error message for debugging
- HTTP 500 indicates server error

---

### 3. **HTTP Status Codes**
| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Success (default) |
| 400 | Bad Request | Client sent invalid data |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error |

---

### 4. **Request Methods**
```python
# GET - Retrieve data
@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)

# POST - Create new resource
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    # Create user
    return jsonify({'success': True})

# DELETE - Remove resource
@app.route('/api/users/<id>', methods=['DELETE'])
def delete_user(id):
    # Delete user
    return jsonify({'success': True})
```

---

### 5. **JSON Response Structure**
```python
# Success
{
  "success": true,
  "data": {...}
}

# Error
{
  "success": false,
  "error": "Error message here"
}
```

**Consistent structure** makes frontend easier to handle responses.

---

## 🎯 Flow Example: Creating a Database

### Request
```
POST /api/databases
Content-Type: application/json

{
  "name": "mydb"
}
```

### Controller Processing
```python
1. @database_bp.route('', methods=['POST']) ← Route matched
2. data = request.get_json() ← Parse JSON body
3. database_name = data.get('name') ← Extract 'name' field
4. Validate: if not database_name... ← Check required field
5. DatabaseModel.create_database(database_name) ← Call model
6. return jsonify({'success': True, ...}) ← Send response
```

### Response
```json
{
  "success": true,
  "message": "Database mydb created successfully"
}
```

---

## ❓ Defense Questions

### Q: What is a Blueprint and why use it?
**A:** A Blueprint is a way to organize Flask routes into modules. We use it to keep related routes together (databases, backups, users) and make the code more maintainable.

### Q: What's the difference between request.get_json() and request.args?
**A:** 
- `request.get_json()`: Gets data from POST body (JSON format)
- `request.args`: Gets URL query parameters (?key=value)

### Q: Why return HTTP status codes?
**A:** Status codes tell the client what happened:
- 200: Success
- 400: Client error (bad input)
- 500: Server error (something went wrong)

### Q: Why wrap everything in try-except?
**A:** To catch any errors and return a proper JSON error response instead of crashing. Makes the API more reliable and easier to debug.

### Q: What's RESTful API design?
**A:** Using HTTP methods (GET, POST, DELETE) correctly and organizing URLs to represent resources. Makes API predictable and easy to use.

### Q: Why validate input in controllers?
**A:** To catch bad data early before passing to models. Prevents errors and provides clear error messages to users.
