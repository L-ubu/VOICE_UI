import { humeExpressionService, type ExpressionAnalysisResult, type CrisisIndicators } from './humeExpressionService';

export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'critical';
export type InterventionType = 'none' | 'gentle-check' | 'express-concern' | 'offer-resources' | 'immediate-referral' | 'stop-conversation';

export interface SafetyCheckResult {
  riskLevel: RiskLevel;
  interventionType: InterventionType;
  shouldPause: boolean;
  shouldStop: boolean;
  shouldRefer: boolean;
  message: string;
  spokenMessage?: string;
  referralInfo?: ReferralInfo;
  detectedIndicators: DetectedIndicators;
}

export interface ReferralInfo {
  title: string;
  description: string;
  contacts: EmergencyContact[];
  website?: string;
  urgency: 'standard' | 'urgent' | 'immediate';
}

export interface EmergencyContact {
  name: string;
  phone: string;
  available: string;
  description: string;
  type: 'crisis' | 'support' | 'professional';
}

export interface DetectedIndicators {
  crisisKeywordsFound: string[];
  emotionalIndicators: string[];
  patternIndicators: string[];
  riskFactors: string[];
}

const CRISIS_KEYWORDS = {
  critical: ['zelfmoord', 'suicide', 'zelfdoding', 'dood willen', 'eind maken', 'niet meer willen leven', 'wil dood', 'wil sterven'],
  high: ['wanhopig', 'hopeloos', 'geen uitweg', 'kan niet meer', 'wil niet meer', 'geef op', 'geen zin meer', 'niemand begrijpt'],
  moderate: ['depressief', 'somber', 'verdrietig', 'leeg', 'uitgeput', 'bang', 'angstig', 'paniek', 'overweldigd'],
  low: ['gestrest', 'nerveus', 'bezorgd', 'zorgen', 'moeilijke periode']
};

const ESCALATION_PATTERNS = [
  { pattern: /plan|hoe|wanneer|methode/i, context: 'crisis', weight: 0.3 },
  { pattern: /afscheid|brief|spullen weggeven/i, context: 'preparation', weight: 0.4 },
  { pattern: /pijn|lijden|stop|genoeg/i, context: 'distress', weight: 0.15 }
];

const PROTECTIVE_FACTORS = [
  { pattern: /familie|kind|partner|vriend/i, weight: -0.1 },
  { pattern: /hoop|toekomst|plan|doel/i, weight: -0.15 },
  { pattern: /hulp|therapie|psycholoog/i, weight: -0.2 }
];

class EnhancedSafetyService {
  private negativeMessageCount = 0;
  private emotionalTrend: 'improving' | 'stable' | 'declining' = 'stable';

  constructor() {
    humeExpressionService.onCrisisDetected((indicators) => {
      console.log('[EnhancedSafety] Crisis indicators from emotion analysis:', indicators);
    });
  }

  checkSafety(text: string, emotionResult?: ExpressionAnalysisResult): SafetyCheckResult {
    const indicators = this.detectIndicators(text);
    const emotionIndicators = emotionResult ? humeExpressionService.getCrisisIndicators(emotionResult) : null;
    const riskScore = this.calculateRiskScore(indicators, emotionIndicators);
    const riskLevel = this.getRiskLevel(riskScore);
    const interventionType = this.getInterventionType(riskLevel, indicators);

    if (riskLevel !== 'safe') this.negativeMessageCount++;
    this.emotionalTrend = humeExpressionService.getEmotionalTrend();

    const messages = this.getMessages(interventionType);
    const referralInfo = riskLevel !== 'safe' && riskLevel !== 'low' ? this.getReferralInfo(riskLevel) : undefined;

    return {
      riskLevel,
      interventionType,
      shouldPause: interventionType === 'offer-resources' || interventionType === 'express-concern',
      shouldStop: interventionType === 'stop-conversation',
      shouldRefer: interventionType === 'immediate-referral' || interventionType === 'stop-conversation',
      message: messages.written,
      spokenMessage: messages.spoken,
      referralInfo,
      detectedIndicators: indicators
    };
  }

  private detectIndicators(text: string): DetectedIndicators {
    const lower = text.toLowerCase();
    const indicators: DetectedIndicators = {
      crisisKeywordsFound: [],
      emotionalIndicators: [],
      patternIndicators: [],
      riskFactors: []
    };

    for (const [severity, keywords] of Object.entries(CRISIS_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          indicators.crisisKeywordsFound.push(`${kw} (${severity})`);
        }
      }
    }

    for (const { pattern, context, weight } of ESCALATION_PATTERNS) {
      if (pattern.test(lower)) {
        indicators.patternIndicators.push(context);
        indicators.riskFactors.push(`${context}:${weight}`);
      }
    }

