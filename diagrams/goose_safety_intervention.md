# Figuur 5.9: Crisisdetectie en Veiligheidsinterventie Flow

```mermaid
flowchart TD
    subgraph Input["📥 Input Analyse"]
        Text["Gebruikerstekst"]
        Emotions["Emotie Analyse<br/>(Hume resultaat)"]
    end

    subgraph Detection["🔍 Detectie"]
        CriticalKW["Critical Keywords<br/>zelfmoord, suicide, zelfdoding"]
        HighKW["High Keywords<br/>wanhopig, hopeloos, geen uitweg"]
        ModerateKW["Moderate Keywords<br/>depressief, somber, bang"]
        
        EmotionCheck["Emotie Indicatoren<br/>despair, fear, distress"]
        PatternCheck["Escalatie Patronen<br/>plan, afscheid, spullen weggeven"]
    end

    subgraph Scoring["📊 Risico Score"]
        Calculate["Score Berekening<br/>(0.0 - 1.0)"]
        
        Critical["≥ 0.7<br/>CRITICAL"]
        High["≥ 0.5<br/>HIGH"]
        Moderate["≥ 0.3<br/>MODERATE"]
        Low["≥ 0.15<br/>LOW"]
        Safe["< 0.15<br/>SAFE"]
    end

    subgraph Intervention["🚨 Interventie"]
        Stop["🛑 stop-conversation<br/>Gesprek stoppen"]
        Refer["📞 immediate-referral<br/>Directe doorverwijzing"]
        Resources["📚 offer-resources<br/>Hulpbronnen aanbieden"]
        Concern["💬 express-concern<br/>Bezorgdheid uiten"]
        None["✓ none<br/>Geen interventie"]
    end

    subgraph Actions["⚡ Acties"]
        StopConvo["Gesprek beëindigen"]
        ShowAlert["Veiligheidsalert tonen"]
        ShowContacts["Hulplijn contacten<br/>1813, 106, 102"]
        SpeakMessage["TTS waarschuwing"]
        LogSafety["Log naar research data"]
    end

    Text --> CriticalKW & HighKW & ModerateKW
    Text --> PatternCheck
    Emotions --> EmotionCheck

    CriticalKW --> |"+0.4"| Calculate
    HighKW --> |"+0.25"| Calculate
    ModerateKW --> |"+0.1"| Calculate
    EmotionCheck --> |"+0.3 max"| Calculate
    PatternCheck --> |"+0.3 max"| Calculate

    Calculate --> Critical & High & Moderate & Low & Safe

    Critical --> Stop
    High --> Refer
    Moderate --> Resources
    Low --> Concern
    Safe --> None

    Stop --> StopConvo & ShowAlert & ShowContacts & SpeakMessage & LogSafety
    Refer --> ShowAlert & ShowContacts & SpeakMessage & LogSafety
    Resources --> ShowContacts & LogSafety
    Concern --> LogSafety
    None --> LogSafety

    style Critical fill:#d32f2f,color:#fff
    style High fill:#f57c00,color:#fff
    style Moderate fill:#fbc02d
    style Low fill:#7cb342
    style Safe fill:#43a047,color:#fff
    
    style Stop fill:#d32f2f,color:#fff
    style Refer fill:#f57c00,color:#fff
```

## Risico Niveaus en Interventies

| Risico | Score | Interventie | Actie |
|--------|-------|-------------|-------|
| **Critical** | ≥ 0.7 | stop-conversation | Gesprek stoppen, alert tonen, 1813 bellen |
| **High** | ≥ 0.5 | immediate-referral | Alert tonen, hulplijnen aanbieden |
| **Moderate** | ≥ 0.3 | offer-resources | Hulpbronnen voorstellen |
| **Low** | ≥ 0.15 | express-concern | Empathisch doorvragen |
| **Safe** | < 0.15 | none | Normale conversatie |

## Hulplijnen (België)

| Naam | Nummer | Beschikbaarheid | Type |
|------|--------|-----------------|------|
| Zelfmoordlijn | 1813 | 24/7 | Crisis |
| Tele-Onthaal | 106 | 24/7 | Support |
| Awel (jongeren) | 102 | Ma-Vr 16-22u | Support |




