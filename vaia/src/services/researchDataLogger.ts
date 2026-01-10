/**
 * Research Data Logger for VAIA VUI Testing
 * 
 * Logs all interactions, task completions, and metrics for research analysis.
 * Supports both VUI and GUI mode comparison.
 */

// ============ Interfaces ============

export interface ParticipantInfo {
  participantId: string;
  age?: string;
  gender?: string;
  techExperience?: string;
  voiceAssistantExperience?: string;
}

export interface TaskDefinition {
  taskId: string;
  taskName: string;
  description: string;
  successCriteria: string[];
}

export interface TaskLog {
  taskId: string;
  taskName: string;
  interface: 'VUI' | 'GUI';
  startTime: string;
  endTime: string | null;
  duration_ms: number;
  status: 'IN_PROGRESS' | 'COMPLETE' | 'PARTIAL' | 'FAILED' | 'SKIPPED';
  errorCount: number;
  correctionCount: number;
  commandCount: number;
  helpRequested: boolean;
  notes: string[];
}

export interface InteractionLog {
  timestamp: string;
  sessionTime_ms: number;
  type: 'voice_command' | 'voice_input' | 'click' | 'type' | 'navigation' | 'selection' | 'ai_edit' | 'error' | 'system';
  action: string;
  fieldId?: string;
  fieldName?: string;
  value?: string;
  previousValue?: string;
  success: boolean;
  error?: string;
  duration_ms?: number;
  recognitionConfidence?: number;
}

export interface VoiceRecognitionLog {
  timestamp: string;
  transcript: string;
  confidence?: number;
  isFinal: boolean;
  parsedCommand?: string;
  wasUnderstood: boolean;
  error?: string;
}

export interface TestSession {
  sessionId: string;
  participant: ParticipantInfo;
  testDate: string;
  interfaceOrder: 'VUI_FIRST' | 'GUI_FIRST';
  currentInterface: 'VUI' | 'GUI';
  startTime: string;
  endTime: string | null;
  tasks: TaskLog[];
  interactions: InteractionLog[];
  voiceRecognitions: VoiceRecognitionLog[];
  metadata: {
    browser: string;
    platform: string;
    screenSize: string;
    microphoneUsed?: string;
  };
}

export interface ResearchMetrics {
  totalTaskTime_VUI: number;
  totalTaskTime_GUI: number;
  avgTaskTime_VUI: number;
  avgTaskTime_GUI: number;
  errorRate_VUI: number;
  errorRate_GUI: number;
  successRate_VUI: number;
  successRate_GUI: number;
  commandsPerTask_VUI: number;
  recognitionErrorRate: number;
  correctionRate_VUI: number;
  correctionRate_GUI: number;
}

// ============ Task Definitions ============

export const PREDEFINED_TASKS: TaskDefinition[] = [
  {
    taskId: 'task_1_basic_info',
    taskName: 'Basisinformatie invullen',
    description: 'Vul titel, ondertitel en link in',
    successCriteria: ['courseTitle filled', 'courseSubtitle filled', 'courseLink filled']
  },
  {
    taskId: 'task_2_datetime',
    taskName: 'Datum en tijd instellen',
    description: 'Stel startdatum, einddatum en starttijd in',
    successCriteria: ['startDate filled', 'endDate filled', 'startTime filled']
  },
  {
    taskId: 'task_3_dropdown',
    taskName: 'Dropdown selectie',
    description: 'Selecteer kennisniveau, taal en certificaat',
    successCriteria: ['level selected', 'language selected', 'certificate selected']
  },
  {
    taskId: 'task_4_navigation',
    taskName: 'Navigatie en correctie',
    description: 'Navigeer en pas titel aan',
    successCriteria: ['navigated to title', 'title modified', 'navigated to next']
  },
  {
    taskId: 'task_5_ai',
    taskName: 'AI-suggestie gebruiken',
    description: 'Gebruik AI-functie voor bewerking of suggestie',
    successCriteria: ['AI command used', 'suggestion processed']
  }
];

// ============ Research Data Logger Class ============

class ResearchDataLogger {
  private session: TestSession | null = null;
  private currentTask: TaskLog | null = null;
  private sessionStartTime: number = 0;
  private isRecording: boolean = false;

  // ============ Session Management ============

