# Testing Guide - HUME AI & Voice UI

## Hoe te testen

### 1. Open de Browser Console
- Druk op `F12` of `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Ga naar het "Console" tabblad
- Alle logging begint met `[HUME]`, `[VoiceUI]`, of `[ConversationPage]`

### 2. Test Voice Input met HUME Analyse

#### Stap 1: Start de app
```bash
npm run dev
```

#### Stap 2: Test spraakherkenning
1. Klik op de "Start spraak" knop
2. Spreek een bericht in (bijvoorbeeld: "Ik voel me verdrietig")
3. Kijk in de console voor:
   - `[VoiceUI] Recognition started` - Spraakherkenning is gestart
   - `[VoiceUI] Final transcript received: ...` - Transcript ontvangen
   - `[VoiceUI] Audio recording stopped: ...` - Audio opname gestopt
   - `[VoiceUI] Audio blob created: ...` - Audio blob gemaakt

#### Stap 3: Controleer HUME analyse
Na het spreken zou je moeten zien:
- `[ConversationPage] Audio data received: ...` - Audio ontvangen
- `[ConversationPage] Starting HUME audio analysis...` - Analyse gestart
- `[HUME] Starting audio analysis...` - HUME service gestart
- `[HUME] Sending audio to HUME API...` - API call wordt gemaakt
- `[HUME] API Response status: ...` - API response status
- `[HUME] Audio analysis response: ...` - Volledige HUME response
- `[HUME] Extracted emotions: ...` - Geëxtraheerde emoties

### 3. Test Text Input met HUME Analyse

1. Type een bericht in het tekstveld
2. Klik op verzenden
3. Kijk in de console voor:
   - `[ConversationPage] Starting text analysis for: ...`
   - `[HUME] Starting text analysis...`
   - `[HUME] Sending text to HUME API...`
   - `[HUME] Text analysis response: ...`

### 4. Test Emotie Context in ChatGPT

Na analyse zou je moeten zien:
- `[ConversationPage] Sending to OpenAI with emotion context: ...`
- Dit toont of de emotie context wordt meegestuurd naar ChatGPT

### 5. Test Veiligheidscontroles

Test met verschillende berichten:

**Lage risico:**
- "Ik wil een gesprek oefenen"
- Console zou moeten tonen: `[ConversationPage] Safety check passed`

**Matige risico:**
- "Ik voel me gestrest"
- Console zou moeten tonen: `[ConversationPage] WARNING: Referral recommended`

**Kritiek risico:**
- "Ik voel me hopeloos"
- Console zou moeten tonen: `[ConversationPage] CRITICAL: App should stop`
- Een alert zou moeten verschijnen

## Wat te controleren

### ✅ HUME API werkt
- Console toont `[HUME] API Response status: 200` (of andere success status)
- Console toont `[HUME] Extracted emotions:` met emotie data
- Geen `[HUME] No API key found` waarschuwing

### ✅ Audio wordt opgenomen
- Console toont `[VoiceUI] MediaRecorder started`
- Console toont `[VoiceUI] Audio chunk received` meerdere keren
- Console toont `[VoiceUI] Audio blob created` met size > 0

### ✅ Audio wordt geanalyseerd
- Console toont `[HUME] Starting audio analysis...`
- Console toont `[HUME] Sending audio to HUME API...`
- Console toont HUME response met emoties

### ✅ Emotie context wordt gebruikt
- Console toont `hasEmotionContext: true`
- Console toont `emotionContext: ...` met emotie informatie
- ChatGPT antwoord past zich aan op basis van emoties

## Troubleshooting

### Geen audio opname
- Controleer of microfoon toestemming is gegeven
- Controleer console voor errors
- Test in Chrome of Edge (beste ondersteuning)

### HUME API errors
- Controleer of `VITE_HUME_API_KEY` correct is in `.env`
- Controleer console voor specifieke error messages
- Als API key niet werkt, gebruikt de app fallback analyse

### Geen emotie context
- Controleer of `currentEmotionAnalysis.value` niet null is
- Controleer console logs voor analyse resultaten
- Zorg dat analyse voltooid is voordat bericht wordt verzonden

## Voorbeeld Console Output

```
[VoiceUI] Recognition started
[VoiceUI] Microphone access granted, starting MediaRecorder...
[VoiceUI] MediaRecorder started, recording audio...
[VoiceUI] Audio chunk received: 1024 bytes
[VoiceUI] Audio chunk received: 2048 bytes
[VoiceUI] Final transcript received: Ik voel me verdrietig
[VoiceUI] Stopping MediaRecorder, state: recording
[VoiceUI] MediaRecorder stopped, creating audio blob...
[VoiceUI] Audio blob created: {size: 15360, type: "audio/webm"}
[VoiceUI] Emitting audio data to parent...
[ConversationPage] Audio data received: {size: 15360, type: "audio/webm", timestamp: "..."}
[ConversationPage] Starting HUME audio analysis...
[HUME] Starting audio analysis... {blobSize: 15360, blobType: "audio/webm"}
[HUME] Sending audio to HUME API...
[HUME] API Response status: 200 OK
[HUME] Audio analysis response: {...}
[HUME] Extracted emotions: {emotions: [...], sentiment: "negative", ...}
[ConversationPage] HUME audio analysis complete: {...}
[ConversationPage] Running safety check with audio emotions...
[ConversationPage] Safety check result: {...}
[ConversationPage] Sending to OpenAI with emotion context: {hasEmotionContext: true, ...}
```


