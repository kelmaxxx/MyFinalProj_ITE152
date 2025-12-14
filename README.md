# MySQL Database Management System
**ITE 152 - Database Management Project**

## Project Overview
A web-based MySQL Database Management System with backup/restore capabilities and user access control. Built with Flask (Python) backend and vanilla JavaScript frontend.

## Features

### 1. Database Management
- Create and drop databases
- View database structures
- Create and drop tables
- View table structures
- Protected system databases (mysql, information_schema, performance_schema, sys)

### 2. Backup & Restore
- Backup entire databases or individual tables using mysqldump
- Restore from .sql files
- Track backup metadata (timestamp, size, database/table name)
- Delete backup files
- View backup history with recent-first ordering

### 3. User Management
- Create and drop MySQL users
- Grant privileges (SELECT, INSERT, UPDATE, DELETE, CREATE, DROP)
- Revoke privileges
- View current user privileges
- Host-based access control

## Technology Stack

### Backend
- **Framework**: Flask (Python 3.8+)
- **Database**: MySQL 5.7+
- **Libraries**: 
  - `mysql-connector-python` - MySQL database connectivity
  - `flask-cors` - Cross-Origin Resource Sharing
  - `subprocess` - mysqldump/mysql command execution

### Frontend
- **HTML5** - Structure
- **CSS3** - Modern gradient design
- **Vanilla JavaScript** - No frameworks (React/Vue)
- **Design**: 
  - Main Color: #2A46FF
  - Secondary Color: #333984
  - Auxiliary Color: #F4F6FF
  - Typography: Montserrat (Regular, Medium, Bold)

## Project Structure

```
mysql-dbms/
├── app.py                          # Main Flask application
├── config.py                       # Configuration settings
├── models/
│   ├── database_model.py          # Database operations
│   ├── backup_model.py            # Backup/restore operations
│   └── user_model.py              # User management operations
├── controllers/
│   ├── database_controller.py     # Database API endpoints
│   ├── backup_controller.py       # Backup API endpoints
│   └── user_controller.py         # User API endpoints
├── static/
│   ├── index.html                 # Single-page application
│   ├── styles.css                 # Styling and design
│   ├── app.js                     # Core JavaScript functionality
│   └── app-utils.js               # Utility functions
├── backups/                        # Backup files storage
│   └── backup_metadata.json       # Backup metadata tracking
└── README.md                       # Documentation
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- MySQL 5.7 or higher
- pip (Python package manager)

### Step 1: Install Dependencies
```bash
pip install flask flask-cors mysql-connector-python
```

### Step 2: Configure MySQL Connection
Edit `config.py` and update MySQL credentials:
```python
MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'kelma'
MYSQL_PORT = 3306
```

### Step 3: Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5000`

## API Endpoints

### Database Operations
- `GET /api/databases` - Get all databases
- `POST /api/databases` - Create database
- `DELETE /api/databases/<name>` - Drop database
- `GET /api/databases/<name>/tables` - Get tables in database
- `POST /api/databases/<name>/tables` - Create table
- `DELETE /api/databases/<name>/tables/<table>` - Drop table
- `GET /api/databases/<name>/tables/<table>/structure` - Get table structure

### Backup Operations
- `GET /api/backups/metadata` - Get all backup metadata
- `GET /api/backups/stats` - Get backup statistics
- `POST /api/backups` - Create backup
- `POST /api/backups/restore` - Restore from backup
- `DELETE /api/backups/<filename>` - Delete backup

### User Operations
- `GET /api/users` - Get all MySQL users
- `POST /api/users` - Create user
- `DELETE /api/users/<username>` - Drop user
- `GET /api/users/<username>/privileges` - Get user privileges
- `POST /api/users/<username>/privileges/grant` - Grant privileges
- `POST /api/users/<username>/privileges/revoke` - Revoke privileges

## Usage Guide

### Database Management
1. Navigate to "Databases" page
2. View dashboard with total databases, backed up databases, and total restored
3. Create new database using "+ Create Database" button
4. View databases in "Primary Databases" panel
5. Backup, view, or delete databases using action buttons
6. View backup history in "Backup Databases" panel

