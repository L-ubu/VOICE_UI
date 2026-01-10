# Figuur 5.10: Sequentiediagram van emotie-context integratie met ChatGPT

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 Gebruiker
    participant VUI as 🎤 VoiceUI
    participant Hume as ☁️ Hume AI
    participant Safety as 🛡️ Safety Service
    participant GPT as 🤖 ChatGPT
    participant TTS as 🔊 TTS

    U->>VUI: Spreekt bericht in
    
    par Audio + Tekst parallel
        VUI->>VUI: Transcriberen (Web Speech API)
        VUI->>VUI: Opnemen (MediaRecorder)
    end

    VUI->>Hume: Audio blob (WebM)
    VUI->>Hume: Tekst transcript
    
    par Multimodale analyse
        Hume->>Hume: Prosody analyse (stem)
        Hume->>Hume: Language analyse (tekst)
    end

    Hume-->>VUI: Audio emoties (40+ categorieën)
    Hume-->>VUI: Tekst emoties

    VUI->>VUI: Combineer resultaten (70/30)
    
    Note over VUI: Top emotie: "sadness" (67%)<br/>Sentiment: negatief<br/>Arousal: high

    VUI->>Safety: Check veiligheid
    Safety->>Safety: Bereken risico score
    Safety-->>VUI: riskLevel: "moderate"

    VUI->>VUI: buildEmotionContext()
    
    Note over VUI: EMOTIE CONTEXT:<br/>- Dominant: sadness (67%)<br/>- Sentiment: negatief<br/>- Intensiteit: high<br/>- Trend: stabiel

    VUI->>GPT: Bericht + Emotie Context
    
    Note over GPT: System prompt +<br/>User bericht +<br/>Emotie context string

    GPT->>GPT: Genereer empathische response
    GPT-->>VUI: JSON response

    VUI->>VUI: Parse & toon bericht
    
    alt TTS Enabled
        VUI->>TTS: Spreek antwoord uit
        TTS->>U: Gesproken reactie
    else TTS Disabled
        VUI->>VUI: Herstart luisteren
    end

    VUI-->>U: Toon antwoord + opties
```

## Voorbeeld Prompt Augmentatie

### Zonder emotie-context:
```
User: Ik voel me de laatste tijd niet zo goed.
```

### Met emotie-context:
```
User: Ik voel me de laatste tijd niet zo goed.

EMOTIE CONTEXT:
Emoties: sadness (67%), anxiety (45%), tiredness (38%)
- Dominant: sadness (67%)
- Sentiment: negatief
- Intensiteit: high
- Trend: stabiel

Pas je reactie empathisch aan. Toon begrip, blijf gesprekscoach.
```

## Impact op ChatGPT Response

| Aspect | Zonder Context | Met Context |
|--------|----------------|-------------|
| Toon | Neutraal, informatief | Warm, empathisch |
| Vraagstelling | "Wat bedoel je daarmee?" | "Dat klinkt zwaar. Wil je me vertellen wat er speelt?" |
| Hulpaanbod | Niet proactief | "Als je wilt, kunnen we samen kijken..." |
| Doorverwijzing | Niet aanwezig | Bij hoog risico: hulplijn suggereren |




