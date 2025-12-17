# Frontend Code Explanation

## 📄 static/index.html - The User Interface

### Purpose
Single-page application (SPA) that displays all UI elements. Uses **tab-based navigation** to switch between different sections.

---

## HTML Structure Breakdown

### 1. Document Setup
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MySQL DBMS - Database Management System</title>
```
- **DOCTYPE**: Tells browser this is HTML5
- **charset="UTF-8"**: Supports all characters (including special symbols)
- **viewport**: Makes page responsive on mobile devices
- **title**: Browser tab title

### 2. CSS Imports (Order Matters!)
```html
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/tables.css">
<link rel="stylesheet" href="css/forms.css">
<link rel="stylesheet" href="css/modals.css">
<link rel="stylesheet" href="css/toast.css">
<link rel="stylesheet" href="css/footer.css">
<link rel="stylesheet" href="css/responsive.css">
```

**Why This Order?**
1. **variables.css**: Defines CSS variables (colors, fonts) used by others
2. **layout.css**: Page structure and grid
3. **components.css**: Reusable UI elements (buttons, cards)
4. **tables.css**: Table styling
5. **forms.css**: Form styling
6. **modals.css**: Popup dialogs
7. **toast.css**: Notifications
8. **footer.css**: Footer styling
9. **responsive.css**: Mobile overrides (loaded last to take precedence)

---

### 3. Header Section
```html
<header>
    <div class="container">
        <div class="header-content">
            <h1>
                <svg>...</svg>
                MySQL DBMS
            </h1>
            <div class="stats-overview">
                <div class="stat-item">
                    <span class="stat-label">Databases</span>
                    <span class="stat-value" id="total-databases">0</span>
                </div>
                ...
            </div>
        </div>
    </div>
</header>
```

**Key Points:**
- **SVG icons**: Vector graphics (scale without pixelation)
- **Stats overview**: Real-time counters updated by JavaScript
- **IDs**: `id="total-databases"` used by JavaScript to update content

---

### 4. Navigation Tabs
```html
<nav class="tabs">
    <div class="container">
        <button class="tab-button active" data-tab="databases">
            <svg>...</svg>
            Databases
        </button>
        <button class="tab-button" data-tab="backups">
            <svg>...</svg>
            Backups
        </button>
        <button class="tab-button" data-tab="users">
            <svg>...</svg>
            Users
        </button>
    </div>
</nav>
```

**How Tabs Work:**
- **data-tab="databases"**: Custom attribute links button to content section
- **class="active"**: First tab starts active (visible)
- JavaScript handles tab switching (we'll see later)

---

### 5. Main Content Area
```html
<main class="container">
    <!-- Databases Tab -->
    <section id="databases-tab" class="tab-content active">
        <div class="section-header">
            <h2>Database Management</h2>
            <button onclick="showCreateDatabaseModal()" class="btn btn-primary">
                <svg>...</svg>
                Create Database
            </button>
        </div>
        
        <div id="database-list" class="grid">
            <!-- Database cards inserted here by JavaScript -->
        </div>
    </section>
    
    <!-- Backups Tab -->
    <section id="backups-tab" class="tab-content">
        ...
    </section>
    
    <!-- Users Tab -->
    <section id="users-tab" class="tab-content">
        ...
    </section>
</main>
```

**Structure Pattern:**
- Each tab is a `<section>` with unique ID
- **id="databases-tab"**: Matches `data-tab="databases"` from button
- **class="active"**: First tab visible, others hidden by CSS
- Content containers (`database-list`) are empty - filled by JavaScript

---

### 6. Modal Dialogs
```html
<!-- Create Database Modal -->
<div id="create-database-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Create New Database</h3>
            <button class="close-btn" onclick="closeModal('create-database-modal')">×</button>
        </div>
        <div class="modal-body">
            <form onsubmit="createDatabase(event)">
                <div class="form-group">
                    <label for="database-name">Database Name:</label>
                    <input type="text" id="database-name" required>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="closeModal('create-database-modal')" class="btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>
