/**
 * Utility Functions and Additional Features
 */

// BACKUP & RESTORE OPERATIONS
async function loadBackupsPage() {
    try {
        const response = await fetch(`${API_BASE}/backups/metadata`);
        const data = await response.json();
        
        if (data.success) {
            state.backups = data.backups;
            renderBackupsTable();
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to load backups');
    }
}

function renderBackupsTable() {
    const tbody = document.getElementById('backupsTableBody');
    
    if (state.backups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No backups found</td></tr>';
        return;
    }
    
    tbody.innerHTML = state.backups.map(backup => `
        <tr>
            <td>${backup.filename}</td>
            <td>${backup.database}</td>
            <td>${backup.table}</td>
            <td>${formatDate(backup.timestamp)}</td>
            <td>${formatSize(backup.size)}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="action-btn restore" onclick="showRestoreModal('${backup.filename}')">Restore</button>
                    <button class="action-btn delete" onclick="confirmDeleteBackup('${backup.filename}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showRestoreModal(filename) {
    const backup = state.backups.find(b => b.filename === filename);
    
    const modal = createModal('Restore Backup', `
        <div class="form-group">
            <label class="form-label">Backup File</label>
            <input type="text" class="form-input" value="${filename}" disabled>
        </div>
        <div class="form-group">
            <label class="form-label">Source Database</label>
            <input type="text" class="form-input" value="${backup.database}" disabled>
        </div>
        <div class="form-group">
            <label class="form-label">Target Database (Optional)</label>
            <input type="text" class="form-input" id="targetDatabase" placeholder="Leave empty to restore to source database">
        </div>
        <p style="color: var(--warning-color); font-size: 0.875rem; margin-top: 1rem;">
            ⚠️ This will overwrite existing data in the target database!
        </p>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: closeModal },
        { text: 'Restore', class: 'btn-primary', action: () => restoreBackup(filename) }
    ]);
    
    showModal(modal);
}

async function restoreBackup(filename) {
    const targetDatabase = document.getElementById('targetDatabase').value.trim() || null;
    
    try {
        const response = await fetch(`${API_BASE}/backups/restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, target_database: targetDatabase })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', data.message);
            closeModal();
            loadDatabasesPage();
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to restore backup');
    }
}

function confirmDeleteBackup(filename) {
    const modal = createModal('Confirm Delete', `
        <p>Are you sure you want to delete the backup <strong>${filename}</strong>?</p>
        <p style="color: var(--danger-color); margin-top: 1rem;">This action cannot be undone!</p>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: closeModal },
        { text: 'Delete', class: 'btn-danger', action: () => deleteBackup(filename) }
    ]);
    
    showModal(modal);
}

async function deleteBackup(filename) {
    try {
        const response = await fetch(`${API_BASE}/backups/${filename}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', data.message);
            closeModal();
            loadBackupsPage();
            loadBackupStats();
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to delete backup');
    }
}

// USER MANAGEMENT OPERATIONS
async function loadUsersPage() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const data = await response.json();
        
        if (data.success) {
            state.users = data.users;
            renderUsersTable();
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to load users');
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    
    if (state.users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = state.users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.host}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="action-btn view" onclick="showPrivilegesModal('${user.username}', '${user.host}')">Privileges</button>
                    <button class="action-btn delete" onclick="confirmDeleteUser('${user.username}', '${user.host}')">Drop</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showCreateUserModal() {
    const modal = createModal('Create User', `
        <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" id="username" placeholder="Enter username">
        </div>
        <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="password" placeholder="Enter password">
        </div>
        <div class="form-group">
            <label class="form-label">Host</label>
            <input type="text" class="form-input" id="host" value="localhost" placeholder="localhost or %">
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: closeModal },
        { text: 'Create', class: 'btn-primary', action: createUser }
    ]);
    
    showModal(modal);
}

async function createUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const host = document.getElementById('host').value.trim() || 'localhost';
    
    if (!username || !password) {
        showToast('error', 'Username and password are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, host })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', data.message);
            closeModal();
            loadUsersPage();
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to create user');
    }
}

function confirmDeleteUser(username, host) {
    const modal = createModal('Confirm Delete', `
        <p>Are you sure you want to drop the user <strong>${username}@${host}</strong>?</p>
        <p style="color: var(--danger-color); margin-top: 1rem;">This action cannot be undone!</p>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: closeModal },
        { text: 'Drop', class: 'btn-danger', action: () => deleteUser(username, host) }
    ]);
    
    showModal(modal);
}

async function deleteUser(username, host) {
    try {
        const response = await fetch(`${API_BASE}/users/${username}?host=${host}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', data.message);
            closeModal();
            loadUsersPage();
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to delete user');
    }
}

