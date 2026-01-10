export interface VUIEvent {
  type: 'recognition-start' | 'recognition-result' | 'recognition-error' | 'speech-start' | 'speech-end';
  data?: any;
  timestamp: number;
}

export type VUIEventHandler = (event: VUIEvent) => void;

class VUIService {
  private recognition: SpeechRecognition | null = null;
  private synth: SpeechSynthesis | null = null;
  private isListening = false;
  private isSpeaking = false;
  private eventHandlers: VUIEventHandler[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private wasListeningBeforeSpeech = false;
  private restartTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.synth = window.speechSynthesis;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }

    if (this.synth) this.findDutchVoice();
  }

  private findDutchVoice(): void {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      const dutchVoices = voices.filter(v => 
        v.lang.startsWith('nl') || v.name.toLowerCase().includes('dutch') || v.name.toLowerCase().includes('nederlands')
      );

      if (dutchVoices.length > 0) {
        this.selectedVoice = dutchVoices.find(v => v.lang === 'nl-BE') || dutchVoices[0];
      } else {
        this.selectedVoice = voices.find(v => v.default) || voices[0] || null;
      }
    };

    if (this.synth.getVoices().length > 0) loadVoices();
    else this.synth.onvoiceschanged = loadVoices;
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'nl-BE';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.emitEvent({ type: 'recognition-start', timestamp: Date.now() });
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;

      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = null;
      }

      this.emitEvent({
        type: 'recognition-result',
        data: { transcript, isFinal: lastResult.isFinal },
        timestamp: Date.now()
      });

      if (!lastResult.isFinal) {
        this.restartTimeout = setTimeout(() => {
          if (this.isListening && this.recognition) {
            try {
              this.recognition.stop();
              setTimeout(() => {
                if (this.isListening && this.recognition) this.recognition.start();
              }, 100);
            } catch (e) {}
          }
        }, 5000);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return;
      this.isListening = false;
      this.emitEvent({ type: 'recognition-error', data: { error: event.error }, timestamp: Date.now() });
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        setTimeout(() => {
          if (this.isListening && this.recognition) {
            try { this.recognition.start(); } catch (e) { this.isListening = false; }
          }
        }, 100);
      }
    };
  }

  startListening(): boolean {
    if (!this.recognition || this.isListening) return this.isListening;
    try {
      this.recognition.start();
      return true;
    } catch (e) {
      return false;
    }
  }

  stopListening(): void {
    if (!this.recognition) return;
    try { this.recognition.stop(); } catch (e) {}
    this.isListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
  }

  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) { resolve(); return; }

      this.synth.cancel();
      this.wasListeningBeforeSpeech = this.isListening;
      if (this.isListening && this.recognition) this.recognition.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'nl-BE';
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.currentUtterance = utterance;
        this.emitEvent({ type: 'speech-start', data: { text }, timestamp: Date.now() });
      };

      const handleEnd = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (this.wasListeningBeforeSpeech && this.recognition) {
          setTimeout(() => {
            try { if (!this.isListening) this.recognition!.start(); } catch (e) {}
          }, 300);
        }
        this.emitEvent({ type: 'speech-end', timestamp: Date.now() });
        resolve();
      };

      utterance.onend = handleEnd;
      utterance.onerror = handleEnd;
      this.synth.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  getListeningState(): boolean { return this.isListening; }
  getSpeakingState(): boolean { return this.isSpeaking; }
  getAvailableVoices(): SpeechSynthesisVoice[] { return this.synth?.getVoices() || []; }
  getSelectedVoice(): SpeechSynthesisVoice | null { return this.selectedVoice; }
  setVoice(voice: SpeechSynthesisVoice): void { this.selectedVoice = voice; }

  onEvent(handler: VUIEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const i = this.eventHandlers.indexOf(handler);
      if (i > -1) this.eventHandlers.splice(i, 1);
    };
  }

  private emitEvent(event: VUIEvent): void {
    this.eventHandlers.forEach(h => { try { h(event); } catch (e) {} });
  }

  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SR && !!window.speechSynthesis;
  }

  isSupported(): boolean { return VUIService.isSupported(); }
}

export const vuiService = new VUIService();
export { VUIService };
