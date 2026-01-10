# Project Overview: Voice-User Interface (VUI) Research Prototype

## 📋 Project Context

This project is part of a **Bachelor's thesis research** comparing Voice-User Interfaces (VUI) versus Graphical User Interfaces (GUI) for completing digital tasks. The research question is:

> **"Wat zijn de belangrijkste voordelen en beperkingen van Voice-User Interfaces in vergelijking met grafische interfaces bij het uitvoeren van digitale taken?"**

The prototype is a **Vue 3 web application** that allows users to fill out a course submission form using either:
- **Voice commands** (VUI mode)
- **Traditional mouse/keyboard** (GUI mode)

All interactions are automatically logged for research comparison.

---

## 🏗️ What Has Been Built

### 1. **Core Application Structure**

#### Technology Stack
- **Vue 3** with TypeScript - Modern frontend framework
- **Vite** - Fast build tool and development server
- **Firebase** - Backend services (Firestore, Functions, Hosting)
- **Web Speech API** - Browser-native speech recognition and text-to-speech
- **Pinia** - State management
- **CKEditor 5** - Rich text editing
- **SCSS** - Styling

#### Project Structure
```
vaia/
├── src/
│   ├── services/
│   │   ├── vuiService.ts          # Voice interface service
│   │   └── dataLogger.ts          # Research data logging
│   ├── components/
│   │   └── VUIControlComponent.vue # VUI control panel UI
│   ├── views/
│   │   └── HomeV2View.vue         # Main form with VUI integration
│   ├── stores/                    # Pinia stores
│   ├── utils/                     # Utility functions
│   └── firebase/                  # Firebase configuration
├── VUI_TESTING_GUIDE.md           # Testing instructions
├── PROTOTYPE_SUMMARY.md           # Technical summary
└── QUICK_START.md                  # Quick start guide
```

---

### 2. **Voice-User Interface (VUI) Service**

**File:** `src/services/vuiService.ts`

#### What It Does
- Handles **speech recognition** (converting speech to text)
- Handles **text-to-speech** (converting text to speech)
- Manages voice events and state
- Provides Dutch language support (nl-NL)

#### Key Features
- ✅ **Speech Recognition**: Uses Web Speech API for continuous listening
- ✅ **Text-to-Speech**: Reads AI suggestions and system feedback
- ✅ **Dutch Voice Selection**: Automatically finds and uses Dutch voices
- ✅ **Event System**: Emits events for recognition start/end, results, errors
- ✅ **Smart Speech Management**: Temporarily stops listening while speaking to prevent feedback loops
- ✅ **Browser Compatibility**: Checks for Web Speech API support

#### How It Works
1. **Initialization**: Checks browser support and sets up recognition
2. **Voice Selection**: Finds best Dutch voice (prefers nl-NL, falls back to nl-BE)
3. **Listening**: Continuous recognition mode with interim results
4. **Speaking**: Uses SpeechSynthesis API with Dutch voice
5. **State Management**: Tracks listening/speaking states

---

### 3. **Data Logger Service**

**File:** `src/services/dataLogger.ts`

#### What It Does
- **Automatically logs all interactions** (voice and GUI)
- Tracks **task completion times**
- Records **errors and corrections**
- Manages **sessions** for research data collection
- Exports data as **JSON files** for analysis

#### Data Structure

