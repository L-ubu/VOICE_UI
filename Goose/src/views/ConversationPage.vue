<!-- ConversationPage.vue -->
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ conversationStore.activeConversation?.title || 'New Conversation' }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content ref="contentRef">

            <!-- Emotion Analysis Indicator -->
            <div v-if="currentEmotionAnalysis" class="emotion-indicator">
                <ion-chip :color="getRiskLevelColor(safetyCheckResult?.riskLevel)">
                    <ion-icon :icon="getEmotionIcon()" />
                    <span>{{ currentEmotionAnalysis.topEmotion }} ({{ (currentEmotionAnalysis.topScore * 100).toFixed(0) }}%)</span>
                    <span class="intensity-badge" :class="currentEmotionAnalysis.arousal">
                        {{ currentEmotionAnalysis.arousal }}
                    </span>
                </ion-chip>
                <ion-chip v-if="safetyCheckResult?.riskLevel && safetyCheckResult.riskLevel !== 'safe'" :color="getRiskLevelColor(safetyCheckResult.riskLevel)">
                    <ion-icon :icon="warningOutline" />
                    <span>{{ safetyCheckResult.riskLevel }}</span>
                </ion-chip>
            </div>
            
            <!-- Crisis Stop Indicator -->
            <div v-if="conversationStopped" class="crisis-indicator">
                <ion-chip color="danger">
                    <ion-icon :icon="warningOutline" />
                    <span>Gesprek gestopt - Professionele hulp aanbevolen</span>
                </ion-chip>
                <ion-chip color="primary" @click="openCrisisHelp">
                    <ion-icon :icon="callOutline" />
                    <span>Bel 1813</span>
                </ion-chip>
            </div>
            
            <!-- Contextual Blanks Hint -->
            <div v-if="blanks.length > 0" class="blanks-hint">
                <div class="blanks-hint-content">
                    <ion-icon :icon="mic" />
                    <span><strong>{{ blanks.length }}</strong> veld(en) om in te vullen</span>
                </div>
                <div class="blanks-hint-tip">Spreek de tekst in of typ hieronder</div>
            </div>

            <!-- Messages List -->
            <div class="messages-container">
                <div v-for="message in conversationStore.activeMessages" :key="message.id"
                    :class="getMessageClass(message)" class="message-bubble">
                    <!-- Profile Picture for Goose (left side) -->

                    <div class="message-header">
                        <div v-if="message.sender === 'assistant'" class="profile-picture profile-picture-goose">
                            <img src="../assets/images/goose.svg" alt="Goose" class="profile-image" />
                        </div>
                        <span class="sender">{{ message.sender === 'user' ? 'Jij' : 'Goose' }}</span>

                        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
                    </div>
                    <div class="message-content">{{ message.message }}</div>
                </div>
                <goose-thinking class="thinking" v-if="isLoading"></goose-thinking>
            </div>


        </ion-content>

        <!-- Message Input -->
        <ion-footer :class="hasFocus?'.focused':''">
            <ion-toolbar>
                <div>                   
                    <ion-chip v-if="options" v-for="(option, index) in options" :key="index" @click="option.type === 'direct'?sendOptionAsMessage(option):addTextToMessage(option)" class="option" :class="option.type">
                        <span class="option-number">{{ index + 1 }}</span>
                        {{ option.text }}
                        <ion-icon :icon="option.type==='direct'?sendOutline:pencilSharp" />
                    </ion-chip>
                </div>
                
                <div v-if="currentHandler" class="input-area">
                    <div class="input-row">
                        <ion-textarea 
                            v-model="newMessage" 
                            placeholder="Typ hier je bericht ..." 
                            @ionFocus="hasFocus = true" 
                            ref="myInput"
                            @ionBlur="hasFocus = false" 
                            @keydown.enter="currentHandler" 
                            @ionPaste="onPaste" 
                            autoGrow="true" 
                            @click="onTextareaClick"
                            class="message-textarea"
                        />
                        <div class="action-buttons">
                <VoiceUIComponent 
                    ref="voiceUI"
                    @transcript="handleVoiceTranscript"
                    @audioData="handleAudioData"
                                @vuiStateChange="handleVUIStateChange"
                                @listeningStateChange="handleListeningStateChange"
                                @ttsStateChange="handleTTSStateChange"
                            />
                            <ion-button @click="currentHandler" :disabled="!newMessage || !newMessage.trim()" class="send-btn">
                        <ion-icon :icon="sendOutline" />
                    </ion-button>
                        </div>
                    </div>
                </div>
            </ion-toolbar>
        </ion-footer>
        <ion-alert
            :is-open="showDeleteAlert"
            :header="alertConfig.header"
            :message="alertConfig.message"
            :buttons="alertConfig.buttons"
            @didDismiss="showDeleteAlert = false"
        />
        
        <ion-alert
            :is-open="showSafetyAlert"
            :header="safetyAlertConfig.header"
            :message="safetyAlertConfig.message"
            :buttons="safetyAlertConfig.buttons"
            @didDismiss="showSafetyAlert = false"
        />
    </ion-page>
    
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
    IonButton, IonIcon, IonItem, IonChip, IonAlert, IonTextarea
} from '@ionic/vue'
import {
    sendOutline, pencilSharp, happyOutline, sadOutline, alertCircleOutline, mic, warningOutline, callOutline
} from 'ionicons/icons'
import { useConversationStore, MessageType, HistoryObject } from '@/stores/conversation'
import { Suggestion, ResponseWrapper } from '@/types'
import OpenAI from 'openai';
import { Thread } from 'openai/resources/beta/threads/threads';
import { RequiredActionFunctionToolCall, Run } from 'openai/resources/beta/threads/runs/runs';
import gooseThinking from '@/ui/gooseThinking.vue';
import { responseBody, steps } from '@/format';
import VoiceUIComponent from '@/components/VoiceUIComponent.vue';
import { humeExpressionService, type ExpressionAnalysisResult } from '@/services/humeExpressionService';
import { enhancedSafetyService, type SafetyCheckResult, type RiskLevel } from '@/services/enhancedSafetyService';
import { VoiceCommandParser } from '@/services/voiceCommandParser';
import { researchDataLogger } from '@/services/researchDataLogger';
const conversationStore = useConversationStore();
const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});
let thread: Thread | null = null;
let activeRun: Run | null;

