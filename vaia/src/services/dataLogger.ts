interface LogEntry {
  timestamp: string;
  type: string;
  category: string;
  data: any;
  fieldId?: string;
  error?: string;
}

class DataLogger {
  private logs: LogEntry[] = [];
  private sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  logInteraction(category: string, type: string, data: any, fieldId?: string, error?: string): void {
    this.logs.push({ timestamp: new Date().toISOString(), type, category, data, fieldId, error });
  }

  getLogs(): LogEntry[] { return [...this.logs]; }

  clear(): void {
    this.logs = [];
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  export(): string {
    return JSON.stringify({ sessionId: this.sessionId, timestamp: new Date().toISOString(), logs: this.logs }, null, 2);
  }

  download(filename?: string): void {
    const blob = new Blob([this.export()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `vaia-research-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const dataLogger = new DataLogger();
