# User Manager - MySQL User Management Frontend

## 📄 static/user-manager.js - User Operations

### Purpose
Handles MySQL user management, including creating users, managing privileges, and displaying user information.

---

## 1. Load All Users

```javascript
async function loadUsers() {
    try {
        const result = await UserAPI.getAll();
        
        if (result.success) {
            displayUsers(result.users);
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to load users', 'error');
        console.error(error);
    }
}
```

**Simple pattern:** Load → Display or Show Error

---

## 2. Display Users

```javascript
function displayUsers(users) {
    const container = document.getElementById('user-list');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No users found. Create your first user!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3>${user.username}@${user.host}</h3>
                </div>
                <div class="card-actions">
                    <button onclick="viewUserPrivileges('${user.username}', '${user.host}')" 
                            class="btn btn-sm">
                        View Privileges
                    </button>
                    <button onclick="showGrantPrivilegesModal('${user.username}', '${user.host}')" 
                            class="btn btn-sm btn-primary">
                        Grant Privileges
                    </button>
                    <button onclick="confirmDeleteUser('${user.username}', '${user.host}')" 
                            class="btn btn-sm btn-danger">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
```

**User Display Format:**
- Shows username@host (MySQL format)
- Three actions: View, Grant, Delete
- Each button passes both username and host

---

## 3. Create User

```javascript
async function createUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('user-username').value.trim();
    const password = document.getElementById('user-password').value;
    const host = document.getElementById('user-host').value.trim();
    
    if (!username || !password) {
        showToast('Username and password are required', 'warning');
        return;
    }
    
    try {
        const result = await UserAPI.create(username, password, host);
        
        if (result.success) {
            showToast(result.message, 'success');
            closeModal('create-user-modal');
            await loadUsers();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to create user', 'error');
        console.error(error);
    }
}
```

**Password Handling:**
- Password NOT trimmed (whitespace might be intentional)
- Username and host ARE trimmed
- Basic validation before API call

---

## 4. Delete User

```javascript
function confirmDeleteUser(username, host) {
    showConfirmation(
        `Are you sure you want to delete user "${username}@${host}"?`,
        () => deleteUser(username, host)
    );
}

async function deleteUser(username, host) {
    try {
        const result = await UserAPI.delete(username, host);
        
        if (result.success) {
            showToast(result.message, 'success');
            await loadUsers();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to delete user', 'error');
        console.error(error);
    }
}
```

**Two parameters:** Username and host both needed for MySQL user identification

---

## 5. View User Privileges

```javascript
async function viewUserPrivileges(username, host) {
    try {
        const result = await UserAPI.getPrivileges(username, host);
        
        if (result.success) {
            showPrivilegesModal(username, host, result.privileges);
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to load privileges', 'error');
        console.error(error);
    }
}

function showPrivilegesModal(username, host, privileges) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Privileges for "${username}@${host}"</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                ${privileges.length === 0 ? 
                    '<p class="empty-state">No privileges granted</p>' : 
                    `<ul class="privilege-list">
                        ${privileges.map(priv => `<li>${priv}</li>`).join('')}
                    </ul>`
                }
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
```

**Privilege Display:**
- Shows raw GRANT statements from MySQL
- Example: `GRANT SELECT, INSERT ON mydb.* TO 'user'@'localhost'`
- Read-only view (no modification here)

---

## 6. Grant Privileges Modal

