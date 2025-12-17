# User Model - Deep Dive Explanation

## 📄 models/user_model.py - MySQL User Management

### Purpose
Manages MySQL users, their privileges, and access control. This is about **database users** (who can access MySQL), not application users.

---

## 🔧 Core Methods Explained

### 1. `get_all_users()`

#### Purpose
Retrieves list of all MySQL users (excluding system users).

#### Code Breakdown

```python
@staticmethod
def get_all_users():
    connection = None
    try:
        connection = DatabaseModel.get_connection('mysql')
```
- Connects to **'mysql' database**: MySQL's internal database where user info is stored
- All user accounts are stored in `mysql.user` table

```python
cursor = connection.cursor()
cursor.execute("SELECT User, Host FROM user WHERE User != '' AND User NOT IN ('mysql.sys', 'mysql.session', 'mysql.infoschema')")
```
- **Selects from user table**: Gets username and host
- **Filters**:
  - `User != ''`: Excludes anonymous users
  - `NOT IN (...)`: Excludes MySQL system users
- **Host**: Where user can connect from (localhost, %, specific IP)

```python
users = [{'username': row[0], 'host': row[1]} for row in cursor.fetchall()]
return users
```
- **List comprehension**: Converts tuples to dictionaries
- Example result: `[{'username': 'root', 'host': 'localhost'}, {'username': 'webuser', 'host': '%'}]`

---

### 2. `create_user(username, password, host='localhost')`

#### Purpose
Creates a new MySQL user account.

#### Code Breakdown

```python
@staticmethod
def create_user(username, password, host='localhost'):
```
- **host parameter**: Default is 'localhost' (local access only)
- **host='%'** means: Can connect from anywhere

```python
connection = None
try:
    connection = DatabaseModel.get_connection()
    cursor = connection.cursor()
    cursor.execute(f"CREATE USER '{username}'@'{host}' IDENTIFIED BY '{password}'")
    connection.commit()
    return True
```
- **CREATE USER SQL command**: MySQL's user creation syntax
- **Username@Host format**: MySQL users are identified by username AND host
  - `'john'@'localhost'` - John from localhost
  - `'john'@'192.168.1.100'` - John from specific IP
  - `'john'@'%'` - John from anywhere
- **IDENTIFIED BY**: Sets password
- **commit()**: Saves the new user

#### Example
```python
create_user('webuser', 'secret123', '%')
# Creates user that can connect from any host
```

---

### 3. `drop_user(username, host='localhost')`

#### Purpose
Deletes a MySQL user account.

#### Code Breakdown

```python
@staticmethod
def drop_user(username, host='localhost'):
    connection = None
    try:
        connection = DatabaseModel.get_connection()
        cursor = connection.cursor()
        cursor.execute(f"DROP USER '{username}'@'{host}'")
        connection.commit()
        return True
```
- **DROP USER**: MySQL command to delete user
- Must specify both username and host
- User loses all privileges and access

---

### 4. `get_user_privileges(username, host='localhost')`

#### Purpose
Shows what permissions a user has.

#### Code Breakdown

```python
@staticmethod
def get_user_privileges(username, host='localhost'):
    connection = None
    try:
        connection = DatabaseModel.get_connection()
        cursor = connection.cursor()
        cursor.execute(f"SHOW GRANTS FOR '{username}'@'{host}'")
        grants = [row[0] for row in cursor.fetchall()]
        return grants
```
- **SHOW GRANTS**: MySQL command that lists user privileges
- Returns list of GRANT statements
- Example output:
```
[
  "GRANT USAGE ON *.* TO 'webuser'@'localhost'",
  "GRANT SELECT, INSERT ON `mydb`.* TO 'webuser'@'localhost'"
]
```

#### Understanding Grant Output
- `USAGE`: Default privilege (can login, no table access)
- `*.*`: All databases and tables
- `mydb.*`: All tables in mydb database
- `SELECT, INSERT`: Specific operations allowed

---

### 5. `grant_privileges(username, host, database, privileges)`

