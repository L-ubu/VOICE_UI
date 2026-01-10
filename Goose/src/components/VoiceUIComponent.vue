<template>
  <div class="vui-inline">
    <!-- Compact trigger button -->
    <button 
      v-if="!vuiModeActive"
      @click="activateVUIMode" 
      class="vui-btn"
      type="button"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
      <span>Spraak</span>
    </button>

    <!-- Expanded VUI panel (inline, not popup) -->
    <div v-else class="vui-expanded">
      <!-- Main row: mic + status + controls -->
      <div class="vui-main-row">
        <!-- Mic button -->
        <button 
          class="mic-btn" 
          :class="currentStatus"
      @click="toggleListening" 
      :disabled="isSpeaking"
          type="button"
        >
          <svg v-if="currentStatus === 'processing'" class="spin" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          <span v-if="isListening" class="pulse-dot"></span>
        </button>

        <!-- Status/transcript -->
        <div class="status-area">
          <div v-if="liveTranscript" class="transcript">"{{ liveTranscript }}"</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else class="status" :class="currentStatus">{{ statusText }}</div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <button 
            class="tts-btn" 
            :class="{ on: ttsEnabled }" 
            @click="ttsEnabled = !ttsEnabled"
            type="button"
            :title="ttsEnabled ? 'Geluid uit' : 'Geluid aan'"
          >
            {{ ttsEnabled ? '🔊' : '🔇' }}
          </button>
          <button 
            class="help-btn" 
            @click="showTips = !showTips"
            type="button"
            :class="{ active: showTips }"
          >
            ?
          </button>
          <button class="close-btn" @click="deactivateVUIMode" type="button">✕</button>
        </div>
      </div>

      <!-- Tips row (collapsible) -->
      <div v-if="showTips" class="tips-row">
        <span class="tip">Zeg <strong>"selecteer 1"</strong> voor opties</span>
        <span class="divider">•</span>
        <span class="tip">Zeg <strong>"verstuur"</strong> om te verzenden</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { vuiService, type VUIEvent } from '@/services/vuiService';

const emit = defineEmits<{
  transcript: [transcript: string];
  audioData: [audioBlob: Blob];
  vuiStateChange: [enabled: boolean];
  listeningStateChange: [listening: boolean];
  ttsStateChange: [enabled: boolean];
}>();

// State
const vuiModeActive = ref(false);
const isListening = ref(false);
const isSpeaking = ref(false);
const isProcessing = ref(false);
const error = ref('');
const liveTranscript = ref('');
const showTips = ref(false);
const ttsEnabled = ref(true);

// Audio recording
let unsubscribe: (() => void) | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

const currentStatus = computed(() => {
  if (isProcessing.value) return 'processing';
  if (isSpeaking.value) return 'speaking';
  if (isListening.value) return 'listening';
  return 'idle';
  });

const statusText = computed(() => {
  switch (currentStatus.value) {
    case 'listening': return 'Luisteren...';
    case 'speaking': return 'Goose spreekt...';
    case 'processing': return 'Verwerken...';
    default: return 'Tik om te spreken';
  }
});

watch(ttsEnabled, (enabled) => {
  emit('ttsStateChange', enabled);
});

onMounted(() => {
  unsubscribe = vuiService.onEvent(handleVUIEvent);
});

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe();
  vuiService.stopListening();
  vuiService.stopSpeaking();
  stopRecording();
});

const handleVUIEvent = (event: VUIEvent) => {
  console.log('[VUI] Event:', event.type);
  
  switch (event.type) {
    case 'recognition-start':
      isListening.value = true;
      isProcessing.value = false;
      error.value = '';
      liveTranscript.value = '';
      startRecording();
      emit('listeningStateChange', true);
      break;

    case 'recognition-result':
      if (event.data?.transcript) {
        liveTranscript.value = event.data.transcript.trim();
      }
      
      if (event.data?.isFinal && event.data.transcript.trim()) {
        const transcript = event.data.transcript.trim();
        isProcessing.value = true;
        isListening.value = false;
        
          stopRecording().then(audioBlob => {
          if (audioBlob && audioBlob.size > 0) {
              emit('audioData', audioBlob);
            }
          emit('transcript', transcript);
          
          setTimeout(() => {
            isProcessing.value = false;
            liveTranscript.value = '';
          }, 300);
        });
        
        emit('listeningStateChange', false);
      }
      break;

    case 'recognition-error':
      const errorType = event.data?.error;
      isListening.value = false;
      isProcessing.value = false;
      emit('listeningStateChange', false);
      stopRecording();
      
      if (errorType === 'no-speech' && vuiModeActive.value) {
        error.value = '';
        setTimeout(() => {
          if (vuiModeActive.value && !isListening.value && !isSpeaking.value) {
            startListeningQuietly();
          }
        }, 800);
      } else if (errorType === 'audio-capture') {
        error.value = 'Geen microfoon';
      } else if (errorType === 'not-allowed') {
        error.value = 'Geef mic toestemming';
      } else if (errorType === 'aborted') {
        if (vuiModeActive.value) {
          setTimeout(() => {
            if (vuiModeActive.value && !isListening.value && !isSpeaking.value) {
              startListeningQuietly();
            }
          }, 500);
        }
      }
      break;

    case 'recognition-end':
      isListening.value = false;
      emit('listeningStateChange', false);
      if (vuiModeActive.value && !isSpeaking.value && !isProcessing.value) {
        setTimeout(() => {
          if (vuiModeActive.value && !isListening.value && !isSpeaking.value) {
            startListeningQuietly();
          }
        }, 500);
      }
      break;

    case 'speech-start':
      isSpeaking.value = true;
      break;

    case 'speech-end':
      isSpeaking.value = false;
      if (vuiModeActive.value && !isListening.value) {
        setTimeout(() => {
          if (vuiModeActive.value && !isListening.value && !isSpeaking.value) {
            startListeningQuietly();
          }
        }, 500);
      }
      break;
  }
};

