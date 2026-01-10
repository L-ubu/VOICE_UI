export interface EmotionScore {
  name: string;
  score: number;
}

export interface ExpressionAnalysisResult {
  emotions: EmotionScore[];
  topEmotion: string;
  topScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  arousal: 'low' | 'medium' | 'high' | 'critical';
  valence: number;
  riskLevel: 'safe' | 'moderate' | 'high' | 'critical';
  requiresIntervention: boolean;
  source: 'text' | 'audio' | 'combined';
  timestamp: number;
  sourceText?: string; // Track which text was analyzed
}

export interface CrisisIndicators {
  hasDespair: boolean;
  hasAnger: boolean;
  hasFear: boolean;
  hasSadness: boolean;
  emotionalDistress: boolean;
  riskScore: number;
}

const POSITIVE_EMOTIONS = [
  'admiration', 'amusement', 'awe', 'calmness', 'contentment', 'excitement',
  'gratitude', 'interest', 'joy', 'love', 'pride', 'relief', 'satisfaction'
];

const NEGATIVE_EMOTIONS = [
  'anger', 'anxiety', 'contempt', 'disappointment', 'disgust', 'distress',
  'embarrassment', 'fear', 'guilt', 'horror', 'pain', 'sadness', 'shame'
];

const CRISIS_EMOTIONS = ['sadness', 'fear', 'anxiety', 'distress', 'horror', 'pain', 'anger'];

const DUTCH_EMOTION_KEYWORDS: Record<string, string[]> = {
  'sadness': ['verdrietig', 'triest', 'somber', 'depressief', 'wanhopig', 'hopeloos', 'eenzaam', 'pijn', 'huilen'],
  'anger': ['boos', 'woedend', 'gefrustreerd', 'kwaad', 'woede'],
  'fear': ['bang', 'angst', 'angstig', 'bezorgd', 'paniek', 'doodsbang'],
  'anxiety': ['gestrest', 'stress', 'onrustig', 'gespannen', 'zenuwachtig', 'zorgen'],
  'joy': ['blij', 'gelukkig', 'vrolijk', 'tevreden', 'fijn', 'leuk'],
  'distress': ['overstuur', 'van streek', 'kapot', 'overweldigd']
};

const DUTCH_CRISIS_KEYWORDS = [
  'zelfmoord', 'suicide', 'zelfdoding', 'dood', 'sterven', 'eind maken',
  'niet meer willen leven', 'hopeloos', 'wanhopig', 'geen uitweg', 'opgeven',
  'kan niet meer', 'wil niet meer', 'geen hoop'
];

type EmotionEventHandler = (result: ExpressionAnalysisResult) => void;
type CrisisEventHandler = (indicators: CrisisIndicators) => void;

