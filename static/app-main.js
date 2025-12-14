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
    if (refreshDatabasesBtn) refreshDatabasesBtn.addEventListener('click', () => loadDashboardData());

    const refreshBackupListBtn = document.getElementById('refreshBackupListBtn');
    if (refreshBackupListBtn) refreshBackupListBtn.addEventListener('click', () => loadDashboardData());

    const refreshBackupsBtn = document.getElementById('refreshBackupsBtn');
    if (refreshBackupsBtn) refreshBackupsBtn.addEventListener('click', () => BackupManager.loadAndRender());

    const refreshUsersBtn = document.getElementById('refreshUsersBtn');
    if (refreshUsersBtn) refreshUsersBtn.addEventListener('click', () => UserManager.loadAndRender());

    // Load initial dashboard data (stats + database lists)
    await loadDashboardData();
    
    // Start on databases page
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

// Dashboard data loader (called on init and refresh)
async function loadDashboardData() {
    await Promise.all([
        loadDatabases(),
        loadBackupStats(),
        loadRecentBackups()
    ]);
    renderDashboardLists();
}

async function loadRecentBackups() {
    try {
        const data = await api.backups.getMetadata();
        if (data.success) {
            state.backups = data.backups;
        }
    } catch (error) {
        console.error('Failed to load backups:', error);
    }
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
    
    // Render primary databases list
    if (state.databases.length === 0) {
        primaryList.innerHTML = '<div class="empty-state">No databases found</div>';
    } else {
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
    
    // Render recent backups list (show up to 5 most recent)
    if (state.backups.length === 0) {
        backupList.innerHTML = '<div class="empty-state">No backups available</div>';
    } else {
        const recentBackups = state.backups.slice(0, 5);
        backupList.innerHTML = recentBackups.map(backup => `
            <div class="list-item">
                <div class="list-item-content">
                    <svg class="list-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span class="list-item-title">${backup.database}</span>
                </div>
                <div class="list-item-meta" style="font-size: 0.75rem; color: var(--text-light);">
                    ${formatDate(backup.timestamp)}
                </div>
            </div>
        `).join('');
    }
}

// Helper function for date formatting
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update dashboard stats (called after operations)
async function updateDashboardStats() {
    await loadDashboardData();
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