  /**
   * Start a new research session
   */
  startSession(
    participantId: string, 
    interfaceOrder: 'VUI_FIRST' | 'GUI_FIRST',
    participantInfo?: Partial<ParticipantInfo>
  ): void {
    this.sessionStartTime = Date.now();
    
    this.session = {
      sessionId: `session_${participantId}_${Date.now()}`,
      participant: {
        participantId,
        ...participantInfo
      },
      testDate: new Date().toISOString(),
      interfaceOrder,
      currentInterface: interfaceOrder === 'VUI_FIRST' ? 'VUI' : 'GUI',
      startTime: new Date().toISOString(),
      endTime: null,
      tasks: [],
      interactions: [],
      voiceRecognitions: [],
      metadata: {
        browser: this.getBrowserInfo(),
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    this.isRecording = true;
    console.log(`📊 Research session started: ${this.session.sessionId}`);
  }

  /**
   * End the current session
   */
  endSession(): TestSession | null {
    if (!this.session) return null;

    // End any ongoing task
    if (this.currentTask) {
      this.endTask('PARTIAL');
    }

    this.session.endTime = new Date().toISOString();
    this.isRecording = false;

    console.log(`📊 Research session ended. Total interactions: ${this.session.interactions.length}`);
    return this.session;
  }

  /**
   * Switch interface mode (VUI <-> GUI)
   */
  switchInterface(): void {
    if (!this.session) return;
    
    this.session.currentInterface = this.session.currentInterface === 'VUI' ? 'GUI' : 'VUI';
    
    this.logInteraction({
      type: 'system',
      action: 'interface_switch',
      value: this.session.currentInterface,
      success: true
    });

    console.log(`📊 Switched to ${this.session.currentInterface} mode`);
  }

  // ============ Task Management ============

  /**
   * Start a predefined task
   */
  startTask(taskId: string): void {
    if (!this.session) {
      console.warn('No active session. Call startSession() first.');
      return;
    }

    // End previous task if any
    if (this.currentTask) {
      this.endTask('PARTIAL');
    }

    const taskDef = PREDEFINED_TASKS.find(t => t.taskId === taskId);
    
    this.currentTask = {
      taskId,
      taskName: taskDef?.taskName || taskId,
      interface: this.session.currentInterface,
      startTime: new Date().toISOString(),
      endTime: null,
      duration_ms: 0,
      status: 'IN_PROGRESS',
      errorCount: 0,
      correctionCount: 0,
      commandCount: 0,
      helpRequested: false,
      notes: []
    };

    this.logInteraction({
      type: 'system',
      action: 'task_start',
      value: taskId,
      success: true
    });

    console.log(`📊 Task started: ${this.currentTask.taskName}`);
  }

  /**
   * End the current task with a status
   */
  endTask(status: 'COMPLETE' | 'PARTIAL' | 'FAILED' | 'SKIPPED'): void {
    if (!this.session || !this.currentTask) return;

    this.currentTask.endTime = new Date().toISOString();
    this.currentTask.duration_ms = new Date(this.currentTask.endTime).getTime() - 
                                    new Date(this.currentTask.startTime).getTime();
    this.currentTask.status = status;

    this.session.tasks.push({ ...this.currentTask });

    this.logInteraction({
      type: 'system',
      action: 'task_end',
      value: `${this.currentTask.taskId}: ${status}`,
      success: status === 'COMPLETE'
    });

    console.log(`📊 Task ended: ${this.currentTask.taskName} - ${status} (${this.currentTask.duration_ms}ms)`);
    this.currentTask = null;
  }

  // ============ Interaction Logging ============

  /**
   * Log a generic interaction
   */
  logInteraction(data: Partial<InteractionLog>): void {
    if (!this.session || !this.isRecording) return;

    const interaction: InteractionLog = {
      timestamp: new Date().toISOString(),
      sessionTime_ms: Date.now() - this.sessionStartTime,
      type: data.type || 'system',
      action: data.action || 'unknown',
      success: data.success ?? true,
      ...data
    };

    this.session.interactions.push(interaction);

    // Update task counters
    if (this.currentTask) {
      if (data.type === 'voice_command' || data.type === 'voice_input') {
        this.currentTask.commandCount++;
      }
      if (!data.success && data.type === 'error') {
        this.currentTask.errorCount++;
      }
    }
  }

  /**
   * Log a voice command
   */
  logVoiceCommand(command: string, transcript: string, success: boolean, fieldId?: string): void {
    this.logInteraction({
      type: 'voice_command',
      action: command,
      value: transcript,
      fieldId,
      success
    });
  }

  /**
   * Log voice input (text dictation)
   */
  logVoiceInput(fieldId: string, value: string, previousValue?: string): void {
    this.logInteraction({
      type: 'voice_input',
      action: 'dictate',
      fieldId,
      value,
      previousValue,
      success: true
    });
  }

  /**
   * Log a click event
   */
  logClick(elementId: string, elementType: string): void {
    this.logInteraction({
      type: 'click',
      action: 'click',
      fieldId: elementId,
      value: elementType,
      success: true
    });
  }

  /**
   * Log typing event
   */
  logTyping(fieldId: string, value: string, previousValue?: string): void {
    this.logInteraction({
      type: 'type',
      action: 'keyboard_input',
      fieldId,
      value,
      previousValue,
      success: true
    });
  }

  /**
   * Log navigation event
   */
  logNavigation(fromField: string | null, toField: string, method: 'voice' | 'click' | 'tab'): void {
    this.logInteraction({
      type: 'navigation',
      action: `navigate_${method}`,
      fieldId: toField,
      previousValue: fromField || undefined,
      success: true
    });
  }

  /**
   * Log selection event (dropdown, checkbox)
   */
  logSelection(fieldId: string, selectedValue: string, selectionType: 'dropdown' | 'checkbox' | 'radio'): void {
    this.logInteraction({
      type: 'selection',
      action: `select_${selectionType}`,
      fieldId,
      value: selectedValue,
      success: true
    });
  }

  /**
   * Log AI edit operation
   */
  logAIEdit(fieldId: string, instruction: string, originalValue: string, editedValue: string, success: boolean): void {
    this.logInteraction({
      type: 'ai_edit',
      action: 'ai_edit',
      fieldId,
      value: editedValue,
      previousValue: originalValue,
      success,
      duration_ms: undefined // Could track API response time
    });

    // Also log the instruction separately
    this.logInteraction({
      type: 'voice_command',
      action: 'edit_instruction',
      value: instruction,
      success
    });
  }

  /**
   * Log an error
   */
  logError(errorType: string, errorMessage: string, fieldId?: string): void {
    if (this.currentTask) {
      this.currentTask.errorCount++;
    }

    this.logInteraction({
      type: 'error',
      action: errorType,
      error: errorMessage,
      fieldId,
      success: false
    });
  }

  /**
   * Log a correction (user fixing a mistake)
   */
  logCorrection(fieldId: string, originalValue: string, correctedValue: string): void {
    if (this.currentTask) {
      this.currentTask.correctionCount++;
    }

    this.logInteraction({
      type: 'voice_input',
      action: 'correction',
      fieldId,
      value: correctedValue,
      previousValue: originalValue,
      success: true
    });
  }

  /**
   * Log voice recognition result
   */
  logVoiceRecognition(
    transcript: string, 
    isFinal: boolean, 
    confidence?: number,
    parsedCommand?: string,
    wasUnderstood: boolean = true,
    error?: string
  ): void {
    if (!this.session) return;

    this.session.voiceRecognitions.push({
      timestamp: new Date().toISOString(),
      transcript,
      confidence,
      isFinal,
      parsedCommand,
      wasUnderstood,
      error
    });

    if (!wasUnderstood) {
      this.logError('recognition_not_understood', `Transcript not understood: ${transcript}`);
    }
  }

  /**
   * Log help request
   */
  logHelpRequest(): void {
    if (this.currentTask) {
      this.currentTask.helpRequested = true;
    }

    this.logInteraction({
      type: 'system',
      action: 'help_requested',
      success: true
    });
  }

  /**
   * Add a note to current task
   */
  addTaskNote(note: string): void {
    if (this.currentTask) {
      this.currentTask.notes.push(`[${new Date().toISOString()}] ${note}`);
    }
  }

  // ============ Metrics Calculation ============

  /**
   * Calculate research metrics from session data
   */
  calculateMetrics(): ResearchMetrics | null {
    if (!this.session) return null;

    const vuiTasks = this.session.tasks.filter(t => t.interface === 'VUI');
    const guiTasks = this.session.tasks.filter(t => t.interface === 'GUI');

    const totalVUI = vuiTasks.reduce((sum, t) => sum + t.duration_ms, 0);
    const totalGUI = guiTasks.reduce((sum, t) => sum + t.duration_ms, 0);

    const errorsVUI = vuiTasks.reduce((sum, t) => sum + t.errorCount, 0);
    const errorsGUI = guiTasks.reduce((sum, t) => sum + t.errorCount, 0);

    const successVUI = vuiTasks.filter(t => t.status === 'COMPLETE').length;
    const successGUI = guiTasks.filter(t => t.status === 'COMPLETE').length;

    const commandsVUI = vuiTasks.reduce((sum, t) => sum + t.commandCount, 0);
    const correctionsVUI = vuiTasks.reduce((sum, t) => sum + t.correctionCount, 0);
    const correctionsGUI = guiTasks.reduce((sum, t) => sum + t.correctionCount, 0);

    const recognitionErrors = this.session.voiceRecognitions.filter(r => !r.wasUnderstood).length;
    const totalRecognitions = this.session.voiceRecognitions.length;

    return {
      totalTaskTime_VUI: totalVUI,
      totalTaskTime_GUI: totalGUI,
      avgTaskTime_VUI: vuiTasks.length > 0 ? totalVUI / vuiTasks.length : 0,
      avgTaskTime_GUI: guiTasks.length > 0 ? totalGUI / guiTasks.length : 0,
      errorRate_VUI: vuiTasks.length > 0 ? errorsVUI / vuiTasks.length : 0,
      errorRate_GUI: guiTasks.length > 0 ? errorsGUI / guiTasks.length : 0,
      successRate_VUI: vuiTasks.length > 0 ? successVUI / vuiTasks.length : 0,
      successRate_GUI: guiTasks.length > 0 ? successGUI / guiTasks.length : 0,
      commandsPerTask_VUI: vuiTasks.length > 0 ? commandsVUI / vuiTasks.length : 0,
      recognitionErrorRate: totalRecognitions > 0 ? recognitionErrors / totalRecognitions : 0,
      correctionRate_VUI: vuiTasks.length > 0 ? correctionsVUI / vuiTasks.length : 0,
      correctionRate_GUI: guiTasks.length > 0 ? correctionsGUI / guiTasks.length : 0
    };
  }

  // ============ Export Functions ============

  /**
   * Get session as JSON string
   */
  exportJSON(): string {
    if (!this.session) return '{}';

    const exportData = {
      ...this.session,
      metrics: this.calculateMetrics(),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Download session data as JSON file
   */
  downloadJSON(filename?: string): void {
    const data = this.exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `research-data-${this.session?.participant.participantId || 'unknown'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📊 Research data downloaded');
  }

  /**
   * Export as CSV (for quick analysis)
   */
  exportTasksCSV(): string {
    if (!this.session) return '';

    const headers = [
      'taskId', 'taskName', 'interface', 'duration_ms', 'status', 
      'errorCount', 'correctionCount', 'commandCount', 'helpRequested'
    ].join(',');

    const rows = this.session.tasks.map(task => [
      task.taskId,
      `"${task.taskName}"`,
      task.interface,
      task.duration_ms,
      task.status,
      task.errorCount,
      task.correctionCount,
      task.commandCount,
      task.helpRequested
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  /**
   * Download tasks as CSV
   */
  downloadTasksCSV(): void {
    const csv = this.exportTasksCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${this.session?.participant.participantId || 'unknown'}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Save to localStorage (backup)
   */
  saveToLocalStorage(): void {
    if (!this.session) return;
    
    try {
      const key = `research_session_${this.session.sessionId}`;
      localStorage.setItem(key, this.exportJSON());
      console.log(`📊 Session saved to localStorage: ${key}`);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  /**
   * Get all saved sessions from localStorage
   */
  getSavedSessions(): string[] {
    const sessions: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('research_session_')) {
        sessions.push(key);
      }
    }
    return sessions;
  }

  /**
   * Load a session from localStorage
   */
  loadFromLocalStorage(sessionKey: string): TestSession | null {
    try {
      const data = localStorage.getItem(sessionKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return null;
  }

  // ============ Utility Functions ============

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Get current session info (for debugging)
   */
  getSessionInfo(): { isRecording: boolean; currentTask: string | null; interactions: number } {
    return {
      isRecording: this.isRecording,
      currentTask: this.currentTask?.taskName || null,
      interactions: this.session?.interactions.length || 0
    };
  }

  /**
   * Get current session (read-only)
   */
  getCurrentSession(): TestSession | null {
    return this.session ? { ...this.session } : null;
  }

  /**
   * Check if recording
   */
  isSessionActive(): boolean {
    return this.isRecording && this.session !== null;
  }

  /**
   * Reset/clear all data
   */
  reset(): void {
    this.session = null;
    this.currentTask = null;
    this.sessionStartTime = 0;
    this.isRecording = false;
    console.log('📊 Research logger reset');
  }
}

// ============ Singleton Export ============

export const researchLogger = new ResearchDataLogger();

// ============ Convenience Functions ============

/**
 * Quick start for research session
 */
export function startResearchSession(participantId: string, vuiFirst: boolean = true): void {
  researchLogger.startSession(participantId, vuiFirst ? 'VUI_FIRST' : 'GUI_FIRST');
}

/**
 * Quick task management
 */
export function startTask(taskNumber: 1 | 2 | 3 | 4 | 5): void {
  const taskId = PREDEFINED_TASKS[taskNumber - 1]?.taskId;
  if (taskId) {
    researchLogger.startTask(taskId);
  }
}

export function completeTask(): void {
  researchLogger.endTask('COMPLETE');
}

export function failTask(): void {
  researchLogger.endTask('FAILED');
}

/**
 * Quick end and download
 */
export function endAndDownload(): void {
  researchLogger.endSession();
  researchLogger.downloadJSON();
  researchLogger.downloadTasksCSV();
}




