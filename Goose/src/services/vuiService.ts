export interface VUIEvent {
  type: 'recognition-start' | 'recognition-result' | 'recognition-error' | 'recognition-end' | 'speech-start' | 'speech-end';
  data?: any;
  timestamp: number;
}

export type VUIEventHandler = (event: VUIEvent) => void;

class VUIService {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private isListening = false;
  private isSpeaking = false;
  private eventHandlers: VUIEventHandler[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.synth = window.speechSynthesis;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }

    if (this.synth) {
        this.findDutchVoice();
    }
  }

  private findDutchVoice(): void {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      const dutchVoices = voices.filter(v => 
        v.lang.startsWith('nl') || v.name.toLowerCase().includes('dutch')
      );

      if (dutchVoices.length > 0) {
        this.selectedVoice = dutchVoices.find(v => v.lang === 'nl-BE') || dutchVoices[0];
        console.log('Selected Dutch voice:', this.selectedVoice.name, this.selectedVoice.lang);
      } else {
        this.selectedVoice = voices.find(v => v.default) || voices[0] || null;
      }
    };

    if (this.synth.getVoices().length > 0) {
      loadVoices();
    } else {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'nl-BE';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.emitEvent({ type: 'recognition-start', timestamp: Date.now() });
    };

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');

      this.emitEvent({
        type: 'recognition-result',
        data: { transcript, isFinal: event.results[event.results.length - 1].isFinal },
        timestamp: Date.now()
      });
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      this.emitEvent({
        type: 'recognition-error',
        data: { error: event.error },
        timestamp: Date.now()
      });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.emitEvent({ type: 'recognition-end', timestamp: Date.now() });
    };
  }

  startListening(): boolean {
    if (!this.recognition || this.isListening) return this.isListening;

    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  stopListening(): void {
    if (!this.recognition) return;
      try {
        this.recognition.stop();
    } catch { /* ignore */ }
      this.isListening = false;
  }

  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel();

      if (this.isListening && this.recognition) {
        this.recognition.stop();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'nl-BE';
      
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.emitEvent({ type: 'speech-start', data: { text }, timestamp: Date.now() });
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.emitEvent({ type: 'speech-end', timestamp: Date.now() });
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.emitEvent({ type: 'speech-end', timestamp: Date.now() });
          resolve();
      };

      this.synth.speak(utterance);
      if (this.synth.paused) this.synth.resume();
    });
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  getListeningState(): boolean { return this.isListening; }
  getSpeakingState(): boolean { return this.isSpeaking; }

  onEvent(handler: VUIEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const idx = this.eventHandlers.indexOf(handler);
      if (idx > -1) this.eventHandlers.splice(idx, 1);
    };
  }

  private emitEvent(event: VUIEvent): void {
    this.eventHandlers.forEach(handler => {
      try { handler(event); } catch { /* ignore */ }
    });
  }

  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SR && !!window.speechSynthesis;
  }
}

export const vuiService = new VUIService();
