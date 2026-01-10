# Goose VUI Research Testing Protocol

## Inhoudsopgave
1. [Testprotocol en Stappenplan](#1-testprotocol-en-stappenplan)
2. [Dataverzameling in de App](#2-dataverzameling-in-de-app)
3. [Dataverzameling tijdens Observatie](#3-dataverzameling-tijdens-observatie)
4. [Pre-Test Vragenlijst](#4-pre-test-vragenlijst)
5. [Post-Test Vragenlijst](#5-post-test-vragenlijst)
6. [System Usability Scale (SUS)](#6-system-usability-scale-sus)
7. [Semi-gestructureerd Interview](#7-semi-gestructureerd-interview)

---

## 1. Testprotocol en Stappenplan

### 1.1 Testvoorbereiding

#### Materialen Checklist
- [ ] Laptop met Goose applicatie (Chrome browser)
- [ ] Werkende microfoon (getest)
- [ ] Stille testomgeving
- [ ] Informed consent formulieren
- [ ] Pre-test vragenlijsten (geprint of digitaal)
- [ ] Post-test vragenlijsten
- [ ] Observatieformulieren
- [ ] Stopwatch / timer
- [ ] Opnameapparatuur (optioneel, met toestemming)

#### Technische Setup
```bash
# Zorg dat de app draait
cd Goose
npm run dev

# Open in Chrome (beste Web Speech API ondersteuning)
# Navigeer naar http://localhost:5173

# Controleer console op fouten
# Zorg dat VITE_OPENAI_API_KEY en VITE_HUME_API_KEY zijn ingesteld
```

### 1.2 Stappenplan per Deelnemer

| Stap | Activiteit | Duur | Notities |
|------|------------|------|----------|
| 1 | Welkom & informed consent | 5 min | Leg doel uit, vraag toestemming opname |
| 2 | Pre-test vragenlijst | 5 min | Demografisch + ervaring VUI |
| 3 | Introductie Goose (GUI) | 3 min | Korte uitleg interface |
| 4 | **Taak 1: GUI conversatie** | 10 min | Timer starten, observeren |
| 5 | SUS vragenlijst (GUI) | 3 min | Direct na GUI taak |
| 6 | Pauze | 2 min | Reset app, nieuwe sessie |
| 7 | Introductie VUI | 3 min | Uitleg spraakcommando's |
| 8 | **Taak 2: VUI conversatie** | 10 min | Timer starten, observeren |
| 9 | SUS vragenlijst (VUI) | 3 min | Direct na VUI taak |
| 10 | Post-test vragenlijst | 5 min | Vergelijking VUI vs GUI |
| 11 | Semi-gestructureerd interview | 10 min | Open vragen, doorvragen |
| 12 | Debriefing & bedanken | 3 min | Vragen beantwoorden |

**Totale duur: ~60 minuten per deelnemer**

### 1.3 Counterbalancing

Om volgorde-effecten te voorkomen:
- **Groep A** (oneven deelnemers): GUI eerst → VUI
- **Groep B** (even deelnemers): VUI eerst → GUI

### 1.4 Testtaken

#### Taak Scenario
> "Stel je voor dat je een moeilijk gesprek wilt voeren met een familielid. Je wilt oefenen hoe je dit gesprek kunt aanpakken. Gebruik Goose om advies te krijgen en te oefenen."

#### Specifieke Subtaken
1. Start een nieuw gesprek met Goose
2. Kies een van de voorgestelde opties
3. Beschrijf je situatie (minimaal 2 zinnen)
4. Reageer op Goose's suggesties (minimaal 3 beurten)
5. Gebruik minimaal één "blank" invul-optie
6. Beëindig het gesprek

---

## 2. Dataverzameling in de App

### 2.1 Automatische Logging via ResearchDataLogger

De app logt automatisch de volgende data:

```typescript
// Types van gelogde data
interface VUIInteraction {
  type: 'command' | 'transcript' | 'error' | 'audio-analysis' | 
        'text-analysis' | 'safety-check' | 'message-sent';
  timestamp: string;
  sessionId: string;
  data: any;
  metadata?: { duration?: number; success?: boolean; error?: string };
}

interface HUMEAnalysisLog {
  type: 'audio' | 'text' | 'combined';
  timestamp: string;
  sessionId: string;
  input: { text?: string; audioSize?: number; audioType?: string };
  analysis: {
    emotions: Array<{ name: string; score: number }>;
    topEmotion: string;
    sentiment: string;
    arousal: string;
    riskLevel: string;
    requiresIntervention: boolean;
    sourceText?: string;
  };
  apiUsed: 'hume-api' | 'fallback';
  performance: { responseTime?: number; fallbackUsed: boolean };
}
```

### 2.2 Data Export

Na elke testsessie, exporteer de data:

```javascript
// In browser console uitvoeren:
const data = await researchDataLogger.exportData();
console.log(data);

// Of download als JSON:
researchDataLogger.downloadData(`goose-test-deelnemer-${deelnemerNummer}.json`);
```

### 2.3 Metrics die worden verzameld

| Metric | Beschrijving | Bron |
|--------|--------------|------|
| `sessionId` | Unieke sessie identifier | Automatisch |
| `timestamps` | Start/eind tijden | Automatisch |
| `transcripts` | Alle gesproken tekst | VUIService |
| `emotions` | Gedetecteerde emoties per uiting | HumeService |
| `sentiment` | Positief/negatief/neutraal | HumeService |
| `arousal` | Emotionele intensiteit | HumeService |
| `riskLevel` | Veiligheidsniveau | SafetyService |
| `commandSuccess` | Spraakcommando succesrate | VoiceCommandParser |
| `responseTime` | Hume API latency | Performance log |
| `errorCount` | Aantal spraakherkenningsfouten | VUIService |

### 2.4 Console Logging Interpretatie

Tijdens de test verschijnt in de console:

```
[HUME] 🎤 Voice: sadness (67%) | 1234ms    // Audio emotie
[HUME] 📝 Text: anxiety (45%) | 567ms      // Tekst emotie
[HUME] 🔗 Combined: sadness (58%)          // Gecombineerd resultaat
[ResearchLogger] VUI Interaction: {...}     // Interactie log
[ResearchLogger] HUME Analysis: {...}       // Emotie-tekst paren
```

---

## 3. Dataverzameling tijdens Observatie

### 3.1 Observatieformulier

```
OBSERVATIEFORMULIER GOOSE VUI TEST
==================================

Deelnemer ID: ___________     Datum: ___________
Conditie: [ ] GUI eerst  [ ] VUI eerst
Observer: ___________

TAAK 1: GUI CONVERSATIE
-----------------------
Starttijd: ___:___    Eindtijd: ___:___    Duur: ___ min

Aantal berichten verzonden: _____
Aantal opties geselecteerd: _____
Aantal blanks ingevuld: _____
Aantal fouten/correcties: _____

Observaties gedrag:
[ ] Aarzelt voor typen
[ ] Typt snel/langzaam
[ ] Leest opties aandachtig
[ ] Scrolt veel terug
[ ] Lijkt gefrustreerd
[ ] Lijkt geëngageerd

Notities:
_________________________________________________
_________________________________________________


TAAK 2: VUI CONVERSATIE
-----------------------
Starttijd: ___:___    Eindtijd: ___:___    Duur: ___ min

Aantal spraakcommando's: _____
Succesvolle herkenningen: _____
Mislukte herkenningen: _____
Aantal "selecteer X" commando's: _____
Aantal vrije spraak berichten: _____

Observaties gedrag:
[ ] Spreekt duidelijk/onduidelijk
[ ] Past spraak aan na fouten
[ ] Herhaalt commando's
[ ] Gebruikt handgebaren
[ ] Kijkt naar scherm tijdens spreken
[ ] Wacht op feedback
[ ] Lijkt ongemakkelijk met spreken

Spraakproblemen genoteerd:
_________________________________________________

Emotionele reacties:
[ ] Lacht
[ ] Zucht
[ ] Fronst
[ ] Lijkt ontspannen
[ ] Lijkt gespannen

Notities:
_________________________________________________
_________________________________________________


VERGELIJKING
------------
Welke interface leek sneller? [ ] GUI  [ ] VUI  [ ] Gelijk
Welke interface leek makkelijker? [ ] GUI  [ ] VUI  [ ] Gelijk
Bij welke was gebruiker meer betrokken? [ ] GUI  [ ] VUI  [ ] Gelijk

Algemene observaties:
_________________________________________________
_________________________________________________
```

### 3.2 Video/Audio Opname (Optioneel)

Met toestemming van de deelnemer:
- Schermopname van de sessie
- Audio-opname van gesproken interacties
- Gezichtsopname voor emotie-observatie

**Let op:** Vraag expliciet toestemming en leg vast in informed consent.

---

## 4. Pre-Test Vragenlijst

### Demografische Gegevens

1. **Leeftijd:**
   - [ ] 18-24
   - [ ] 25-34
   - [ ] 35-44
   - [ ] 45-54
   - [ ] 55-64
   - [ ] 65+

2. **Geslacht:**
   - [ ] Man
   - [ ] Vrouw
   - [ ] Non-binair
   - [ ] Zeg ik liever niet

3. **Hoogst behaald opleidingsniveau:**
   - [ ] Secundair onderwijs
   - [ ] Bachelor
   - [ ] Master
   - [ ] Doctoraat
   - [ ] Anders: _______

### Ervaring met Voice Assistants

4. **Hoe vaak gebruik je spraakassistenten (Siri, Alexa, Google Assistant)?**
   - [ ] Dagelijks
   - [ ] Wekelijks
   - [ ] Maandelijks
   - [ ] Zelden
   - [ ] Nooit

5. **Welke spraakassistenten heb je gebruikt? (meerdere mogelijk)**
   - [ ] Siri (Apple)
   - [ ] Google Assistant
   - [ ] Alexa (Amazon)
   - [ ] Cortana (Microsoft)
   - [ ] Bixby (Samsung)
   - [ ] Geen

6. **Waarvoor gebruik je spraakassistenten meestal? (meerdere mogelijk)**
   - [ ] Muziek afspelen
   - [ ] Weer opvragen
   - [ ] Timers/alarmen zetten
   - [ ] Berichten versturen
   - [ ] Zoekopdrachten
   - [ ] Smart home bediening
   - [ ] Anders: _______

7. **Hoe comfortabel voel je je met hardop praten tegen een apparaat?**
   
   Helemaal niet comfortabel [1] [2] [3] [4] [5] Zeer comfortabel

8. **In welke situaties zou je NIET hardop willen praten tegen een apparaat?**
   - [ ] In het openbaar
   - [ ] Op het werk
   - [ ] Thuis met anderen aanwezig
   - [ ] Nooit een probleem
   - [ ] Anders: _______

### Ervaring met AI Chatbots

9. **Heb je ervaring met AI chatbots zoals ChatGPT?**
   - [ ] Ja, regelmatig
   - [ ] Ja, soms
   - [ ] Een paar keer geprobeerd
   - [ ] Nee, nooit

10. **Zou je een AI-gebaseerde app gebruiken om emotionele ondersteuning te krijgen?**
    
    Zeer onwaarschijnlijk [1] [2] [3] [4] [5] Zeer waarschijnlijk

---

## 5. Post-Test Vragenlijst

### Vergelijking VUI vs GUI

1. **Welke interface vond je MAKKELIJKER in gebruik?**
   - [ ] Typen (GUI)
   - [ ] Spreken (VUI)
   - [ ] Geen verschil

   Waarom? _______________________________________

2. **Welke interface vond je SNELLER?**
   - [ ] Typen (GUI)
   - [ ] Spreken (VUI)
   - [ ] Geen verschil

3. **Welke interface vond je PRETTIGER?**
   - [ ] Typen (GUI)
   - [ ] Spreken (VUI)
   - [ ] Geen verschil

   Waarom? _______________________________________

4. **Bij welke interface voelde je je meer verbonden met Goose?**
   - [ ] Typen (GUI)
   - [ ] Spreken (VUI)
   - [ ] Geen verschil

### VUI-specifieke Vragen

5. **Hoe goed begreep de spraakherkenning wat je zei?**
   
   Zeer slecht [1] [2] [3] [4] [5] Zeer goed

6. **Hoe natuurlijk voelde het om tegen Goose te praten?**
   
   Zeer onnatuurlijk [1] [2] [3] [4] [5] Zeer natuurlijk

7. **Hoe duidelijk waren de spraakcommando's (zoals "selecteer 1")?**
   
   Zeer onduidelijk [1] [2] [3] [4] [5] Zeer duidelijk

8. **Hoeveel fouten maakte de spraakherkenning?**
   - [ ] Geen fouten
   - [ ] 1-2 fouten
   - [ ] 3-5 fouten
   - [ ] Meer dan 5 fouten

9. **Wat deed je wanneer de spraakherkenning je niet begreep?**
   - [ ] Dezelfde zin herhalen
   - [ ] Langzamer/duidelijker praten
   - [ ] Andere woorden gebruiken
   - [ ] Overschakelen naar typen
   - [ ] Anders: _______

### Emotie-analyse Perceptie

10. **Merkte je dat Goose reageerde op je emoties/stemming?**
    - [ ] Ja, duidelijk
    - [ ] Ja, een beetje
    - [ ] Nee, niet echt
    - [ ] Nee, helemaal niet

11. **Als ja, hoe voelde dat?**
    - [ ] Prettig/ondersteunend
    - [ ] Ongemakkelijk
    - [ ] Indrukwekkend
    - [ ] Griezelig
    - [ ] Neutraal

12. **Vond je dat Goose empathisch reageerde?**
    
    Helemaal niet [1] [2] [3] [4] [5] Zeer empathisch

### Algemene Ervaring

13. **Zou je Goose met VUI opnieuw gebruiken?**
    
    Zeer onwaarschijnlijk [1] [2] [3] [4] [5] Zeer waarschijnlijk

14. **Zou je Goose aanbevelen aan anderen?**
    
    Zeer onwaarschijnlijk [1] [2] [3] [4] [5] Zeer waarschijnlijk

15. **Wat vond je het BESTE aan de VUI?**
    
    _______________________________________________

16. **Wat vond je het SLECHTSTE aan de VUI?**
    
    _______________________________________________

17. **Welke verbeteringen zou je suggereren?**
    
    _______________________________________________

---

## 6. System Usability Scale (SUS)

De SUS wordt twee keer afgenomen: na GUI en na VUI.

### Instructies
*Score elke stelling van 1 (helemaal mee oneens) tot 5 (helemaal mee eens)*

| # | Stelling | 1 | 2 | 3 | 4 | 5 |
|---|----------|---|---|---|---|---|
| 1 | Ik denk dat ik dit systeem graag regelmatig zou gebruiken | ○ | ○ | ○ | ○ | ○ |
| 2 | Ik vond het systeem onnodig complex | ○ | ○ | ○ | ○ | ○ |
| 3 | Ik vond het systeem gemakkelijk te gebruiken | ○ | ○ | ○ | ○ | ○ |
| 4 | Ik denk dat ik technische ondersteuning nodig zou hebben om dit systeem te kunnen gebruiken | ○ | ○ | ○ | ○ | ○ |
| 5 | Ik vond de verschillende functies in dit systeem goed geïntegreerd | ○ | ○ | ○ | ○ | ○ |
| 6 | Ik vond dat er te veel inconsistenties in dit systeem zaten | ○ | ○ | ○ | ○ | ○ |
| 7 | Ik kan me voorstellen dat de meeste mensen dit systeem snel zouden leren gebruiken | ○ | ○ | ○ | ○ | ○ |
| 8 | Ik vond het systeem erg omslachtig in gebruik | ○ | ○ | ○ | ○ | ○ |
| 9 | Ik voelde me zeer zeker tijdens het gebruik van het systeem | ○ | ○ | ○ | ○ | ○ |
| 10 | Ik moest veel leren voordat ik dit systeem kon gebruiken | ○ | ○ | ○ | ○ | ○ |

### SUS Score Berekening

```
Voor oneven items (1, 3, 5, 7, 9): score - 1
Voor even items (2, 4, 6, 8, 10): 5 - score

SUS Score = som × 2.5

Interpretatie:
- < 50: Niet acceptabel
- 50-70: Marginaal acceptabel  
- 70-80: Goed
- 80-90: Uitstekend
- > 90: Best denkbaar
```

---

## 7. Semi-gestructureerd Interview

### Opening (1 min)
"Bedankt voor het testen van Goose. Ik wil je nu een paar vragen stellen over je ervaring. Er zijn geen goede of foute antwoorden."

### Kernvragen (8 min)

#### Algemene Ervaring
1. "Hoe zou je je algemene ervaring met Goose beschrijven?"
   - Doorvraag: "Wat vond je het meest opvallend?"

2. "Was er een moment waarop je gefrustreerd raakte? Zo ja, wanneer?"
   - Doorvraag: "Hoe ging je daarmee om?"

#### VUI-specifiek
3. "Hoe voelde het om hardop tegen Goose te praten in plaats van te typen?"
   - Doorvraag: "Was dat anders dan je verwacht had?"

4. "Waren er momenten waarop de spraakherkenning je niet begreep?"
   - Doorvraag: "Hoe reageerde je daarop?"

5. "Wat vond je van de spraakcommando's zoals 'selecteer 1'?"
   - Doorvraag: "Waren ze intuïtief? Wat zou je anders doen?"

#### Emotie-analyse
6. "Goose analyseert je emoties via je stem. Wat vind je daarvan?"
   - Doorvraag: "Voelde dat als een inbreuk op je privacy?"
   - Doorvraag: "Merkte je dat de reacties daarop waren afgestemd?"

7. "Vond je dat Goose je emotionele staat begreep?"
   - Doorvraag: "Waar merkte je dat aan?"

#### Vergelijking
8. "Als je moest kiezen: typen of spreken met Goose. Welke kies je?"
   - Doorvraag: "Waarom?"

9. "In welke situatie zou je liever typen, en wanneer liever spreken?"

#### Toekomst
10. "Zou je een app zoals Goose met VUI in het echte leven gebruiken?"
    - Doorvraag: "Waar zou je het voor gebruiken?"
    - Doorvraag: "Wat zou ervoor nodig zijn om je over te halen?"

### Afsluiting (1 min)
"Is er nog iets dat je wilt toevoegen over je ervaring?"

---

## Bijlage A: Informed Consent Formulier

```
INFORMED CONSENT - GOOSE VUI ONDERZOEK
======================================

Onderzoeker: [Naam]
Instelling: Odisee Hogeschool
Contact: [email]

DOEL VAN HET ONDERZOEK
Dit onderzoek vergelijkt voice-user interfaces (VUI) met grafische 
interfaces (GUI) in de context van een emotie-bewuste conversatie-app.

WAT WORDT ER VAN U GEVRAAGD?
- Twee korte gesprekken voeren met de Goose app (~10 min elk)
- Vragenlijsten invullen (~15 min totaal)
- Deelnemen aan een kort interview (~10 min)
- Totale duur: ~60 minuten

GEGEVENSVERZAMELING
Wij verzamelen:
- Antwoorden op vragenlijsten
- Transcripties van uw gesprekken met Goose
- Emotie-analyse data van uw spraak
- Observatienotities

[ ] Ik geef toestemming voor audio-opname van de sessie
[ ] Ik geef toestemming voor schermopname van de sessie

VERTROUWELIJKHEID
- Alle data wordt geanonimiseerd
- Uw naam wordt nergens vermeld
- Data wordt beveiligd opgeslagen
- Na afloop van het onderzoek wordt ruwe data verwijderd

VRIJWILLIGE DEELNAME
- Deelname is volledig vrijwillig
- U kunt op elk moment stoppen zonder reden te geven
- U kunt vragen om uw data te verwijderen

TOESTEMMING
Door hieronder te tekenen, bevestig ik dat ik:
- Dit formulier heb gelezen en begrepen
- Toestemming geef voor deelname
- Weet dat ik op elk moment kan stoppen

Naam: _______________________
Handtekening: _______________________
Datum: _______________________
```

---

## Bijlage B: Data Analyse Plan

### Kwantitatieve Analyse

| Variabele | Type | Analyse |
|-----------|------|---------|
| Task Completion Time | Continu | Paired t-test (VUI vs GUI) |
| SUS Score | Continu | Paired t-test, descriptive |
| Error Rate | Ratio | Wilcoxon signed-rank |
| Emotion Accuracy | Ordinal | Chi-square |
| Command Success Rate | Ratio | Descriptive, correlation |

### Kwalitatieve Analyse

- **Thematische analyse** van interview transcripties
- **Affinity diagramming** voor observatienotities
- **Categorisering** van open vragenlijst-antwoorden

### Verwachte Output

1. Vergelijkingstabel VUI vs GUI prestaties
2. SUS score vergelijking met benchmarks
3. Emotie-detectie accuraatheid analyse
4. Gebruikersvoorkeuren en -percepties
5. Aanbevelingen voor VUI-ontwerp