// Component state
const newMessage = ref('')
const selectedType = ref<MessageType>('question')
const options = ref<Suggestion[] | null>();
const currentHandler = ref<Function>();
const isLoading = ref<boolean>(true);
const hasFocus = ref<boolean>(false);
const contentRef = ref();
const myInput = ref();
const showDeleteAlert = ref<boolean>(false);
const showSafetyAlert = ref<boolean>(false);
const voiceUI = ref<InstanceType<typeof VoiceUIComponent> | null>(null);
const currentEmotionAnalysis = ref<ExpressionAnalysisResult | null>(null);
const safetyCheckResult = ref<SafetyCheckResult | null>(null);
const conversationStopped = ref<boolean>(false);

// Create initial conversation if none exists
onMounted(async () => {

    if (conversationStore.conversations.length === 0) {
        conversationStore.createConversation('Chat met Goose')
        addMessage('assistant', 'Hallo! Ik ben Goose. Kan ik je met iets helpen?', [{
            text: "Ik wil een moeilijk gesprek met iemand aangaan",
            type: "direct",
            function: "goToStep",
            parameter: "1"

        }, {
            text: "Ik wil oefenen op verbindend communiceren",
            type: "direct"
        }]);
    }
    currentHandler.value = sendMessage;
    isLoading.value = false;
})

watch(isLoading, async () => {
    setTimeout(() => {
        scrollToBottom();
    }, 50)
});



const scrollToEnd = async () => {
  // Get the native input element
  const nativeInput = await myInput.value.$el.getInputElement()
  
  setTimeout(() => {
    const length = nativeInput.value.length
    nativeInput.setSelectionRange(length, length)
    nativeInput.focus()
  }, 0)
}