async function showPrivilegesModal(username, host) {
    const modal = createModal('Manage Privileges', `
        <div class="form-group">
            <label class="form-label">User</label>
            <input type="text" class="form-input" value="${username}@${host}" disabled>
        </div>
        <div class="form-group">
            <label class="form-label">Database</label>
            <select class="form-select" id="privilegeDatabase">
                <option value="">Loading databases...</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Privileges</label>
            <div class="checkbox-group" id="privilegeCheckboxes">
                <label class="checkbox-label">
                    <input type="checkbox" value="SELECT"> SELECT
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" value="INSERT"> INSERT
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" value="UPDATE"> UPDATE
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" value="DELETE"> DELETE
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" value="CREATE"> CREATE
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" value="DROP"> DROP
                </label>
            </div>
        </div>
        <div id="currentPrivileges" style="margin-top: 1rem; padding: 1rem; background: var(--auxiliary-color); border-radius: 8px;">
            <strong>Current Privileges:</strong>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">Loading...</p>
        </div>
    `, [
        { text: 'Close', class: 'btn-secondary', action: closeModal },
        { text: 'Grant', class: 'btn-success', action: () => grantPrivileges(username, host) },
        { text: 'Revoke', class: 'btn-danger', action: () => revokePrivileges(username, host) }
    ]);
    
    showModal(modal);
    
    // Load databases
    await loadDatabasesForPrivileges();
    
    // Load current privileges
    await loadCurrentPrivileges(username, host);
}

async function loadDatabasesForPrivileges() {
    try {
        const response = await fetch(`${API_BASE}/databases`);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('privilegeDatabase');
            select.innerHTML = '<option value="">Select database</option>' + 
                data.databases.map(db => `<option value="${db}">${db}</option>`).join('');
        }
    } catch (error) {
        showToast('error', 'Failed to load databases');
    }
}

async function loadCurrentPrivileges(username, host) {
    try {
        const response = await fetch(`${API_BASE}/users/${username}/privileges?host=${host}`);
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('currentPrivileges');
            container.innerHTML = `
                <strong>Current Privileges:</strong>
                <div style="margin-top: 0.5rem; font-size: 0.875rem;">
                    ${data.privileges.map(p => `<div style="margin: 0.25rem 0;">${p}</div>`).join('') || 'No privileges granted'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to load privileges:', error);
    }
}

async function grantPrivileges(username, host) {
    const database = document.getElementById('privilegeDatabase').value;
    const checkboxes = document.querySelectorAll('#privilegeCheckboxes input:checked');
    const privileges = Array.from(checkboxes).map(cb => cb.value);
    
    if (!database) {
        showToast('error', 'Please select a database');
        return;
    }
    
    if (privileges.length === 0) {
        showToast('error', 'Please select at least one privilege');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/${username}/privileges/grant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host, database, privileges })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', data.message);
            await loadCurrentPrivileges(username, host);
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to grant privileges');
    }
}

async function revokePrivileges(username, host) {
    const database = document.getElementById('privilegeDatabase').value;
    const checkboxes = document.querySelectorAll('#privilegeCheckboxes input:checked');
    const privileges = Array.from(checkboxes).map(cb => cb.value);
    
    if (!database) {
        showToast('error', 'Please select a database');
        return;
    }
    
    if (privileges.length === 0) {
        showToast('error', 'Please select at least one privilege');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/${username}/privileges/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host, database, privileges })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', data.message);
            await loadCurrentPrivileges(username, host);
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to revoke privileges');
    }
}

// MODAL UTILITIES
function createModal(title, body, buttons) {
    // Build footer buttons HTML
    const buttonsHtml = buttons.map(btn => `
        <button class="btn ${btn.class}" data-action="${btn.text}">${btn.text}</button>
    `).join('');

    // Store handlers in a temporary global map keyed by action text
    window._modalButtonHandlers = {};
    buttons.forEach(btn => {
        if (typeof btn.action === 'function') {
            window._modalButtonHandlers[btn.text] = btn.action;
        }
    });
    
    return `
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    ${body}
                </div>
                <div class="modal-footer">
                    ${buttonsHtml}
                </div>
            </div>
        </div>
    `;
}

function showModal(html) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = html;
    
    // Add event listeners to buttons (wire up provided handlers)
    container.querySelectorAll('.modal-footer .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'Cancel' || action === 'Close') {
                closeModal();
                return;
            }
            if (window._modalButtonHandlers && typeof window._modalButtonHandlers[action] === 'function') {
                try {
                    window._modalButtonHandlers[action]();
                } catch (e) {
                    console.error('Modal action handler error:', e);
                }
            }
        });
    });
    
    // Close on overlay click
    container.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
}

function closeModal() {
    // Clear modal and handlers
    document.getElementById('modalContainer').innerHTML = '';
    window._modalButtonHandlers = null;
}

// TOAST NOTIFICATIONS
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// UTILITY FUNCTIONS
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// EXPOSE FUNCTIONS TO GLOBAL SCOPE (for onclick handlers)
window.showRestoreModal = showRestoreModal;
window.confirmDeleteBackup = confirmDeleteBackup;
window.showPrivilegesModal = showPrivilegesModal;
window.confirmDeleteUser = confirmDeleteUser;
window.closeModal = closeModal;
window.showToast = showToast;
window.createModal = createModal;
window.showModal = showModal;
