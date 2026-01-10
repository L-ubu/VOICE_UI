# Research Data Logging - Goose Project

## Overzicht

De `researchDataLogger` service verzamelt uitgebreide data over:
- **VUI Interacties**: Commando's, transcripts, errors, berichten
- **HUME AI Analyses**: Audio, tekst, en gecombineerde emotie-analyses
- **Performance Metrics**: Response tijden, success rates, error rates
- **Safety Checks**: Veiligheidscontroles en risico-niveaus

## HUME AI & Nederlandse Ondersteuning

✅ **HUME AI ondersteunt Nederlands!**

Volgens de officiële HUME AI documentatie:
- **Prosody & Vocal Bursts**: Werken met 50+ talen, inclusief Nederlands
- **Transcription**: Ondersteunt 20 talen, inclusief Nederlands
- **Emotional Language**: Analyseert emotionele taal in meerdere talen

De fallback analyse gebruikt Nederlandse keywords voor emotie-detectie.

## Data Verzameling

### Automatische Logging

De logger verzamelt automatisch:

1. **VUI Interacties**
   - Voice transcripts
   - Parsed commands (select-option, fill-blank, send-now, etc.)
   - Errors en success states
   - Performance timings

2. **HUME Analyses**
   - Audio analyses (prosody, vocal bursts)
   - Text analyses (emotional language)
   - Gecombineerde analyses
   - API vs fallback gebruik
   - Response tijden

3. **Performance Metrics**
   - Command parsing tijd
   - Blank filling tijd
   - Option selection tijd
   - Message sending tijd
   - Safety check tijd

4. **Emotie Data**
   - Gedetecteerde emoties met scores
   - Sentiment (positive/negative/neutral)
   - Intensity (low/medium/high/critical)
   - Risk levels
   - Intervention flags

## Data Export

### Via Code

```typescript
import { researchDataLogger } from '@/services/researchDataLogger';

// Export als JSON
const jsonData = await researchDataLogger.exportData('json');

// Download naar bestand
await researchDataLogger.downloadData('my-research-session.json');
```

### Via UI (Development Mode)

Er is een verborgen export knop (standaard uitgeschakeld). Zet `v-if="false"` naar `v-if="true"` in `ConversationPage.vue` om deze te activeren.

## Data Structuur

### Session Data

```json
{
  "sessionId": "session_1234567890_abc123",
  "startTime": "2024-01-01T12:00:00.000Z",
  "endTime": "2024-01-01T12:30:00.000Z",
  "duration": 1800000,
  "totalInteractions": 150,
  "logs": [...],
  "summary": {
    "vuiInteractions": {
      "commands": 45,
      "transcripts": 60,
      "errors": 2,
      "messagesSent": 30
    },
    "humeAnalyses": {
      "audio": 30,
      "text": 30,
      "combined": 30,
      "apiUsed": 0,
      "fallbackUsed": 90
    },
    "performance": {
      "averageResponseTime": 245.5,
      "successRate": 98.5,
      "errorRate": 1.5
    },
    "emotions": {
      "topEmotions": [
        { "name": "sadness", "count": 15 },
        { "name": "joy", "count": 10 }
      ],
      "sentimentDistribution": {
        "negative": 20,
        "positive": 10,
        "neutral": 60
      }
    }
  }
}
```

## Gebruik voor Onderzoek

### Metrics die je kunt analyseren:

1. **VUI Effectiviteit**
   - Success rate van commando's
   - Gemiddelde response tijd
   - Error rate
   - Command parsing accuratesse

2. **HUME AI Performance**
   - API vs fallback gebruik
   - Response tijden
   - Emotie detectie accuratesse
   - Sentiment analyse kwaliteit

3. **User Experience**
   - Interactie patronen
   - Meest gebruikte commando's
   - Blank filling success rate
   - Option selection patterns

4. **Emotie Analyse**
   - Meest voorkomende emoties
   - Sentiment distributie
   - Intensity levels
   - Risk level trends

## Session Management

Elke sessie krijgt een unieke ID. Nieuwe sessie starten:

```typescript
researchDataLogger.clear(); // Start nieuwe sessie
```

## Enable/Disable Logging

```typescript
researchDataLogger.enable();  // Start logging
researchDataLogger.disable(); // Stop logging
```

## Best Practices

1. **Export regelmatig**: Download data na elke test sessie
2. **Anonymize data**: Verwijder persoonlijke informatie voor publicatie
3. **Backup data**: Bewaar exports op veilige locatie
4. **Analyze patterns**: Gebruik de summary data voor snelle insights

## Voorbeelden

### Analyse VUI Performance

```typescript
const summary = researchDataLogger.generateSummary();
console.log('VUI Success Rate:', summary.performance.successRate);
console.log('Average Response Time:', summary.performance.averageResponseTime);
```

### Analyse Emotie Trends

```typescript
const summary = researchDataLogger.generateSummary();
console.log('Top Emotions:', summary.emotions.topEmotions);
console.log('Sentiment Distribution:', summary.emotions.sentimentDistribution);
```

## Troubleshooting

**Geen data wordt gelogd?**
- Controleer of logging enabled is: `researchDataLogger.enable()`
- Check console voor `[ResearchLogger]` messages

**Data export werkt niet?**
- Controleer browser console voor errors
- Zorg dat browser downloads toestaat

**Performance metrics ontbreken?**
- Zorg dat `performance.now()` beschikbaar is
- Check of timing functies correct worden aangeroepen