const onPaste = () => {
  // Let the paste complete first
  setTimeout(() => {
    scrollToEnd()
  }, 0)
}

async function scrollToBottom() {
    try {
        // Method 1: Use ion-content's scrollToBottom (preferred for Ionic)
        if (contentRef.value && contentRef.value.$el) {
            await contentRef.value.$el.scrollToBottom(300) // 300ms animation
        }
    } catch (error) {
        // Method 2: Fallback using scrollIntoView
        console.log(error);
    }
}

const handleVoiceTranscript = async (transcript: string) => {
    const optionsCount = options.value?.length ?? 0;
    const blanksCount = blanks.value.length;
    const command = VoiceCommandParser.parse(transcript, optionsCount, blanksCount);
    
    researchDataLogger.logVUIInteraction('transcript', { transcript, command, availableOptionsCount: optionsCount, availableBlanksCount: blanksCount }, { success: true });
    
    if (command.type === 'fill-blank' && command.blankNumber && command.fillText) {
        const idx = command.blankNumber - 1;
        if (idx >= 0 && idx < blanks.value.length) {
            await fillBlankWithText(idx, command.fillText);
            researchDataLogger.logVUIPerformance('blank-filled', true);
            if (voiceUI.value) await voiceUI.value.speak(`Blanko ${command.blankNumber} ingevuld met ${command.fillText}`);
            return;
        }
    }
    
    if (command.type === 'send-now') {
        if (blanks.value.length > 0) {
            if (voiceUI.value) await voiceUI.value.speak('Er zijn nog blanks die ingevuld moeten worden voordat je kunt versturen.');
            return;
        }
        if (newMessage.value.trim()) await sendMessage();
        else if (voiceUI.value) await voiceUI.value.speak('Er is geen bericht om te versturen.');
        return;
    }
    
    if (blanksCount > 0 && command.type === 'send-message' && command.transcript) {
        await fillBlankWithText(currentBlankIndex.value, command.transcript);
        return;
    }
    
    if (command.type === 'select-option' && command.optionNumber && options.value) {
        const idx = command.optionNumber - 1;
        if (idx >= 0 && idx < options.value.length) {
            const opt = options.value[idx];
            researchDataLogger.logVUIInteraction('command', { commandType: 'select-option', optionNumber: command.optionNumber, optionText: opt.text }, { success: true });
            if (voiceUI.value) await voiceUI.value.speak(`Optie ${command.optionNumber} geselecteerd: ${opt.text}`);
            await sendOptionAsMessage(opt);
            return;
        }
    }
    
    if (command.type === 'send-message' && command.transcript) {
        newMessage.value = command.transcript;
        await sendMessage();
    } else if (command.type === 'unknown') {
        newMessage.value = transcript;
        await sendMessage();
    }
};

