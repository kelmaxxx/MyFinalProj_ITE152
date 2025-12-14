/**
 * API Client - Centralized API communication
 */

const API_BASE = 'http://localhost:5000/api';

// Helper to handle fetch with better error handling
async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}

const api = {
    // Database endpoints
    databases: {
        getAll: () => apiFetch(`${API_BASE}/databases`),
        create: (name) => apiFetch(`${API_BASE}/databases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        }),
        delete: (name) => apiFetch(`${API_BASE}/databases/${name}`, {
            method: 'DELETE'
        }),
        getTables: (dbName) => apiFetch(`${API_BASE}/databases/${dbName}/tables`),
        createTable: (dbName, name, columns) => apiFetch(`${API_BASE}/databases/${dbName}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, columns })
        }),
        deleteTable: (dbName, tableName) => apiFetch(`${API_BASE}/databases/${dbName}/tables/${tableName}`, {
            method: 'DELETE'
        }),
        getTableStructure: (dbName, tableName) => 
            apiFetch(`${API_BASE}/databases/${dbName}/tables/${tableName}/structure`)
    },

    // Backup endpoints
    backups: {
        getMetadata: () => apiFetch(`${API_BASE}/backups/metadata`),
        getStats: () => apiFetch(`${API_BASE}/backups/stats`),
        create: (database, table = null) => apiFetch(`${API_BASE}/backups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ database, table })
        }),
        restore: (filename, target_database = null) => apiFetch(`${API_BASE}/backups/restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, target_database })
        }),
        delete: (filename) => apiFetch(`${API_BASE}/backups/${filename}`, {
            method: 'DELETE'
        })
    },

    // User endpoints
    users: {
        getAll: () => apiFetch(`${API_BASE}/users`),
        create: (username, password, host = 'localhost') => apiFetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, host })
        }),
        delete: (username, host = 'localhost') => 
            apiFetch(`${API_BASE}/users/${username}?host=${host}`, {
                method: 'DELETE'
            }),
        getPrivileges: (username, host = 'localhost') => 
            apiFetch(`${API_BASE}/users/${username}/privileges?host=${host}`),
        grantPrivileges: (username, host, database, privileges) => 
            apiFetch(`${API_BASE}/users/${username}/privileges/grant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, database, privileges })
            }),
        revokePrivileges: (username, host, database, privileges) => 
            apiFetch(`${API_BASE}/users/${username}/privileges/revoke`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, database, privileges })
            })
    }
};