```javascript
async function showGrantPrivilegesModal(username, host) {
    const dbResult = await DatabaseAPI.getAll();
    
    if (!dbResult.success) {
        showToast('Failed to load databases', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = 'grant-privileges-modal-' + Date.now();
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Grant Privileges to "${username}@${host}"</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Database:</label>
                    <select id="grant-database">
                        <option value="">Select database...</option>
                        ${dbResult.databases.map(db => `<option value="${db}">${db}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Privileges:</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="SELECT"> SELECT</label>
                        <label><input type="checkbox" value="INSERT"> INSERT</label>
                        <label><input type="checkbox" value="UPDATE"> UPDATE</label>
                        <label><input type="checkbox" value="DELETE"> DELETE</label>
                        <label><input type="checkbox" value="CREATE"> CREATE</label>
                        <label><input type="checkbox" value="DROP"> DROP</label>
                        <label><input type="checkbox" value="ALTER"> ALTER</label>
                        <label><input type="checkbox" value="ALL"> ALL PRIVILEGES</label>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button onclick="this.closest('.modal').remove()" class="btn">Cancel</button>
                <button onclick="grantPrivileges('${username}', '${host}', '${modal.id}')" 
                        class="btn btn-primary">
                    Grant
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
```

**Checkbox Group:**
- Multiple privileges can be selected
- Common privileges shown as checkboxes
- "ALL PRIVILEGES" option for full access

---

## 7. Grant Privileges Function

```javascript
async function grantPrivileges(username, host, modalId) {
    const modal = document.getElementById(modalId);
    const database = modal.querySelector('#grant-database').value;
    
    // Get checked privileges
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
    const privileges = Array.from(checkboxes).map(cb => cb.value);
    
    if (!database) {
        showToast('Please select a database', 'warning');
        return;
    }
    
    if (privileges.length === 0) {
        showToast('Please select at least one privilege', 'warning');
        return;
    }
    
    try {
        const result = await UserAPI.grantPrivileges(username, host, database, privileges);
        
        if (result.success) {
            showToast(result.message, 'success');
            modal.remove();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to grant privileges', 'error');
        console.error(error);
    }
}
```

**Getting Checked Checkboxes:**
```javascript
const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
const privileges = Array.from(checkboxes).map(cb => cb.value);
```

1. **querySelectorAll()**: Gets all checked checkboxes
2. **Array.from()**: Converts NodeList to Array
3. **map()**: Extracts value from each checkbox
4. Result: `['SELECT', 'INSERT', 'UPDATE']`

---

## 8. Revoke Privileges

```javascript
async function showRevokePrivilegesModal(username, host) {
    const dbResult = await DatabaseAPI.getAll();
    
    if (!dbResult.success) {
        showToast('Failed to load databases', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = 'revoke-privileges-modal-' + Date.now();
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Revoke Privileges from "${username}@${host}"</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Database:</label>
                    <select id="revoke-database">
                        <option value="">Select database...</option>
                        ${dbResult.databases.map(db => `<option value="${db}">${db}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Privileges to Revoke:</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="SELECT"> SELECT</label>
                        <label><input type="checkbox" value="INSERT"> INSERT</label>
                        <label><input type="checkbox" value="UPDATE"> UPDATE</label>
                        <label><input type="checkbox" value="DELETE"> DELETE</label>
                        <label><input type="checkbox" value="CREATE"> CREATE</label>
                        <label><input type="checkbox" value="DROP"> DROP</label>
                        <label><input type="checkbox" value="ALTER"> ALTER</label>
                        <label><input type="checkbox" value="ALL"> ALL PRIVILEGES</label>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button onclick="this.closest('.modal').remove()" class="btn">Cancel</button>
                <button onclick="revokePrivileges('${username}', '${host}', '${modal.id}')" 
                        class="btn btn-danger">
                    Revoke
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function revokePrivileges(username, host, modalId) {
    const modal = document.getElementById(modalId);
    const database = modal.querySelector('#revoke-database').value;
    
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
    const privileges = Array.from(checkboxes).map(cb => cb.value);
    
    if (!database) {
        showToast('Please select a database', 'warning');
        return;
    }
    
    if (privileges.length === 0) {
        showToast('Please select at least one privilege', 'warning');
        return;
    }
    
    try {
        const result = await UserAPI.revokePrivileges(username, host, database, privileges);
        
        if (result.success) {
            showToast(result.message, 'success');
            modal.remove();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to revoke privileges', 'error');
        console.error(error);
    }
}
```

**Similar to Grant:**
- Same structure as grant modal
- Different button styling (btn-danger)
- Calls revoke API instead of grant

---

## 🔑 Key Concepts Summary

### 1. User@Host Pattern
```javascript
`${username}@${host}`
```
- MySQL identifies users by BOTH username and host
- Always pass both parameters together

### 2. Checkbox Collection
```javascript
const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
const values = Array.from(checkboxes).map(cb => cb.value);
```
- Standard pattern for multi-select
- Convert NodeList → Array → Extract values

### 3. Dynamic Modal IDs
```javascript
modal.id = 'grant-modal-' + Date.now();
```
- Unique ID for each modal instance
- Allows targeting specific modal later

### 4. Validation Before API Call
```javascript
if (!database) { return; }
if (privileges.length === 0) { return; }
// Then make API call
```
- Catch errors early
- Better user experience

---

## ❓ Common Questions

**Q: Why check privileges.length === 0?**
A: User must select at least one privilege to grant/revoke. Empty array would be invalid.

**Q: Why Array.from() on checkboxes?**
A: querySelectorAll returns NodeList, not Array. Array.from converts it so we can use .map()

**Q: Can we grant privileges on all databases?**
A: Not in current implementation. Must select specific database. Could add "*" option for all databases.

**Q: What happens if user already has privilege?**
A: MySQL handles it gracefully - GRANT is idempotent (safe to run multiple times).
