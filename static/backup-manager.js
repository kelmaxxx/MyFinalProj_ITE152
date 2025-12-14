/**
 * Backup Manager - Handles backup/restore operations and UI
 */

const BackupManager = {
    async loadAndRender() {
        try {
            const data = await api.backups.getMetadata();
            if (data.success) {
                state.backups = data.backups;
                this.render();
            }
        } catch (error) {
            console.error('Failed to load backups:', error);
            showToast('Failed to load backups', 'error');
        }
    },

    render() {
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
                <td>${formatBytes(backup.size)}</td>
                <td>
                    <button class="btn-icon" onclick="BackupManager.showRestoreModal('${backup.filename}')" title="Restore">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="BackupManager.showDeleteModal('${backup.filename}')" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    showRestoreModal(filename) {
        const backup = state.backups.find(b => b.filename === filename);
        const modalHtml = createModal('Restore Backup', `
            <p>Restore from <strong>${filename}</strong>?</p>
            ${backup ? `<p>Original database: <strong>${backup.database}</strong></p>` : ''}
            <div class="form-group">
                <label for="targetDatabase">Target Database (Optional)</label>
                <input type="text" id="targetDatabase" placeholder="Leave empty to use original database" value="${backup?.database || ''}">
            </div>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Restore', class: 'btn-primary', action: () => this.restoreBackup(filename) }
        ]);
        showModal(modalHtml);
    },

    async restoreBackup(filename) {
        const targetDatabase = document.getElementById('targetDatabase').value.trim() || null;
        
        try {
            const data = await api.backups.restore(filename, targetDatabase);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                await updateDashboardStats();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to restore backup', 'error');
        }
    },

    showDeleteModal(filename) {
        const modalHtml = createModal('Delete Backup', `
            <p>Are you sure you want to delete backup <strong>${filename}</strong>?</p>
            <p class="text-danger">This action cannot be undone!</p>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Delete', class: 'btn-danger', action: () => this.deleteBackup(filename) }
        ]);
        showModal(modalHtml);
    },

    async deleteBackup(filename) {
        try {
            const data = await api.backups.delete(filename);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                await this.loadAndRender();
                await updateDashboardStats();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to delete backup', 'error');
        }
    }
};