const handleAudioData = async (audioBlob: Blob) => {
    if (conversationStopped.value) return;
    
    const startTime = performance.now();
    
    try {
        const audioResult = await humeExpressionService.analyzeAudio(audioBlob);
        const audioDuration = performance.now() - startTime;
        
        console.log('%c[HUME] 🎤 Voice:', 'color: #8b5cf6; font-weight: bold;', 
            audioResult.topEmotion, `(${(audioResult.topScore * 100).toFixed(0)}%)`,
            `| ${audioDuration.toFixed(0)}ms`);
        
        researchDataLogger.logHUMEAnalysis({
            type: 'audio', timestamp: new Date().toISOString(), sessionId: researchDataLogger.getSessionId(),
            input: { audioSize: audioBlob.size, audioType: audioBlob.type },
            analysis: { emotions: audioResult.emotions, topEmotion: audioResult.topEmotion, sentiment: audioResult.sentiment, arousal: audioResult.arousal, riskLevel: audioResult.riskLevel, requiresIntervention: audioResult.requiresIntervention },
            apiUsed: 'hume-api', performance: { responseTime: audioDuration, fallbackUsed: false }
        });
        
        const transcript = newMessage.value || '';
        
        if (transcript) {
            const textStart = performance.now();
            const textResult = await humeExpressionService.analyzeText(transcript);
            const textDuration = performance.now() - textStart;
            
            console.log('%c[HUME] 📝 Text:', 'color: #10b981; font-weight: bold;',
                textResult.topEmotion, `(${(textResult.topScore * 100).toFixed(0)}%)`,
                `| ${textDuration.toFixed(0)}ms`);
            
            researchDataLogger.logHUMEAnalysis({
                type: 'text', timestamp: new Date().toISOString(), sessionId: researchDataLogger.getSessionId(),
                input: { text: transcript },
                analysis: { emotions: textResult.emotions, topEmotion: textResult.topEmotion, sentiment: textResult.sentiment, arousal: textResult.arousal, riskLevel: textResult.riskLevel, requiresIntervention: textResult.requiresIntervention, sourceText: transcript },
                apiUsed: 'hume-api', performance: { responseTime: textDuration, fallbackUsed: false }
            });
            
            const combined = humeExpressionService.combineAnalyses(audioResult, textResult);
            
            console.log('%c[HUME] 🔗 Combined:', 'color: #f59e0b; font-weight: bold;',
                combined.topEmotion, `(${(combined.topScore * 100).toFixed(0)}%)`);
            
            researchDataLogger.logHUMEAnalysis({
                type: 'combined', timestamp: new Date().toISOString(), sessionId: researchDataLogger.getSessionId(),
                input: { text: transcript, audioSize: audioBlob.size },
                analysis: { emotions: combined.emotions, topEmotion: combined.topEmotion, sentiment: combined.sentiment, arousal: combined.arousal, riskLevel: combined.riskLevel, requiresIntervention: combined.requiresIntervention, sourceText: transcript },
                apiUsed: 'hume-api', performance: { responseTime: audioDuration + textDuration, fallbackUsed: false }
            });
            
            currentEmotionAnalysis.value = combined;
            await checkSafety(transcript, combined);
        } else {
            currentEmotionAnalysis.value = audioResult;
            await checkSafety('', audioResult);
        }
    } catch (error) {
        console.error('[HUME] Error:', error);
    }
};

const checkSafety = async (text: string, emotionAnalysis: ExpressionAnalysisResult) => {
    const startTime = performance.now();
    const result = enhancedSafetyService.checkSafety(text, emotionAnalysis);
    
    researchDataLogger.logVUIInteraction('safety-check', {
        text: text.substring(0, 100), safetyResult: result, emotionAnalysis,
        riskLevel: result.riskLevel, interventionType: result.interventionType
    }, { duration: performance.now() - startTime, success: true });
    
    safetyCheckResult.value = result;
    
    if (result.shouldStop) {
        conversationStopped.value = true;
        showSafetyAlert.value = true;
        voiceUI.value?.stopListening();
        if (voiceUI.value && result.spokenMessage) await voiceUI.value.speak(result.spokenMessage);
        await addMessage('assistant', result.message, []);
    } else if (result.shouldRefer) {
        showSafetyAlert.value = true;
        if (voiceUI.value && result.spokenMessage) await voiceUI.value.speak(result.spokenMessage);
    }
};

const handleTextAnalysis = async (text: string): Promise<ExpressionAnalysisResult> => {
    try {
        const result = await humeExpressionService.analyzeText(text);
        console.log('%c[HUME] 📝 Text:', 'color: #10b981; font-weight: bold;',
            result.topEmotion, `(${(result.topScore * 100).toFixed(0)}%)`);
        currentEmotionAnalysis.value = result;
        await checkSafety(text, result);
        return result;
    } catch (error) {
        console.error('[HUME] Text analysis error:', error);
        return { emotions: [], topEmotion: 'neutral', topScore: 0, sentiment: 'neutral', arousal: 'low', valence: 0, riskLevel: 'safe', requiresIntervention: false, source: 'text', timestamp: Date.now() };
    }
};

