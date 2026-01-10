# Quick Start Guide - VUI Prototype

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd vaia
npm install
```

### Step 2: Start the Server
```bash
npm run dev
```

### Step 3: Open in Browser
- Go to: `http://localhost:5173/v2`
- Click "Start spraak" button
- Allow microphone permission
- Start speaking!

## 🎤 Try These Commands

### Navigation Commands
1. **"Ga naar titel"** - Navigate to a specific field
2. **"Volgende stap"** of **"Volgende veld"** - Go to next field in the form
3. **"Vorige veld"** - Go to previous field in the form
4. **"Volgende pagina"** - Go to next form page/step
5. **"Vorige pagina"** - Go to previous form page/step

### Text Input Commands
6. **"Schrijf Artificiële Intelligentie"** - Write text in the selected field (must be at a field first)
7. **"Vul titel in met Artificiële Intelligentie"** - Fill a specific field directly

### Checkbox Commands
8. **"Selecteer onderzoek"** - Select/deselect a checkbox option (works for PrimaryTargetGroup field)
9. **"Selecteer levenslang leren"** - Select/deselect another checkbox option

### Radio Button Commands
10. **"Selecteer bepaalde datum"** - Select the first radio option for "Type opleiding" (fixed date option)
11. **"Selecteer eigen tijd"** - Select the second radio option for "Type opleiding" (self-paced option)

### General Commands
12. **"Wis veld"** of **"Leeg veld"** - Clear the current field
13. **"Lees veld"** - Read the current value of the field

### AI Suggestion Commands
14. **"Lees suggestie"** - Read all AI suggestions (if available) - also opens the suggestion box
15. **"Selecteer 1"** of **"Selecteer twee"** - Select AI suggestion by number (1-12, or een-twaalf in Dutch)
16. **"Accepteer suggestie"** - Accept the first suggestion
17. **"Wijs suggestie af"** - Reject the suggestion

### Control Commands
18. **"Stop"** - Stop listening

**Important:** The system will only write text when you explicitly say "schrijf" or "typ". After navigating to a field, you must say "schrijf [text]" to write in it.

## 📊 Export Research Data

Open browser console (F12) and run:
```javascript
window.dataLogger.downloadSession()
```

This downloads a JSON file with all interaction data.

## 🔧 Toggle VUI On/Off

In `src/views/HomeV2View.vue`, line ~127:
```typescript
const enableVUI = ref<boolean>(true);  // Set to false for GUI-only testing
```

## 📖 Full Documentation

- See `VUI_TESTING_GUIDE.md` for complete testing instructions
- See `PROTOTYPE_SUMMARY.md` for technical details

## ✅ What's Working

- ✅ Voice recognition (Dutch)
- ✅ Text-to-speech for AI suggestions
- ✅ Form field filling via voice
- ✅ Navigation via voice commands
- ✅ AI suggestion interaction
- ✅ Automatic data logging
- ✅ Data export (JSON)

## 🌐 Browser Requirements

- **Chrome** or **Edge** (recommended)
- Microphone access required
- Modern browser with Web Speech API support

## 🐛 Troubleshooting

**Microphone not working?**
- Check browser permissions
- Refresh the page
- Use Chrome/Edge

**Commands not recognized?**
- Speak clearly
- Use exact command phrases (see help in VUI panel)
- Check help section in bottom-right panel

**Data not logging?**
- Check browser console for errors
- Ensure JavaScript is enabled

---

**Ready to test!** 🎉


