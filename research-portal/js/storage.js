/**
 * Research Data Storage Module
 * Handles all data persistence using localStorage with structured format
 */

const STORAGE_KEYS = {
    SESSIONS: 'vui_research_sessions',
    CURRENT_SESSION: 'vui_current_session',
    RESPONSES: 'vui_research_responses'
};

// Initialize storage if empty
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESPONSES)) {
        localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify({}));
    }
}

// Session Management
const SessionManager = {
    getAll() {
        const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        return data ? JSON.parse(data) : [];
    },

    get(sessionId) {
        const sessions = this.getAll();
        return sessions.find(s => s.id === sessionId);
    },

    create(sessionData) {
        const sessions = this.getAll();
        const newSession = {
            id: sessionData.participantId,
            project: sessionData.project,
            interfaceOrder: sessionData.order,
            notes: sessionData.notes || '',
            createdAt: new Date().toISOString(),
            status: 'in-progress',
            completedForms: []
        };
        sessions.push(newSession);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        this.setCurrent(newSession.id);
        return newSession;
    },

    update(sessionId, updates) {
        const sessions = this.getAll();
        const index = sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            sessions[index] = { ...sessions[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
            return sessions[index];
        }
        return null;
    },

    delete(sessionId) {
        const sessions = this.getAll().filter(s => s.id !== sessionId);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        // Also delete associated responses
        ResponseManager.deleteForSession(sessionId);
    },

    setCurrent(sessionId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    },

    getCurrent() {
        const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
        return currentId ? this.get(currentId) : null;
    },

    clearCurrent() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    },

    markFormComplete(sessionId, formType) {
        const session = this.get(sessionId);
        if (session && !session.completedForms.includes(formType)) {
            session.completedForms.push(formType);
            this.update(sessionId, { completedForms: session.completedForms });
            
            // Check if all required forms are complete
            this.checkAndMarkComplete(sessionId);
        }
    },

    checkAndMarkComplete(sessionId) {
        const session = this.get(sessionId);
        if (!session || session.status === 'complete') return;
        
        const responses = ResponseManager.getForSession(sessionId);
        
        // Required forms for a complete session
        const requiredForms = [
            'consent',
            session.project + '_pretest',
            session.project + '_sus',
            session.project + '_posttest'
        ];
        
        const allComplete = requiredForms.every(form => responses[form]);
        
        if (allComplete) {
            this.update(sessionId, { 
                status: 'complete',
                completedAt: new Date().toISOString()
            });
        }
    },

    markComplete(sessionId) {
        const session = this.get(sessionId);
        if (session) {
            this.update(sessionId, { 
                status: 'complete',
                completedAt: new Date().toISOString()
            });
        }
    },

    markInProgress(sessionId) {
        const session = this.get(sessionId);
        if (session) {
            this.update(sessionId, { 
                status: 'in-progress',
                completedAt: null
            });
        }
    },

    getStats() {
        const sessions = this.getAll();
        return {
            total: sessions.length,
            goose: sessions.filter(s => s.project === 'goose').length,
            vaia: sessions.filter(s => s.project === 'vaia').length,
            completed: sessions.filter(s => s.status === 'complete').length,
            inProgress: sessions.filter(s => s.status === 'in-progress').length
        };
    }
};

// Response Management
const ResponseManager = {
    getAll() {
        const data = localStorage.getItem(STORAGE_KEYS.RESPONSES);
        return data ? JSON.parse(data) : {};
    },

    getForSession(sessionId) {
        const responses = this.getAll();
        return responses[sessionId] || {};
    },

    getForForm(sessionId, formType) {
        const sessionResponses = this.getForSession(sessionId);
        return sessionResponses[formType] || null;
    },

    save(sessionId, formType, formData) {
        const responses = this.getAll();
        if (!responses[sessionId]) {
            responses[sessionId] = {};
        }
        responses[sessionId][formType] = {
            data: formData,
            submittedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
        
        // Mark form as complete in session
        SessionManager.markFormComplete(sessionId, formType);
        
        return responses[sessionId][formType];
    },

    deleteForSession(sessionId) {
        const responses = this.getAll();
        delete responses[sessionId];
        localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
    },

    exportAll() {
        const sessions = SessionManager.getAll();
        const responses = this.getAll();
        
        return sessions.map(session => ({
            ...session,
            responses: responses[session.id] || {}
        }));
    }
};

// Data Export Functions
const DataExporter = {
    toJSON() {
        const data = {
            exportedAt: new Date().toISOString(),
            sessions: ResponseManager.exportAll()
        };
        return JSON.stringify(data, null, 2);
    },

    toCSV() {
        const sessions = ResponseManager.exportAll();
        const rows = [];
        
        // Build header from all possible fields
        const allFields = new Set(['sessionId', 'project', 'interfaceOrder', 'status', 'createdAt']);
        
        sessions.forEach(session => {
            Object.entries(session.responses || {}).forEach(([formType, formData]) => {
                Object.keys(formData.data || {}).forEach(field => {
                    allFields.add(`${formType}_${field}`);
                });
            });
        });
        
        const headers = Array.from(allFields);
        rows.push(headers.join(','));
        
        // Build data rows
        sessions.forEach(session => {
            const row = headers.map(header => {
                if (header === 'sessionId') return session.id;
                if (header === 'project') return session.project;
                if (header === 'interfaceOrder') return session.interfaceOrder;
                if (header === 'status') return session.status;
                if (header === 'createdAt') return session.createdAt;
                
                // Parse form field
                const [formType, ...fieldParts] = header.split('_');
                const field = fieldParts.join('_');
                const formData = session.responses?.[formType]?.data;
                if (formData && formData[field] !== undefined) {
                    let value = formData[field];
                    if (Array.isArray(value)) value = value.join('; ');
                    if (typeof value === 'string' && value.includes(',')) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }
                return '';
            });
            rows.push(row.join(','));
        });
        
        return rows.join('\n');
    },

    download(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    exportJSON() {
        const data = this.toJSON();
        const date = new Date().toISOString().split('T')[0];
        this.download(data, `vui-research-data-${date}.json`, 'application/json');
    },

    exportCSV() {
        const data = this.toCSV();
        const date = new Date().toISOString().split('T')[0];
        this.download(data, `vui-research-data-${date}.csv`, 'text/csv');
    }
};

// SUS Score Calculator
const SUSCalculator = {
    calculate(responses) {
        // SUS has 10 questions
        // Odd questions (1,3,5,7,9): score - 1
        // Even questions (2,4,6,8,10): 5 - score
        // Total * 2.5 = SUS score
        
        let total = 0;
        for (let i = 1; i <= 10; i++) {
            const score = parseInt(responses[`sus_q${i}`]) || 3;
            if (i % 2 === 1) {
                total += score - 1;
            } else {
                total += 5 - score;
            }
        }
        return Math.round(total * 2.5);
    },

    getGrade(score) {
        if (score >= 90) return { grade: 'A+', label: 'Excellent', color: '#22c55e' };
        if (score >= 80) return { grade: 'A', label: 'Zeer goed', color: '#22c55e' };
        if (score >= 70) return { grade: 'B', label: 'Goed', color: '#84cc16' };
        if (score >= 60) return { grade: 'C', label: 'Matig', color: '#eab308' };
        if (score >= 50) return { grade: 'D', label: 'Ondergemiddeld', color: '#f97316' };
        return { grade: 'F', label: 'Slecht', color: '#ef4444' };
    }
};

// Initialize on load
initStorage();