const sendMessage = async () => {
    if (!newMessage.value.trim() || isLoading.value || conversationStopped.value) return;
    
    if (blanks.value.length > 0) {
        researchDataLogger.logVUIInteraction('error', { error: 'Cannot send: unfilled blanks', blanksCount: blanks.value.length }, { success: false });
        if (voiceUI.value) await voiceUI.value.speak('Vul eerst alle blanks in voordat je het bericht verstuurt.');
        return;
    }
    
    const messageText = newMessage.value.trim();
    isLoading.value = true;
    
    // Analyze emotions
    if (!currentEmotionAnalysis.value) {
        await handleTextAnalysis(messageText);
    } else {
        const textAnalysis = await humeExpressionService.analyzeText(messageText);
        const combined = humeExpressionService.combineAnalyses(currentEmotionAnalysis.value, textAnalysis);
        currentEmotionAnalysis.value = combined;
        await checkSafety(messageText, combined);
    }
    
    if (conversationStopped.value || safetyCheckResult.value?.shouldStop) {
        isLoading.value = false;
        newMessage.value = '';
        return;
    }
    
    const history = await addMessage('user', messageText);
    researchDataLogger.logVUIInteraction('message-sent', { messageText, hasEmotionContext: !!currentEmotionAnalysis.value, emotionContext: currentEmotionAnalysis.value, safetyRiskLevel: safetyCheckResult.value?.riskLevel }, { success: true });
    
    newMessage.value = '';
    options.value = [];
    
    if (history && conversationStore.activeConversation) {
        const body = { ...responseBody } as any;
        body.input = history;
        body.instructions += steps.filter(x => x.index === conversationStore.activeConversation?.currentStep)[0].instructions;
        body.instructions += buildEmotionContext(currentEmotionAnalysis.value, safetyCheckResult.value);
        
        const response = await client.responses.create(body);
        const jsonPart = response.output?.find(p => p.type === 'message');
        
        try {
            const text = response.output_text ?? (jsonPart && (jsonPart as any).content?.[0]?.text);
            const payload: ResponseWrapper = JSON.parse(text);
            await addMessage('assistant', payload.response.message, payload.response.suggestions);
            
            if (voiceUI.value) {
                if (ttsEnabled.value) await voiceUI.value.speak(payload.response.message);
                else if (isVUIActive.value) voiceUI.value.restartListening();
            }
        } catch (e) {
            console.error('[OpenAI] Parse error:', e);
        }
    }
    
    currentEmotionAnalysis.value = null;
    isLoading.value = false;
}

const buildEmotionContext = (emotionAnalysis: ExpressionAnalysisResult | null, safetyResult: SafetyCheckResult | null): string => {
    if (!emotionAnalysis?.emotions) return '';
    
    const emotions = emotionAnalysis.emotions.map(e => `${e.name} (${(e.score * 100).toFixed(0)}%)`).join(', ');
    const trend = humeExpressionService.getEmotionalTrend();
    const crisis = humeExpressionService.getCrisisIndicators(emotionAnalysis);
    const valenceText = emotionAnalysis.valence > 0 ? 'positief' : emotionAnalysis.valence < 0 ? 'negatief' : 'neutraal';
    const trendText = trend === 'improving' ? 'verbeterend' : trend === 'declining' ? 'verslechterend' : 'stabiel';
    
    let ctx = `\n\nEMOTIE CONTEXT:\nEmoties: ${emotions}\n- Dominant: ${emotionAnalysis.topEmotion} (${(emotionAnalysis.topScore * 100).toFixed(0)}%)\n- Sentiment: ${emotionAnalysis.sentiment}, Intensiteit: ${emotionAnalysis.arousal}, Valentie: ${valenceText}, Trend: ${trendText}`;

    if (crisis.riskScore > 0.3 || safetyResult?.riskLevel === 'moderate' || safetyResult?.riskLevel === 'high') {
        ctx += `\n\n⚠️ VERHOOGD RISICO:`;
        if (crisis.hasDespair) ctx += ' wanhoop,';
        if (crisis.hasSadness) ctx += ' verdriet,';
        if (crisis.hasFear) ctx += ' angst,';
        if (crisis.emotionalDistress) ctx += ' emotionele nood';
        ctx += '\nWees extra empathisch. Verwijs naar hulp indien nodig.';
    }
    
    ctx += '\n\nPas je reactie empathisch aan. Toon begrip, blijf gesprekscoach.';
    return ctx;
}

