/**
 * Database Manager - Handles database operations and UI
 */

const DatabaseManager = {
    async loadAndRender() {
        try {
            const data = await api.databases.getAll();
            if (data.success) {
                state.databases = data.databases;
                this.render();
            }
        } catch (error) {
            console.error('Failed to load databases:', error);
            showToast('Failed to load databases', 'error');
        }
    },

    render() {
        const primaryList = document.getElementById('primaryList');
        const backupList = document.getElementById('backupList');
        
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
                <div class="list-item-actions">
                    <button class="btn-icon" onclick="DatabaseManager.showBackupModal('${db}')" title="Backup">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="DatabaseManager.showDeleteModal('${db}')" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="DatabaseManager.showDetailsModal('${db}')" title="View Details">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    },

    showCreateModal() {
        const modalHtml = createModal('Create New Database', `
            <div class="form-group">
                <label for="dbName">Database Name</label>
                <input type="text" id="dbName" placeholder="Enter database name" required>
            </div>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Create', class: 'btn-primary', action: () => this.createDatabase() }
        ]);
        showModal(modalHtml);
    },

    async createDatabase() {
        const name = document.getElementById('dbName').value.trim();
        if (!name) {
            showToast('Please enter a database name', 'error');
            return;
        }

        try {
            const data = await api.databases.create(name);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                await this.loadAndRender();
                await updateDashboardStats();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to create database', 'error');
        }
    },

    showBackupModal(database) {
        const modalHtml = createModal('Backup Database', `
            <p>Create a backup of <strong>${database}</strong>?</p>
            <div class="form-group">
                <label for="backupTable">Specific Table (Optional)</label>
                <input type="text" id="backupTable" placeholder="Leave empty for full database backup">
            </div>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Backup', class: 'btn-primary', action: () => this.createBackup(database) }
        ]);
        showModal(modalHtml);
    },

    async createBackup(database) {
        const table = document.getElementById('backupTable').value.trim() || null;
        
        try {
            const data = await api.backups.create(database, table);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                await updateDashboardStats();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to create backup', 'error');
        }
    },

    showDeleteModal(database) {
        const modalHtml = createModal('Delete Database', `
            <p>Are you sure you want to delete <strong>${database}</strong>?</p>
            <p class="text-danger">This action cannot be undone!</p>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Delete', class: 'btn-danger', action: () => this.deleteDatabase(database) }
        ]);
        showModal(modalHtml);
    },

    async deleteDatabase(database) {
        try {
            const data = await api.databases.delete(database);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                await this.loadAndRender();
                await updateDashboardStats();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to delete database', 'error');
        }
    },

    async showDetailsModal(database) {
        try {
            const data = await api.databases.getTables(database);
            if (data.success) {
                const tables = data.tables;
                const modalHtml = createModal(`Database: ${database}`, `
                    <h4>Tables (${tables.length})</h4>
                    <div class="table-list">
                        ${tables.length > 0 
                            ? tables.map(t => `<div class="table-item">${t}</div>`).join('')
                            : '<p class="empty-state">No tables found</p>'
                        }
                    </div>
                `, [
                    { text: 'Close', class: 'btn-secondary' }
                ]);
                showModal(modalHtml);
            }
        } catch (error) {
            showToast('Failed to load database details', 'error');
        }
    }
};
