# VAIA VUI Onderzoek - Uitvoeringshandleiding

## Inhoudsopgave
1. [Voorbereiding](#1-voorbereiding)
2. [Testomgeving Setup](#2-testomgeving-setup)
3. [Deelnemer Ontvangst](#3-deelnemer-ontvangst)
4. [Test Uitvoering](#4-test-uitvoering)
5. [Data Verzameling & Opslag](#5-data-verzameling--opslag)
6. [Troubleshooting](#6-troubleshooting)
7. [Checklists](#7-checklists)

---

## 1. Voorbereiding

### 1.1 Benodigdheden Checklist

#### Digitaal
- [ ] VAIA applicatie gedeployed of lokaal draaiend
- [ ] Chrome of Edge browser (beste spraakherkenning)
- [ ] Werkende microfoon getest
- [ ] Stabiele internetverbinding
- [ ] Schermopname software (optioneel: OBS, Loom)
- [ ] Spreadsheet voor deelnemer tracking

#### Fysiek
- [ ] Informed consent formulieren (2x per deelnemer)
- [ ] Pre-test vragenlijsten geprint
- [ ] Post-test vragenlijsten geprint
- [ ] Observatieformulieren geprint
- [ ] Pennen
- [ ] Stille testomgeving
- [ ] Water/drinken voor deelnemers

### 1.2 Deelnemer Werving

**Inclusiecriteria:**
- 18 jaar of ouder
- Basiskennis Nederlands
- Geen ernstige spraak- of gehoorproblemen
- Bereid om hardop te spreken

**Streefaantal:** Minimaal 10-15 deelnemers voor betrouwbare resultaten

**Diversiteit nastreven in:**
- Leeftijd (18-24, 25-44, 45-64, 65+)
- Technologie-ervaring
- Ervaring met spraakassistenten

### 1.3 Counterbalancing Schema

| Deelnemer # | Volgorde | Taken Volgorde |
|:-----------:|:--------:|:--------------:|
| P001 | VUI → GUI | 1,2,3,4,5 |
| P002 | GUI → VUI | 1,2,3,4,5 |
| P003 | VUI → GUI | 1,2,3,4,5 |
| P004 | GUI → VUI | 1,2,3,4,5 |
| ... | ... | ... |

---

## 2. Testomgeving Setup

### 2.1 Applicatie Starten

```bash
# Navigeer naar vaia directory
cd c:\Users\Gebruiker\VOICE_UI\vaia

# Start development server
npm run dev

# Of voor productie build
npm run build
npm run preview
```

### 2.2 Research Panel Activeren

1. Open de applicatie in browser
2. Klik op het 📊 icoon rechtsonder
3. Het Research Control Panel opent
4. Voer Participant ID in (bijv. "P001")
5. Selecteer Interface Order (VUI_FIRST of GUI_FIRST)
6. Klik "Start Session"

### 2.3 Browser Instellingen

**Chrome/Edge:**
1. Ga naar `chrome://settings/content/microphone`
2. Sta microfoon toe voor de applicatie
3. Test: spreek iets en check of de browser reageert

**Aanbevolen browserinstellingen:**
- Incognitomodus voor elke nieuwe deelnemer
- Geen extensies die kunnen interfereren
- Volledige schermmodus (F11)

### 2.4 Audio Test

1. Open de applicatie
2. Klik op de microfoon knop
3. Zeg: "Test een twee drie"
4. Controleer of de transcript verschijnt
5. Controleer of TTS feedback hoorbaar is

---

## 3. Deelnemer Ontvangst

### 3.1 Welkomstscript

> "Welkom en bedankt dat u wilt deelnemen aan dit onderzoek. Mijn naam is [naam] en ik doe onderzoek naar hoe mensen formulieren invullen met spraak versus typen.
>
> Vandaag gaat u dezelfde taken uitvoeren op twee manieren: één keer door te praten tegen de computer, en één keer door te typen en klikken. Ik wil benadrukken dat we niet u testen, maar het systeem. Er zijn geen goede of foute antwoorden.
>
> Heeft u vragen voordat we beginnen?"

### 3.2 Informed Consent

1. Geef deelnemer het informed consent formulier
2. Laat rustig lezen
3. Beantwoord eventuele vragen
4. Laat ondertekenen (2 exemplaren: 1 voor deelnemer, 1 voor onderzoeker)

### 3.3 Pre-Test Vragenlijst

1. Geef deelnemer de pre-test vragenlijst
2. Noteer het Deelnemer ID (P001, P002, etc.)
3. Laat zelfstandig invullen
4. Controleer of alles is ingevuld

---

## 4. Test Uitvoering

### 4.1 Training/Oefenfase (5 minuten)

**Voor VUI:**
> "Ik ga u nu kort laten zien hoe de spraakinterface werkt. U klikt op de microfoon, spreekt een commando, en het systeem voert het uit."

Demonstreer:
1. Microfoon activeren
2. "Ga naar titel" - navigatie
3. "Schrijf Testcursus" - tekst invoeren
4. "Volgende veld" - navigatie
5. "Selecteer optie één" - selectie

Laat deelnemer oefenen met dezelfde commando's.

**Voor GUI:**
> "Bij de grafische interface typt u gewoon in de velden en klikt u op knoppen zoals u gewend bent."

Korte demonstratie van:
1. In veld klikken
2. Typen
3. Dropdown openen
4. Optie selecteren

### 4.2 Taakuitvoering

**Start de sessie in Research Panel:**
1. Klik "Start Session" met juiste participant ID
2. Selecteer juiste volgorde (VUI_FIRST of GUI_FIRST)

**Per taak:**
1. Lees de taakinstructie voor aan deelnemer
2. Klik op "▶" bij de taak in Research Panel
3. Zeg: "U mag beginnen"
4. Observeer en noteer (niet ingrijpen!)
5. Als klaar, klik "✓" (succes) of "✗" (mislukt)
6. Ga naar volgende taak

**Taak Instructies:**

**TAAK 1: Basisinformatie**
> "Vul de volgende gegevens in:
> - Titel: 'Introductie tot Machine Learning'
> - Ondertitel: 'Van theorie naar praktijk'
> - Link: eventbrite.com"

**TAAK 2: Datum en Tijd**
> "Stel de volgende cursusdata in:
> - Startdatum: 15 maart 2025
> - Einddatum: 20 maart 2025
> - Starttijd: 14:00"

**TAAK 3: Dropdown Selectie**
> "Selecteer de volgende opties:
> - Kennisniveau: Beginner
> - Taal: Nederlands
> - Selecteer optie nummer 2 bij Certificaat"

**TAAK 4: Navigatie en Correctie**
> "Navigeer terug naar het titelveld en pas de titel aan naar 'Machine Learning voor Beginners'. Navigeer daarna naar het volgende veld."

**TAAK 5: AI Functie**
> "Gebruik het 'verbeter' commando om de beschrijving korter te maken, OF accepteer een AI suggestie."

### 4.3 Interface Wisselen

Na alle 5 taken met eerste interface:

1. Klik "🔄 Switch to [andere interface]" in Research Panel
2. Zeg tegen deelnemer:

> "Goed gedaan! Nu gaat u dezelfde taken uitvoeren, maar dan [met spraak / door te typen]. Neem even een korte pauze als u wilt."

3. Reset het formulier indien nodig
4. Voer dezelfde 5 taken uit met de andere interface

### 4.4 Observeren (Do's en Don'ts)

**DO:**
- ✅ Noteer non-verbaal gedrag (zuchten, lachen, fronsen)
- ✅ Noteer spontane uitspraken
- ✅ Noteer wanneer deelnemer aarzelt
- ✅ Noteer foutpatronen
- ✅ Blijf neutraal en ondersteunend

**DON'T:**
- ❌ Help de deelnemer (tenzij vastgelopen)
- ❌ Geef hints over commando's
- ❌ Toon frustratie of ongeduld
- ❌ Onderbreek tijdens taakuitvoering
- ❌ Beïnvloed met gezichtsuitdrukkingen

### 4.5 Wanneer Ingrijpen?

**Ingrijpen alleen als:**
- Deelnemer geeft expliciet aan niet verder te kunnen
- Systeem crasht of reageert niet meer
- Deelnemer vraagt om hulp (noteer dit als "help requested")
- Na 3+ minuten zonder enige voortgang op één taak

**Bij ingrijpen:**
1. Noteer dat er is ingeholpen
2. Geef minimale hulp om verder te kunnen
3. Markeer taak als "PARTIAL" in Research Panel

---

## 5. Data Verzameling & Opslag

### 5.1 Automatische Logging

Het Research Panel logt automatisch:
- Alle spraakcommando's en transcripties
- Tijd per taak
- Fouten en correcties
- Navigatie tussen velden
- Interface wisselingen

### 5.2 Data Exporteren

Na afloop van elke sessie:

1. Klik "💾 Save" om naar localStorage op te slaan
2. Klik "⏹️ End & Download" om sessie te beëindigen
3. Twee bestanden worden gedownload:
   - `research-data-P001-[timestamp].json` - Complete data
   - `tasks-P001-[timestamp].csv` - Taaksamenvatting

### 5.3 Data Opslag

**Mappenstructuur:**
```
/onderzoek_data/
├── raw_json/
│   ├── research-data-P001-1234567890.json
│   ├── research-data-P002-1234567891.json
│   └── ...
├── csv_exports/
│   ├── tasks-P001-1234567890.csv
│   └── ...
├── vragenlijsten/
│   ├── pre-test/
│   │   └── P001-pre.pdf
│   ├── post-test/
│   │   └── P001-post.pdf
│   └── observaties/
│       └── P001-obs.pdf
└── samenvatting.xlsx
```

### 5.4 Backup Procedures

1. **Na elke sessie:** Kopieer JSON/CSV naar cloud storage
2. **Dagelijks:** Backup alle vragenlijsten (foto/scan)
3. **Wekelijks:** Controleer data integriteit

### 5.5 Anonimisering

- Gebruik alleen Participant IDs (P001, P002, etc.)
- Verwijder namen uit alle bestanden
- Bewaar koppellijst (ID ↔ naam) apart en beveiligd

---

## 6. Troubleshooting

### 6.1 Spraakherkenning Problemen

| Probleem | Oplossing |
|----------|-----------|
| Microfoon werkt niet | Check browser permissions, herstart browser |
| Slecht herkend | Vraag deelnemer duidelijker te spreken |
| Verkeerde taal | Check system language settings |
| Geen reactie | Click away from mic button, try again |

### 6.2 Applicatie Problemen

| Probleem | Oplossing |
|----------|-----------|
| App laadt niet | `npm run dev` opnieuw starten |
| Research Panel verdwenen | Refresh pagina, click 📊 icon |
| Data niet opgeslagen | Check localStorage limit, export handmatig |
| Formulier reset niet | Hard refresh (Ctrl+Shift+R) |

### 6.3 Deelnemer Problemen

| Situatie | Aanpak |
|----------|--------|
| Te nerveus om te spreken | Extra oefentijd, geruststellend praten |
| Wil stoppen | Respecteer beslissing, bedank voor deelname |
| Gefrustreerd | Korte pauze aanbieden |
| Te veel praten | Vriendelijk terugbrengen naar taak |

---

## 7. Checklists

### 7.1 Dag Voor Test

- [ ] Applicatie werkt correct
- [ ] Microfoon getest
- [ ] Alle formulieren geprint
- [ ] Counterbalancing schema bijgewerkt
- [ ] Testomgeving stil en rustig
- [ ] Water/drinken aanwezig

### 7.2 Voor Elke Deelnemer

- [ ] Participant ID toegewezen
- [ ] Counterbalancing bepaald (VUI/GUI first)
- [ ] Consent formulier klaar
- [ ] Vragenlijsten klaar met ID ingevuld
- [ ] Research Panel reset

### 7.3 Na Elke Deelnemer

- [ ] Data geëxporteerd (JSON + CSV)
- [ ] Bestanden benoemd met Participant ID
- [ ] Vragenlijsten ingescand/gefotografeerd
- [ ] Backup gemaakt
- [ ] Observatienotities aangevuld
- [ ] Research Panel gereset voor volgende deelnemer

### 7.4 Na Alle Tests

- [ ] Alle data verzameld en gebackupt
- [ ] SUS scores berekend
- [ ] Data samengevoegd in analysespreadsheet
- [ ] Kwalitatieve data gecategoriseerd
- [ ] Voorlopige bevindingen genoteerd

---

## Bijlage: Snelle Referentie Spraakcommando's

### Navigatie
- "Ga naar [veldnaam]"
- "Volgende veld"
- "Vorige veld"

### Invoer
- "Schrijf [tekst]"
- "Vul [veld] in met [tekst]"
- Direct datum/tijd zeggen (bijv. "15 maart 2025")

### Selectie
- "Selecteer optie [nummer]"
- "Selecteer [optienaam]"
- "Accepteer suggestie"

### Bewerking
- "Verbeter [instructie]" (bijv. "verbeter maak korter")
- "Bewerk [instructie]"

### Overig
- "Lees veld" - leest huidige veldwaarde voor
- "Wis veld" - maakt veld leeg
- "Stop" - stopt luisteren

---

*Handleiding versie 1.0 - [Datum]*
*Contact: [Email onderzoeker]*