async function addMessage(who: string, message: string, suggestions?: Suggestion[]): Promise<HistoryObject[] | undefined>{
    let history;
    if(who === 'user'){
        history = conversationStore.addUserMessage(message);
    } else if(who === 'assistant'){
        history = conversationStore.addGooseMessage(message, suggestions);
    }
    if(suggestions){
        options.value = suggestions;
    }
    await scrollToBottom();
    return history;
}

const sendOptionAsMessage = async (option: Suggestion) => {
    newMessage.value = option.text.replaceAll('…', ' ___');
    await nextTick();
    
    if (option.function && conversationStore.activeConversation) {
        if (option.function === "goToStep" && option.parameter) {
            conversationStore.activeConversation.currentStep = parseInt(option.parameter);
        }
    }
    
    if (blanks.value.length > 0) {
        currentBlankIndex.value = 0;
        const textarea = await myInput.value.$el.getInputElement();
        const first = blanks.value[0];
        textarea.setSelectionRange(first.start, first.end);
            textarea.focus();
        if (voiceUI.value) await voiceUI.value.speak(`Optie geselecteerd. Vul de blanks in door te zeggen "vul eerste blanko met [tekst]" of spreek gewoon de tekst in.`);
        return;
    }
    
    await sendMessage();
}

const addTextToMessage = (option: Suggestion) => {
    newMessage.value += option.text.replaceAll('…', ' ___');
    jumpToNextBlank();
}

const currentBlankIndex = ref(0);

const blanks = computed(() => {
    const regex = /___/g;
    const matches = [];
    let match;
    while ((match = regex.exec(newMessage.value)) !== null) {
        matches.push({
            start: match.index,
            end: match.index + 3
        });
    }
    return matches;
})


const jumpToNextBlank = async () => {
  if (blanks.value.length === 0) return;
  const textarea = await myInput.value.$el.getInputElement();
  const blank = blanks.value[currentBlankIndex.value];
  if (blank) {
    textarea.setSelectionRange(blank.start, blank.end);
    textarea.focus();
    currentBlankIndex.value = (currentBlankIndex.value + 1) % blanks.value.length;
  }
};

const fillBlankWithText = async (blankIndex: number, text: string) => {
  if (blankIndex < 0 || blankIndex >= blanks.value.length) return;
  
  const blank = blanks.value[blankIndex];
  const textarea = await myInput.value.$el.getInputElement();
  
  newMessage.value = newMessage.value.substring(0, blank.start) + text + newMessage.value.substring(blank.end);
  await nextTick();
  
  const remaining = blanks.value.length;
  if (remaining > 0) {
    currentBlankIndex.value = Math.min(blankIndex, remaining - 1);
    const next = blanks.value[currentBlankIndex.value];
    if (next) {
      textarea.setSelectionRange(next.start, next.end);
      textarea.focus();
      if (voiceUI.value) await voiceUI.value.speak(`Blanko ingevuld. Er zijn nog ${remaining} blanko's over.`);
    }
  } else {
    textarea.setSelectionRange(blank.start + text.length, blank.start + text.length);
    textarea.focus();
    if (voiceUI.value) await voiceUI.value.speak('Alle blanks zijn ingevuld. Je kunt het bericht nu versturen.');
    }
};

const onTextareaClick = async () => {
    const textarea = await myInput.value.$el.getInputElement();
  const cursorPos = textarea.selectionStart;
  const idx = blanks.value.findIndex(b => cursorPos >= b.start && cursorPos <= b.end);
  if (idx !== -1) {
    currentBlankIndex.value = idx;
    textarea.setSelectionRange(blanks.value[idx].start, blanks.value[idx].end);
  }
};

