/**
 * Main Application Logic
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    updateCurrentParticipant();
});

// Dashboard Updates
function updateDashboard() {
    const stats = SessionManager.getStats();
    
    // Update stat cards if they exist
    const gooseCount = document.getElementById('gooseCount');
    const vaiaCount = document.getElementById('vaiaCount');
    const totalParticipants = document.getElementById('totalParticipants');
    const completedSessions = document.getElementById('completedSessions');
    
    if (gooseCount) gooseCount.textContent = stats.goose;
    if (vaiaCount) vaiaCount.textContent = stats.vaia;
    if (totalParticipants) totalParticipants.textContent = stats.total;
    if (completedSessions) completedSessions.textContent = stats.completed;
    
    // Update recent sessions
    updateRecentSessions();
}

function updateRecentSessions() {
    const container = document.getElementById('recentSessions');
    if (!container) return;
    
    const sessions = SessionManager.getAll().slice(-5).reverse();
    
    if (sessions.length === 0) {
        container.innerHTML = '<p class="empty-state">Nog geen sessies gestart</p>';
        return;
    }
    
    container.innerHTML = sessions.map(session => {
        const date = new Date(session.createdAt).toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="session-item">
                <div class="session-info">
                    <span class="session-id">${session.id}</span>
                    <span class="session-project ${session.project}">${session.project === 'goose' ? '🪿 Goose' : '📚 VAIA'}</span>
                </div>
                <div>
                    <span class="session-date">${date}</span>
                    <span class="session-status ${session.status}">${session.status === 'complete' ? 'Voltooid' : 'Bezig'}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateCurrentParticipant() {
    const badge = document.getElementById('currentParticipant');
    if (!badge) return;
    
    const current = SessionManager.getCurrent();
    if (current) {
        badge.textContent = `${current.project === 'goose' ? '🪿' : '📚'} ${current.id}`;
        badge.classList.add('active');
    } else {
        badge.textContent = 'Geen deelnemer geselecteerd';
        badge.classList.remove('active');
    }
}

// Modal Functions
function openNewSession() {
    const modal = document.getElementById('newSessionModal');
    if (modal) modal.classList.add('open');
}

function closeModal() {
    const modal = document.getElementById('newSessionModal');
    if (modal) modal.classList.remove('open');
}

function createSession(event) {
    event.preventDefault();
    
    const form = event.target;
    const sessionData = {
        participantId: form.participantId.value.trim(),
        project: form.project.value,
        order: form.order.value,
        notes: form.sessionNotes?.value || ''
    };
    
    // Check if ID already exists
    if (SessionManager.get(sessionData.participantId)) {
        alert('Een sessie met dit Deelnemer ID bestaat al. Kies een ander ID.');
        return;
    }
    
    SessionManager.create(sessionData);
    closeModal();
    form.reset();
    updateDashboard();
    updateCurrentParticipant();
    
    // Show success message
    showNotification(`Sessie gestart voor ${sessionData.participantId}`, 'success');
    
    // Redirect to appropriate pre-test
    setTimeout(() => {
        const url = sessionData.project === 'goose' 
            ? 'pages/goose/pre-test.html' 
            : 'pages/vaia/pre-test.html';
        window.location.href = url;
    }, 1000);
}

// Data Export
function exportAllData(format) {
    if (format === 'json') {
        DataExporter.exportJSON();
    } else if (format === 'csv') {
        DataExporter.exportCSV();
    }
    showNotification('Data geëxporteerd!', 'success');
}

function clearAllData() {
    if (confirm('Weet u zeker dat u ALLE data wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
        if (confirm('Dit is uw laatste kans. Alle sessies en antwoorden worden permanent verwijderd.')) {
            localStorage.removeItem(STORAGE_KEYS.SESSIONS);
            localStorage.removeItem(STORAGE_KEYS.RESPONSES);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
            initStorage();
            updateDashboard();
            updateCurrentParticipant();
            showNotification('Alle data is gewist', 'info');
        }
    }
}

// Form Handling
function initForm(formType, project) {
    const current = SessionManager.getCurrent();
    
    // Show participant info
    const participantInfo = document.getElementById('participantInfo');
    if (participantInfo && current) {
        participantInfo.innerHTML = `
            <strong>Deelnemer:</strong> ${current.id} | 
            <strong>Project:</strong> ${current.project === 'goose' ? '🪿 Goose' : '📚 VAIA'} |
            <strong>Volgorde:</strong> ${current.interfaceOrder === 'vui-first' ? 'VUI → GUI' : 'GUI → VUI'}
        `;
    }
    
    // Load saved responses if any
    if (current) {
        const saved = ResponseManager.getForForm(current.id, formType);
        if (saved) {
            loadFormData(saved.data);
        }
    }
    
    // Setup auto-save
    const form = document.getElementById('researchForm');
    if (form) {
        form.addEventListener('change', () => autoSaveForm(formType));
    }
}

function loadFormData(data) {
    Object.entries(data).forEach(([name, value]) => {
        const elements = document.getElementsByName(name);
        elements.forEach(el => {
            if (el.type === 'radio' || el.type === 'checkbox') {
                el.checked = Array.isArray(value) ? value.includes(el.value) : el.value === value;
            } else {
                el.value = value;
            }
        });
    });
}

function autoSaveForm(formType) {
    const current = SessionManager.getCurrent();
    if (!current) return;
    
    const form = document.getElementById('researchForm');
    if (!form) return;
    
    const formData = collectFormData(form);
    
    // Save as draft (don't mark complete)
    const responses = ResponseManager.getAll();
    if (!responses[current.id]) {
        responses[current.id] = {};
    }
    responses[current.id][formType + '_draft'] = {
        data: formData,
        savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
}

function collectFormData(form) {
    const formData = {};
    const elements = form.elements;
    
    for (let el of elements) {
        if (!el.name) continue;
        
        if (el.type === 'radio') {
            if (el.checked) formData[el.name] = el.value;
        } else if (el.type === 'checkbox') {
            if (!formData[el.name]) formData[el.name] = [];
            if (el.checked) formData[el.name].push(el.value);
        } else {
            formData[el.name] = el.value;
        }
    }
    
    return formData;
}

function submitForm(event, formType, nextUrl) {
    event.preventDefault();
    
    const current = SessionManager.getCurrent();
    if (!current) {
        alert('Geen actieve sessie gevonden. Start eerst een nieuwe sessie.');
        window.location.href = '../../index.html';
        return;
    }
    
    const form = event.target;
    const formData = collectFormData(form);
    
    // Validate required fields
    const requiredMissing = [];
    form.querySelectorAll('[required]').forEach(el => {
        if (el.type === 'radio') {
            const group = form.querySelectorAll(`[name="${el.name}"]`);
            const anyChecked = Array.from(group).some(r => r.checked);
            if (!anyChecked && !requiredMissing.includes(el.name)) {
                requiredMissing.push(el.name);
            }
        } else if (!el.value.trim()) {
            requiredMissing.push(el.name);
        }
    });
    
    if (requiredMissing.length > 0) {
        alert('Vul alle verplichte velden in voordat u doorgaat.');
        return;
    }
    
    // Calculate SUS score if applicable
    if (formType.includes('sus')) {
        const susVuiScore = calculateSUSFromForm(formData, 'vui');
        const susGuiScore = calculateSUSFromForm(formData, 'gui');
        if (susVuiScore !== null) formData.sus_vui_score = susVuiScore;
        if (susGuiScore !== null) formData.sus_gui_score = susGuiScore;
    }
    
    // Save response
    ResponseManager.save(current.id, formType, formData);
    
    showNotification('Antwoorden opgeslagen!', 'success');
    
    // Navigate to next form or back to dashboard
    setTimeout(() => {
        window.location.href = nextUrl || '../../index.html';
    }, 500);
}

function calculateSUSFromForm(formData, prefix) {
    let total = 0;
    let hasData = false;
    
    for (let i = 1; i <= 10; i++) {
        const key = `sus_${prefix}_q${i}`;
        const score = parseInt(formData[key]);
        if (isNaN(score)) continue;
        
        hasData = true;
        if (i % 2 === 1) {
            total += score - 1;
        } else {
            total += 5 - score;
        }
    }
    
    return hasData ? Math.round(total * 2.5) : null;
}

// Notifications
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            .notification-success { background: #22c55e; color: white; }
            .notification-error { background: #ef4444; color: white; }
            .notification-info { background: #3b82f6; color: white; }
            .notification button {
                background: none;
                border: none;
                color: inherit;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.7;
            }
            .notification button:hover { opacity: 1; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => notification.remove(), 4000);
}

// Navigation helpers
function goBack() {
    window.history.back();
}

function goToDashboard() {
    window.location.href = '../../index.html';
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});



