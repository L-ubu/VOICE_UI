# Figuur 5.8: Flowdiagram van multimodale emotie-analyse (audio + tekst)

```mermaid
flowchart LR
    subgraph Input["📥 Input"]
        Audio["🎤 Audio<br/>(WebM blob)"]
        Text["📝 Tekst<br/>(transcript)"]
    end

    subgraph HumeAPI["☁️ Hume AI API"]
        subgraph Prosody["Prosody Model"]
            P1["Job aanmaken"]
            P2["Polling status"]
            P3["Resultaten ophalen"]
        end
        subgraph Language["Language Model"]
            L1["Job aanmaken"]
            L2["Polling status"]
            L3["Resultaten ophalen"]
        end
    end

    subgraph Local["🏠 Lokale Analyse"]
        Keywords["Nederlandse<br/>Trefwoorden"]
        Crisis["Crisis<br/>Keywords"]
    end

    subgraph Processing["⚙️ Verwerking"]
        AudioEmotions["Audio Emoties<br/>(top 10)"]
        TextEmotions["Tekst Emoties<br/>(top 10)"]
        Weighting["Weging<br/>70% + 30%"]
    end

    subgraph Output["📤 Output"]
        Combined["Gecombineerd<br/>Resultaat"]
        TopEmotion["Top Emotie"]
        Sentiment["Sentiment"]
        RiskLevel["Risico Niveau"]
    end

    Audio --> P1 --> P2 --> P3 --> AudioEmotions
    Text --> L1 --> L2 --> L3 --> TextEmotions
    Text --> Keywords --> TextEmotions
    Text --> Crisis --> RiskLevel

    AudioEmotions --> |"× 0.7"| Weighting
    TextEmotions --> |"× 0.3"| Weighting
    
    Weighting --> Combined
    Combined --> TopEmotion
    Combined --> Sentiment
    Combined --> RiskLevel

    style Audio fill:#e3f2fd
    style Text fill:#f3e5f5
    style Combined fill:#c8e6c9
    style RiskLevel fill:#ffcdd2
```

## Toelichting

De multimodale analyse combineert twee informatiebronnen:

| Bron | Model | Gewicht | Wat wordt geanalyseerd |
|------|-------|---------|------------------------|
| Audio | Prosody | 70% | Toon, tempo, intensiteit, trillingen |
| Tekst | Language | 30% | Woordkeuze, zinsstructuur, context |

### Waarom 70/30 weging?

De stemkenmerken (prosody) zijn vaak betrouwbaarder dan woorden alleen:
- Iemand kan zeggen "het gaat goed" met een trillende stem → audio detecteert spanning
- Sarcasme en ironie worden beter opgepikt via toon
- Culturele verschillen in emotie-expressie via woorden

### Fallback mechanisme

Als de Hume API niet beschikbaar is:
1. Lokale Nederlandse trefwoorden worden gescand
2. Crisis-keywords worden direct gedetecteerd
3. Een fallback-resultaat wordt geretourneerd zonder API-latentie




