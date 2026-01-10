# Hoofdstuk 5: Praktische Uitwerking - Voice-User Interface Prototypes

**Auteur:** Luca Vandenweghe  
**Bachelorproef:** Wat zijn de belangrijkste voordelen en beperkingen van Voice-User Interfaces in vergelijking met grafische interfaces bij het uitvoeren van digitale taken?

---

## Inhoudsopgave

1. [Overzicht van de Twee Prototypes](#1-overzicht-van-de-twee-prototypes)
2. [Technologiekeuzes en Motivatie](#2-technologiekeuzes-en-motivatie)
3. [VAIA Project - Formulier VUI](#3-vaia-project---formulier-vui)
4. [Goose Project - Conversational VUI](#4-goose-project---conversational-vui)
5. [Uitdagingen en Oplossingen](#5-uitdagingen-en-oplossingen)
6. [Code Voorbeelden](#6-code-voorbeelden)
7. [Belangrijke Beslissingen](#7-belangrijke-beslissingen)

---

## 1. Overzicht van de Twee Prototypes

### 1.1 Twee Verschillende VUI Benaderingen

Voor dit onderzoek zijn **twee verschillende VUI prototypes** ontwikkeld, elk met een unieke benadering:

| Aspect | VAIA Project | Goose Project |
|--------|--------------|---------------|
| **Type** | Formulier-gebaseerde VUI | Conversational VUI |
| **Doel** | Opleiding registratieformulier | Emotionele ondersteuning chatbot |
| **Interactie** | Command-based ("ga naar titel") | Natural conversation |
| **Emotie-analyse** | Niet aanwezig | HUME AI integratie |
| **Taal** | Nederlands (nl-NL/nl-BE) | Nederlands |
| **Platform** | Web (Vue 3) | Web + Mobile (Ionic/Capacitor) |

### 1.2 Waarom Twee Prototypes?

De keuze om twee prototypes te ontwikkelen was gebaseerd op:

1. **Verschillende use cases testen**: Formulieren vs. open conversatie
2. **Verschillende complexiteitsniveaus**: Gestructureerde commando's vs. natuurlijke taal
3. **Brede toepasbaarheid onderzoeken**: Kan VUI in beide contexten effectief zijn?

---

## 2. Technologiekeuzes en Motivatie

### 2.1 Gekozen Tech Stack

#### Frontend Framework: Vue 3 + TypeScript

**Waarom Vue 3:**
- Moderne, reactieve framework met goede TypeScript ondersteuning
- Component-based architectuur past goed bij modulaire VUI services
- Uitstekende developer experience en documentatie
- Bestaande VAIA codebase was al in Vue geschreven

**Waarom TypeScript:**
- Type safety voorkomt runtime errors in VUI service
- Betere IDE ondersteuning voor complexe event handling
- Makkelijker te onderhouden en debuggen

#### Spraakherkenning: Web Speech API

**Waarom Web Speech API gekozen in plaats van alternatieven:**

| Optie | Voordelen | Nadelen | Keuze |
|-------|-----------|---------|-------|
| **Web Speech API** | Gratis, geen API keys, browser-native | Beperkte browser support, minder accuraat | ✅ Gekozen |
| Google Cloud Speech | Zeer accuraat, veel talen | Betaald, complexe setup | ❌ |
| Azure Speech | Enterprise features | Betaald, overkill voor prototype | ❌ |
| Whisper (OpenAI) | Open source, zeer accuraat | Vereist server-side processing | ❌ |

**Motivatie keuze Web Speech API:**
- Geen kosten voor prototype/onderzoek
- Voldoende accuraat voor Nederlandse spraak in Chrome/Edge
- Direct beschikbaar in browser, geen externe dependencies
- Makkelijk te integreren met Vue components

#### Text-to-Speech: SpeechSynthesis API

**Waarom browser-native TTS:**
- Gratis en direct beschikbaar
- Nederlandse stemmen beschikbaar in Chrome/Edge
- Voldoende natuurlijk voor feedback berichten
- Synchrone integratie met speech recognition (pause during speaking)

#### Backend: Firebase

**Waarom Firebase:**
- Bestaande infrastructuur (VAIA project gebruikte dit al)
- Cloud Functions voor AI integraties
- Firestore voor data opslag
- Eenvoudige hosting

#### AI Integraties

| Service | Project | Doel |
|---------|---------|------|
| **OpenAI GPT-3.5** | VAIA | Text editing, link parsing |
| **HUME AI** | Goose | Emotie-analyse (prosody, text) |

---

## 3. VAIA Project - Formulier VUI

### 3.1 Project Beschrijving

Het VAIA project is een **formulier-gebaseerde VUI** voor het registreren van opleidingen op de VAIA website. Gebruikers kunnen het complete formulier invullen met stemcommando's.

### 3.2 Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│                    HomeV2View.vue                           │
│                  (Main Form Component)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │ VUIControlComponent│    │   Input Field Components   │   │
│  │  (Floating Panel) │    │   (Text, Dropdown, etc.)    │   │
│  └────────┬────────┘    └──────────────────────────────┘   │
│           │                                                  │
├───────────▼──────────────────────────────────────────────────┤
│                    Services Layer                            │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  vuiService.ts │  │voiceCommandHandlers│ │editService.ts│  │
│  │ (Speech API)   │  │(Command Parsing)  │ │(AI Editing)  │  │
│  └────────────────┘  └─────────────────┘  └──────────────┘  │
│  ┌────────────────┐  ┌─────────────────┐                    │
│  │ dataLogger.ts  │  │formFieldNavigator│                    │
│  │(Research Data) │  │(Field Navigation)│                    │
│  └────────────────┘  └─────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Implementeerde Voice Commands

#### Navigatie Commando's
```
"Ga naar [veldnaam]"      → Navigeert naar specifiek veld
"Volgende veld"           → Gaat naar volgend veld
"Vorige veld"             → Gaat naar vorig veld
"Volgende pagina"         → Gaat naar volgende formulier stap
```

#### Invoer Commando's
```
"Schrijf [tekst]"         → Schrijft tekst in actief veld
"Vul [veld] in met [waarde]" → Vult specifiek veld in
"Verbeter [instructie]"   → Bewerkt tekst met AI (ChatGPT)
"Link [website]"          → Parseert gesproken URL
```

#### Selectie Commando's
```
"Selecteer [nummer]"      → Selecteert optie in dropdown
"Selecteer onderzoek"     → Selecteert checkbox
"Klaar" / "Sluit"         → Sluit dropdown/popup
```

### 3.4 Key Implementation: vuiService.ts

De `vuiService` is de kern van de spraakfunctionaliteit:

```typescript
// Initialisatie van Web Speech API
class VUIService {
  private recognition: SpeechRecognition | null = null;
  private synth: SpeechSynthesis | null = null;
  
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.synth = window.speechSynthesis;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }
  
  private setupRecognition(): void {
    this.recognition.continuous = true;      // Blijft luisteren
    this.recognition.interimResults = true;  // Toont tussenresultaten
    this.recognition.lang = 'nl-BE';         // Nederlandse spraak
  }
}
```

### 3.5 Key Implementation: Voice Command Parsing

Het command parsing systeem herkent Nederlandse commando's:

```typescript
const parseCommand = (transcript: string): string | null => {
  let lower = transcript.toLowerCase().trim();
  
  // Edit commando's (Nederlandse woorden voor betere herkenning)
  if (lower.startsWith('verbeter') || lower.startsWith('bewerk') || 
      lower.startsWith('wijzig') || lower.startsWith('corrigeer')) {
    return 'edit';
  }
  
  // Navigatie commando's
  if (lower.startsWith('ga naar') || lower.startsWith('navigeer naar')) {
    return 'navigate';
  }
  
  // Dropdown selectie - check of dropdown open is
  if (isDropdownOpen() && lower.match(/selecteer.*\d+/)) {
    return 'select-dropdown-number';
  }
  
  return null;
};
```

### 3.6 Key Implementation: AI-Powered Editing

De `editService` integreert OpenAI voor slimme tekstbewerking:

```typescript
async editText(originalText: string, instruction: string): Promise<EditResponse> {
  const aiResult = await this.callOpenAI([
    {
      role: 'system',
      content: `Je bent een tekstbewerker. De gebruiker geeft je een tekst en een instructie. 
                Pas de tekst aan volgens de instructie en geef ALLEEN de aangepaste tekst terug.`
    },
    {
      role: 'user',
      content: `Originele tekst: "${originalText}"
                Instructie: ${instruction}
                Geef alleen de aangepaste tekst terug:`
    }
  ]);
  
  return { editedText: aiResult, success: true };
}
```

### 3.7 Data Logging voor Onderzoek

Alle interacties worden automatisch gelogd:

```typescript
interface InteractionLog {
  id: string;
  timestamp: number;
  type: 'voice' | 'gui' | 'system';
  action: string;
  fieldId?: string;
  data?: any;
  duration?: number;
  error?: string;
}
```

---

## 4. Goose Project - Conversational VUI

### 4.1 Project Beschrijving

Het Goose project is een **conversational VUI chatbot** met emotie-analyse. Het is ontworpen voor emotionele ondersteuning gesprekken.

### 4.2 Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│                 ConversationPage.vue                         │
│              (Main Conversation Interface)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │VoiceUIComponent │    │  ResponseComponent           │   │
│  │(Voice Controls) │    │  (Chat Messages Display)     │   │
│  └────────┬────────┘    └──────────────────────────────┘   │
│           │                                                  │
├───────────▼──────────────────────────────────────────────────┤
│                    Services Layer                            │
│  ┌────────────────────┐  ┌─────────────────────────────┐   │
│  │    vuiService.ts   │  │ humeExpressionService.ts    │   │
│  │  (Speech + TTS)    │  │ (Emotion Analysis - HUME AI)│   │
│  └────────────────────┘  └─────────────────────────────┘   │
│  ┌────────────────────┐  ┌─────────────────────────────┐   │
│  │voiceCommandParser.ts│  │ enhancedSafetyService.ts   │   │
│  │(Intent Detection)  │  │ (Content Safety Checks)     │   │
│  └────────────────────┘  └─────────────────────────────┘   │
│  ┌────────────────────┐                                     │
│  │researchDataLogger.ts│                                     │
│  │(Research Logging)  │                                     │
│  └────────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 HUME AI Emotie-Analyse

Het Goose project integreert HUME AI voor emotie-analyse:

```typescript
// Analyse van spraak prosody (toonhoogte, tempo, etc.)
async analyzeAudioEmotion(audioBlob: Blob): Promise<EmotionAnalysis> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  
  const response = await fetch('https://api.hume.ai/v0/batch/jobs', {
    method: 'POST',
    headers: { 'X-Hume-Api-Key': this.apiKey },
    body: formData
  });
  
  return this.processHumeResponse(response);
}

// Analyse van tekst emotie
async analyzeTextEmotion(text: string): Promise<EmotionAnalysis> {
  // Analyseert sentiment en emotionele taal
}
```

### 4.4 Conversational Command Parser

Anders dan VAIA, gebruikt Goose natuurlijke taal verwerking:

```typescript
interface ParsedCommand {
  type: 'select-option' | 'fill-blank' | 'send-now' | 'help' | 'unknown';
  data?: any;
}

function parseVoiceCommand(transcript: string, context: ConversationContext): ParsedCommand {
  const lower = transcript.toLowerCase();
  
  // Detecteer selectie intent
  if (lower.includes('kies') || lower.includes('selecteer') || lower.match(/optie\s*\d/)) {
    const optionNumber = extractNumber(transcript);
    return { type: 'select-option', data: { optionNumber } };
  }
  
  // Detecteer blank-filling intent
  if (context.hasBlankToFill && !isCommandPhrase(transcript)) {
    return { type: 'fill-blank', data: { value: transcript } };
  }
  
  return { type: 'unknown' };
}
```

### 4.5 Safety Service

Veiligheidscontroles voor gevoelige inhoud:

```typescript
class EnhancedSafetyService {
  checkContent(text: string): SafetyResult {
    const riskLevel = this.assessRisk(text);
    const intervention = this.determineIntervention(riskLevel);
    
    return {
      safe: riskLevel < RiskThreshold.HIGH,
      riskLevel,
      intervention,
      suggestedResponse: this.getSafeResponse(riskLevel)
    };
  }
}
```

---

## 5. Uitdagingen en Oplossingen

### 5.1 Spraakherkenning Accuratesse

**Probleem:** Web Speech API herkent sommige Nederlandse woorden incorrect.

**Voorbeeld:** "edit" werd niet herkend, "schrijf" werd soms als "schreef" gehoord.

**Oplossing:** 
- Meerdere synoniemen accepteren voor hetzelfde commando
- Nederlandse woorden gebruiken in plaats van Engelse ("verbeter" i.p.v. "edit")

```typescript
// Accepteer meerdere varianten
if (lower.startsWith('verbeter') || lower.startsWith('bewerk') || 
    lower.startsWith('wijzig') || lower.startsWith('corrigeer') ||
    lower.startsWith('herschrijf')) {
  return 'edit';
}
```

### 5.2 Dropdown Navigatie

**Probleem:** "Volgende veld" werkte niet correct voor dropdown velden op pagina 2.

**Analyse:** De `resolveFieldElement` functie kon dropdown containers niet correct identificeren.

**Oplossing:** Specifieke handling voor dropdown velden toegevoegd:

```typescript
// Dropdown field IDs op step 2
const DROPDOWN_FIELDS: FieldKey[] = [
  'organisers', 'knowledgeLevel', 'priceLevel', 'afterCourseGoals', 
  'scopeOfApplication', 'ethicDomains', 'certificate', 'language', 'locationZone'
];

export const resolveFieldElement = (key: FieldKey): HTMLElement | null => {
  // Handle dropdown fields - look for dropdown container with matching ID
  if (DROPDOWN_FIELDS.includes(key)) {
    const dropdown = document.querySelector(`.dropdown-container#${key}`);
    if (dropdown) {
      return dropdown.querySelector('.dropdown-header');
    }
  }
  // ... rest of logic
};
```

### 5.3 Dropdown Nummering

**Probleem:** Nummers in dropdowns toonden 1, 2, 1, 4 i.p.v. 1, 2, 3, 4.

**Oorzaak:** Duplicate opties kregen dezelfde nummer (eerste match werd gevonden).

**Oplossing:** Sequentiële nummering gebaseerd op positie:

```typescript
// VOOR (fout)
const getOptionNumber = (option: string): number => {
  for (const opt of options) {
    if (opt === option) return number;  // Vindt eerste match
    number++;
  }
};

// NA (correct)
const getDisplayNumber = (groupIndex: number, optionIndex: number): number => {
  let number = 1;
  for (let g = 0; g < groupIndex; g++) {
    number += filteredOptions.value[g]?.options.length || 0;
  }
  return number + optionIndex;  // Unieke positie-gebaseerde nummer
};
```

### 5.4 Dropdowns Sluiten bij Navigatie

**Probleem:** Dropdowns bleven open bij navigeren naar volgend veld.

**Oplossing:** Automatisch alle open dropdowns sluiten:

```typescript
const closeAllDropdowns = (): void => {
  // Close organisers popup
  const popup = document.querySelector('.organisers-popup.open');
  if (popup) {
    const btn = popup.querySelector('.done-button');
    btn?.click();
  }
  
  // Close all open dropdown headers
  const openHeaders = document.querySelectorAll('.dropdown-header.open');
  openHeaders.forEach(header => header.click());
};

const focusFieldElement = (key: FieldKey, el: HTMLElement): void => {
  closeAllDropdowns();  // Eerst sluiten
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // ... focus logic
  }, 50);
};
```

### 5.5 CORS Errors met Firebase Functions

**Probleem:** Firebase Cloud Functions gaven CORS errors.

**Initiële aanpak:** Firebase Functions aanroepen voor AI editing.

**Error:**
```
Access to fetch at 'https://us-central1-vaia-form.cloudfunctions.net/editText' 
has been blocked by CORS policy
```

**Oplossing:** Direct OpenAI API aanroepen vanuit frontend met environment variable:

```typescript
// .env bestand
VITE_OPENAI_API_KEY=sk-your-key-here

// editService.ts
private async callOpenAI(messages): Promise<string | null> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages
    })
  });
  // ...
}
```

### 5.6 Speech/Listen Conflict

**Probleem:** Systeem hoorde zijn eigen spraak terug en triggerde commando's.

**Oplossing:** Pauzeer luisteren tijdens spreken:

```typescript
speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    this.wasListeningBeforeSpeech = this.isListening;
    
    // Stop listening before speaking
    if (this.isListening && this.recognition) {
      this.recognition.stop();
    }
    
    utterance.onend = () => {
      // Resume listening after speaking
      if (this.wasListeningBeforeSpeech && this.recognition) {
        setTimeout(() => this.recognition.start(), 300);
      }
      resolve();
    };
    
    this.synth.speak(utterance);
  });
}
```

---

## 6. Code Voorbeelden

### 6.1 Voice Command Flow (VAIA)

```typescript
// 1. User speaks → VUIService receives transcript
vuiService.onEvent((event) => {
  if (event.type === 'recognition-result' && event.data.isFinal) {
    const transcript = event.data.transcript;
    
    // 2. Parse command
    const command = parseCommand(transcript);
    
    // 3. Execute command
    switch (command) {
      case 'navigate':
        handleNavigateCommand(transcript, speak);
        break;
      case 'edit':
        handleEditCommand(transcript, speak);
        break;
      case 'fill':
        handleFillCommand(transcript, speak, setLinkSuggestions);
        break;
    }
  }
});
```

### 6.2 Emotion Analysis Flow (Goose)

```typescript
// 1. Analyze user message emotion
const emotionResult = await humeExpressionService.analyzeTextEmotion(userMessage);