```

**Modal Structure:**
- **Outer div (.modal)**: Full-screen overlay (hidden by default)
- **Inner div (.modal-content)**: The actual dialog box
- **Form**: Collects user input
- **onsubmit**: JavaScript function called when form submitted
- **required**: HTML5 validation (field must be filled)

---

### 7. Toast Notification Container
```html
<div id="toast-container"></div>
```
- Empty container where toast messages appear
- JavaScript creates toast elements and adds them here

---

### 8. JavaScript Imports (Order Matters!)
```html
<script src="api.js"></script>
<script src="ui-helpers.js"></script>
<script src="database-manager.js"></script>
<script src="backup-manager.js"></script>
<script src="user-manager.js"></script>
<script src="app-main.js"></script>
```

**Why This Order?**
1. **api.js**: API functions used by everyone
2. **ui-helpers.js**: Utility functions (modals, toasts) used by everyone
3. **database-manager.js**: Database-specific functions
4. **backup-manager.js**: Backup-specific functions
5. **user-manager.js**: User-specific functions
6. **app-main.js**: Initialization (runs last, uses all others)

---

## 📄 static/api.js - API Client

### Purpose
Centralized API communication layer. All backend calls go through here.

---

### Configuration
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```
- Base URL for all API calls
- Can change for production (e.g., `https://myapp.com/api`)

---

### API Functions Pattern

#### Example: Database API
```javascript
const DatabaseAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/databases`);
        return response.json();
    },
    
    create: async (name) => {
        const response = await fetch(`${API_BASE_URL}/databases`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name})
        });
        return response.json();
    },
    
    delete: async (name) => {
        const response = await fetch(`${API_BASE_URL}/databases/${name}`, {
            method: 'DELETE'
        });
        return response.json();
    },
    
    getTables: async (database) => {
        const response = await fetch(`${API_BASE_URL}/databases/${database}/tables`);
        return response.json();
    },
    
    createTable: async (database, name, columns) => {
        const response = await fetch(`${API_BASE_URL}/databases/${database}/tables`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, columns})
        });
        return response.json();
    },
    
    deleteTable: async (database, table) => {
        const response = await fetch(`${API_BASE_URL}/databases/${database}/tables/${table}`, {
            method: 'DELETE'
        });
        return response.json();
    },
    
    getTableStructure: async (database, table) => {
        const response = await fetch(`${API_BASE_URL}/databases/${database}/tables/${table}/structure`);
        return response.json();
    }
};
```

**Key Concepts:**

#### 1. Object Organization
```javascript
const DatabaseAPI = {
    getAll: async () => {...},
    create: async (name) => {...}
};
```
- Groups related functions together
- Easy to use: `DatabaseAPI.getAll()`

#### 2. Async/Await
```javascript
async () => {
    const response = await fetch(...);
    return response.json();
}
```
- **async**: Function returns a Promise
- **await**: Wait for Promise to complete
- Makes asynchronous code look synchronous

#### 3. Fetch API
```javascript
const response = await fetch(url, options);
```
- Built-in browser API for HTTP requests
- Returns Promise that resolves to Response object

#### 4. GET Request (Simple)
```javascript
const response = await fetch(`${API_BASE_URL}/databases`);
```
- No options needed for GET
- Just provide URL

#### 5. POST Request (With Body)
```javascript
const response = await fetch(`${API_BASE_URL}/databases`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name})
});
```
- **method**: HTTP method
- **headers**: Tell server we're sending JSON
- **body**: Data to send (must be string, use JSON.stringify)

#### 6. DELETE Request
```javascript
const response = await fetch(`${API_BASE_URL}/databases/${name}`, {
    method: 'DELETE'
});
```
- Resource identifier in URL
- No body needed

#### 7. Template Literals
```javascript
`${API_BASE_URL}/databases/${name}`
```
- Backticks (`) allow embedded expressions
- `${variable}` inserts value
- Example: `http://localhost:5000/api/databases/mydb`

---

