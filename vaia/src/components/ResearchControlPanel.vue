<template>
  <div class="research-panel" :class="{ 'collapsed': isCollapsed }">
    <!-- Toggle Button -->
    <button class="toggle-btn" @click="isCollapsed = !isCollapsed" title="Research Panel">
      📊
    </button>

    <!-- Panel Content -->
    <div class="panel-content" v-if="!isCollapsed">
      <h3>🔬 Research Control</h3>

      <!-- Session Setup -->
      <div class="section" v-if="!sessionActive">
        <h4>Start Session</h4>
        <div class="input-group">
          <label>Participant ID:</label>
          <input v-model="participantId" placeholder="P001" />
        </div>
        <div class="input-group">
          <label>Interface Order:</label>
          <select v-model="interfaceOrder">
            <option value="VUI_FIRST">VUI First</option>
            <option value="GUI_FIRST">GUI First</option>
          </select>
        </div>
        <button class="btn primary" @click="startSession">▶️ Start Session</button>
      </div>

      <!-- Active Session Controls -->
      <div class="section" v-else>
        <div class="session-info">
          <span class="status recording">● REC</span>
          <span>{{ participantId }}</span>
          <span class="badge">{{ currentInterface }}</span>
        </div>

        <!-- Interface Toggle -->
        <button class="btn secondary" @click="switchInterface">
          🔄 Switch to {{ currentInterface === 'VUI' ? 'GUI' : 'VUI' }}
        </button>

        <!-- Task Controls -->
        <div class="task-section">
          <h4>Tasks</h4>
          <div class="task-list">
            <div 
              v-for="(task, index) in tasks" 
              :key="task.taskId"
              class="task-item"
              :class="{ 
                'active': currentTaskId === task.taskId,
                'completed': completedTasks.includes(task.taskId)
              }"
            >
              <span class="task-number">{{ index + 1 }}</span>
              <span class="task-name">{{ task.taskName }}</span>
              <div class="task-actions">
                <button 
                  v-if="currentTaskId !== task.taskId && !completedTasks.includes(task.taskId)"
                  class="btn-small" 
                  @click="startTask(task.taskId)"
                  title="Start task"
                >▶</button>
                <button 
                  v-if="currentTaskId === task.taskId"
                  class="btn-small success" 
                  @click="completeTask"
                  title="Complete task"
                >✓</button>
                <button 
                  v-if="currentTaskId === task.taskId"
                  class="btn-small danger" 
                  @click="failTask"
                  title="Fail task"
                >✗</button>
                <span v-if="completedTasks.includes(task.taskId)" class="completed-mark">✓</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="btn secondary small" @click="logHelp">❓ Help Requested</button>
          <button class="btn secondary small" @click="addNote">📝 Add Note</button>
        </div>

        <!-- Stats -->
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Interactions:</span>
            <span class="stat-value">{{ interactionCount }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Current Task:</span>
            <span class="stat-value">{{ currentTaskName || '-' }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Duration:</span>
            <span class="stat-value">{{ sessionDuration }}</span>
          </div>
        </div>

        <!-- Session End -->
        <div class="end-section">
          <button class="btn warning" @click="saveSession">💾 Save</button>
          <button class="btn danger" @click="endSession">⏹️ End & Download</button>
        </div>
      </div>

      <!-- Saved Sessions -->
      <div class="section saved-sessions" v-if="savedSessions.length > 0">
        <h4>Saved Sessions ({{ savedSessions.length }})</h4>
        <div class="session-list">
          <div v-for="session in savedSessions" :key="session" class="saved-item">
            <span>{{ formatSessionName(session) }}</span>
            <button class="btn-small" @click="downloadSavedSession(session)">📥</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { researchLogger, PREDEFINED_TASKS } from '@/services/researchDataLogger';

const isCollapsed = ref(true);
const participantId = ref('');
const interfaceOrder = ref<'VUI_FIRST' | 'GUI_FIRST'>('VUI_FIRST');
const sessionActive = ref(false);
const currentInterface = ref<'VUI' | 'GUI'>('VUI');
const currentTaskId = ref<string | null>(null);
const currentTaskName = ref<string | null>(null);
const completedTasks = ref<string[]>([]);
const interactionCount = ref(0);
const sessionStartTime = ref<number>(0);
const sessionDuration = ref('00:00');
const savedSessions = ref<string[]>([]);

const tasks = PREDEFINED_TASKS;

let durationInterval: number | null = null;

onMounted(() => {
  loadSavedSessions();
});

onUnmounted(() => {
  if (durationInterval) {
    clearInterval(durationInterval);
  }
});

function startSession() {
  if (!participantId.value.trim()) {
    alert('Please enter a Participant ID');
    return;
  }

  researchLogger.startSession(participantId.value, interfaceOrder.value);
  sessionActive.value = true;
  currentInterface.value = interfaceOrder.value === 'VUI_FIRST' ? 'VUI' : 'GUI';
  sessionStartTime.value = Date.now();
  completedTasks.value = [];
  currentTaskId.value = null;
  currentTaskName.value = null;

  // Start duration timer
  durationInterval = window.setInterval(updateDuration, 1000);
  
  console.log('Research session started');
}

function switchInterface() {
  researchLogger.switchInterface();
  currentInterface.value = currentInterface.value === 'VUI' ? 'GUI' : 'VUI';
}

function startTask(taskId: string) {
  researchLogger.startTask(taskId);
  currentTaskId.value = taskId;
  const task = tasks.find(t => t.taskId === taskId);
  currentTaskName.value = task?.taskName || null;
  updateInteractionCount();
}

function completeTask() {
  if (currentTaskId.value) {
    researchLogger.endTask('COMPLETE');
    completedTasks.value.push(currentTaskId.value);
    currentTaskId.value = null;
    currentTaskName.value = null;
    updateInteractionCount();
  }
}

function failTask() {
  if (currentTaskId.value) {
    researchLogger.endTask('FAILED');
    completedTasks.value.push(currentTaskId.value);
    currentTaskId.value = null;
    currentTaskName.value = null;
    updateInteractionCount();
  }
}

function logHelp() {
  researchLogger.logHelpRequest();
  updateInteractionCount();
}

function addNote() {
  const note = prompt('Enter observation note:');
  if (note) {
    researchLogger.addTaskNote(note);
  }
}

function saveSession() {
  researchLogger.saveToLocalStorage();
  loadSavedSessions();
  alert('Session saved to browser storage');
}

function endSession() {
  if (confirm('End session and download data?')) {
    researchLogger.endSession();
    researchLogger.downloadJSON();
    researchLogger.downloadTasksCSV();
    
    // Reset UI
    sessionActive.value = false;
    if (durationInterval) {
      clearInterval(durationInterval);
    }
    
    researchLogger.reset();
  }
}

function updateDuration() {
  if (!sessionStartTime.value) return;
  
  const elapsed = Math.floor((Date.now() - sessionStartTime.value) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  sessionDuration.value = `${minutes}:${seconds}`;
  
  updateInteractionCount();
}

function updateInteractionCount() {
  const info = researchLogger.getSessionInfo();
  interactionCount.value = info.interactions;
}

function loadSavedSessions() {
  savedSessions.value = researchLogger.getSavedSessions();
}

function formatSessionName(sessionKey: string): string {
  // Extract participant ID and timestamp from key
  const parts = sessionKey.replace('research_session_session_', '').split('_');
  if (parts.length >= 2) {
    return `${parts[0]} - ${new Date(parseInt(parts[1])).toLocaleDateString()}`;
  }
  return sessionKey;
}

function downloadSavedSession(sessionKey: string) {
  const session = researchLogger.loadFromLocalStorage(sessionKey);
  if (session) {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionKey}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Expose methods for external control
defineExpose({
  startSession,
  startTask,
  completeTask,
  failTask,
  endSession
});
</script>

<style scoped>
.research-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
}

.research-panel.collapsed {
  width: auto;
}

.toggle-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #1a1a2e;
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, background 0.2s;
}

.toggle-btn:hover {
  transform: scale(1.1);
  background: #16213e;
}

.panel-content {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  background: #1a1a2e;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: #fff;
}

h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #00d9ff;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
}

h4 {
  margin: 12px 0 8px 0;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section {
  margin-bottom: 16px;
}

.input-group {
  margin-bottom: 8px;
}

.input-group label {
  display: block;
  margin-bottom: 4px;
  color: #aaa;
  font-size: 11px;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #0f0f23;
  color: #fff;
  font-size: 13px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-bottom: 8px;
}

.btn.primary {
  background: linear-gradient(135deg, #00d9ff, #0099ff);
  color: #000;
}

.btn.secondary {
  background: #2a2a4a;
  color: #fff;
}

.btn.warning {
  background: #f39c12;
  color: #000;
}

.btn.danger {
  background: #e74c3c;
  color: #fff;
}

.btn.small {
  padding: 6px 12px;
  font-size: 11px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-small {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: #333;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}

.btn-small.success {
  background: #27ae60;
}

.btn-small.danger {
  background: #e74c3c;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 8px;
  background: #0f0f23;
  border-radius: 6px;
}

.status {
  font-size: 10px;
  font-weight: bold;
}

.status.recording {
  color: #e74c3c;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.badge {
  background: #00d9ff;
  color: #000;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.task-section {
  margin: 16px 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #0f0f23;
  border-radius: 6px;
  border: 1px solid transparent;
}

.task-item.active {
  border-color: #00d9ff;
  background: #1a2a4a;
}

.task-item.completed {
  opacity: 0.6;
}

.task-number {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
}

.task-name {
  flex: 1;
  font-size: 12px;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.completed-mark {
  color: #27ae60;
  font-weight: bold;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.quick-actions .btn {
  flex: 1;
  margin: 0;
}

.stats {
  background: #0f0f23;
  border-radius: 6px;
  padding: 10px;
  margin: 12px 0;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #222;
}

.stat:last-child {
  border-bottom: none;
}

.stat-label {
  color: #888;
  font-size: 11px;
}

.stat-value {
  color: #00d9ff;
  font-weight: 500;
}

.end-section {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.end-section .btn {
  flex: 1;
  margin: 0;
}

.saved-sessions {
  border-top: 1px solid #333;
  padding-top: 12px;
  margin-top: 16px;
}

.session-list {
  max-height: 100px;
  overflow-y: auto;
}

.saved-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #0f0f23;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 11px;
}
</style>