const alertConfig = ref({
  header: 'Bericht verwijderen',
  message: 'Opgelet, alle berichten die volgen op dit bericht worden ook verwijderd. ben je zeker?',
  buttons: [
    { text: 'Annuleren', role: 'cancel' },
    { text: 'Verwijder', role: 'destructive' }
  ]
})

const safetyAlertConfig = computed(() => {
  if (!safetyCheckResult.value) return { header: 'Veiligheid', message: '', buttons: [{ text: 'OK', role: 'cancel' }] };
  
  const r = safetyCheckResult.value;
  let msg = r.message;
  
  if (r.referralInfo) {
    msg += `\n\n${r.referralInfo.title}\n${r.referralInfo.description}\n\nHulplijnen:`;
    r.referralInfo.contacts.forEach(c => { msg += `\n• ${c.name}: ${c.phone}\n   ${c.available} - ${c.description}`; });
    if (r.referralInfo.website) msg += `\n\nMeer info: ${r.referralInfo.website}`;
    }
  
  const buttons: any[] = [];
  if (r.shouldStop) {
    buttons.push({ text: 'Bel 1813', handler: () => { window.location.href = 'tel:1813'; } });
    buttons.push({ text: 'Bezoek website', handler: () => { window.open('https://www.zelfmoord1813.be', '_blank'); } });
    buttons.push({ text: 'Sluiten', role: 'cancel', handler: () => { conversationStopped.value = true; voiceUI.value?.stopListening(); } });
  } else if (r.shouldRefer) {
    buttons.push({ text: 'Meer informatie', handler: () => { if (r.referralInfo?.website) window.open(r.referralInfo.website, '_blank'); } });
    buttons.push({ text: 'Ga verder', role: 'cancel' });
  } else {
    buttons.push({ text: 'OK', role: 'cancel' });
  }
  
  return { header: r.shouldStop ? '⚠️ Belangrijke Melding' : r.shouldRefer ? 'Ondersteuning Beschikbaar' : 'Informatie', message: msg, buttons };
})

const getMessageClass = (message: any) => {
    return {
        'message-me': message.sender === 'user',
        'message-goose': message.sender === 'assistant',
        [`message-${message.type}`]: true
    }
}

const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(timestamp)
}

const getEmotionIcon = () => {
    if (!currentEmotionAnalysis.value) return alertCircleOutline;
    const sentiment = currentEmotionAnalysis.value.sentiment;
    if (sentiment === 'positive') return happyOutline;
    if (sentiment === 'negative') return sadOutline;
    return alertCircleOutline;
}

// Get risk level color for UI
const getRiskLevelColor = (riskLevel: RiskLevel | undefined): string => {
    switch (riskLevel) {
        case 'critical': return 'danger';
        case 'high': return 'warning';
        case 'moderate': return 'secondary';
        case 'low': return 'tertiary';
        default: return 'success';
    }
}

const openCrisisHelp = () => {
    window.open('https://www.zelfmoord1813.be', '_blank');
}

// Handle VUI state changes
const handleVUIStateChange = (enabled: boolean) => {
    console.log('[ConversationPage] VUI state changed:', enabled);
    researchDataLogger.logVUIInteraction('command', { commandType: 'vui-toggle', enabled }, { success: true });
}

const handleListeningStateChange = (listening: boolean) => {
    console.log('[ConversationPage] Listening state changed:', listening);
    researchDataLogger.logVUIPerformance(
        listening ? 'recognition-start' : 'recognition-end',
        true
    );
}

const ttsEnabled = ref(true);
const isVUIActive = computed(() => voiceUI.value?.isEnabled?.() ?? false);

const handleTTSStateChange = (enabled: boolean) => {
    console.log('[ConversationPage] TTS state changed:', enabled);
    ttsEnabled.value = enabled;
    researchDataLogger.logVUIInteraction('command', { commandType: 'tts-toggle', enabled }, { success: true });
}
</script>

