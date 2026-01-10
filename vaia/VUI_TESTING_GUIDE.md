# VUI Prototype Testing Guide

## Overview
This prototype implements a Voice-User Interface (VUI) for the VAIA form application, designed for research comparing VUI vs GUI interfaces.

## Features

### Voice Commands
The VUI supports the following voice commands (in Dutch):

1. **Fill Field**: "Vul [veldnaam] in met [waarde]"
   - Example: "Vul titel in met Artificiële Intelligentie in de Kunst"

2. **Navigate**: "Ga naar [veldnaam]"
   - Example: "Ga naar doelgroep"

3. **Read AI Suggestion**: "Lees suggestie"
   - Reads the AI suggestion for the currently focused field

4. **Accept Suggestion**: "Accepteer suggestie"
   - Accepts the AI suggestion for the current field

5. **Reject Suggestion**: "Wijs suggestie af"
   - Rejects the AI suggestion

6. **Navigation**: 
   - "Volgende stap" - Go to next form step
   - "Vorige stap" - Go to previous form step

7. **Stop**: "Stop" or "Stop luisteren"
   - Stops voice recognition

### Field Names (Dutch)
- titel / title
- inleiding / introduction
- ondertitel / subtitle
- beschrijving / description
- link / courselink
- doelgroep / targetgroup
- vereisten / requirements
- prijs / price
- locatie / location
- uren / hours
- voornaam / firstname
- achternaam / lastname
- email
- organisatie / organisation

## Browser Requirements

- **Chrome** (recommended) - Full support
- **Edge** - Full support
- **Safari** - Limited support (may need fallback)
- **Firefox** - Limited support

The Web Speech API is required for speech recognition and text-to-speech.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd vaia
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Navigate to `http://localhost:5173/v2` (or the port shown in terminal)
   - The VUI control panel will appear in the bottom-right corner

4. **Enable Microphone Permission**
   - When you click "Start spraak", the browser will ask for microphone permission
   - Click "Allow" to enable voice recognition

## Testing Procedure

### For Research Testing

1. **Start a Session**
   - The data logger automatically starts when the page loads
   - All interactions are logged automatically

2. **Complete Form Tasks**
   - Fill out the form using voice commands
   - Try different voice commands
   - Test AI suggestion acceptance/rejection

3. **Export Data**
   - Open browser console (F12)
   - Type: `window.dataLogger.downloadSession()`
   - This will download a JSON file with all logged data

### Test Scenarios

#### Scenario 1: Basic Form Filling
1. Start voice recognition
2. Say "Ga naar titel"
3. Say "Vul titel in met [your course title]"
4. Navigate to next field and repeat

#### Scenario 2: AI Suggestions
1. First, provide a course URL or paste course information
2. Wait for AI suggestions to be generated
3. Navigate to a field with suggestions
4. Say "Lees suggestie"
5. Say "Accepteer suggestie" or "Wijs suggestie af"

#### Scenario 3: Form Navigation
1. Fill out step 1 (Content)
2. Say "Volgende stap"
3. Fill out step 2 (Categories & metadata)
4. Say "Vorige stap" to go back

## Data Collection

### Automatic Logging
The system automatically logs:
- All voice interactions
- All GUI interactions (clicks, typing)
- Task completion times
- Errors and corrections
- Field focus events
- Form navigation

### Data Export
To export research data:

```javascript
// Export current session
window.dataLogger.downloadSession()

// Export all sessions
window.dataLogger.downloadAllSessions()

// Get current session data (for console inspection)
window.dataLogger.getCurrentSession()
```

### Logged Metrics
- **Task Completion Time**: Time to complete each task
- **Number of Interactions**: Total voice/GUI interactions
- **Error Count**: Number of errors and corrections
- **Field-level Data**: Time spent per field, errors per field
- **Voice Command Success Rate**: Successful vs failed commands

## Troubleshooting

### Microphone Not Working
- Check browser permissions (Settings > Privacy > Microphone)
- Try refreshing the page
- Use Chrome or Edge for best compatibility

### Voice Recognition Not Accurate
- Speak clearly and at a normal pace
- Reduce background noise
- Check that language is set to Dutch (nl-NL)

### Commands Not Recognized
- Speak the exact command phrases
- Check the help section in the VUI control panel
- Commands are case-insensitive but must match the pattern

### Data Not Logging
- Check browser console for errors
- Ensure JavaScript is enabled
- Check that the dataLogger service is initialized

## Development Notes

### Toggle VUI On/Off
In `HomeV2View.vue`, set `enableVUI` to `false` to disable VUI:
```typescript
const enableVUI = ref<boolean>(false); // Set to false to disable
```

### Switch Between VUI and GUI
For research comparison:
1. Complete form with VUI enabled (enableVUI = true)
2. Complete form with VUI disabled (enableVUI = false)
3. Compare the exported data

### Customize Voice Commands
Edit `VUIControlComponent.vue` in the `parseCommand` function to add new commands.

## Research Metrics

The prototype collects data for:
- **Efficiency**: Task completion time (VUI vs GUI)
- **Accuracy**: Error rates and corrections
- **User Experience**: Interaction patterns, command success rates
- **Context-specific Performance**: Performance per field type, task type

## Next Steps

1. Test the prototype with real users
2. Collect data for both VUI and GUI modes
3. Analyze the exported JSON data
4. Compare metrics between interfaces
5. Document findings in research paper

## Support

For issues or questions:
- Check browser console for errors
- Review the code comments in service files
- Check the BP.txt document for research context






