**Interaction Log:**
```typescript
{
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

**Task Log:**
```typescript
{
  taskId: string;
  taskName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  interactions: InteractionLog[];
  errors: number;
  completed: boolean;
  interfaceType: 'vui' | 'gui';
}
```

**Session Log:**
```typescript
{
  sessionId: string;
  startTime: number;
  endTime?: number;
  interfaceType: 'vui' | 'gui';
  tasks: TaskLog[];
  totalInteractions: number;
  totalErrors: number;
  totalDuration?: number;
}
```

#### Key Features
- ✅ **Automatic Logging**: All interactions logged without manual intervention
- ✅ **Session Management**: Tracks complete user sessions
- ✅ **Task Tracking**: Can track individual tasks within sessions
- ✅ **Error Tracking**: Categorizes and counts errors
- ✅ **Export Functionality**: Download JSON files with all data
- ✅ **Timing Metrics**: Records duration for all interactions

#### How to Export Data
```javascript
// In browser console (F12):
window.dataLogger.downloadSession()        // Current session
window.dataLogger.downloadAllSessions()   // All sessions
window.dataLogger.getCurrentSession()     // View in console
```

---

### 4. **VUI Control Component**

**File:** `src/components/VUIControlComponent.vue`

#### What It Does
- Provides a **floating control panel** for voice interface
- Shows **real-time transcript** of voice input
- Displays **status indicators** (listening, speaking, idle)
- Includes **help section** with available commands
- Handles **command parsing** from voice input

#### UI Features
- 🎤 **Microphone Button**: Start/stop listening
- 📝 **Transcript Display**: Shows last recognized speech
- ⚠️ **Error Messages**: Displays recognition errors
- 📊 **Status Indicators**: Visual feedback for system state
- ❓ **Help Toggle**: Shows/hides command reference

#### Command Parsing
The component parses Dutch voice commands and identifies:
- Navigation commands ("ga naar [veld]")
- Fill commands ("vul [veld] in met [waarde]")
- Write commands ("schrijf [tekst]")
- AI suggestion commands ("lees suggestie", "accepteer suggestie")
- Form navigation ("volgende stap", "vorige stap")
- Checkbox/radio selection
- Field clearing ("wis veld")
- Stop command ("stop")

---

### 5. **Main Form Integration**

**File:** `src/views/HomeV2View.vue`

#### What It Does
- **Main course submission form** with multiple steps
- **Integrates VUI control component**
- **Handles all voice commands** and executes actions
- **Tracks field focus** for context-aware commands
- **Manages form navigation** via voice
- **Logs all interactions** automatically

#### Form Structure
- **Step 0**: Call-to-action / Introduction
- **Step 1**: Content (title, introduction, subtitle, description, link, course type, dates/times)
- **Step 2**: Categories & Metadata (organizers, target groups, pricing, location, contact info)

#### Voice Command Handlers

**Navigation:**
- `handleNavigateCommand()` - Navigate to specific field
- `handleNextFieldCommand()` - Move to next field
- `handlePreviousFieldCommand()` - Move to previous field
- `handleNextStepCommand()` - Go to next form step
- `handlePreviousStepCommand()` - Go to previous form step

**Field Interaction:**
- `handleFillCommand()` - Fill field with value ("vul [veld] in met [waarde]")
- `handleWriteCommand()` - Write text in focused field ("schrijf [tekst]")
- `handleClearFieldCommand()` - Clear current field
- `handleReadFieldCommand()` - Read current field value

**AI Suggestions:**
- `handleReadSuggestionCommand()` - Read AI suggestions for field
- `handleAcceptSuggestionCommand()` - Accept first suggestion
- `handleRejectSuggestionCommand()` - Reject suggestion
- `handleSelectSuggestionCommand()` - Select suggestion by number

**Form Controls:**
- `handleSelectCheckboxCommand()` - Toggle checkbox options
- `handleSelectRadioCommand()` - Select radio button options

#### Field Name Mapping
The system maps Dutch field names to internal field IDs:
- "titel" → `title`
- "inleiding" → `introduction`
- "doelgroep" → `targetGroup`
- etc.

It also supports matching by **first words of field labels** for more natural commands.

---

## 🎯 Supported Voice Commands

### Navigation Commands
1. **"Ga naar [veldnaam]"** - Navigate to a specific field
   - Example: "Ga naar titel" or "Ga naar beknopte inleiding"
2. **"Volgende veld"** / **"Volgende stap"** - Go to next field
3. **"Vorige veld"** / **"Vorige stap"** - Go to previous field
4. **"Volgende pagina"** - Go to next form step
5. **"Vorige pagina"** - Go to previous form step

### Text Input Commands
6. **"Schrijf [tekst]"** - Write text in the currently focused field
   - Example: "Schrijf Artificiële Intelligentie"
7. **"Vul [veldnaam] in met [waarde]"** - Fill a specific field directly
   - Example: "Vul titel in met Artificiële Intelligentie in de Kunst"

### Checkbox Commands
8. **"Selecteer [optie]"** - Select/deselect a checkbox option
   - Example: "Selecteer onderzoek" or "Selecteer levenslang leren"

### Radio Button Commands
9. **"Selecteer bepaalde datum"** - Select fixed date option for course type
10. **"Selecteer eigen tijd"** - Select self-paced option for course type

### General Commands
11. **"Wis veld"** / **"Leeg veld"** - Clear the current field
12. **"Lees veld"** - Read the current value of the field

### AI Suggestion Commands
13. **"Lees suggestie"** - Read all AI suggestions (also opens suggestion box)
14. **"Selecteer 1"** / **"Selecteer twee"** - Select AI suggestion by number (1-12, or een-twaalf in Dutch)
15. **"Accepteer suggestie"** - Accept the first suggestion
16. **"Wijs suggestie af"** - Reject the suggestion

### Control Commands
17. **"Stop"** / **"Stop luisteren"** - Stop listening

---

## 🔬 Research Data Collection

### What Gets Logged

**Automatic Logging:**
- ✅ All voice interactions (commands, transcripts, success/failure)
- ✅ All GUI interactions (clicks, typing, field changes)
- ✅ Task completion times
- ✅ Error counts and types
- ✅ Field-level interactions (time spent, errors per field)
- ✅ Form navigation events
- ✅ AI suggestion interactions

### Metrics Collected

1. **Efficiency Metrics:**
   - Task completion time
   - Time per field
   - Number of interactions per task

2. **Accuracy Metrics:**
   - Error count
   - Error rate per field
   - Correction attempts

3. **User Experience Metrics:**
   - Command success rate
   - Voice recognition accuracy
   - Interaction patterns

4. **Context-Specific Metrics:**
   - Performance per field type (text, textarea, dropdown, checkbox, radio)
   - Performance per task type (lookup, form-input, navigation)

### Exporting Data

After completing a form session:
1. Open browser console (F12)
2. Run: `window.dataLogger.downloadSession()`
3. JSON file downloads with all session data
4. Data can be analyzed for research comparison

---

## 🚀 How to Use

### For Development/Testing

1. **Install Dependencies:**
   ```bash
   cd vaia
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Access Application:**
   - Navigate to: `http://localhost:5173/v2`
   - VUI control panel appears in bottom-right corner