### Backup & Restore
1. Navigate to "Backup & Restore" page
2. View all backups in a sortable table
3. Backup from databases page or directly
4. Restore backups to original or different database
5. Delete old backups when no longer needed

### User Management
1. Navigate to "User Management" page
2. View all database users
3. Create new users with "+ Create User" button
4. Manage user privileges with "Privileges" button
5. Grant/revoke specific privileges on databases
6. Drop users when no longer needed

## Design Features

### UI Components
- **Sidebar Navigation**: Fixed sidebar with gradient background
- **Dashboard Panels**: Statistics cards with gradient icons
- **Modal Dialogs**: Centered modals for user interactions
- **Toast Notifications**: Success, error, and warning messages
- **Responsive Tables**: Scrollable tables for data display
- **Confirmation Dialogs**: Destructive operation confirmations

### Color Scheme
- Primary: #2A46FF (Blue)
- Secondary: #333984 (Dark Blue)
- Auxiliary: #F4F6FF (Light Blue)
- Success: #10B981 (Green)
- Warning: #F59E0B (Orange)
- Danger: #EF4444 (Red)

## Code Architecture

### Models (Business Logic)
- **DatabaseModel**: Handles database CRUD operations
- **BackupModel**: Manages backup/restore with metadata tracking
- **UserModel**: MySQL user management and privilege control

### Controllers (API Layer)
- **database_controller**: RESTful endpoints for databases
- **backup_controller**: RESTful endpoints for backups
- **user_controller**: RESTful endpoints for users

### Frontend (Presentation Layer)
- **app.js**: Core functionality, navigation, database operations
- **app-utils.js**: Backup, user management, modals, toasts, utilities

## Security Considerations

⚠️ **EDUCATIONAL PROJECT WARNING**: This is an educational project for ITE 152 course. Not recommended for production use without proper security audit.

### Current Limitations
- No authentication/authorization system
- Direct root MySQL access
- No input sanitization beyond basic validation
- SQL injection vulnerable in some areas
- No rate limiting or DOS protection

### Recommendations for Production
1. Implement user authentication and session management
2. Use parameterized queries for all SQL operations
3. Add input validation and sanitization
4. Implement role-based access control (RBAC)
5. Add rate limiting and request throttling
6. Use HTTPS for secure communication
7. Implement audit logging
8. Add database connection pooling
9. Use environment variables for sensitive data
10. Add comprehensive error handling

## File Naming Convention
- Database backups: `<database>_<timestamp>.sql`
- Table backups: `<database>_<table>_<timestamp>.sql`
- Timestamp format: `YYYYMMDD_HHMMSS`

## Backup Metadata Format
```json
[
  {
    "filename": "mydb_20240115_143022.sql",
    "database": "mydb",
    "table": "Full Database",
    "timestamp": "2024-01-15T14:30:22",
    "size": 2048576
  }
]
```

## Troubleshooting

### MySQL Connection Issues
- Verify MySQL service is running
- Check credentials in `config.py`
- Ensure MySQL port (3306) is accessible

### Backup/Restore Errors
- Ensure `mysqldump` and `mysql` commands are in system PATH
- Check write permissions for `backups/` directory
- Verify sufficient disk space

### Permission Errors
- Ensure MySQL user has necessary privileges
- Check file system permissions for backup directory

## Development Team
- **Course**: ITE 152 - Database Management
- **Project Type**: Educational/Academic

## License
This project is developed for educational purposes as part of ITE 152 coursework.

## Future Enhancements
- [ ] Database query interface (SQL editor)
- [ ] Data import/export (CSV, JSON)
- [ ] Visual database schema designer
- [ ] Backup scheduling and automation
- [ ] Multi-user authentication system
- [ ] Activity logging and audit trails
- [ ] Database performance monitoring
- [ ] Replication management
- [ ] Advanced privilege management (column-level)
- [ ] Database migration tools
