# VAIA VUI Testing Materials

## Inhoudsopgave
1. [Testprotocol & Stappenplan](#1-testprotocol--stappenplan)
2. [Pre-Test Vragenlijst](#2-pre-test-vragenlijst)
3. [Takenlijst voor Deelnemers](#3-takenlijst-voor-deelnemers)
4. [Post-Test Vragenlijst (SUS + Custom)](#4-post-test-vragenlijst)
5. [Observatieformulier voor Onderzoeker](#5-observatieformulier)
6. [Data Logging Specificaties](#6-data-logging)

---

## 1. Testprotocol & Stappenplan

### 1.1 Voorbereiding (1 dag voor test)

| Stap | Actie | Checklist |
|------|-------|-----------|
| 1 | Testomgeving voorbereiden | ☐ VAIA app draait lokaal/online |
| 2 | Browser controleren | ☐ Chrome/Edge met microfoon toegang |
| 3 | Vragenlijsten printen/klaarzetten | ☐ Pre-test, Post-test, Observatie |
| 4 | Opnameapparatuur testen | ☐ Schermopname software werkt |
| 5 | Counterbalancing bepalen | ☐ Deelnemer start met VUI of GUI? |
| 6 | Informed consent voorbereiden | ☐ Toestemmingsformulier klaar |

### 1.2 Testprocedure per Deelnemer (±45-60 min)

```
FASE 1: INTRODUCTIE (5 min)
├── Welkom en uitleg onderzoeksdoel
├── Informed consent ondertekenen
├── Pre-test vragenlijst invullen
└── Uitleg testprocedure

FASE 2: EERSTE INTERFACE (15-20 min)
├── Interface A (VUI of GUI - counterbalanced)
├── Korte oefentaak (1-2 min)
├── 5 testtaken uitvoeren
├── Tijd en fouten worden automatisch gelogd
└── Korte pauze

FASE 3: TWEEDE INTERFACE (15-20 min)
├── Interface B (de andere interface)
├── Korte oefentaak (1-2 min)
├── Dezelfde 5 testtaken uitvoeren
└── Tijd en fouten worden automatisch gelogd

FASE 4: AFRONDING (10-15 min)
├── Post-test vragenlijst (SUS + custom vragen)
├── Semi-gestructureerd interview (5-10 min)
├── Bedanken en eventuele compensatie
└── Data exporteren en opslaan
```

### 1.3 Counterbalancing Schema

| Deelnemer # | Eerste Interface | Tweede Interface |
|-------------|------------------|------------------|
| 1, 3, 5, 7... | VUI | GUI |
| 2, 4, 6, 8... | GUI | VUI |

---

## 2. Pre-Test Vragenlijst

### Deelnemer Informatie
**Deelnemer ID:** _________________ **Datum:** _________________

### Sectie A: Demografische Gegevens

**A1. Wat is uw leeftijd?**
- ☐ 18-24 jaar
- ☐ 25-34 jaar
- ☐ 35-44 jaar
- ☐ 45-54 jaar
- ☐ 55-64 jaar
- ☐ 65+ jaar

**A2. Wat is uw geslacht?**
- ☐ Man
- ☐ Vrouw
- ☐ Anders / Zeg ik liever niet

**A3. Wat is uw hoogst behaalde opleidingsniveau?**
- ☐ Middelbaar onderwijs
- ☐ MBO
- ☐ HBO Bachelor
- ☐ Universiteit Bachelor
- ☐ Master of hoger

**A4. Wat is uw beroep of studierichting?**
_________________________________________________

### Sectie B: Technologie-ervaring

**B1. Hoe vaak gebruikt u digitale apparaten (computer, smartphone, tablet)?**
- ☐ Meerdere uren per dag
- ☐ Ongeveer 1 uur per dag
- ☐ Enkele keren per week
- ☐ Zelden

**B2. Hoe zou u uw algemene computervaardigheden omschrijven?**
- ☐ Beginner
- ☐ Gemiddeld
- ☐ Gevorderd
- ☐ Expert

**B3. Hoe vaak vult u online formulieren in? (bijv. registraties, aanvragen)**
- ☐ Dagelijks
- ☐ Wekelijks
- ☐ Maandelijks
- ☐ Zelden of nooit

### Sectie C: Voice Assistant Ervaring

**C1. Heeft u ervaring met spraakassistenten? (bijv. Siri, Google Assistant, Alexa)**
- ☐ Ja, ik gebruik ze dagelijks
- ☐ Ja, ik gebruik ze wekelijks
- ☐ Ja, maar zelden
- ☐ Nee, nooit gebruikt

**C2. Indien ja, waarvoor gebruikt u spraakassistenten het meest?** (meerdere antwoorden mogelijk)
- ☐ Vragen stellen / informatie opzoeken
- ☐ Timers/alarmen instellen
- ☐ Muziek afspelen
- ☐ Smart home apparaten bedienen
- ☐ Berichten versturen
- ☐ Navigatie
- ☐ Anders: _________________

**C3. Hoe comfortabel voelt u zich bij het hardop praten tegen een apparaat?**

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Zeer oncomfortabel | | Neutraal | | Zeer comfortabel |

**C4. In welke situaties zou u GEEN spraakassistent gebruiken?** (meerdere antwoorden mogelijk)
- ☐ In het openbaar
- ☐ Op kantoor/werk
- ☐ In aanwezigheid van anderen
- ☐ Voor privé informatie
- ☐ Nooit, ik gebruik het overal
- ☐ Anders: _________________

### Sectie D: Verwachtingen

**D1. Wat verwacht u dat makkelijker zal zijn met spraak dan met typen?**
_________________________________________________
_________________________________________________

**D2. Wat verwacht u dat moeilijker zal zijn met spraak dan met typen?**
_________________________________________________
_________________________________________________

---

## 3. Takenlijst voor Deelnemers

### Testtaken VAIA Applicatie

**Scenario:** U bent een opleidingsaanbieder en wilt een nieuwe cursus toevoegen aan de VAIA-website. U heeft de volgende cursusinformatie:

---

**TAAK 1: Basisinformatie invullen** (Form-input)
> Vul de volgende velden in:
> - Titel: "Introductie tot Machine Learning"
> - Ondertitel: "Van theorie naar praktijk"
> - Link: eventbrite.com

**Succescriteria:** Alle 3 velden correct ingevuld

---

**TAAK 2: Datum en tijd instellen** (Form-input met parsing)
> Stel de volgende cursusdata in:
> - Startdatum: 15 maart 2025
> - Einddatum: 20 maart 2025
> - Starttijd: 14:00

**Succescriteria:** Alle datums/tijden correct ingevuld

---

**TAAK 3: Dropdown selectie** (Selection)
> Selecteer de volgende opties:
> - Kennisniveau: "Beginner"
> - Taal: "Nederlands"
> - Selecteer optie nummer 2 in Certificaat

**Succescriteria:** Alle 3 selecties correct gemaakt

---

**TAAK 4: Navigatie en correctie** (Navigation + Edit)
> - Navigeer naar het veld "Titel"
> - Pas de titel aan naar "Machine Learning voor Beginners"
> - Navigeer naar het volgende veld

**Succescriteria:** Navigatie succesvol, titel aangepast

---

**TAAK 5: AI-suggestie gebruiken** (AI-assisted)
> - Accepteer de AI-suggestie voor het doelgroep veld
> - OF: Gebruik "verbeter maak korter" op de beschrijving

**Succescriteria:** AI-functie succesvol gebruikt

---

### Meetpunten per Taak

| Taak | Start Trigger | Eind Trigger | Te Meten |
|------|---------------|--------------|----------|
| 1 | Eerste karakter/woord | Alle velden gevuld | Tijd, fouten, correcties |
| 2 | Focus op startdatum | Alle datums ingevuld | Tijd, parsing errors |
| 3 | Focus op dropdown | Alle selecties gedaan | Tijd, verkeerde selecties |
| 4 | Navigatie commando | Correctie bevestigd | Tijd, navigatie fouten |
| 5 | AI commando gegeven | Suggestie verwerkt | Tijd, success/fail |

---

## 4. Post-Test Vragenlijst

### Deelnemer ID: _________________ 

### Sectie A: System Usability Scale (SUS) - VUI

*Geef aan in hoeverre u het eens bent met de volgende stellingen over de SPRAAKINTERFACE:*

| Stelling | Helemaal oneens | Oneens | Neutraal | Eens | Helemaal eens |
|----------|-----------------|--------|----------|------|---------------|
| 1. Ik denk dat ik dit systeem regelmatig zou willen gebruiken | 1 | 2 | 3 | 4 | 5 |
| 2. Ik vond het systeem onnodig complex | 1 | 2 | 3 | 4 | 5 |
| 3. Ik vond het systeem makkelijk te gebruiken | 1 | 2 | 3 | 4 | 5 |
| 4. Ik denk dat ik technische ondersteuning nodig zou hebben om dit systeem te kunnen gebruiken | 1 | 2 | 3 | 4 | 5 |
| 5. Ik vond de verschillende functies in dit systeem goed geïntegreerd | 1 | 2 | 3 | 4 | 5 |
| 6. Ik vond dat er te veel inconsistenties in dit systeem zaten | 1 | 2 | 3 | 4 | 5 |
| 7. Ik kan me voorstellen dat de meeste mensen dit systeem snel zouden leren gebruiken | 1 | 2 | 3 | 4 | 5 |
| 8. Ik vond het systeem erg omslachtig in gebruik | 1 | 2 | 3 | 4 | 5 |
| 9. Ik voelde me erg zelfverzekerd tijdens het gebruik van het systeem | 1 | 2 | 3 | 4 | 5 |
| 10. Ik moest veel leren voordat ik aan de slag kon met dit systeem | 1 | 2 | 3 | 4 | 5 |

**SUS Score VUI:** _______ /100

---

### Sectie B: System Usability Scale (SUS) - GUI

*Geef aan in hoeverre u het eens bent met de volgende stellingen over de GRAFISCHE INTERFACE (typen/klikken):*

| Stelling | Helemaal oneens | Oneens | Neutraal | Eens | Helemaal eens |
|----------|-----------------|--------|----------|------|---------------|
| 1. Ik denk dat ik dit systeem regelmatig zou willen gebruiken | 1 | 2 | 3 | 4 | 5 |
| 2. Ik vond het systeem onnodig complex | 1 | 2 | 3 | 4 | 5 |
| 3. Ik vond het systeem makkelijk te gebruiken | 1 | 2 | 3 | 4 | 5 |
| 4. Ik denk dat ik technische ondersteuning nodig zou hebben | 1 | 2 | 3 | 4 | 5 |
| 5. Ik vond de verschillende functies goed geïntegreerd | 1 | 2 | 3 | 4 | 5 |
| 6. Ik vond dat er te veel inconsistenties zaten | 1 | 2 | 3 | 4 | 5 |
| 7. Ik kan me voorstellen dat de meeste mensen dit snel zouden leren | 1 | 2 | 3 | 4 | 5 |
| 8. Ik vond het systeem erg omslachtig | 1 | 2 | 3 | 4 | 5 |
| 9. Ik voelde me erg zelfverzekerd tijdens het gebruik | 1 | 2 | 3 | 4 | 5 |
| 10. Ik moest veel leren voordat ik aan de slag kon | 1 | 2 | 3 | 4 | 5 |

**SUS Score GUI:** _______ /100

---

### Sectie C: Vergelijkende Vragen

**C1. Welke interface had uw voorkeur voor het invullen van formulieren?**
- ☐ Sterk voorkeur voor spraak (VUI)
- ☐ Lichte voorkeur voor spraak (VUI)
- ☐ Geen voorkeur / gelijk
- ☐ Lichte voorkeur voor typen (GUI)
- ☐ Sterk voorkeur voor typen (GUI)

**C2. Welke interface was SNELLER volgens u?**
- ☐ Spraak was veel sneller
- ☐ Spraak was iets sneller
- ☐ Ongeveer gelijk
- ☐ Typen was iets sneller
- ☐ Typen was veel sneller

**C3. Welke interface was NAUWKEURIGER volgens u?**
- ☐ Spraak was veel nauwkeuriger
- ☐ Spraak was iets nauwkeuriger
- ☐ Ongeveer gelijk
- ☐ Typen was iets nauwkeuriger
- ☐ Typen was veel nauwkeuriger

**C4. Welke interface was VERMOEIENDER?**
- ☐ Spraak was veel vermoeiender
- ☐ Spraak was iets vermoeiender
- ☐ Ongeveer gelijk
- ☐ Typen was iets vermoeiender
- ☐ Typen was veel vermoeiender

---

### Sectie D: VUI-Specifieke Vragen

**D1. Hoe goed begreep het systeem wat u zei?**

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Zeer slecht | Slecht | Matig | Goed | Zeer goed |

**D2. Hoe natuurlijk voelden de spraakcommando's aan?**

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Zeer onnatuurlijk | | Neutraal | | Zeer natuurlijk |

**D3. Welke spraakcommando's werkten het BESTE?** (meerdere mogelijk)
- ☐ Navigatie (ga naar, volgende veld)
- ☐ Tekst invoeren (schrijf, vul in)
- ☐ Selectie (selecteer nummer)
- ☐ AI bewerking (verbeter, maak korter)
- ☐ Datum/tijd invoeren

**D4. Welke spraakcommando's werkten het SLECHTSTE?** (meerdere mogelijk)
- ☐ Navigatie
- ☐ Tekst invoeren
- ☐ Selectie
- ☐ AI bewerking
- ☐ Datum/tijd invoeren

**D5. Zou u deze spraakinterface in het echt gebruiken?**
- ☐ Ja, zeker
- ☐ Ja, waarschijnlijk
- ☐ Misschien
- ☐ Waarschijnlijk niet
- ☐ Zeker niet

**D6. In welke situatie zou u spraak verkiezen boven typen?**
_________________________________________________
_________________________________________________

**D7. In welke situatie zou u typen verkiezen boven spraak?**
_________________________________________________
_________________________________________________

---

### Sectie E: Open Vragen

**E1. Wat vond u het meest POSITIEF aan de spraakinterface?**
_________________________________________________
_________________________________________________
_________________________________________________

**E2. Wat vond u het meest FRUSTREREND aan de spraakinterface?**
_________________________________________________
_________________________________________________
_________________________________________________

**E3. Welke verbeteringen zou u voorstellen voor de spraakinterface?**
_________________________________________________
_________________________________________________
_________________________________________________

**E4. Heeft u nog andere opmerkingen?**
_________________________________________________
_________________________________________________
_________________________________________________

---

## 5. Observatieformulier voor Onderzoeker

### Deelnemer ID: _______ | Datum: _______ | Interface Volgorde: VUI→GUI / GUI→VUI

### Gedragsobservaties tijdens VUI

| Observatie | Ja | Nee | Opmerkingen |
|------------|----|----|-------------|
| Aarzelt voor het spreken | | | |
| Herhaalt commando's vaak | | | |
| Uit frustratie (zucht, kreun) | | | |
| Vraagt om hulp/uitleg | | | |
| Wijkt af van instructies | | | |
| Ontwikkelt eigen strategieën | | | |
| Spreekt te zacht/luid | | | |
| Spreekt te snel/langzaam | | | |

### Specifieke Problemen Geobserveerd

| Probleem | Frequentie | Context |
|----------|------------|---------|
| Spraakherkenningsfout | | |
| Verkeerd commando begrepen | | |
| Navigatiefout | | |
| Selectiefout | | |
| Systeem reageert niet | | |

### Quotes/Opmerkingen van Deelnemer
```
Tijdens test:
_________________________________________________
_________________________________________________

Na test:
_________________________________________________
_________________________________________________
```

### Algemene Indruk
_________________________________________________
_________________________________________________

---

## 6. Data Logging Specificaties

### 6.1 Automatisch Gelogde Data

```typescript
interface TestSession {
  sessionId: string;
  participantId: string;
  startTime: string;
  endTime: string;
  interfaceOrder: 'VUI_FIRST' | 'GUI_FIRST';
  tasks: TaskLog[];
  interactions: InteractionLog[];
}

interface TaskLog {
  taskId: string;
  taskName: string;
  interface: 'VUI' | 'GUI';
  startTime: string;
  endTime: string;
  duration_ms: number;
  success: 'COMPLETE' | 'PARTIAL' | 'FAILED';
  errorCount: number;
  correctionCount: number;
  helpRequested: boolean;
}

interface InteractionLog {
  timestamp: string;
  type: 'voice' | 'click' | 'type' | 'system';
  action: string;
  fieldId?: string;
  value?: string;
  error?: string;
  duration_ms?: number;
}
```

### 6.2 Te Exporteren Metrics

| Metric | Beschrijving | Berekening |
|--------|--------------|------------|
| Task Completion Time | Tijd per taak in ms | endTime - startTime |
| Error Rate | % fouten per taak | errors / attempts |
| Success Rate | % succesvolle taken | successful / total |
| Commands per Task | Aantal commando's | count(voice interactions) |
| Recognition Errors | Herkenningsfouten | count(recognition-error) |
| Correction Rate | Correcties nodig | corrections / tasks |

### 6.3 Export Formaat

Data wordt geëxporteerd als JSON met de volgende structuur:
- `research-data-{participantId}-{timestamp}.json`

---

## Bijlagen

### A. SUS Score Berekening

```
1. Trek 1 af van de score voor items 1, 3, 5, 7, 9
2. Trek de score van items 2, 4, 6, 8, 10 af van 5
3. Tel alle aangepaste scores op
4. Vermenigvuldig met 2.5

Score interpretatie:
- < 50: Slecht
- 50-70: Matig
- 70-85: Goed
- > 85: Excellent
```

### B. Interview Vragen (Semi-gestructureerd)

1. Kunt u beschrijven hoe het voelde om spraak te gebruiken vs typen?
2. Waren er momenten waarop u wilde overschakelen naar de andere interface?
3. Hoe zou u deze technologie in uw dagelijks leven/werk kunnen gebruiken?
4. Wat zou er moeten veranderen om spraak uw voorkeur te maken?

### C. Informed Consent Template

[Zie apart document]

---

*Laatste update: [datum]*
*Versie: 1.0*