### BackupAPI
```javascript
const BackupAPI = {
    getMetadata: async () => {
        const response = await fetch(`${API_BASE_URL}/backups/metadata`);
        return response.json();
    },
    
    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/backups/stats`);
        return response.json();
    },
    
    create: async (database, table = null) => {
        const response = await fetch(`${API_BASE_URL}/backups`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({database, table})
        });
        return response.json();
    },
    
    restore: async (filename, targetDatabase = null) => {
        const response = await fetch(`${API_BASE_URL}/backups/restore`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                filename, 
                target_database: targetDatabase
            })
        });
        return response.json();
    },
    
    delete: async (filename) => {
        const response = await fetch(`${API_BASE_URL}/backups/${filename}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};
```

**Optional Parameters:**
```javascript
create: async (database, table = null) => {
```
- `table = null`: Default value if not provided
- Allows: `BackupAPI.create('mydb')` or `BackupAPI.create('mydb', 'users')`

---

### UserAPI
```javascript
const UserAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/users`);
        return response.json();
    },
    
    create: async (username, password, host = 'localhost') => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password, host})
        });
        return response.json();
    },
    
    delete: async (username, host = 'localhost') => {
        const response = await fetch(`${API_BASE_URL}/users/${username}?host=${host}`, {
            method: 'DELETE'
        });
        return response.json();
    },
    
    getPrivileges: async (username, host = 'localhost') => {
        const response = await fetch(`${API_BASE_URL}/users/${username}/privileges?host=${host}`);
        return response.json();
    },
    
    grantPrivileges: async (username, host, database, privileges) => {
        const response = await fetch(`${API_BASE_URL}/users/${username}/privileges/grant`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({host, database, privileges})
        });
        return response.json();
    },
    
    revokePrivileges: async (username, host, database, privileges) => {
        const response = await fetch(`${API_BASE_URL}/users/${username}/privileges/revoke`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({host, database, privileges})
        });
        return response.json();
    }
};
```

**Query Parameters:**
```javascript
`${API_BASE_URL}/users/${username}?host=${host}`
```
- `?host=${host}`: Adds query parameter
- Example: `/api/users/john?host=localhost`

---

## 📄 static/ui-helpers.js - Utility Functions

### Purpose
Reusable UI functions for modals, toasts, and tab switching.

---

### 1. Show Modal
```javascript
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}
```
- **document.getElementById()**: Gets element by ID
- **style.display = 'flex'**: Makes modal visible
- CSS handles the overlay and centering

---

### 2. Close Modal
```javascript
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}
```
- Hides modal
- **querySelector('form')**: Finds first form inside modal
- **form.reset()**: Clears all form fields

---

### 3. Show Toast Notification
```javascript
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
```

**How It Works:**
1. Creates new div element
2. Sets CSS classes for styling
3. Adds icon and message
4. Appends to container
5. Animates in (adds 'show' class)
6. After 3 seconds, animates out and removes

**Type Parameter:**
```javascript
showToast('Success!', 'success');  // Green toast
showToast('Error!', 'error');      // Red toast
showToast('Info', 'info');         // Blue toast
```

---

### 4. Show Confirmation Dialog
```javascript
function showConfirmation(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Confirm Action</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-cancel">Cancel</button>
                <button class="btn btn-danger">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle buttons
    modal.querySelector('.btn-cancel').onclick = () => {
        modal.remove();
    };
    
    modal.querySelector('.btn-danger').onclick = () => {
        modal.remove();
        onConfirm();
    };
}
```

**Usage Example:**
```javascript
showConfirmation('Delete this database?', () => {
    // This code runs if user clicks Confirm
    DatabaseAPI.delete(dbName);
});
```

**Callback Function:**
- `onConfirm`: Function passed as parameter
- Called only if user clicks Confirm
- Allows custom action after confirmation

---

### 5. Tab Switching
```javascript
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Update button states
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}
```

**How It Works:**
1. Remove 'active' class from all tab contents (hides all)
2. Add 'active' class to selected tab (shows one)
3. Remove 'active' class from all buttons
4. Add 'active' class to clicked button

**querySelectorAll:**
```javascript
document.querySelectorAll('.tab-content')
```
- Returns all elements matching selector
- `.forEach()` loops through them

---

### 6. Format File Size
```javascript
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
```

**Examples:**
- `formatFileSize(1024)` → "1 KB"
- `formatFileSize(1048576)` → "1 MB"
- `formatFileSize(2500000)` → "2.38 MB"

**Math Explanation:**
- `Math.log(bytes) / Math.log(k)`: Determines scale (KB, MB, GB)
- `Math.floor()`: Rounds down to get index
- `Math.pow(k, i)`: Calculates divisor
- `Math.round(...* 100) / 100`: Rounds to 2 decimal places

---

### 7. Format Timestamp
```javascript
function formatTimestamp(timestamp) {
    // timestamp format: 20240115_143052
    const year = timestamp.substr(0, 4);
    const month = timestamp.substr(4, 2);
    const day = timestamp.substr(6, 2);
    const hour = timestamp.substr(9, 2);
    const minute = timestamp.substr(11, 2);
    const second = timestamp.substr(13, 2);
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
```

**Transformation:**
- Input: `20240115_143052`
- Output: `2024-01-15 14:30:52`

**substr() Method:**
```javascript
'20240115_143052'.substr(0, 4)  // '2024' (start at 0, take 4 chars)
'20240115_143052'.substr(4, 2)  // '01' (start at 4, take 2 chars)
```

---

## 🔑 Key JavaScript Concepts

### 1. DOM Manipulation
```javascript
// Get element
const element = document.getElementById('my-id');

// Change content
element.textContent = 'New text';
element.innerHTML = '<b>HTML content</b>';

// Change style
element.style.display = 'none';

// Add/remove class
element.classList.add('active');
element.classList.remove('active');

// Create new element
const div = document.createElement('div');
div.className = 'my-class';
document.body.appendChild(div);
```

### 2. Event Handling
```javascript
// Inline (in HTML)
<button onclick="myFunction()">Click</button>

// JavaScript
button.onclick = () => { ... };

// Event listener (preferred)
button.addEventListener('click', () => { ... });
```

### 3. Arrow Functions
```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Arrow function with body
const add = (a, b) => {
    return a + b;
};
```

### 4. Template Literals
```javascript
const name = 'John';
const age = 25;

// Old way
const msg = 'Hello ' + name + ', you are ' + age + ' years old';

// Template literal
const msg = `Hello ${name}, you are ${age} years old`;
```

### 5. Object Destructuring
```javascript
const response = {success: true, data: {...}};

// Old way
const success = response.success;
const data = response.data;

// Destructuring
const {success, data} = response;
```

---

## 🎯 Complete Flow Example

### User Creates Database

**1. HTML (User Action)**
```html
<button onclick="showCreateDatabaseModal()">Create Database</button>
```

**2. ui-helpers.js (Show Modal)**
```javascript
function showCreateDatabaseModal() {
    showModal('create-database-modal');
}
```

**3. HTML (User Fills Form)**
```html
<form onsubmit="createDatabase(event)">
    <input id="database-name" value="mydb">
    <button type="submit">Create</button>
</form>
```

**4. database-manager.js (Handle Submit)**
```javascript
async function createDatabase(event) {
    event.preventDefault();
    const name = document.getElementById('database-name').value;
    
    const result = await DatabaseAPI.create(name);
    
    if (result.success) {
        showToast('Database created!', 'success');
        closeModal('create-database-modal');
        loadDatabases();
    } else {
        showToast(result.error, 'error');
    }
}
```

**5. api.js (API Call)**
```javascript
create: async (name) => {
    const response = await fetch(`${API_BASE_URL}/databases`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name})
    });
    return response.json();
}
```

**6. Backend Processes Request**
```python
@database_bp.route('', methods=['POST'])
def create_database():
    data = request.get_json()
    DatabaseModel.create_database(data['name'])
    return jsonify({'success': True, ...})
```

**7. Response Returns to Frontend**
```javascript
// result = {success: true, message: "Database created"}
if (result.success) {
    showToast('Database created!', 'success');
}
```

**8. UI Updates**
- Modal closes
- Success toast appears
- Database list refreshes
