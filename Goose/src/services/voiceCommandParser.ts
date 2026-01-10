export interface ParsedCommand {
  type: 'send-message' | 'select-option' | 'fill-blank' | 'send-now' | 'unknown';
  optionNumber?: number;
  blankNumber?: number;
  fillText?: string;
  transcript?: string;
}

const NUMBER_WORDS: Record<string, number> = {
  'een': 1, 'één': 1, 'eerste': 1,
  'twee': 2, 'tweede': 2,
  'drie': 3, 'derde': 3,
  'vier': 4, 'vierde': 4,
  'vijf': 5, 'vijfde': 5,
  'zes': 6, 'zesde': 6,
  'zeven': 7, 'zevende': 7,
  'acht': 8, 'achtste': 8,
  'negen': 9, 'negende': 9,
  'tien': 10, 'tiende': 10,
  'elf': 11, 'elfde': 11,
  'twaalf': 12, 'twaalfde': 12
};

export class VoiceCommandParser {
  static parse(transcript: string, optionsCount: number, blanksCount = 0): ParsedCommand {
    const clean = transcript.toLowerCase().trim().replace(/[.,!?;:]+$/, '');
    
    // Check for blank-filling commands
    if (blanksCount > 0) {
      const blankMatch = clean.match(/(?:vul|invul)\s+(?:de\s+)?(\w+)\s+(?:blanko|blank|leeg)\s+(?:in\s+)?(?:met\s+)?(.+)/i);
      if (blankMatch) {
        const num = this.parseNumber(blankMatch[1], blanksCount);
        if (num && blankMatch[2]) {
          return { type: 'fill-blank', blankNumber: num, fillText: blankMatch[2].trim() };
        }
      }
    }
    
    // Check for "send now" command
    if (/^(?:verstuur|verzend|stuur|send)(?:\s+(?:nu|now))?$/i.test(clean)) {
      return { type: 'send-now' };
    }
    
    // Check for option selection
    const optionPatterns = [
      /(?:selecteer|kies|optie|nummer)\s+(?:de\s+)?(\w+)/,
      /^(\d+)$/,
      /^(eerste|tweede|derde|vierde|vijfde|zesde|zevende|achtste|negende|tiende|elfde|twaalfde)$/
    ];
    
    for (const pattern of optionPatterns) {
      const match = clean.match(pattern);
      if (match) {
        const num = this.parseNumber(match[1], optionsCount);
        if (num && num <= optionsCount) {
          return { type: 'select-option', optionNumber: num };
        }
      }
    }
    
    // Default: treat as message
    if (clean.length > 0) {
      return { type: 'send-message', transcript: transcript.trim() };
    }
    
    return { type: 'unknown' };
  }
  
  private static parseNumber(text: string, max: number): number | null {
    const lower = text.toLowerCase();
    if (NUMBER_WORDS[lower]) return NUMBER_WORDS[lower];
    
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= max) return parsed;
    
    return null;
  }
}
