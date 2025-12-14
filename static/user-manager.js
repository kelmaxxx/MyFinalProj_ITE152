/**
 * User Manager - Handles user management operations and UI
 */

const UserManager = {
    async loadAndRender() {
        try {
            const data = await api.users.getAll();
            if (data.success) {
                state.users = data.users;
                this.render();
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            showToast('Failed to load users', 'error');
        }
    },

    render() {
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
                    <button class="btn-icon" onclick="UserManager.showPrivilegesModal('${user.username}', '${user.host}')" title="Manage Privileges">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="UserManager.showDeleteModal('${user.username}', '${user.host}')" title="Delete User">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    showCreateModal() {
        const modalHtml = createModal('Create New User', `
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" placeholder="Enter username" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter password" required>
            </div>
            <div class="form-group">
                <label for="host">Host</label>
                <input type="text" id="host" value="localhost" placeholder="Host (default: localhost)">
            </div>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Create', class: 'btn-primary', action: () => this.createUser() }
        ]);
        showModal(modalHtml);
    },

    async createUser() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const host = document.getElementById('host').value.trim() || 'localhost';

        if (!username || !password) {
            showToast('Username and password are required', 'error');
            return;
        }

        try {
            const data = await api.users.create(username, password, host);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                await this.loadAndRender();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to create user', 'error');
        }
    },

    showDeleteModal(username, host) {
        const modalHtml = createModal('Delete User', `
            <p>Are you sure you want to delete user <strong>${username}@${host}</strong>?</p>
            <p class="text-danger">This action cannot be undone!</p>
        `, [
            { text: 'Cancel', class: 'btn-secondary' },
            { text: 'Delete', class: 'btn-danger', action: () => this.deleteUser(username, host) }
        ]);
        showModal(modalHtml);
    },

    async deleteUser(username, host) {
        try {
            const data = await api.users.delete(username, host);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
                await this.loadAndRender();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to delete user', 'error');
        }
    },

    async showPrivilegesModal(username, host) {
        try {
            const data = await api.users.getPrivileges(username, host);
            if (data.success) {
                const privileges = data.privileges;
                const modalHtml = createModal(`Manage Privileges: ${username}@${host}`, `
                    <h4>Current Privileges</h4>
                    <div class="privileges-list">
                        ${privileges.length > 0 
                            ? privileges.map(p => `<div class="privilege-item">${p}</div>`).join('')
                            : '<p class="empty-state">No privileges granted</p>'
                        }
                    </div>
                    <hr>
                    <h4>Grant/Revoke Privileges</h4>
                    <div class="form-group">
                        <label for="privDatabase">Database</label>
                        <input type="text" id="privDatabase" placeholder="Database name" required>
                    </div>
                    <div class="form-group">
                        <label>Privileges (comma-separated)</label>
                        <input type="text" id="privList" placeholder="e.g., SELECT, INSERT, UPDATE" required>
                    </div>
                `, [
                    { text: 'Close', class: 'btn-secondary' },
                    { text: 'Grant', class: 'btn-success', action: () => this.grantPrivileges(username, host) },
                    { text: 'Revoke', class: 'btn-danger', action: () => this.revokePrivileges(username, host) }
                ]);
                showModal(modalHtml);
            }
        } catch (error) {
            showToast('Failed to load privileges', 'error');
        }
    },

    async grantPrivileges(username, host) {
        const database = document.getElementById('privDatabase').value.trim();
        const privList = document.getElementById('privList').value.trim();

        if (!database || !privList) {
            showToast('Database and privileges are required', 'error');
            return;
        }

        const privileges = privList.split(',').map(p => p.trim()).filter(p => p);

        try {
            const data = await api.users.grantPrivileges(username, host, database, privileges);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to grant privileges', 'error');
        }
    },

    async revokePrivileges(username, host) {
        const database = document.getElementById('privDatabase').value.trim();
        const privList = document.getElementById('privList').value.trim();

        if (!database || !privList) {
            showToast('Database and privileges are required', 'error');
            return;
        }

        const privileges = privList.split(',').map(p => p.trim()).filter(p => p);

        try {
            const data = await api.users.revokePrivileges(username, host, database, privileges);
            if (data.success) {
                showToast(data.message, 'success');
                closeModal();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Failed to revoke privileges', 'error');
        }
    }
};
