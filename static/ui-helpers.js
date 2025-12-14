/**
 * UI Helpers - Toast notifications and modal system
 */

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer') || createToastContainer();
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
}

// Modal system
function createModal(title, body, buttons) {
    const buttonsHtml = buttons.map(btn => `
        <button class="btn ${btn.class}" data-action="${btn.text}">${btn.text}</button>
    `).join('');

    // Store handlers globally for event wiring
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
    
    // Wire up button handlers
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
                    showToast('Action failed: ' + e.message, 'error');
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
    document.getElementById('modalContainer').innerHTML = '';
    window._modalButtonHandlers = null;
}

// Utility functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