class HumeExpressionService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.hume.ai/v0/batch';
  private emotionHistory: ExpressionAnalysisResult[] = [];
  private emotionHandlers: EmotionEventHandler[] = [];
  private crisisHandlers: CrisisEventHandler[] = [];

  constructor() {
    this.apiKey = import.meta.env.VITE_HUME_API_KEY || null;
    console.log('[HumeExpression] Service initialized');
    console.log('[HumeExpression] API key present:', !!this.apiKey);
  }

  async analyzeText(text: string): Promise<ExpressionAnalysisResult> {
    const localResult = this.analyzeTextLocally(text);
    localResult.sourceText = text;
    
    if (localResult.requiresIntervention || !this.apiKey) {
      return localResult;
    }

    try {
      const jobId = await this.createJob({
        models: { language: { granularity: 'sentence' } },
        text: [text]
      });

      if (!jobId) return localResult;

      const humeResult = await this.pollJobResults(jobId);
      if (humeResult) {
        const parsed = this.parseLanguageResponse(humeResult);
        parsed.source = 'text';
        parsed.sourceText = text;
        return this.mergeResults(parsed, localResult);
      }

      return localResult;
    } catch {
      return localResult;
    }
  }

  async analyzeAudio(audioBlob: Blob): Promise<ExpressionAnalysisResult> {
    if (!this.apiKey) {
      return this.createNeutralResult('audio');
    }

    try {
      const base64Audio = await this.blobToBase64(audioBlob);
      
      const jobId = await this.createJob({
        models: { prosody: { granularity: 'utterance' } },
        files: [{ content: base64Audio, content_type: audioBlob.type || 'audio/webm' }]
      });

      if (!jobId) return this.createNeutralResult('audio');

      const humeResult = await this.pollJobResults(jobId);
      if (humeResult) {
        const parsed = this.parseProsodyResponse(humeResult);
        parsed.source = 'audio';
        this.addToHistory(parsed);
        return parsed;
      }

      return this.createNeutralResult('audio');
    } catch {
      return this.createNeutralResult('audio');
    }
  }

  combineAnalyses(audio: ExpressionAnalysisResult, text: ExpressionAnalysisResult): ExpressionAnalysisResult {
    const emotionMap = new Map<string, number>();

    audio.emotions.forEach(e => emotionMap.set(e.name, e.score * 0.7));
    text.emotions.forEach(e => {
      const existing = emotionMap.get(e.name) || 0;
      emotionMap.set(e.name, existing + (e.score * 0.3));
    });

    const combined = Array.from(emotionMap.entries())
      .map(([name, score]) => ({ name, score: Math.min(score, 1) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const result = this.createResultFromEmotions(combined, 'combined');
    result.sourceText = text.sourceText;
    
    // Take higher risk
    const riskOrder = ['safe', 'moderate', 'high', 'critical'];
    result.riskLevel = riskOrder[Math.max(
      riskOrder.indexOf(audio.riskLevel),
      riskOrder.indexOf(text.riskLevel)
    )] as ExpressionAnalysisResult['riskLevel'];
    
    result.requiresIntervention = audio.requiresIntervention || text.requiresIntervention;

    return result;
  }

  getCrisisIndicators(result: ExpressionAnalysisResult): CrisisIndicators {
    const emotions = result?.emotions || [];
    
    const hasDespair = emotions.some(e => ['distress', 'sadness'].includes(e.name) && e.score > 0.6);
    const hasAnger = emotions.some(e => ['anger', 'contempt'].includes(e.name) && e.score > 0.5);
    const hasFear = emotions.some(e => ['fear', 'anxiety', 'horror'].includes(e.name) && e.score > 0.5);
    const hasSadness = emotions.some(e => ['sadness', 'disappointment'].includes(e.name) && e.score > 0.5);
    const emotionalDistress = result?.arousal === 'critical' || 
      (result?.arousal === 'high' && result?.sentiment === 'negative');

    let riskScore = 0;
    if (hasDespair) riskScore += 0.35;
    if (hasAnger) riskScore += 0.15;
    if (hasFear) riskScore += 0.2;
    if (hasSadness) riskScore += 0.2;
    if (emotionalDistress) riskScore += 0.15;
    
    const recentNegative = this.emotionHistory.slice(-5).filter(h => h.sentiment === 'negative').length;
    if (recentNegative >= 3) riskScore += 0.1;

    return { hasDespair, hasAnger, hasFear, hasSadness, emotionalDistress, riskScore: Math.min(riskScore, 1) };
  }

  onEmotionUpdate(handler: EmotionEventHandler): () => void {
    this.emotionHandlers.push(handler);
    return () => {
      const idx = this.emotionHandlers.indexOf(handler);
      if (idx > -1) this.emotionHandlers.splice(idx, 1);
    };
  }

  onCrisisDetected(handler: CrisisEventHandler): () => void {
    this.crisisHandlers.push(handler);
    return () => {
      const idx = this.crisisHandlers.indexOf(handler);
      if (idx > -1) this.crisisHandlers.splice(idx, 1);
    };
  }

  getHistory(): ExpressionAnalysisResult[] { return [...this.emotionHistory]; }

  getEmotionalTrend(): 'improving' | 'stable' | 'declining' {
    if (this.emotionHistory.length < 3) return 'stable';
    const recent = this.emotionHistory.slice(-3);
    const trend = recent[2].valence - recent[0].valence;
    if (trend > 0.2) return 'improving';
    if (trend < -0.2) return 'declining';
    return 'stable';
  }

  // Private methods
  private async createJob(params: any): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Hume-Api-Key': this.apiKey! },
        body: JSON.stringify(params)
      });

      if (!response.ok) return null;
      const data = await response.json();
      console.log('[HumeExpression] Job created:', data.job_id);
      return data.job_id;
    } catch {
      return null;
    }
  }

  private async pollJobResults(jobId: string, maxAttempts = 15): Promise<any | null> {
    for (let i = 0; i < maxAttempts; i++) {
      await this.delay(1000);

      try {
        const statusRes = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
          headers: { 'X-Hume-Api-Key': this.apiKey! }
        });

        if (!statusRes.ok) continue;
        const status = await statusRes.json();
        console.log('[HumeExpression] Job status:', status.state?.status);

        if (status.state?.status === 'COMPLETED') {
          const predRes = await fetch(`${this.baseUrl}/jobs/${jobId}/predictions`, {
            headers: { 'X-Hume-Api-Key': this.apiKey! }
          });
          if (predRes.ok) return await predRes.json();
        } else if (status.state?.status === 'FAILED') {
          return null;
        }
      } catch { /* continue polling */ }
    }
    return null;
  }

  private parseLanguageResponse(data: any): ExpressionAnalysisResult {
    try {
      const predictions = data?.[0]?.results?.predictions?.[0]?.models?.language?.grouped_predictions?.[0]?.predictions || [];
      if (!predictions.length) return this.createNeutralResult('text');

      const emotionMap = new Map<string, number[]>();
      predictions.forEach((pred: any) => {
        (pred.emotions || []).forEach((e: any) => {
          const name = e.name.toLowerCase();
          if (!emotionMap.has(name)) emotionMap.set(name, []);
          emotionMap.get(name)!.push(e.score);
        });
      });

      const emotions = Array.from(emotionMap.entries())
        .map(([name, scores]) => ({ name, score: scores.reduce((a, b) => a + b, 0) / scores.length }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return this.createResultFromEmotions(emotions, 'text');
    } catch {
      return this.createNeutralResult('text');
    }
  }

  private parseProsodyResponse(data: any): ExpressionAnalysisResult {
    try {
      const predictions = data?.[0]?.results?.predictions?.[0]?.models?.prosody?.grouped_predictions?.[0]?.predictions || [];
      if (!predictions.length) return this.createNeutralResult('audio');

      const latestPred = predictions[predictions.length - 1];
      const emotions = (latestPred.emotions || [])
        .map((e: any) => ({ name: e.name.toLowerCase(), score: e.score }))
        .sort((a: EmotionScore, b: EmotionScore) => b.score - a.score)
        .slice(0, 10);

      return this.createResultFromEmotions(emotions, 'audio');
    } catch {
      return this.createNeutralResult('audio');
    }
  }

  private analyzeTextLocally(text: string): ExpressionAnalysisResult {
    const lowerText = text.toLowerCase();
    const detectedEmotions: EmotionScore[] = [];
    const hasCrisisKeyword = DUTCH_CRISIS_KEYWORDS.some(kw => lowerText.includes(kw));

    for (const [emotion, keywords] of Object.entries(DUTCH_EMOTION_KEYWORDS)) {
      const matches = keywords.filter(kw => lowerText.includes(kw)).length;
      if (matches > 0) {
        detectedEmotions.push({ name: emotion, score: Math.min(0.3 + (matches * 0.15), 0.85) });
      }
    }

    if (hasCrisisKeyword) {
      const sadIdx = detectedEmotions.findIndex(e => e.name === 'sadness');
      if (sadIdx >= 0) {
        detectedEmotions[sadIdx].score = Math.min(detectedEmotions[sadIdx].score + 0.3, 1);
      } else {
        detectedEmotions.push({ name: 'sadness', score: 0.8 });
      }
      detectedEmotions.push({ name: 'distress', score: 0.75 });
    }

    detectedEmotions.sort((a, b) => b.score - a.score);

    if (!detectedEmotions.length) return this.createNeutralResult('text');

    const result = this.createResultFromEmotions(detectedEmotions, 'text');
    if (hasCrisisKeyword) {
      result.riskLevel = 'critical';
      result.requiresIntervention = true;
    }

    return result;
  }

  private createResultFromEmotions(emotions: EmotionScore[], source: 'text' | 'audio' | 'combined'): ExpressionAnalysisResult {
    const result: ExpressionAnalysisResult = {
      emotions: emotions.slice(0, 5),
      topEmotion: emotions[0]?.name || 'neutral',
      topScore: emotions[0]?.score || 0,
      sentiment: this.calculateSentiment(emotions),
      arousal: this.calculateArousal(emotions),
      valence: this.calculateValence(emotions),
      riskLevel: this.calculateRiskLevel(emotions),
      requiresIntervention: this.checkIntervention(emotions),
      source,
      timestamp: Date.now()
    };

    this.addToHistory(result);
    return result;
  }

  private mergeResults(primary: ExpressionAnalysisResult, secondary: ExpressionAnalysisResult): ExpressionAnalysisResult {
    const riskOrder = ['safe', 'moderate', 'high', 'critical'];
    primary.riskLevel = riskOrder[Math.max(
      riskOrder.indexOf(primary.riskLevel),
      riskOrder.indexOf(secondary.riskLevel)
    )] as ExpressionAnalysisResult['riskLevel'];
    primary.requiresIntervention = primary.requiresIntervention || secondary.requiresIntervention;
    return primary;
  }

  private calculateSentiment(emotions: EmotionScore[]): 'positive' | 'negative' | 'neutral' {
    let pos = 0, neg = 0;
    emotions.forEach(e => {
      if (POSITIVE_EMOTIONS.includes(e.name)) pos += e.score;
      else if (NEGATIVE_EMOTIONS.includes(e.name)) neg += e.score;
    });
    const diff = pos - neg;
    return diff > 0.15 ? 'positive' : diff < -0.15 ? 'negative' : 'neutral';
  }

  private calculateArousal(emotions: EmotionScore[]): ExpressionAnalysisResult['arousal'] {
    const highArousal = ['anger', 'fear', 'excitement', 'horror', 'anxiety', 'distress'];
    const topScore = emotions[0]?.score || 0;
    const hasHigh = emotions.some(e => highArousal.includes(e.name) && e.score > 0.5);

    if (topScore >= 0.75 && hasHigh) return 'critical';
    if (topScore >= 0.6 || hasHigh) return 'high';
    if (topScore >= 0.4) return 'medium';
    return 'low';
  }

  private calculateValence(emotions: EmotionScore[]): number {
    let val = 0, weight = 0;
    emotions.forEach(e => {
      if (POSITIVE_EMOTIONS.includes(e.name)) { val += e.score; weight += e.score; }
      else if (NEGATIVE_EMOTIONS.includes(e.name)) { val -= e.score; weight += e.score; }
    });
    return weight === 0 ? 0 : Math.max(-1, Math.min(1, val / weight));
  }

  private calculateRiskLevel(emotions: EmotionScore[]): ExpressionAnalysisResult['riskLevel'] {
    const crisisScore = emotions.filter(e => CRISIS_EMOTIONS.includes(e.name)).reduce((s, e) => s + e.score, 0);
    const topScore = emotions[0]?.score || 0;
    const hasSadness = emotions.some(e => e.name === 'sadness' && e.score > 0.6);
    const hasDistress = emotions.some(e => e.name === 'distress' && e.score > 0.5);

    if (crisisScore > 1.5 || (hasSadness && hasDistress)) return 'critical';
    if (crisisScore > 1.0 || topScore > 0.7) return 'high';
    if (crisisScore > 0.5 || topScore > 0.5) return 'moderate';
    return 'safe';
  }

  private checkIntervention(emotions: EmotionScore[]): boolean {
    const critical = ['sadness', 'distress', 'fear', 'anxiety', 'horror'];
    return emotions.some(e => critical.includes(e.name) && e.score > 0.65);
  }

  private createNeutralResult(source: 'text' | 'audio' | 'combined'): ExpressionAnalysisResult {
    return {
      emotions: [{ name: 'neutral', score: 0.5 }],
      topEmotion: 'neutral',
      topScore: 0.5,
      sentiment: 'neutral',
      arousal: 'low',
      valence: 0,
      riskLevel: 'safe',
      requiresIntervention: false,
      source,
      timestamp: Date.now()
    };
  }

  private addToHistory(result: ExpressionAnalysisResult): void {
    this.emotionHistory.push(result);
    if (this.emotionHistory.length > 10) this.emotionHistory.shift();

    this.emotionHandlers.forEach(h => { try { h(result); } catch { /* ignore */ } });

    const indicators = this.getCrisisIndicators(result);
    if (indicators.riskScore > 0.4 || indicators.emotionalDistress) {
      this.crisisHandlers.forEach(h => { try { h(indicators); } catch { /* ignore */ } });
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1] || base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const humeExpressionService = new HumeExpressionService();