4. **Enable Voice Interface:**
   - Click "Start spraak" button
   - Allow microphone permission when prompted
   - Start speaking commands

### For Research Testing

**Testing VUI Mode:**
1. Set `enableVUI = true` in `HomeV2View.vue` (line ~138)
2. Complete form using voice commands
3. Export data: `window.dataLogger.downloadSession()`

**Testing GUI Mode (for comparison):**
1. Set `enableVUI = false` in `HomeV2View.vue`
2. Complete form using mouse/keyboard
3. Export data: `window.dataLogger.downloadSession()`

**Compare Results:**
- Analyze exported JSON files
- Compare task completion times
- Compare error rates
- Compare interaction patterns

---

## 🏛️ Architecture Overview

### Service Layer
- **vuiService**: Handles all voice-related functionality
- **dataLogger**: Handles all data collection and logging

### Component Layer
- **VUIControlComponent**: UI for voice interface control
- **HomeV2View**: Main form with VUI integration
- **InputField Components**: Form field components (existing)

### Integration Flow

```
User speaks → Web Speech API → vuiService → VUIControlComponent
                                                      ↓
                                            Command parsing
                                                      ↓
                                            HomeV2View handlers
                                                      ↓
                                            Form actions executed
                                                      ↓
                                            dataLogger logs interaction
```

### Event System

1. **Voice Recognition Event** → `vuiService` emits event
2. **VUIControlComponent** receives event → Parses command
3. **Command Event** → Emitted to `HomeV2View`
4. **HomeV2View** executes command → Updates form
5. **dataLogger** logs interaction → Stores in session

---

## 📊 Research Methodology

