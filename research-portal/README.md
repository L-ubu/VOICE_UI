# 📋 VUI Research Portal

Een web-based onderzoeksportaal voor het verzamelen van vragenlijstdata voor het VUI onderzoek (Goose & VAIA).

## 🚀 Snel Starten

### Optie 1: Direct openen (simpelste)
Open `index.html` direct in je browser. **Let op:** Sommige browsers blokkeren localStorage voor lokale bestanden.

### Optie 2: Live Server (aanbevolen)
```bash
# Met Python 3
cd research-portal
python -m http.server 8080

# Of met Node.js (npx)
npx serve .

# Of met VS Code Live Server extensie
# Rechtermuisknop op index.html -> "Open with Live Server"
```

Open vervolgens: http://localhost:8080

### Optie 3: PowerShell Quick Start
```powershell
cd C:\Users\Gebruiker\VOICE_UI\research-portal
Start-Process "http://localhost:8080"
python -m http.server 8080
```

## 📁 Structuur

```
research-portal/
├── index.html              # Dashboard & startpagina
├── css/
│   └── styles.css          # Alle styling
├── js/
│   ├── storage.js          # Data opslag (localStorage)
│   └── main.js             # Applicatie logica
└── pages/
    ├── consent.html        # Informed consent formulier
    ├── data-overview.html  # Data overzicht & export
    ├── protocol.html       # Testprotocol
    ├── goose/
    │   ├── pre-test.html   # Pre-test vragenlijst
    │   ├── sus.html        # System Usability Scale
    │   ├── post-test.html  # Post-test vragenlijst
    │   └── observation.html # Observatieformulier (onderzoeker)
    └── vaia/
        ├── tasks.html      # Taak instructies (toon aan deelnemer)
        ├── pre-test.html   # Pre-test vragenlijst
        ├── sus.html        # System Usability Scale
        ├── post-test.html  # Post-test vragenlijst (incl. AI-vragen)
        └── observation.html # Observatieformulier (onderzoeker)
```

## 💾 Data Opslag

Alle data wordt opgeslagen in de browser's **localStorage**:
- `vui_research_sessions` - Sessie informatie
- `vui_research_responses` - Formulier antwoorden
- `vui_current_session` - Huidige actieve sessie

### Data Exporteren

1. Ga naar **Data Overzicht** in het menu
2. Klik op **Export JSON** of **Export CSV**
3. Het bestand wordt automatisch gedownload

### Data Format (JSON)
```json
{
  "exportedAt": "2026-01-08T...",
  "sessions": [
    {
      "id": "P001",
      "project": "goose",
      "interfaceOrder": "vui-first",
      "createdAt": "...",
      "responses": {
        "consent": { "data": {...}, "submittedAt": "..." },
        "goose_pretest": { "data": {...}, "submittedAt": "..." },
        "goose_sus": { "data": {...}, "submittedAt": "..." },
        "goose_posttest": { "data": {...}, "submittedAt": "..." }
      }
    }
  ]
}
```

## 🔄 Test Flow

1. **Start Sessie** - Maak nieuwe deelnemer aan
2. **Informed Consent** - Laat ondertekenen
3. **Pre-Test** - Demografische vragen & ervaring
4. **Taak Instructies** - Toon taken aan deelnemer (VAIA: `tasks.html`)
5. **Test Uitvoeren** - Deelnemer test de app (extern)
6. **SUS Vragenlijst** - System Usability Scale voor beide interfaces
7. **Post-Test** - Vergelijkende & open vragen
8. **Observatie** (optioneel) - Onderzoeker vult in

## 📚 VAIA-Specifieke Features

De VAIA sectie bevat extra materialen voor formulier-gebaseerde VUI tests:

- **Taak Instructies (`tasks.html`)**: 
  - 5 gedefinieerde taken met duidelijke instructies
  - Toggle tussen VUI en GUI mode (toont/verbergt spraakcommando's)
  - Printbaar formaat
  - Voorbeelden van spraakcommando's per taak

- **Post-Test uitgebreid met AI-vragen**:
  - AI-suggestie bruikbaarheid
  - AI-bewerkingscommando kwaliteit
  - Welke AI-functies werden gebruikt
  - AI vertrouwen

- **Observatieformulier met VUI-specifieke tracking**:
  - Herhalingen tellen (spraak)
  - Spraakproblemen categoriseren
  - Per-taak timing voor zowel GUI als VUI

## 🎨 Features

- ✅ Automatisch opslaan (auto-save bij elke wijziging)
- ✅ Progress indicatoren
- ✅ SUS score berekening
- ✅ Export naar JSON & CSV
- ✅ Responsive design
- ✅ Dark mode UI
- ✅ Print-vriendelijke formulieren

## ⚠️ Belangrijk

- Data blijft in de browser - **maak regelmatig backups via Export**
- Wis browsercache niet voordat je data hebt geëxporteerd
- Test in Chrome of Edge voor beste compatibiliteit

## 📊 SUS Score Berekening

De SUS score wordt automatisch berekend:
1. Oneven vragen (1,3,5,7,9): score - 1
2. Even vragen (2,4,6,8,10): 5 - score
3. Totaal × 2.5 = SUS score (0-100)

Score interpretatie:
- < 50: Niet acceptabel
- 50-70: Marginaal
- 70-80: Goed
- 80-90: Uitstekend
- > 90: Best denkbaar

---

*VUI Research Portal - Odisee Hogeschool - 2026*

