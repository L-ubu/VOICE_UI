# Figuur 5.5: Architectuurdiagram van Goose emotie-analyse integratie

```mermaid
flowchart TB
    subgraph User["👤 Gebruiker"]
        Speech["🎤 Spraak"]
    end

    subgraph VUIComponent["VoiceUIComponent"]
        WebSpeechAPI["Web Speech API<br/>(ASR nl-BE)"]
        MediaRecorder["MediaRecorder API<br/>(Audio Opname)"]
        TTS["Text-to-Speech<br/>(nl-BE stem)"]
    end

    subgraph VUIService["VUIService"]
        EventEmitter["Event Emitter<br/>(recognition-result,<br/>speech-start/end)"]
    end

    subgraph HumeService["HumeExpressionService"]
        ProsodyModel["Hume Prosody Model<br/>(stemanalyse)"]
        LanguageModel["Hume Language Model<br/>(tekstanalyse)"]
        LocalFallback["Lokale Fallback<br/>(Nederlandse trefwoorden)"]
        Combiner["Multimodale Combiner<br/>(70% audio + 30% tekst)"]
    end

    subgraph SafetyService["EnhancedSafetyService"]
        CrisisDetection["Crisisdetectie<br/>(trefwoorden + emoties)"]
        RiskCalculator["Risico Calculator<br/>(score 0-1)"]
        Intervention["Interventie Beslisser<br/>(5 niveaus)"]
    end

    subgraph ChatGPT["OpenAI ChatGPT"]
        PromptBuilder["Prompt Builder<br/>(+ emotie context)"]
        GPT4["GPT-4 Response<br/>(empathische reactie)"]
    end

    subgraph ConversationPage["ConversationPage.vue"]
        MessageHandler["Bericht Handler"]
        EmotionIndicator["Emotie Indicator<br/>(UI chip)"]
        SafetyAlert["Veiligheids Alert<br/>(modal)"]
    end

    subgraph DataLogger["ResearchDataLogger"]
        VUILogs["VUI Interacties"]
        HumeLogs["Hume Analyses<br/>(emotie-tekst paren)"]
        PerformanceLogs["Performance Metrics"]
    end

    %% Flow
    Speech --> WebSpeechAPI
    Speech --> MediaRecorder
    
    WebSpeechAPI --> EventEmitter
    MediaRecorder --> |"audio/webm"| ProsodyModel
    
    EventEmitter --> |"transcript"| MessageHandler
    EventEmitter --> |"transcript"| LanguageModel
    EventEmitter --> |"transcript"| LocalFallback
    
    ProsodyModel --> |"emoties audio"| Combiner
    LanguageModel --> |"emoties tekst"| Combiner
    LocalFallback --> |"fallback emoties"| Combiner
    
    Combiner --> |"gecombineerd resultaat"| CrisisDetection
    Combiner --> |"emotie data"| EmotionIndicator
    
    CrisisDetection --> RiskCalculator
    RiskCalculator --> Intervention
    
    Intervention --> |"should stop?"| SafetyAlert
    Intervention --> |"referral info"| SafetyAlert
    
    MessageHandler --> |"bericht + emotie context"| PromptBuilder
    Combiner --> |"emotie context string"| PromptBuilder
    
    PromptBuilder --> GPT4
    GPT4 --> |"response JSON"| MessageHandler
    GPT4 --> |"gesproken tekst"| TTS
    TTS --> User
    
    %% Logging
    EventEmitter -.-> VUILogs
    Combiner -.-> HumeLogs
    ProsodyModel -.-> PerformanceLogs
    LanguageModel -.-> PerformanceLogs

    %% Styling
    classDef userStyle fill:#e1f5fe,stroke:#01579b
    classDef vuiStyle fill:#f3e5f5,stroke:#7b1fa2
    classDef humeStyle fill:#fff3e0,stroke:#e65100
    classDef safetyStyle fill:#ffebee,stroke:#c62828
    classDef chatgptStyle fill:#e8f5e9,stroke:#2e7d32
    classDef logStyle fill:#fafafa,stroke:#757575,stroke-dasharray: 5 5

    class User userStyle
    class VUIComponent,VUIService vuiStyle
    class HumeService humeStyle
    class SafetyService safetyStyle
    class ChatGPT chatgptStyle
    class DataLogger logStyle
```

## Beschrijving

Dit diagram toont de architectuur van de Goose emotie-analyse integratie:

1. **Gebruikersinput**: Spraak wordt gelijktijdig verwerkt door de Web Speech API (voor transcriptie) en de MediaRecorder API (voor audio-opname).

2. **VUIService**: Centraliseert alle spraak-events via een event-emitter patroon, waardoor losse koppeling mogelijk is.

3. **HumeExpressionService**: Voert multimodale analyse uit:
   - Prosody Model: analyseert stemkenmerken (toon, tempo, intensiteit)
   - Language Model: analyseert emotie in tekst
   - Lokale Fallback: detecteert Nederlandse emotie-trefwoorden
   - Combiner: weegt resultaten (70% audio, 30% tekst)

4. **EnhancedSafetyService**: Berekent risico-score op basis van:
   - Crisis-trefwoorden (zelfmoord, wanhoop, etc.)
   - Emotie-indicatoren (wanhoop, angst, verdriet)
   - Emotionele trend over tijd
   - Bepaalt interventieniveau (none → stop-conversation)

5. **ChatGPT**: Ontvangt het gebruikersbericht samen met emotie-context, wat leidt tot empathische reacties.

6. **ResearchDataLogger**: Registreert alle interacties en analyses voor onderzoeksdoeleinden.




