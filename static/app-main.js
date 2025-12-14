/**
 * Main Application Entry Point
 */

// Global application state
const state = {
    currentPage: 'dashboard',
    databases: [],
    backups: [],
    users: [],
    stats: {}
};

// Initialize application
async function initApp() {
    // Set up navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            navigateToPage(page);
        });
    });

    // Set up button handlers
    const createDbBtn = document.getElementById('createDbBtn');
    if (createDbBtn) createDbBtn.addEventListener('click', () => DatabaseManager.showCreateModal());

    const createUserBtn = document.getElementById('createUserBtn');
    if (createUserBtn) createUserBtn.addEventListener('click', () => UserManager.showCreateModal());

    const refreshDatabasesBtn = document.getElementById('refreshDatabasesBtn');
    if (refreshDatabasesBtn) refreshDatabasesBtn.addEventListener('click', () => DatabaseManager.loadAndRender());

    const refreshBackupsBtn = document.getElementById('refreshBackupsBtn');
    if (refreshBackupsBtn) refreshBackupsBtn.addEventListener('click', () => BackupManager.loadAndRender());

    const refreshUsersBtn = document.getElementById('refreshUsersBtn');
    if (refreshUsersBtn) refreshUsersBtn.addEventListener('click', () => UserManager.loadAndRender());

    // Load initial data
    await navigateToPage('databases');
}

// Navigation handler
async function navigateToPage(page) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update active page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `${page}-page`);
    });

    state.currentPage = page;

    // Load page-specific data
    switch (page) {
        case 'databases':
            await DatabaseManager.loadAndRender();
            break;
        case 'backups':
            await BackupManager.loadAndRender();
            break;
        case 'users':
            await UserManager.loadAndRender();
            break;
    }
}

// Dashboard loader
async function loadDashboard() {
    await Promise.all([
        loadDatabases(),
        loadBackupStats()
    ]);
    renderDashboardLists();
}

async function loadDatabases() {
    try {
        const data = await api.databases.getAll();
        if (data.success) {
            state.databases = data.databases;
            document.getElementById('totalDatabases').textContent = state.databases.length;
        }
    } catch (error) {
        console.error('Failed to load databases:', error);
    }
}

async function loadBackupStats() {
    try {
        const data = await api.backups.getStats();
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

function renderDashboardLists() {
    const primaryList = document.getElementById('primaryDatabaseList');
    const backupList = document.getElementById('backupDatabaseList');
    
    if (state.databases.length === 0) {
        primaryList.innerHTML = '<div class="empty-state">No databases found</div>';
        backupList.innerHTML = '<div class="empty-state">No backups available</div>';
        return;
    }

    primaryList.innerHTML = state.databases.map(db => `
        <div class="list-item">
            <div class="list-item-content">
                <svg class="list-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
                <span class="list-item-title">${db}</span>
            </div>
        </div>
    `).join('');
}

// Update dashboard stats (called after operations)
async function updateDashboardStats() {
    await loadDatabases();
    await loadBackupStats();
    renderDashboardLists();
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