#### Purpose
Gives user permissions on a database.

#### Code Breakdown

```python
@staticmethod
def grant_privileges(username, host, database, privileges):
    connection = None
    try:
        connection = DatabaseModel.get_connection()
        cursor = connection.cursor()
```
- Opens connection to MySQL

```python
priv_str = ', '.join(privileges)
```
- **Joins privilege list**: `['SELECT', 'INSERT']` → `'SELECT, INSERT'`
- Creates comma-separated string for SQL

```python
query = f"GRANT {priv_str} ON `{database}`.* TO '{username}'@'{host}'"
```
- **GRANT syntax**: `GRANT privileges ON database.* TO user@host`
- `database.*`: All tables in specified database
- Example: `GRANT SELECT, INSERT ON mydb.* TO 'webuser'@'localhost'`

```python
cursor.execute(query)
cursor.execute("FLUSH PRIVILEGES")
connection.commit()
return True
```
- **FLUSH PRIVILEGES**: Reloads privilege tables
- Ensures changes take effect immediately
- Without FLUSH, changes might not apply until MySQL restart

#### Example Usage
```python
grant_privileges('webuser', 'localhost', 'mydb', ['SELECT', 'INSERT', 'UPDATE'])
# Allows webuser to read and modify data in mydb database
```

---

### 6. `revoke_privileges(username, host, database, privileges)`

#### Purpose
Removes user permissions from a database.

#### Code Breakdown

```python
@staticmethod
def revoke_privileges(username, host, database, privileges):
    connection = None
    try:
        connection = DatabaseModel.get_connection()
        cursor = connection.cursor()
        
        priv_str = ', '.join(privileges)
        query = f"REVOKE {priv_str} ON `{database}`.* FROM '{username}'@'{host}'"
```
- **REVOKE syntax**: Opposite of GRANT
- Removes specified privileges from user
- Example: `REVOKE DELETE ON mydb.* FROM 'webuser'@'localhost'`

```python
cursor.execute(query)
cursor.execute("FLUSH PRIVILEGES")
connection.commit()
return True
```
- Similar to grant: Executes REVOKE, flushes privileges, commits

---

## 🔑 MySQL Privilege Types Explained

### Common Privileges
| Privilege | What It Allows |
|-----------|----------------|
| **SELECT** | Read data (SELECT queries) |
| **INSERT** | Add new data (INSERT queries) |
| **UPDATE** | Modify existing data (UPDATE queries) |
| **DELETE** | Remove data (DELETE queries) |
| **CREATE** | Create databases and tables |
| **DROP** | Delete databases and tables |
| **ALTER** | Modify table structure |
| **INDEX** | Create/drop indexes |
| **ALL** | All privileges (full access) |
| **USAGE** | No privileges (only login) |

### Privilege Scope
```
GRANT SELECT ON *.* TO 'user'@'host'        → All databases
GRANT SELECT ON mydb.* TO 'user'@'host'     → All tables in mydb
GRANT SELECT ON mydb.users TO 'user'@'host' → Only users table
```

---

## 🎯 Understanding User@Host Concept

### Why Username AND Host?
MySQL identifies users by **both** username and host. Same username from different hosts = different users.

### Examples
```sql
'admin'@'localhost'      → Admin from local machine
'admin'@'192.168.1.5'    → Admin from specific IP
'admin'@'%.company.com'  → Admin from any company.com subdomain
'admin'@'%'              → Admin from anywhere (least secure)
```

### Security Implications
- **'root'@'localhost'**: Root can only login locally (secure)
- **'root'@'%'**: Root can login from anywhere (DANGEROUS!)
- Best practice: Restrict by host for security

---

## 🔒 Security Considerations

### 1. **SQL Injection Risk**
```python
cursor.execute(f"CREATE USER '{username}'@'{host}' IDENTIFIED BY '{password}'")
```
- **Current code uses f-strings**: Vulnerable to SQL injection
- **Better approach**: Use parameterized queries (not all MySQL commands support this)
- **Mitigation**: Validate input before using