    for (const { pattern, weight } of PROTECTIVE_FACTORS) {
      if (pattern.test(lower)) {
        indicators.riskFactors.push(`protective:${weight}`);
      }
    }

    return indicators;
  }

  private calculateRiskScore(indicators: DetectedIndicators, emotionIndicators: CrisisIndicators | null): number {
    let score = 0;

    const criticalCount = indicators.crisisKeywordsFound.filter(k => k.includes('critical')).length;
    const highCount = indicators.crisisKeywordsFound.filter(k => k.includes('high')).length;
    const moderateCount = indicators.crisisKeywordsFound.filter(k => k.includes('moderate')).length;

    score += criticalCount * 0.4 + highCount * 0.25 + moderateCount * 0.1;

    for (const factor of indicators.riskFactors) {
      const weight = parseFloat(factor.split(':').pop() || '0');
      score += weight;
    }

    if (emotionIndicators) {
      score += emotionIndicators.riskScore * 0.3;
      if (emotionIndicators.hasDespair) score += 0.2;
      if (emotionIndicators.emotionalDistress) score += 0.15;
    }

    if (this.negativeMessageCount >= 5) score += 0.1;
    if (this.emotionalTrend === 'declining') score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 0.7) return 'critical';
    if (score >= 0.5) return 'high';
    if (score >= 0.3) return 'moderate';
    if (score >= 0.15) return 'low';
    return 'safe';
  }

  private getInterventionType(riskLevel: RiskLevel, indicators: DetectedIndicators): InterventionType {
    if (riskLevel === 'critical') return 'stop-conversation';
    if (riskLevel === 'high') {
      return indicators.patternIndicators.includes('preparation') ? 'stop-conversation' : 'immediate-referral';
    }
    if (riskLevel === 'moderate') return 'offer-resources';
    if (riskLevel === 'low') return 'express-concern';
    return 'none';
  }

  private getMessages(type: InterventionType): { written: string; spoken: string } {
    switch (type) {
      case 'stop-conversation':
        return {
          written: 'Wat je vertelt raakt aan gedachten over zelfdoding. Het is heel belangrijk dat je hier niet alleen mee blijft. Neem contact op met de Zelfmoordlijn via 1813 of www.zelfmoord1813.be. Ze zijn 24/7 bereikbaar.',
          spoken: 'Wat je vertelt raakt aan gedachten over zelfdoding. Neem alsjeblieft contact op met de Zelfmoordlijn via 1813. Ze kunnen je helpen.'
        };
      case 'immediate-referral':
        return {
          written: 'Ik merk dat je het moeilijk hebt. De Zelfmoordlijn (1813) of Tele-Onthaal (106) zijn er om naar je te luisteren, gratis en anoniem.',
          spoken: 'Ik merk dat je het moeilijk hebt. De Zelfmoordlijn is bereikbaar op 1813, gratis en anoniem.'
        };
      case 'offer-resources':
        return {
          written: 'Ik hoor dat je door een moeilijke periode gaat. Tele-Onthaal (106) biedt een luisterend oor, 24/7.',
          spoken: 'Ik hoor dat je door een moeilijke periode gaat. Wil je weten welke hulp er beschikbaar is?'
        };
      case 'express-concern':
        return {
          written: 'Ik merk dat er iets is wat je bezighoudt. Als je erover wilt praten, ben ik hier om te luisteren.',
          spoken: 'Ik merk dat er iets is wat je bezighoudt. Wil je me er meer over vertellen?'
        };
      default:
        return { written: '', spoken: '' };
    }
  }

  private getReferralInfo(riskLevel: RiskLevel): ReferralInfo {
    const urgency = riskLevel === 'critical' ? 'immediate' : riskLevel === 'high' ? 'urgent' : 'standard';
    return {
      title: 'Professionele Hulp Beschikbaar',
      description: urgency === 'immediate' ? 'Neem nu contact op met een hulplijn.' : 'Er zijn mensen die je kunnen helpen.',
      contacts: this.getEmergencyContacts(),
      website: 'https://www.zelfmoord1813.be',
      urgency
    };
  }

  getEmergencyContacts(): EmergencyContact[] {
    return [
      { name: 'Zelfmoordlijn 1813', phone: '1813', available: '24/7', description: 'Gratis hulp bij suïcidale gedachten', type: 'crisis' },
      { name: 'Tele-Onthaal', phone: '106', available: '24/7', description: 'Anoniem luisterend oor', type: 'support' },
      { name: 'Awel (jongeren)', phone: '102', available: 'Ma-Vr 16-22u', description: 'Hulplijn voor jongeren', type: 'support' }
    ];
  }

  resetContext(): void {
    this.negativeMessageCount = 0;
    this.emotionalTrend = 'stable';
  }
}

export const enhancedSafetyService = new EnhancedSafetyService();
