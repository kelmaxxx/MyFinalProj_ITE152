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

    async showBackupModal(database) {
        try {
            // Get tables for the database
            const data = await api.databases.getTables(database);
            if (data.success) {
                const tables = data.tables;
                const modalHtml = createModal('Backup Database', `
                    <p>Create a backup of <strong>${database}</strong>?</p>
                    <div class="form-group">
                        <label for="backupTable">Specific Table (Optional)</label>
                        <select id="backupTable" class="form-select">
                            <option value="">-- Full Database Backup --</option>
                            ${tables.map(table => `<option value="${table}">${table}</option>`).join('')}
                        </select>
                        ${tables.length === 0 ? '<small class="form-hint">No tables found in this database</small>' : ''}
                    </div>
                `, [
                    { text: 'Cancel', class: 'btn-secondary' },
                    { text: 'Backup', class: 'btn-primary', action: () => this.createBackup(database) }
                ]);
                showModal(modalHtml);
            }
        } catch (error) {
            showToast('Failed to load tables', 'error');
        }
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
                    <div class="database-details-header">
                        <h4>Tables (${tables.length})</h4>
                        <button class="btn btn-primary btn-sm" onclick="DatabaseManager.showCreateTableModal('${database}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 4px;">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Table
                        </button>
                    </div>
                    <div class="table-list">
                        ${tables.length > 0 
                            ? tables.map(t => `
                                <div class="table-item">
                                    <span>${t}</span>
                                    <button class="btn-icon btn-icon-sm" onclick="DatabaseManager.showDeleteTableModal('${database}', '${t}')" title="Delete Table">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            `).join('')
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
    },

    showCreateTableModal(database) {
        const modalHtml = createModal('Create New Table', `
            <div class="form-group">
                <label for="tableName">Table Name</label>
                <input type="text" id="tableName" placeholder="Enter table name" required>
            </div>
            <div class="form-group">
                <label>Columns</label>
                <div id="columnsContainer">
                    <div class="column-row">
                        <input type="text" class="column-name" placeholder="Column name" required>
                        <select class="column-type">
                            <option value="INT">INT</option>
                            <option value="VARCHAR(255)">VARCHAR(255)</option>
                            <option value="TEXT">TEXT</option>
                            <option value="DATE">DATE</option>
                            <option value="DATETIME">DATETIME</option>
                            <option value="BOOLEAN">BOOLEAN</option>
                            <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                            <option value="FLOAT">FLOAT</option>
                        </select>
                        <button type="button" class="btn-icon btn-remove-column" onclick="DatabaseManager.removeColumn(this)" disabled title="Remove Column">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="DatabaseManager.addColumn()" style="margin-top: 0.5rem;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 4px;">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Column
                </button>
            </div>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Create', class: 'btn-primary', action: () => this.createTableInDatabase(database) }
        ]);
        showModal(modalHtml);
    },

    addColumn() {
        const container = document.getElementById('columnsContainer');
        const columnRow = document.createElement('div');
        columnRow.className = 'column-row';
        columnRow.innerHTML = `
            <input type="text" class="column-name" placeholder="Column name" required>
            <select class="column-type">
                <option value="INT">INT</option>
                <option value="VARCHAR(255)">VARCHAR(255)</option>
                <option value="TEXT">TEXT</option>
                <option value="DATE">DATE</option>
                <option value="DATETIME">DATETIME</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                <option value="FLOAT">FLOAT</option>
            </select>
            <button type="button" class="btn-icon btn-remove-column" onclick="DatabaseManager.removeColumn(this)" title="Remove Column">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        container.appendChild(columnRow);
        this.updateRemoveButtons();
    },

    removeColumn(button) {
        const columnRow = button.closest('.column-row');
        columnRow.remove();
        this.updateRemoveButtons();
    },

    updateRemoveButtons() {
        const rows = document.querySelectorAll('.column-row');
        rows.forEach((row, index) => {
            const removeBtn = row.querySelector('.btn-remove-column');
            if (rows.length === 1) {
                removeBtn.disabled = true;
            } else {
                removeBtn.disabled = false;
            }
        });
    },

    async createTableInDatabase(database) {
        const tableName = document.getElementById('tableName').value.trim();
        if (!tableName) {
            showToast('Please enter a table name', 'error');
            return;
        }

        const columnRows = document.querySelectorAll('.column-row');
        const columns = [];
        
        for (let row of columnRows) {
            const name = row.querySelector('.column-name').value.trim();
            const type = row.querySelector('.column-type').value;
            
            if (!name) {
                showToast('All columns must have a name', 'error');
                return;
            }
            
            columns.push({ name, type });
        }

        if (columns.length === 0) {
            showToast('Please add at least one column', 'error');
            return;
        }

        try {
            const data = await api.databases.createTable(database, tableName, columns);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                // Refresh the details modal to show the new table
                await this.showDetailsModal(database);
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to create table', 'error');
        }
    },

    showDeleteTableModal(database, table) {
        const modalHtml = createModal('Delete Table', `
            <p>Are you sure you want to delete the table <strong>${table}</strong> from database <strong>${database}</strong>?</p>
            <p class="text-danger">This action cannot be undone!</p>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Delete', class: 'btn-danger', action: () => this.deleteTable(database, table) }
        ]);
        showModal(modalHtml);
    },

    async deleteTable(database, table) {
        try {
            const data = await api.databases.deleteTable(database, table);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                // Refresh the details modal to show updated table list
                await this.showDetailsModal(database);
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to delete table', 'error');
        }
    }
};