// 2. Check safety
const safetyResult = safetyService.checkContent(userMessage);

// 3. Generate response based on emotion + safety
const response = generateResponse({
  message: userMessage,
  emotion: emotionResult.dominantEmotion,
  intensity: emotionResult.intensity,
  safetyLevel: safetyResult.riskLevel
});

// 4. Log for research
researchDataLogger.logInteraction({
  type: 'conversation',
  emotion: emotionResult,
  safety: safetyResult
});
```

### 6.3 Form Field Navigation

```typescript
// Navigate to next field in form
export const focusNextFieldInStep = (step: FormStep, direction: 1 | -1): FocusMoveResult => {
  const keys = getOrderedVisibleKeys(step);  // Get all fields in order
  const from = getActiveFieldKey();          // Find current field
  const currentIndex = from ? keys.indexOf(from) : -1;
  const nextIndex = currentIndex + direction;
  
  if (nextIndex >= 0 && nextIndex < keys.length) {
    const to = keys[nextIndex];
    const el = resolveFieldElement(to);
    focusFieldElement(to, el);
    return { from, to };
  }
  
  return { from, to: null, atEdge: direction > 0 ? 'end' : 'start' };
};
```

---

## 7. Belangrijke Beslissingen

### 7.1 Web Speech API vs Cloud Services

| Beslissing | Gekozen | Reden |
|------------|---------|-------|
| Spraakherkenning | Web Speech API | Gratis, geen setup, voldoende voor prototype |
| TTS | SpeechSynthesis API | Browser-native, Nederlandse stemmen beschikbaar |

### 7.2 Command-Based vs Natural Language

| Project | Aanpak | Reden |
|---------|--------|-------|
| VAIA | Command-based | Formulier heeft gestructureerde velden, commands zijn duidelijker |
| Goose | Natural language | Conversatie vereist flexibele interpretatie |

### 7.3 Nederlandse Trigger Words

| Engels | Nederlands | Reden |
|--------|------------|-------|
| "edit" | "verbeter" | Nederlandse spraakherkenning herkent dit beter |
| "next" | "volgende" | Natuurlijker in Nederlandse context |
| "select" | "selecteer"/"kies" | Meerdere varianten voor betere herkenning |

### 7.4 Local Fallbacks

Alle AI-features hebben lokale fallbacks:

```typescript
async editText(originalText: string, instruction: string): Promise<EditResponse> {
  // Try OpenAI first
  const aiResult = await this.callOpenAI(messages);
  if (aiResult) return { editedText: aiResult, success: true };
  
  // Fallback to local processing
  const fallbackResult = this.applyLocalEdit(originalText, instruction);
  return { editedText: fallbackResult, success: true };
}
```

Dit zorgt ervoor dat het systeem blijft werken ook zonder API keys of bij API fouten.

---

## Conclusie Praktische Uitwerking

Beide prototypes demonstreren dat Voice-User Interfaces effectief kunnen worden geïmplementeerd met moderne web technologieën. De belangrijkste leerpunten:

1. **Web Speech API is voldoende** voor Nederlandse spraakherkenning in prototype fase
2. **Nederlandse trigger woorden** verbeteren herkenning significant
3. **Fallback mechanismen** zijn essentieel voor robuustheid
4. **Dropdown/form navigatie** vereist specifieke aandacht voor VUI
5. **Emotie-analyse** voegt waarde toe aan conversational VUI's

De volgende stap is gebruikerstesten om de effectiviteit te meten tegenover traditionele GUI's.

---

*Dit document is onderdeel van de Bachelorproef VUI vs GUI vergelijking.*