<style scoped>
.messages-container {
    padding: 16px;
    min-height: 100%;
}

.message-bubble {
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 12px;
    position: relative;
    max-width: 80%;
    .profile-image{
        width: 3rem;
    }
}

.message-me {
    background: var(--ion-color-primary);
    color: var(--ion-color-primary-contrast);
    margin-left: auto;
    text-align: right;
}

.message-goose {
    background: var(--ion-color-light);
    color: var(--ion-color-dark);
    margin-right: auto;
}

.message-question {
    border-left: 4px solid var(--ion-color-primary);
}

.message-suggestion {
    border-left: 4px solid var(--ion-color-success);
}

.message-warning {
    border-left: 4px solid var(--ion-color-warning);
}

.message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 1.2em;
    opacity: 0.8;
}

.message-content {
    font-size: 1.6em;
    line-height: 1.4;
}

/* Input Area */
.input-area {
    padding: 12px 16px;
    background: var(--ion-color-light);
}

.input-row {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    background: white;
    border-radius: 24px;
    padding: 8px 8px 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-textarea {
    flex: 1;
    --background: transparent;
    --padding-start: 0;
    --padding-end: 0;
    --padding-top: 8px;
    --padding-bottom: 8px;
    min-height: 40px;
    font-size: 16px;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.send-btn {
    --border-radius: 50%;
    --padding-start: 12px;
    --padding-end: 12px;
    height: 44px;
    width: 44px;
    margin: 0;
}

.delete-btn {
    position: absolute;
    top: 0;
    right: 0;
    --padding-end: 4px;
    --padding-top: 2px;

}
.thinking{
    width: 10rem;
}

.hasFocus {
    height: 30%;
}

.option {
    font-size: 1.4rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    
    .option-number {
        font-weight: 700;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;
    }
    
    ion-icon{
            font-size: 1.8rem;
            flex-shrink: 0; 
        }
    &.direct {
        background-color: var(--ion-color-primary);
        color: var(--ion-color-primary-contrast);
        
        .option-number {
            background: rgba(255, 255, 255, 0.3);
            color: var(--ion-color-primary-contrast);
        }
        
        ion-icon {
            color: var(--ion-color-primary-contrast);
        } 
    }  
}

.emotion-indicator {
    padding: 1rem;
    background: var(--ion-color-light);
    border-bottom: 1px solid var(--ion-color-medium);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    ion-chip {
        font-size: 1.2rem;
    }
    
    .intensity-badge {
        padding: 0.2rem 0.6rem;
        border-radius: 1rem;
        font-size: 1rem;
        font-weight: 600;
        margin-left: 0.5rem;
        
        &.low {
            background: var(--ion-color-success);
            color: white;
        }
        
        &.medium {
            background: var(--ion-color-warning);
            color: white;
        }
        
        &.high {
            background: var(--ion-color-danger);
            color: white;
        }
        
        &.critical {
            background: #8b0000;
            color: white;
            animation: pulse 1s infinite;
        }
    }
}

.blanks-hint {
    padding: 1rem 1.2rem;
    background: linear-gradient(135deg, var(--ion-color-tertiary-tint), var(--ion-color-primary-tint));
    border-bottom: 2px solid var(--ion-color-primary);
    text-align: center;
}

.blanks-hint-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    font-size: 1.2rem;
    color: var(--ion-color-dark);
    margin-bottom: 0.4rem;
}

.blanks-hint-content ion-icon {
    font-size: 1.5rem;
    color: var(--ion-color-primary);
}

.blanks-hint-tip {
    font-size: 1rem;
    color: var(--ion-color-medium-shade);
}

.crisis-indicator {
    padding: 1rem;
    background: var(--ion-color-danger-tint);
    border-bottom: 2px solid var(--ion-color-danger);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    
    ion-chip {
        font-size: 1.2rem;
        cursor: pointer;
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}

.crisis-indicator ion-chip[color="danger"] {
    animation: pulse 1.5s ease-in-out infinite;
}

</style>