const startListeningQuietly = () => {
  error.value = '';
  vuiService.startListening();
};

const activateVUIMode = () => {
  vuiModeActive.value = true;
  showTips.value = true; // Automatically show tips when VUI activates
  emit('vuiStateChange', true);
  error.value = '';
  setTimeout(() => startListeningQuietly(), 300);
};

const deactivateVUIMode = () => {
  if (isListening.value) {
    vuiService.stopListening();
    stopRecording();
    isListening.value = false;
  }
  vuiModeActive.value = false;
  emit('vuiStateChange', false);
  liveTranscript.value = '';
  error.value = '';
};

const toggleListening = () => {
  if (isSpeaking.value) return;

  if (isListening.value) {
    vuiService.stopListening();
    stopRecording();
    isListening.value = false;
    liveTranscript.value = '';
    emit('listeningStateChange', false);
  } else {
    startListeningQuietly();
  }
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.start(100);
  } catch (err) {
    console.error('[VUI] Recording error:', err);
  }
};

const stopRecording = (): Promise<Blob | null> => {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      resolve(null);
      return;
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      mediaRecorder?.stream.getTracks().forEach(t => t.stop());
      mediaRecorder = null;
      audioChunks = [];
      resolve(blob);
    };
    if (mediaRecorder.state === 'recording') mediaRecorder.stop();
    else resolve(null);
  });
};

// Restart listening immediately (called when TTS is skipped)
const restartListeningNow = () => {
  if (vuiModeActive.value && !isListening.value && !isSpeaking.value) {
    setTimeout(() => startListeningQuietly(), 100);
  }
};

defineExpose({
  speak: async (text: string) => {
    if (!ttsEnabled.value) {
      // TTS is muted, restart listening immediately
      restartListeningNow();
      return;
    }
    await vuiService.speak(text);
  },
  stopListening: () => {
    vuiService.stopListening();
    vuiService.stopSpeaking();
    stopRecording();
    isListening.value = false;
  },
  isListening: () => isListening.value,
  isSpeaking: () => isSpeaking.value,
  isEnabled: () => vuiModeActive.value,
  isTTSEnabled: () => ttsEnabled.value,
  setTTSEnabled: (enabled: boolean) => { ttsEnabled.value = enabled; },
  setEnabled: (enabled: boolean) => { 
    if (enabled) activateVUIMode();
    else deactivateVUIMode();
  },
  restartListening: restartListeningNow
});
</script>

<style scoped>
.vui-inline {
  display: flex;
  flex-direction: column;
}

/* Trigger Button */
.vui-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.vui-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Expanded VUI panel */
.vui-expanded {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 10px 12px;
  min-width: 280px;
  animation: expandIn 0.2s ease;
}

@keyframes expandIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Main row */
.vui-main-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Mic button */
.mic-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #6366f1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;
}

.mic-btn:hover {
  transform: scale(1.05);
}

.mic-btn.listening {
  background: #dc2626;
  color: white;
  animation: pulse-bg 1.5s ease infinite;
}

@keyframes pulse-bg {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
}

.mic-btn.speaking {
  background: #f3f4f6;
  color: #8b5cf6;
}

.mic-btn.processing {
  background: #fbbf24;
  color: white;
}

.mic-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pulse-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: blink 1s ease infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Status area */
.status-area {
  flex: 1;
  min-width: 0;
}

.status {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.status.listening {
  color: white;
  font-weight: 600;
}

.transcript {
  color: white;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.error {
  color: #fecaca;
  font-size: 13px;
}

/* Controls */
.controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.tts-btn,
.help-btn,
.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
}

.tts-btn:hover,
.help-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tts-btn.on {
  background: rgba(255, 255, 255, 0.35);
}

.help-btn {
  font-weight: 700;
}

.help-btn.active {
  background: rgba(255, 255, 255, 0.35);
}

.close-btn {
  font-size: 16px;
}

/* Tips row */
.tips-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  flex-wrap: wrap;
}

.tip {
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  }

.tip strong {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  }

.divider {
  color: rgba(255, 255, 255, 0.5);
}
</style>
