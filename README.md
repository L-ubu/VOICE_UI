# VOICE_UI

Voice-User Interface (VUI) research prototype — built for a bachelor's thesis comparing voice interfaces against graphical interfaces for completing digital tasks.

> **Research question:** What are the key advantages and limitations of Voice-User Interfaces compared to graphical interfaces when performing digital tasks?

## What's inside

| Folder | What it is |
|---|---|
| `vaia/` | Main research prototype — Vue 3 + TypeScript + Firebase web app where users complete a course submission form via voice (VUI) or mouse/keyboard (GUI). All interactions logged for comparison. |
| `Goose/` | Ionic + Vue mobile app (Capacitor, Android) exploring voice-first interaction on mobile |
| `research-portal/` | Portal for research data |
| `diagrams/` | Architecture and research diagrams |
| `printable/` | Printable research materials |

## Tech stack

- **Vue 3** + TypeScript + Vite
- **Firebase** — Firestore, Functions, Hosting
- **Web Speech API** — browser-native speech recognition + text-to-speech
- **Ionic + Capacitor** — mobile app (Goose)
- **Pinia** — state management

## Quick start

```bash
# Research prototype (vaia)
cd vaia
npm install
npm run dev

# Mobile app (Goose)
cd Goose
npm install
npm run dev
```

## Docs

- `PROJECT_OVERVIEW.md` — full technical overview of the research prototype
- `STAND_VAN_ZAKEN.md` — current state of affairs (NL)
- `TODO_OVERZICHT.md` — remaining work overview
- `vaia/VUI_TESTING_GUIDE.md` — how to test the voice interface
- `Goose/RESEARCH_DATA_LOGGING.md` — how research data is logged

## License

MIT — see [LICENSE](LICENSE)
