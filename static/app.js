/**
 * MySQL Database Management System - Frontend Application
 * ITE 152 - Database Management Project
 */

const API_BASE = '/api';

// State Management
const state = {
    currentPage: 'databases',
    databases: [],
    backups: [],
    users: [],
    stats: {}
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeEventListeners();
    loadDashboardData();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

function switchPage(page) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `${page}-page`);
    });
    
    state.currentPage = page;
    
    // Load page data
    if (page === 'databases') {
        loadDatabasesPage();
    } else if (page === 'backups') {
        loadBackupsPage();
    } else if (page === 'users') {
        loadUsersPage();
    }
}

// Event Listeners
function initializeEventListeners() {
    // Database page
    document.getElementById('createDbBtn').addEventListener('click', showCreateDatabaseModal);
    document.getElementById('refreshDatabasesBtn').addEventListener('click', loadDatabasesPage);
    
    // Backups page
    document.getElementById('refreshBackupsBtn').addEventListener('click', loadBackupsPage);
    
    // Users page
    document.getElementById('createUserBtn').addEventListener('click', showCreateUserModal);
    document.getElementById('refreshUsersBtn').addEventListener('click', loadUsersPage);
}

// Dashboard Data
async function loadDashboardData() {
    await Promise.all([
        loadDatabasesPage(),
        loadBackupStats()
    ]);
}

// DATABASE OPERATIONS
async function loadDatabasesPage() {
    try {
        const response = await fetch(`${API_BASE}/databases`);
        const data = await response.json();
        
        if (data.success) {
            state.databases = data.databases;
            updateDatabaseStats();
            renderDatabaseLists();
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to load databases');
    }
}

function updateDatabaseStats() {
    document.getElementById('totalDatabases').textContent = state.databases.length;
}

async function loadBackupStats() {
    try {
        const response = await fetch(`${API_BASE}/backups/stats`);
        const data = await response.json();
        
        if (data.success) {
            state.stats = data.stats;
            document.getElementById('backedUpDatabases').textContent = data.stats.databases_backed_up;
            const totalTablesEl = document.getElementById('totalTables');
            if (totalTablesEl) totalTablesEl.textContent = data.stats.total_tables ?? 0;
        }
    } catch (error) {
        console.error('Failed to load backup stats:', error);
    }
}

function renderDatabaseLists() {
    const primaryList = document.getElementById('primaryDatabaseList');
    const backupList = document.getElementById('backupDatabaseList');
    
    if (state.databases.length === 0) {
        primaryList.innerHTML = '<div class="empty-state">No databases found</div>';
        backupList.innerHTML = '<div class="empty-state">No backups available</div>';
        return;
    }
    
    // Primary databases
    primaryList.innerHTML = state.databases.map(db => `
        <div class="database-item">
            <div class="database-info">
                <h4>${db}</h4>
                <p class="database-meta">Active Database</p>
            </div>
            <div class="database-actions">
                <button class="action-btn backup" onclick="showBackupModal('${db}')">Backup</button>
                <button class="action-btn view" onclick="viewDatabase('${db}')">View</button>
                <button class="action-btn delete" onclick="confirmDeleteDatabase('${db}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Load backup databases
    loadBackupDatabases(backupList);
}

async function loadBackupDatabases(container) {
    try {
        const response = await fetch(`${API_BASE}/backups/metadata`);
        const data = await response.json();
        
        if (data.success && data.backups.length > 0) {
            const uniqueDbs = [...new Set(data.backups.map(b => b.database))];
            
            container.innerHTML = uniqueDbs.map(db => {
                const dbBackups = data.backups.filter(b => b.database === db);
                const latestBackup = dbBackups[0];
                
                return `
                    <div class="database-item">
                        <div class="database-info">
                            <h4>${db}</h4>
                            <p class="database-meta">${dbBackups.length} backup(s) • Last: ${formatDate(latestBackup.timestamp)}</p>
                        </div>
                        <div class="database-actions">
                            <button class="action-btn restore" onclick="showRestoreModal('${latestBackup.filename}')">Restore</button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<div class="empty-state">No backups available</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Failed to load backups</div>';
    }
}

function showCreateDatabaseModal() {
    const modal = createModal('Create Database', `
        <div class="form-group">
            <label class="form-label">Database Name</label>
            <input type="text" class="form-input" id="dbName" placeholder="Enter database name">
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: closeModal },
        { text: 'Create', class: 'btn-primary', action: createDatabase }
    ]);
    
    showModal(modal);
}

async function createDatabase() {
    const name = document.getElementById('dbName').value.trim();
    
    if (!name) {
        showToast('error', 'Database name is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/databases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
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
        showToast('error', 'Failed to create database');
    }
}

function confirmDeleteDatabase(dbName) {
    const modal = createModal('Confirm Delete', `
        <p>Are you sure you want to delete the database <strong>${dbName}</strong>?</p>
        <p style="color: var(--danger-color); margin-top: 1rem;">This action cannot be undone!</p>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: closeModal },
        { text: 'Delete', class: 'btn-danger', action: () => deleteDatabase(dbName) }
    ]);
    
    showModal(modal);
}

async function deleteDatabase(dbName) {
    try {
        const response = await fetch(`${API_BASE}/databases/${dbName}`, {
            method: 'DELETE'
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
        showToast('error', 'Failed to delete database');
    }
}

function showBackupModal(database) {
    const modal = createModal('Backup Database', `
        <div class="form-group">
            <label class="form-label">Database</label>
            <input type="text" class="form-input" value="${database}" disabled>
        </div>
        <div class="form-group">
            <label class="form-label">Backup Type</label>
            <select class="form-select" id="backupType">
                <option value="full">Full Database</option>
                <option value="table">Specific Table</option>
            </select>
        </div>
        <div class="form-group" id="tableSelectGroup" style="display: none;">
            <label class="form-label">Select Table</label>
            <select class="form-select" id="tableSelect">
                <option value="">Loading tables...</option>
            </select>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: closeModal },
        { text: 'Backup', class: 'btn-primary', action: () => createBackup(database) }
    ]);
    
    showModal(modal);
    
    // Handle backup type change
    document.getElementById('backupType').addEventListener('change', async (e) => {
        const tableGroup = document.getElementById('tableSelectGroup');
        if (e.target.value === 'table') {
            tableGroup.style.display = 'block';
            await loadTablesForBackup(database);
        } else {
            tableGroup.style.display = 'none';
        }
    });
}

async function loadTablesForBackup(database) {
    try {
        const response = await fetch(`${API_BASE}/databases/${database}/tables`);
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('tableSelect');
            select.innerHTML = data.tables.map(table => 
                `<option value="${table}">${table}</option>`
            ).join('');
        }
    } catch (error) {
        showToast('error', 'Failed to load tables');
    }
}

async function createBackup(database) {
    const backupType = document.getElementById('backupType').value;
    const table = backupType === 'table' ? document.getElementById('tableSelect').value : null;
    
    try {
        const response = await fetch(`${API_BASE}/backups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ database, table })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', data.message);
            closeModal();
            loadDatabasesPage();
            loadBackupStats();
        } else {
            showToast('error', data.error);
        }
    } catch (error) {
        showToast('error', 'Failed to create backup');
    }
}

function viewDatabase(dbName) {
    showToast('warning', 'View functionality coming soon!');
}

// EXPOSE FUNCTIONS TO GLOBAL SCOPE (for onclick handlers)
window.showBackupModal = showBackupModal;
window.confirmDeleteDatabase = confirmDeleteDatabase;
window.viewDatabase = viewDatabase;