### Test Setup
- **Wizard of Oz Approach**: Human operator can assist if needed (though system is fully automated)
- **Dual Mode Testing**: Same form can be tested with VUI and GUI separately
- **Controlled Environment**: Same tasks, same form, different interfaces

### Comparison Metrics
1. **Efficiency**: Time to complete tasks
2. **Accuracy**: Error rates and corrections
3. **User Experience**: Interaction patterns, command success rates
4. **Context-Specific Performance**: Performance per field type and task type

### Data Analysis
- Exported JSON files contain all necessary data
- Can be analyzed with statistical software (SPSS, R, Python)
- Supports quantitative and qualitative analysis

---

## 🌐 Browser Requirements

- ✅ **Chrome** (Recommended) - Full support
- ✅ **Edge** - Full support
- ⚠️ **Safari** - Limited support
- ⚠️ **Firefox** - Limited support

**Requirements:**
- Modern browser with Web Speech API support
- Microphone access
- JavaScript enabled

---

## 🔧 Technical Details

### Speech Recognition
- Uses **Web Speech API** (browser-native)
- Language: **Dutch (nl-NL)**
- Mode: **Continuous** (keeps listening)
- Results: **Interim + Final** (shows partial results)

### Text-to-Speech
- Uses **SpeechSynthesis API** (browser-native)
- Language: **Dutch (nl-NL)**
- Voice: Automatically selects best Dutch voice
- Rate: 0.9 (slightly slower for clarity)

### Data Storage
- **In-memory** during session
- **Exported as JSON** files
- Can be extended to Firebase for cloud storage

### Error Handling
- Speech recognition errors logged
- Command parsing failures logged
- Field navigation errors logged
- All errors included in exported data

---

## 📝 Current Status

### ✅ Completed Features

- ✅ Voice recognition (Dutch)
- ✅ Text-to-speech (Dutch)
- ✅ Command parsing and execution
- ✅ Form field filling via voice
- ✅ Form navigation via voice
- ✅ AI suggestion interaction via voice
- ✅ Automatic data logging
- ✅ Data export (JSON)
- ✅ Session management
- ✅ Error tracking
- ✅ Field focus tracking
- ✅ Help documentation
- ✅ Browser compatibility checks

### 🎯 Ready For

- ✅ User testing (10-15 participants recommended)
- ✅ Data collection
- ✅ Research comparison (VUI vs GUI)
- ✅ Statistical analysis

---

## 📚 Documentation Files

1. **VUI_TESTING_GUIDE.md** - Complete testing instructions
2. **PROTOTYPE_SUMMARY.md** - Technical summary
3. **QUICK_START.md** - Quick start guide
4. **README.md** - General project information
5. **STAND_VAN_ZAKEN.md** - Research progress status
6. **TODO_OVERZICHT.md** - Task overview

---

## 🎓 For Your Mentor

### Key Points to Explain

1. **Purpose**: Research prototype comparing VUI vs GUI for form completion tasks

2. **What Works**:
   - Full voice interface for form filling
   - Automatic data collection for research
   - Dual-mode testing (VUI/GUI toggle)
   - Comprehensive logging system

3. **Technical Implementation**:
   - Vue 3 + TypeScript application
   - Web Speech API for voice recognition
   - Service-based architecture
   - Event-driven command handling

4. **Research Value**:
   - Collects quantitative metrics (time, errors, interactions)
   - Supports qualitative analysis (interaction patterns)
   - Enables statistical comparison between interfaces
   - Ready for user testing

5. **Next Steps**:
   - Recruit participants (10-15 recommended)
   - Conduct user tests
   - Analyze collected data
   - Write research findings

---

## 💡 Key Innovations

1. **Automatic Data Logging**: No manual intervention needed - all interactions logged automatically
2. **Dual-Mode Testing**: Same application can test both VUI and GUI modes
3. **Context-Aware Commands**: System understands field context for natural commands
4. **Comprehensive Metrics**: Tracks efficiency, accuracy, and user experience metrics
5. **Research-Ready**: Built specifically for academic research with proper data collection

---

*This prototype is complete and ready for user testing and data collection for your Bachelor's thesis research.*
