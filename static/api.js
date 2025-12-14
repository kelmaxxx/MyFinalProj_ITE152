/**
 * API Client - Centralized API communication
 */

const API_BASE = 'http://localhost:5000/api';

const api = {
    // Database endpoints
    databases: {
        getAll: () => fetch(`${API_BASE}/databases`).then(r => r.json()),
        create: (name) => fetch(`${API_BASE}/databases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        }).then(r => r.json()),
        delete: (name) => fetch(`${API_BASE}/databases/${name}`, {
            method: 'DELETE'
        }).then(r => r.json()),
        getTables: (dbName) => fetch(`${API_BASE}/databases/${dbName}/tables`).then(r => r.json()),
        createTable: (dbName, name, columns) => fetch(`${API_BASE}/databases/${dbName}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, columns })
        }).then(r => r.json()),
        deleteTable: (dbName, tableName) => fetch(`${API_BASE}/databases/${dbName}/tables/${tableName}`, {
            method: 'DELETE'
        }).then(r => r.json()),
        getTableStructure: (dbName, tableName) => 
            fetch(`${API_BASE}/databases/${dbName}/tables/${tableName}/structure`).then(r => r.json())
    },

    // Backup endpoints
    backups: {
        getMetadata: () => fetch(`${API_BASE}/backups/metadata`).then(r => r.json()),
        getStats: () => fetch(`${API_BASE}/backups/stats`).then(r => r.json()),
        create: (database, table = null) => fetch(`${API_BASE}/backups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ database, table })
        }).then(r => r.json()),
        restore: (filename, target_database = null) => fetch(`${API_BASE}/backups/restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, target_database })
        }).then(r => r.json()),
        delete: (filename) => fetch(`${API_BASE}/backups/${filename}`, {
            method: 'DELETE'
        }).then(r => r.json())
    },

    // User endpoints
    users: {
        getAll: () => fetch(`${API_BASE}/users`).then(r => r.json()),
        create: (username, password, host = 'localhost') => fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, host })
        }).then(r => r.json()),
        delete: (username, host = 'localhost') => 
            fetch(`${API_BASE}/users/${username}?host=${host}`, {
                method: 'DELETE'
            }).then(r => r.json()),
        getPrivileges: (username, host = 'localhost') => 
            fetch(`${API_BASE}/users/${username}/privileges?host=${host}`).then(r => r.json()),
        grantPrivileges: (username, host, database, privileges) => 
            fetch(`${API_BASE}/users/${username}/privileges/grant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, database, privileges })
            }).then(r => r.json()),
        revokePrivileges: (username, host, database, privileges) => 
            fetch(`${API_BASE}/users/${username}/privileges/revoke`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, database, privileges })
            }).then(r => r.json())
    }
};
