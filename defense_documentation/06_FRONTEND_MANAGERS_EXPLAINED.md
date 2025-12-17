# Frontend Managers - Business Logic Explained

## 📄 static/app-main.js - Application Initialization

### Purpose
The **entry point** for the frontend application. Runs when page loads and sets up event listeners.

---

### Code Breakdown

```javascript
// Tab switching functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        switchTab(tabName);
    });
});
```

**What This Does:**
1. **querySelectorAll('.tab-button')**: Gets all tab buttons
2. **forEach()**: Loops through each button
3. **addEventListener('click')**: Attaches click handler
4. **getAttribute('data-tab')**: Gets tab name from HTML attribute
5. **switchTab(tabName)**: Switches to selected tab

**Example:**
```html
<button data-tab="databases">Databases</button>
```
When clicked → `tabName = "databases"` → `switchTab("databases")`

---

```javascript
// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
```

**Modal Click-Outside to Close:**
- Clicks anywhere on page trigger this
- Checks if click was on modal backdrop (not content)
- If yes, closes the modal
- User-friendly: Click outside = cancel

---

```javascript
// Load initial data
async function initApp() {
    await loadDatabases();
    await loadBackups();
    await loadUsers();
    await updateStats();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initApp);
```

**Application Initialization:**
- **DOMContentLoaded**: Fires when HTML is fully loaded
- **initApp()**: Loads all initial data
- **async function**: Can use await inside
- Loads databases, backups, users, and statistics

---

## 📄 static/database-manager.js - Database Operations

### Purpose
Handles all database-related UI operations and API interactions.

---

### 1. Load All Databases
```javascript
async function loadDatabases() {
    try {
        const result = await DatabaseAPI.getAll();
        
        if (result.success) {
            displayDatabases(result.databases);
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to load databases', 'error');
        console.error(error);
    }
}
```

**Flow:**
1. Call API to get databases
2. Check if successful
3. If yes: Display databases
4. If no: Show error toast
5. **try-catch**: Handles network errors

**Why async/await?**
- API calls take time (network request)
- `await` waits for response before continuing
- Makes code easier to read than callbacks

---

### 2. Display Databases
```javascript
function displayDatabases(databases) {
    const container = document.getElementById('database-list');
    
    if (databases.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No databases found. Create your first database!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = databases.map(db => `
        <div class="card">
            <div class="card-header">
                <h3>${db}</h3>
                <div class="card-actions">
                    <button onclick="viewTables('${db}')" class="btn btn-sm">
                        View Tables
                    </button>
                    <button onclick="confirmDeleteDatabase('${db}')" class="btn btn-sm btn-danger">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
