export interface ContextParameter {
  name: string;
  description: string;
  dataType: string;
  answer?: string;
  options?: [string];
  multipleAnswers?: boolean;
}

export interface ContextParameterWrapper {
  context: ContextParameter,
  instruction?: string
}

export interface ContextParamterArrayWrapper {
  contextParameters: [ContextParameter],
  instruction?: string
}

export interface FormatResponse {
  message: string;
  suggestions: Suggestion[];
}

export interface ResponseWrapper {
  response: FormatResponse;
}

export interface PickerObject {
  value: string;
  text: string;
}

export interface Suggestion {
  type: 'aanvulzin' | 'direct',
  text: string,
  function?: string,
  parameter?: string
}
 
export interface GooseState {
  current_step: 1|2|3|4;
  exercise_mode: Boolean; // pas true na expliciete keuze
  safety: { 
    risk: Boolean; 
    type?:'suicide'|'violence'|'other' 
  };
  slots: { 
    situation?:string; 
    otherPerson?:string; 
  };
}

// Re-export types from services for convenience
export type { ExpressionAnalysisResult, EmotionScore, CrisisIndicators } from '@/services/humeExpressionService';
export type { SafetyCheckResult, RiskLevel, InterventionType, ReferralInfo, EmergencyContact } from '@/services/enhancedSafetyService';

