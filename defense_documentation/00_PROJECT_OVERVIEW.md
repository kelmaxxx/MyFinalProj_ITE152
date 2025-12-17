# MySQL Database Management System - Project Overview

## 🎯 Project Purpose
This is a **web-based MySQL Database Management System (DBMS)** built as an ITE 152 course project. It provides a user-friendly interface to manage MySQL databases, perform backups/restores, and manage database users - all through a modern web application.

## 🏗️ System Architecture

### Architecture Pattern: **MVC (Model-View-Controller)**

```
┌─────────────────┐
│   Frontend      │  (View - HTML/CSS/JavaScript)
│   Static Files  │
└────────┬────────┘
         │
         ↓ HTTP Requests (REST API)
┌─────────────────┐
│   Flask App     │  (Controller - Routes & Business Logic)
│   app.py        │
└────────┬────────┘
         │
         ↓ Function Calls
┌─────────────────┐
│   Controllers   │  (Controllers - API Endpoints)
│   Blueprints    │
└────────┬────────┘
         │
         ↓ Data Operations
┌─────────────────┐
│   Models        │  (Model - Data & Business Logic)
│   Database Ops  │
└────────┬────────┘
         │
         ↓ SQL Queries
┌─────────────────┐
│   MySQL Server  │  (Database)
│   localhost:3306│
└─────────────────┘
```

## 📁 Project Structure

```
project/
├── app.py                      # Main Flask application (Entry point)
├── config.py                   # Configuration settings
├── acli.exe                    # Atlassian CLI tool (external utility)
│
├── controllers/                # API Route Handlers (Blueprints)
│   ├── database_controller.py # Database CRUD operations API
│   ├── backup_controller.py   # Backup/Restore operations API
│   └── user_controller.py     # User management API
│
├── models/                     # Data Layer (Business Logic)
│   ├── database_model.py      # Database operations logic
│   ├── backup_model.py        # Backup/Restore logic
│   └── user_model.py          # User management logic
│
├── static/                     # Frontend (Client-side)
│   ├── index.html             # Main HTML page
│   ├── api.js                 # API client for backend calls
│   ├── app-main.js            # Application initialization & routing
│   ├── database-manager.js    # Database UI logic
│   ├── backup-manager.js      # Backup UI logic
│   ├── user-manager.js        # User management UI logic
│   ├── ui-helpers.js          # Utility functions (modals, toasts)
│   └── css/                   # Styling files
│       ├── variables.css      # CSS variables (colors, fonts)
│       ├── layout.css         # Page layout & grid
│       ├── components.css     # Reusable components
│       ├── tables.css         # Table styling
│       ├── forms.css          # Form styling
│       ├── modals.css         # Modal dialogs
│       ├── toast.css          # Notification styling
│       ├── footer.css         # Footer styling
│       └── responsive.css     # Mobile responsiveness
│
└── backups/                    # Backup Storage
    ├── *.sql                  # SQL backup files
    ├── backup_metadata.json   # Backup metadata
    └── restore_stats.json     # Restore statistics
```

## 🛠️ Technology Stack

### Backend
- **Python 3.x** - Programming language
- **Flask 2.x** - Web framework
- **Flask-CORS** - Cross-Origin Resource Sharing support
- **mysql-connector-python** - MySQL database driver

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (modular CSS with variables)
- **Vanilla JavaScript** - Interactivity (no frameworks)
- **SVG Icons** - Vector graphics for UI

### Database
- **MySQL Server** - Database system
- **mysqldump** - Backup utility (external command)
- **mysql CLI** - Restore utility (external command)

## 🌟 Key Features

### 1. **Database Management**
- View all databases (excluding system databases)
- Create new databases
- Delete databases (with protection for system databases)
- View tables within databases
- Create tables with custom columns
- Delete tables
- View table structures

### 2. **Backup & Restore**
- Full database backup
- Single table backup
- Restore from backup files
- Choose target database for restore
- View backup metadata (filename, size, timestamp)
- Delete old backups
- Automatic backup file naming with timestamps

### 3. **User Management**
- List all MySQL users
- Create new users with host specification
- Delete users
- View user privileges
- Grant privileges (SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, ALL)
- Revoke privileges
- Manage privileges per database

### 4. **Statistics Dashboard**
- Total databases count
- Total backups created
- Total tables across all databases
- Recent backups list
- Real-time statistics updates

## 🔒 Security Features

1. **System Database Protection**: Cannot delete MySQL system databases
2. **Password Handling**: Uses environment variables for MySQL password
3. **SQL Injection Prevention**: Uses parameterized queries where possible
4. **User Confirmation**: Destructive operations require modal confirmation

## 🚀 How to Run

1. **Start MySQL Server** (ensure running on localhost:3306)
2. **Install Dependencies**:
   ```bash
   pip install flask flask-cors mysql-connector-python
   ```
3. **Configure Database Connection** in `config.py`:
   - Set MySQL host, user, password
4. **Run Application**:
   ```bash
   python app.py
   ```
5. **Access Web Interface**: Open browser to `http://localhost:5000`

## 🎨 Design Principles

1. **Modular Architecture**: Separation of concerns (MVC pattern)
2. **RESTful API**: Clean API endpoints following REST conventions
3. **Responsive Design**: Works on desktop and mobile devices
4. **User Experience**: Intuitive UI with visual feedback (toasts, modals)
5. **Code Reusability**: Shared utilities and helper functions
6. **Maintainability**: Clear file organization and naming conventions

## 📊 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/databases` | GET | List all databases |
| `/api/databases` | POST | Create database |
| `/api/databases/<name>` | DELETE | Delete database |
| `/api/databases/<name>/tables` | GET | List tables |
| `/api/databases/<name>/tables` | POST | Create table |
| `/api/backups/metadata` | GET | Get backup list |
| `/api/backups/stats` | GET | Get backup statistics |
| `/api/backups` | POST | Create backup |
| `/api/backups/restore` | POST | Restore backup |
| `/api/users` | GET | List users |
| `/api/users` | POST | Create user |
| `/api/users/<username>` | DELETE | Delete user |
| `/api/users/<username>/privileges/grant` | POST | Grant privileges |

## 🎓 Learning Outcomes

This project demonstrates understanding of:
- Web application development (Full-stack)
- Database management systems
- RESTful API design
- MVC architecture pattern
- Frontend-backend communication
- File system operations
- Process execution (mysqldump/mysql)
- JSON data handling
- User interface design
- Security considerations