### 2. **Password Handling**
```python
IDENTIFIED BY '{password}'
```
- Password sent in plain text to MySQL
- MySQL handles encryption internally
- Should validate password strength in application

### 3. **Principle of Least Privilege**
- Don't grant ALL privileges unless necessary
- Grant only what user needs for their job
- Example: Web app user only needs SELECT, INSERT, UPDATE (not DROP)

---

## 🎯 Real-World Usage Examples

### Scenario 1: Create Web Application User
```python
# Create user that can only read/write data
UserModel.create_user('webapp', 'secure_pass', 'localhost')
UserModel.grant_privileges('webapp', 'localhost', 'myapp_db', 
                          ['SELECT', 'INSERT', 'UPDATE', 'DELETE'])
```
- User can't create/drop tables (safer)
- Can only access from localhost
- Can only work with data in myapp_db

### Scenario 2: Create Read-Only Report User
```python
# Create user for reporting/analytics
UserModel.create_user('reports', 'pass123', '%')
UserModel.grant_privileges('reports', '%', 'myapp_db', ['SELECT'])
```
- Can connect from anywhere
- Can only read data (SELECT)
- Can't modify anything

### Scenario 3: Create Admin User
```python
# Create database administrator
UserModel.create_user('dbadmin', 'strong_pass', 'localhost')
UserModel.grant_privileges('dbadmin', 'localhost', '*', ['ALL'])
```
- Full privileges on all databases
- Can only connect from localhost (secure)
- Can create, drop, modify anything

---

## 🔄 Flow Example: Creating User with Privileges

### Step-by-Step Process
```
1. User fills form: Username=john, Password=pass123, Host=localhost
2. Frontend → POST /api/users {username: 'john', password: 'pass123', host: 'localhost'}
3. user_controller.py receives request
4. Calls UserModel.create_user('john', 'pass123', 'localhost')
5. Executes: CREATE USER 'john'@'localhost' IDENTIFIED BY 'pass123'
6. User created in MySQL
7. Returns success to frontend
8. Frontend shows success toast

Then to grant privileges:
9. User selects john, clicks "Grant Privileges"
10. Selects database: mydb, privileges: SELECT, INSERT
11. Frontend → POST /api/users/john/privileges/grant 
    {host: 'localhost', database: 'mydb', privileges: ['SELECT', 'INSERT']}
12. Calls UserModel.grant_privileges('john', 'localhost', 'mydb', ['SELECT', 'INSERT'])
13. Executes: GRANT SELECT, INSERT ON `mydb`.* TO 'john'@'localhost'
14. Executes: FLUSH PRIVILEGES
15. Returns success
16. User john can now read/insert data in mydb
```

---

## ❓ Common Questions for Defense

### Q: Why do we connect to 'mysql' database for get_all_users()?
**A:** Because MySQL stores all user account information in the `mysql.user` table. It's MySQL's internal database for system information.

### Q: What's the difference between DROP USER and REVOKE?
**A:** 
- **DROP USER**: Deletes the entire user account (can't login anymore)
- **REVOKE**: Removes specific privileges (user still exists, just has less access)

### Q: Why FLUSH PRIVILEGES after GRANT/REVOKE?
**A:** MySQL caches privilege information in memory. FLUSH PRIVILEGES tells MySQL to reload the privileges from the database, so changes take effect immediately.

### Q: Can we have same username with different hosts?
**A:** Yes! `'john'@'localhost'` and `'john'@'%'` are two different users in MySQL. Each can have different passwords and privileges.

### Q: What does host='%' mean?
**A:** The wildcard `%` means "any host". User can connect from any IP address. Less secure but more flexible.

### Q: How would you improve security?
**A:**
1. Use parameterized queries to prevent SQL injection
2. Validate username/password format before using
3. Hash passwords in application (though MySQL also hashes them)
4. Log all user creation/privilege changes
5. Implement password strength requirements
6. Restrict host to specific IPs instead of '%'