```

**Key Concepts:**

#### Empty State
```javascript
if (databases.length === 0) {
    container.innerHTML = `<div>No databases found</div>`;
    return;
}
```
- Shows friendly message when no data
- Better UX than blank screen

#### Array.map() for HTML Generation
```javascript
databases.map(db => `<div>${db}</div>`).join('')
```
- **map()**: Transforms each database into HTML string
- Returns array: `['<div>db1</div>', '<div>db2</div>']`
- **join('')**: Combines array into single string
- Result: `'<div>db1</div><div>db2</div>'`

**Example:**
```javascript
['mydb', 'testdb'].map(db => `<div>${db}</div>`).join('')
// Result: '<div>mydb</div><div>testdb</div>'
```

#### Template Literals for HTML
```javascript
`
<div class="card">
    <h3>${db}</h3>
    <button onclick="viewTables('${db}')">View</button>
</div>
`
```
- Multi-line strings
- Embedded expressions: `${db}`
- Generates HTML dynamically

#### onclick in Generated HTML
```javascript
<button onclick="confirmDeleteDatabase('${db}')">
```
- Injects database name into function call
- Example: `onclick="confirmDeleteDatabase('mydb')"`
- Function must be globally accessible

---

### 3. Create Database
```javascript
async function createDatabase(event) {
    event.preventDefault();
    
    const name = document.getElementById('database-name').value.trim();
    
    if (!name) {
        showToast('Please enter a database name', 'warning');
        return;
    }
    
    try {
        const result = await DatabaseAPI.create(name);
        
        if (result.success) {
            showToast(result.message, 'success');
            closeModal('create-database-modal');
            await loadDatabases();
            await updateStats();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to create database', 'error');
        console.error(error);
    }
}
```

**Important Concepts:**

#### event.preventDefault()
```javascript
event.preventDefault();
```
- Stops form from submitting normally (page refresh)
- Allows JavaScript to handle submission
- **Must be first** in form handler

#### Input Validation
```javascript
const name = document.getElementById('database-name').value.trim();

if (!name) {
    showToast('Please enter a database name', 'warning');
    return;
}
```
- **trim()**: Removes whitespace from start/end
- Checks if name is empty
- Shows warning if invalid
- **return**: Stops function execution

#### Success Flow
```javascript
if (result.success) {
    showToast(result.message, 'success');     // Show success message
    closeModal('create-database-modal');       // Close form
    await loadDatabases();                     // Refresh list
    await updateStats();                       // Update counters
}
```
- Multiple actions after success
- Keeps UI in sync with data

---

### 4. Delete Database (with Confirmation)
```javascript
function confirmDeleteDatabase(database) {
    showConfirmation(
        `Are you sure you want to delete database "${database}"? This action cannot be undone.`,
        () => deleteDatabase(database)
    );
}

async function deleteDatabase(database) {
    try {
        const result = await DatabaseAPI.delete(database);
        
        if (result.success) {
            showToast(result.message, 'success');
            await loadDatabases();
            await updateStats();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to delete database', 'error');
        console.error(error);
    }
}
```

**Two-Step Deletion:**
1. **confirmDeleteDatabase()**: Shows confirmation dialog
2. **deleteDatabase()**: Actually deletes (only if confirmed)

**Why Separate Functions?**
- Safety: Prevents accidental deletion
- Reusability: Can call deleteDatabase() from elsewhere if needed
- UX: Users have a chance to cancel

---

### 5. View Tables in Database
```javascript
async function viewTables(database) {
    try {
        const result = await DatabaseAPI.getTables(database);
        
        if (result.success) {
            showTablesModal(database, result.tables);
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to load tables', 'error');
        console.error(error);
    }
}

function showTablesModal(database, tables) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Tables in "${database}"</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                ${tables.length === 0 ? 
                    '<p class="empty-state">No tables in this database</p>' : 
                    `<ul class="table-list">
                        ${tables.map(table => `
                            <li>
                                <span>${table}</span>
                                <div>
                                    <button onclick="viewTableStructure('${database}', '${table}')" class="btn btn-sm">
                                        Structure
                                    </button>
                                    <button onclick="confirmDeleteTable('${database}', '${table}')" class="btn btn-sm btn-danger">
                                        Delete
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>`
                }
                <button onclick="showCreateTableModal('${database}')" class="btn btn-primary">
                    Add New Table
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
```

**Dynamic Modal Creation:**
- Creates modal on-the-fly (not pre-defined in HTML)
- More flexible than static modals
- **document.createElement('div')**: Creates new element
- **appendChild()**: Adds to page

**Ternary Operator:**
```javascript
${tables.length === 0 ? 
    'No tables message' : 
    'Table list HTML'
}
```
- Shorthand for if-else
- Format: `condition ? valueIfTrue : valueIfFalse`

**this.closest('.modal').remove():**
```javascript
onclick="this.closest('.modal').remove()"
```
- **this**: The button element
- **closest('.modal')**: Finds nearest parent with class 'modal'
- **remove()**: Removes element from DOM

---

### 6. Create Table
```javascript
let tableColumns = [];

function addTableColumn() {
    const nameInput = document.getElementById('column-name');
    const typeInput = document.getElementById('column-type');
    
    const name = nameInput.value.trim();
    const type = typeInput.value.trim();
    
    if (!name || !type) {
        showToast('Please enter column name and type', 'warning');
        return;
    }
    
    tableColumns.push({name, type});
    
    displayTableColumns();
    
    // Clear inputs
    nameInput.value = '';
    typeInput.value = '';
    nameInput.focus();
}

function displayTableColumns() {
    const container = document.getElementById('columns-list');
    
    container.innerHTML = tableColumns.map((col, index) => `
        <div class="column-item">
            <span>${col.name} - ${col.type}</span>
            <button onclick="removeTableColumn(${index})" class="btn btn-sm btn-danger">
                Remove
            </button>
        </div>
    `).join('');
}

function removeTableColumn(index) {
    tableColumns.splice(index, 1);
    displayTableColumns();
}

async function createTable(event, database) {
    event.preventDefault();
    
    const name = document.getElementById('table-name').value.trim();
    
    if (!name) {
        showToast('Please enter a table name', 'warning');
        return;
    }
    
    if (tableColumns.length === 0) {
        showToast('Please add at least one column', 'warning');
        return;
    }
    
    try {
        const result = await DatabaseAPI.createTable(database, name, tableColumns);
        
        if (result.success) {
            showToast(result.message, 'success');
            closeModal('create-table-modal');
            tableColumns = []; // Reset
            await viewTables(database); // Refresh table list
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to create table', 'error');
        console.error(error);
    }
}
```

**Column Management Pattern:**

#### State Management
```javascript
let tableColumns = [];
```
- **Global variable** stores columns during creation
- Array of objects: `[{name: 'id', type: 'INT'}, ...]`

#### Add Column
```javascript
tableColumns.push({name, type});  // Add to array
displayTableColumns();             // Update UI
```
- **push()**: Adds to end of array
- Re-renders list after each addition

#### Remove Column
```javascript
tableColumns.splice(index, 1);
```
- **splice(index, count)**: Removes element at index
- Example: `[a, b, c].splice(1, 1)` → `[a, c]` (removed b)

#### Reset State
```javascript
tableColumns = [];
```
- Clears array after successful creation
- Prevents old data carrying over to next use

**Object Shorthand:**
```javascript
const name = 'id';
const type = 'INT';

// Old way
{name: name, type: type}

// Shorthand
{name, type}
```

---

### 7. View Table Structure
```javascript
async function viewTableStructure(database, table) {
    try {
        const result = await DatabaseAPI.getTableStructure(database, table);
        
        if (result.success) {
            showTableStructureModal(database, table, result.structure);
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to load table structure', 'error');
        console.error(error);
    }
}

function showTableStructureModal(database, table, structure) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Structure of "${database}.${table}"</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Type</th>
                            <th>Null</th>
                            <th>Key</th>
                            <th>Default</th>
                            <th>Extra</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${structure.map(col => `
                            <tr>
                                <td>${col.field}</td>
                                <td>${col.type}</td>
                                <td>${col.null}</td>
                                <td>${col.key}</td>
                                <td>${col.default || '-'}</td>
                                <td>${col.extra || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
```

**Table Generation:**
```javascript
<table>
    <thead>
        <tr><th>Field</th>...</tr>
    </thead>
    <tbody>
        ${structure.map(col => `<tr>...</tr>`).join('')}
    </tbody>
</table>
```
- Maps structure array to table rows
- Each column becomes a row in the table

**Null Coalescing:**
```javascript
${col.default || '-'}
```
- If `col.default` is null/undefined/empty, show '-'
- Handles missing values gracefully

---

## 📄 static/backup-manager.js - Backup Operations

### Purpose
Handles backup creation, restoration, and management.

---

### 1. Load Backups
```javascript
async function loadBackups() {
    try {
        const result = await BackupAPI.getMetadata();
        
        if (result.success) {
            displayBackups(result.backups);
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to load backups', 'error');
        console.error(error);
    }
}

function displayBackups(backups) {
    const container = document.getElementById('backup-list');
    
    if (backups.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No backups yet. Create your first backup!</p>
            </div>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    
    container.innerHTML = backups.map(backup => `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3>${backup.database}${backup.table ? `.${backup.table}` : ''}</h3>
                    <p class="text-muted">${backup.filename}</p>
                </div>
                <div class="card-meta">
                    <span>${formatFileSize(backup.size)}</span>
                    <span>${formatTimestamp(backup.timestamp)}</span>
                </div>
            </div>
            <div class="card-actions">
                <button onclick="showRestoreModal('${backup.filename}')" class="btn btn-sm btn-primary">
                    Restore
                </button>
                <button onclick="confirmDeleteBackup('${backup.filename}')" class="btn btn-sm btn-danger">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}
```

**Sorting:**
```javascript
backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
```
- **sort()**: Sorts array in place
- **Comparator function**: `(a, b) => ...`
- **localeCompare()**: Compares strings
- `b.timestamp.localeCompare(a.timestamp)`: Descending order (newest first)

**Conditional Display:**
```javascript
${backup.table ? `.${backup.table}` : ''}
```
- If table exists: Show "database.table"
- If not: Show "database"
- **Ternary operator** for conditional content

---

### 2. Create Backup
```javascript
async function showCreateBackupModal() {
    // Load databases for dropdown
    const dbResult = await DatabaseAPI.getAll();
    
    if (!dbResult.success) {
        showToast('Failed to load databases', 'error');
        return;
    }
    
    const modal = document.getElementById('create-backup-modal');
    const select = document.getElementById('backup-database');
    
    // Populate database dropdown
    select.innerHTML = `
        <option value="">Select database...</option>
        ${dbResult.databases.map(db => `<option value="${db}">${db}</option>`).join('')}
    `;
    
    showModal('create-backup-modal');
}

async function loadBackupTables() {
    const database = document.getElementById('backup-database').value;
    const tableSelect = document.getElementById('backup-table');
    
    if (!database) {
        tableSelect.innerHTML = '<option value="">Select database first</option>';
        tableSelect.disabled = true;
        return;
    }
    
    const result = await DatabaseAPI.getTables(database);
    
    if (result.success) {
        tableSelect.disabled = false;
        tableSelect.innerHTML = `
            <option value="">All tables (full backup)</option>
            ${result.tables.map(table => `<option value="${table}">${table}</option>`).join('')}
        `;
    }
}

async function createBackup(event) {
    event.preventDefault();
    
    const database = document.getElementById('backup-database').value;
    const table = document.getElementById('backup-table').value;
    
    if (!database) {
        showToast('Please select a database', 'warning');
        return;
    }
    
    try {
        showToast('Creating backup... Please wait', 'info');
        
        const result = await BackupAPI.create(database, table || null);
        
        if (result.success) {
            showToast('Backup created successfully!', 'success');
            closeModal('create-backup-modal');
            await loadBackups();
            await updateStats();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to create backup', 'error');
        console.error(error);
    }
}
```

**Cascading Dropdowns:**
1. Select database → Populates table dropdown
2. Table dropdown depends on database selection
3. **disabled**: Prevents selection until database chosen

**Optimistic UI:**
```javascript
showToast('Creating backup... Please wait', 'info');
```
- Shows loading message immediately
- Backup creation can take time (large databases)
- Improves perceived performance

**Empty String vs Null:**
```javascript
const table = document.getElementById('backup-table').value;
BackupAPI.create(database, table || null);
```
- Empty string (`""`) is falsy
- `table || null`: Converts empty string to null
- API expects null for "no table"

---

### 3. Restore Backup
```javascript
async function showRestoreModal(filename) {
    const dbResult = await DatabaseAPI.getAll();
    
    if (!dbResult.success) {
        showToast('Failed to load databases', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = 'restore-modal-' + Date.now();
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Restore Backup</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <p>Restoring: <strong>${filename}</strong></p>
                <div class="form-group">
                    <label>Target Database (optional):</label>
                    <select id="restore-target-db">
                        <option value="">Use original database</option>
                        ${dbResult.databases.map(db => `<option value="${db}">${db}</option>`).join('')}
                        <option value="_new_">Create new database...</option>
                    </select>
                </div>
                <div class="form-group" id="new-db-name-group" style="display: none;">
                    <label>New Database Name:</label>
                    <input type="text" id="new-db-name" placeholder="Enter new database name">
                </div>
            </div>
            <div class="modal-actions">
                <button onclick="this.closest('.modal').remove()" class="btn">Cancel</button>
                <button onclick="restoreBackup('${filename}', '${modal.id}')" class="btn btn-primary">Restore</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show new database name input when "_new_" selected
    modal.querySelector('#restore-target-db').addEventListener('change', (e) => {
        const newDbGroup = modal.querySelector('#new-db-name-group');
        newDbGroup.style.display = e.target.value === '_new_' ? 'block' : 'none';
    });
}

async function restoreBackup(filename, modalId) {
    const modal = document.getElementById(modalId);
    const targetSelect = modal.querySelector('#restore-target-db');
    const newDbInput = modal.querySelector('#new-db-name');
    
    let targetDatabase = targetSelect.value;
    
    if (targetDatabase === '_new_') {
        targetDatabase = newDbInput.value.trim();
        if (!targetDatabase) {
            showToast('Please enter new database name', 'warning');
            return;
        }
    }
    
    if (targetDatabase === '') {
        targetDatabase = null; // Use original
    }
    
    try {
        showToast('Restoring backup... Please wait', 'info');
        
        const result = await BackupAPI.restore(filename, targetDatabase);
        
        if (result.success) {
            showToast('Backup restored successfully!', 'success');
            modal.remove();
            await loadDatabases();
            await updateStats();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to restore backup', 'error');
        console.error(error);
    }
}
```

**Unique Modal ID:**
```javascript
modal.id = 'restore-modal-' + Date.now();
```
- **Date.now()**: Current timestamp in milliseconds
- Creates unique ID for each modal
- Allows multiple modals simultaneously (though not recommended UX)

**Conditional Input Display:**
```javascript
modal.querySelector('#restore-target-db').addEventListener('change', (e) => {
    const newDbGroup = modal.querySelector('#new-db-name-group');
    newDbGroup.style.display = e.target.value === '_new_' ? 'block' : 'none';
});
```
- Listens for dropdown change
- Shows/hides input based on selection
- **e.target.value**: Selected option value
- Dynamic form behavior

**querySelector vs getElementById:**
```javascript
// Global search
document.getElementById('my-id');

// Search within element
modal.querySelector('#my-id');
```
- **querySelector**: More flexible, can search within element
- Good for dynamically created modals

---

### 4. Update Statistics
```javascript
async function updateStats() {
    try {
        const result = await BackupAPI.getStats();
        
        if (result.success) {
            document.getElementById('total-databases').textContent = result.stats.total_databases;
            document.getElementById('total-backups').textContent = result.stats.total_backups;
            document.getElementById('total-tables').textContent = result.stats.total_tables;
        }
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}
```

**Silent Error Handling:**
```javascript
} catch (error) {
    console.error('Failed to update stats:', error);
}
```
- Logs error to console but doesn't show toast
- Stats update is background operation
- Don't annoy user with non-critical error

**textContent vs innerHTML:**
```javascript
element.textContent = '123';  // Safe, plain text
element.innerHTML = '<b>123</b>';  // Renders HTML
```
- **textContent**: Treats content as plain text
- **innerHTML**: Parses HTML tags
- Use textContent for dynamic user data (security)

---

## 🔑 Key Patterns & Best Practices

### 1. Async/Await Pattern
```javascript
async function loadData() {
    try {
        const result = await API.getData();
        if (result.success) {
            displayData(result.data);
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
        console.error(error);
    }
}
```

### 2. Separation of Concerns
```javascript
// Load data
async function loadDatabases() { ... }

// Display data
function displayDatabases(databases) { ... }

// User action
function confirmDeleteDatabase(name) { ... }

// API call
async function deleteDatabase(name) { ... }
```

### 3. User Feedback
```javascript
// Before long operation
showToast('Creating backup... Please wait', 'info');

// After success
showToast('Backup created!', 'success');

// After error
showToast(result.error, 'error');
```

### 4. State Management
```javascript
let tableColumns = [];  // Application state

function addColumn() {
    tableColumns.push(...);  // Modify state
    displayColumns();         // Update UI
}

function clearColumns() {
    tableColumns = [];  // Reset state
}
```

### 5. Input Validation
```javascript
const name = input.value.trim();

if (!name) {
    showToast('Name required', 'warning');
    return;
}

if (name.length < 3) {
    showToast('Name too short', 'warning');
    return;
}
```

### 6. Confirmation for Destructive Actions
```javascript
function confirmDelete(item) {
    showConfirmation(
        `Delete ${item}?`,
        () => actuallyDelete(item)
    );
}
```
