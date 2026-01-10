export interface VUIInteraction {
  type: 'command' | 'transcript' | 'error' | 'audio-analysis' | 'text-analysis' | 'safety-check' | 'message-sent';
  timestamp: string;
  sessionId: string;
  data: any;
  metadata?: { duration?: number; success?: boolean; error?: string };
}

export interface HUMEAnalysisLog {
  type: 'audio' | 'text' | 'combined';
  timestamp: string;
  sessionId: string;
  input: { text?: string; audioSize?: number; audioType?: string };
  analysis: {
    emotions: Array<{ name: string; score: number }>;
    topEmotion: string;
    sentiment: string;
    arousal: string;
    riskLevel: string;
    requiresIntervention: boolean;
    sourceText?: string; // The text that was analyzed
  };
  apiUsed: 'hume-api' | 'fallback';
  performance: { responseTime?: number; fallbackUsed: boolean };
}

export interface VUIPerformanceLog {
  timestamp: string;
  sessionId: string;
  action: string;
  duration?: number;
  success: boolean;
  error?: string;
}

class ResearchDataLogger {
  private sessionId: string;
  private logs: Array<VUIInteraction | HUMEAnalysisLog | VUIPerformanceLog> = [];
  private startTime: number;
  private isEnabled = true;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
    console.log('[ResearchLogger] Initialized with session:', this.sessionId);
  }

  logVUIInteraction(type: VUIInteraction['type'], data: any, metadata?: VUIInteraction['metadata']) {
    if (!this.isEnabled) return;
    const interaction: VUIInteraction = {
      type, timestamp: new Date().toISOString(), sessionId: this.sessionId, data, metadata
    };
    this.logs.push(interaction);
    console.log('[ResearchLogger] VUI Interaction:', interaction);
  }

  logHUMEAnalysis(analysis: HUMEAnalysisLog) {
    if (!this.isEnabled) return;
    this.logs.push(analysis);
    
    // Enhanced logging with source text
    console.log('%c[ResearchLogger] HUME Analysis', 'color: #8b5cf6; font-weight: bold;', {
      type: analysis.type,
      sourceText: analysis.analysis.sourceText || analysis.input.text || '(audio only)',
      topEmotion: analysis.analysis.topEmotion,
      emotions: analysis.analysis.emotions.map(e => `${e.name}: ${(e.score * 100).toFixed(0)}%`).join(', '),
      sentiment: analysis.analysis.sentiment,
      riskLevel: analysis.analysis.riskLevel
    });
  }

  logVUIPerformance(action: string, success: boolean, duration?: number, error?: string) {
    if (!this.isEnabled) return;
    const perf: VUIPerformanceLog = {
      timestamp: new Date().toISOString(), sessionId: this.sessionId, action, duration, success, error
    };
    this.logs.push(perf);
    console.log('[ResearchLogger] VUI Performance:', perf);
  }

  async exportData(): Promise<string> {
    return JSON.stringify({
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      totalInteractions: this.logs.length,
      logs: this.logs,
      summary: this.generateSummary()
    }, null, 2);
  }

  async downloadData(filename?: string) {
    const data = await this.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `goose-research-${this.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private generateSummary() {
    const humeLogs = this.logs.filter(l => 'analysis' in l) as HUMEAnalysisLog[];
    const emotionCounts: Record<string, number> = {};
    const sentimentCounts: Record<string, number> = {};

    humeLogs.forEach(log => {
      log.analysis.emotions.forEach(e => {
        emotionCounts[e.name] = (emotionCounts[e.name] || 0) + 1;
      });
      sentimentCounts[log.analysis.sentiment] = (sentimentCounts[log.analysis.sentiment] || 0) + 1;
    });

    return {
      vuiInteractions: {
        commands: this.logs.filter(l => (l as VUIInteraction).type === 'command').length,
        transcripts: this.logs.filter(l => (l as VUIInteraction).type === 'transcript').length,
        errors: this.logs.filter(l => (l as VUIInteraction).type === 'error').length,
        messagesSent: this.logs.filter(l => (l as VUIInteraction).type === 'message-sent').length
      },
      humeAnalyses: {
        audio: humeLogs.filter(l => l.type === 'audio').length,
        text: humeLogs.filter(l => l.type === 'text').length,
        combined: humeLogs.filter(l => l.type === 'combined').length
      },
      emotions: {
        topEmotions: Object.entries(emotionCounts).sort(([, a], [, b]) => b - a).slice(0, 5),
        sentiments: sentimentCounts
      },
      // Include all emotion-text pairs for research
      emotionTextPairs: humeLogs.map(l => ({
        text: l.analysis.sourceText || l.input.text || '',
        topEmotion: l.analysis.topEmotion,
        emotions: l.analysis.emotions,
        sentiment: l.analysis.sentiment,
        type: l.type
      }))
    };
  }

  clear() {
    this.logs = [];
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
  }

  enable() { this.isEnabled = true; }
  disable() { this.isEnabled = false; }
  getSessionId(): string { return this.sessionId; }
  getLogCount(): number { return this.logs.length; }
}

export const researchDataLogger = new ResearchDataLogger();
