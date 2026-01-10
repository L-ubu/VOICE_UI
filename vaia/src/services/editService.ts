// OpenAI-powered edit and link service

export interface EditResponse {
	editedText: string;
	success: boolean;
	error?: string;
}

export interface LinkParseResponse {
	url: string;
	success: boolean;
	error?: string;
}

class EditService {
	private cache: Map<string, string> = new Map();
	private apiKey: string | null = null;

	constructor() {
		// Get OpenAI API key from environment variable
		// @ts-ignore - Vite environment variable
		this.apiKey = (import.meta.env?.VITE_OPENAI_API_KEY as string) || null;
		if (!this.apiKey) {
			console.warn('OpenAI API key not found. Add VITE_OPENAI_API_KEY to your .env file.');
		}
	}

	/**
	 * Call OpenAI ChatGPT API
	 */
	private async callOpenAI(messages: { role: string; content: string }[]): Promise<string | null> {
		if (!this.apiKey) {
			console.warn('OpenAI API key not configured');
			return null;
		}

		try {
			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.apiKey}`
				},
				body: JSON.stringify({
					model: 'gpt-3.5-turbo',
					messages: messages,
					max_tokens: 500,
					temperature: 0.7
				})
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('OpenAI API error:', error);
				return null;
			}

			const data = await response.json();
			return data.choices?.[0]?.message?.content?.trim() || null;
		} catch (error) {
			console.error('OpenAI API call failed:', error);
			return null;
		}
	}

	/**
	 * Edit text using ChatGPT based on user's instruction
	 * @param originalText The original text to edit
	 * @param instruction What the user wants to change/edit
	 * @param fieldType Optional field type hint for better context
	 * @returns Promise with the edited text
	 */
	async editText(originalText: string, instruction: string, fieldType: string = 'text'): Promise<EditResponse> {
		const cacheKey = `${originalText}|${instruction}|${fieldType}`.toLowerCase();
		if (this.cache.has(cacheKey)) {
			return { editedText: this.cache.get(cacheKey)!, success: true };
		}

		// Try OpenAI first
		const aiResult = await this.callOpenAI([
			{
				role: 'system',
				content: `Je bent een tekstbewerker. De gebruiker geeft je een tekst en een instructie. 
Pas de tekst aan volgens de instructie en geef ALLEEN de aangepaste tekst terug, geen uitleg.
Het veldtype is: ${fieldType}. Houd hier rekening mee (bijv. links moeten valide URLs zijn).
Antwoord altijd in het Nederlands tenzij anders gevraagd.`
			},
			{
				role: 'user',
				content: `Originele tekst: "${originalText}"

Instructie: ${instruction}

Geef alleen de aangepaste tekst terug:`
			}
		]);

		if (aiResult) {
			// Clean up the result (remove quotes if GPT added them)
			let cleanResult = aiResult.replace(/^["']|["']$/g, '').trim();
			this.cache.set(cacheKey, cleanResult);
			return { editedText: cleanResult, success: true };
		}

		// Fallback to local processing if OpenAI fails
		console.log('Falling back to local edit processing');
		const fallbackResult = this.applyLocalEdit(originalText, instruction);
		this.cache.set(cacheKey, fallbackResult);
		return { editedText: fallbackResult, success: true };
	}

	/**
	 * Parse a spoken link description into a valid URL using ChatGPT
	 * Examples:
	 * - "google punt com" -> "https://www.google.com"
	 * - "eventbrite" -> "https://www.eventbrite.com"
	 * - "linkedin learning" -> "https://www.linkedin.com/learning"
	 */
	async parseSpokenLink(description: string): Promise<LinkParseResponse> {
		const cacheKey = `link:${description.toLowerCase()}`;
		if (this.cache.has(cacheKey)) {
			return { url: this.cache.get(cacheKey)!, success: true };
		}

		// Try OpenAI first
		const aiResult = await this.callOpenAI([
			{
				role: 'system',
				content: `Je bent een URL-parser. De gebruiker beschrijft of spelt een website/URL in het Nederlands.
Converteer dit naar een geldige URL. Gebruik deze regels:
- "punt" = "."
- "slash" = "/"
- "streepje" = "-"
- Herken bekende websites (eventbrite, youtube, linkedin, etc.)
- Voeg altijd https:// toe als het ontbreekt
- Voeg www. toe indien van toepassing
- Als de gebruiker letters spelt (bijv. "aa bee cee"), combineer deze tot woorden

Geef ALLEEN de URL terug, geen uitleg of extra tekst.`
			},
			{
				role: 'user',
				content: `Converteer naar URL: "${description}"

URL:`
			}
		]);

		if (aiResult) {
			// Clean up and validate URL
			let url = aiResult.replace(/^["']|["']$/g, '').trim();
			// Ensure it starts with http
			if (!url.startsWith('http://') && !url.startsWith('https://')) {
				url = 'https://' + url;
			}
			this.cache.set(cacheKey, url);
			return { url, success: true };
		}

		// Fallback to local URL parsing
		console.log('Falling back to local URL parsing');
		const fallbackUrl = this.parseUrlLocally(description);
		this.cache.set(cacheKey, fallbackUrl);
		return { url: fallbackUrl, success: true };
	}

	/**
	 * Smart local text editing based on Dutch voice commands (fallback)
	 */
	private applyLocalEdit(original: string, instruction: string): string {
		const lower = instruction.toLowerCase().trim();

		// === CAPITALIZATION ===
		if (lower.includes('hoofdletter') || lower.includes('capitalize') || lower.includes('kapitaal')) {
			if (lower.includes('alles') || lower.includes('alle') || lower.includes('volledig')) {
				return original.toUpperCase();
			}
			if (lower.includes('zinnen') || lower.includes('elke zin')) {
				return original.replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
			}
			if (lower.includes('woorden') || lower.includes('elk woord')) {
				return original.replace(/\b\w/g, c => c.toUpperCase());
			}
			return original.charAt(0).toUpperCase() + original.slice(1);
		}

		// === LOWERCASE ===
		if (lower.includes('kleine letter') || lower.includes('lowercase') || lower.includes('klein maken')) {
			return original.toLowerCase();
		}

		// === REMOVE/DELETE ===
		if (lower.includes('verwijder') || lower.includes('delete') || lower.includes('weg')) {
			if (lower.includes('spatie') || lower.includes('spaces')) {
				return original.replace(/\s+/g, '');
			}
			if (lower.includes('nummer') || lower.includes('cijfer') || lower.includes('getal')) {
				return original.replace(/\d+/g, '');
			}
			if (lower.includes('leesteken') || lower.includes('punctuatie')) {
				return original.replace(/[.,!?;:'"()[\]{}]/g, '');
			}
			const removeMatch = lower.match(/(?:verwijder|delete|weg met)\s+(?:het woord\s+)?["']?(\w+)["']?/);
			if (removeMatch) {
				return original.replace(new RegExp(removeMatch[1], 'gi'), '').replace(/\s+/g, ' ').trim();
			}
		}

		// === TRIM/CLEAN ===
		if (lower.includes('trim') || lower.includes('witruimte') || lower.includes('opschonen')) {
			return original.trim().replace(/\s+/g, ' ');
		}

		// === ADD PUNCTUATION ===
		if (lower.includes('punt') && (lower.includes('erbij') || lower.includes('toevoegen') || lower.includes('einde'))) {
			return original.trim().replace(/[.!?]*$/, '') + '.';
		}
		if (lower.includes('uitroepteken') || lower.includes('exclamation')) {
			return original.trim().replace(/[.!?]*$/, '') + '!';
		}
		if (lower.includes('vraagteken') || lower.includes('question')) {
			return original.trim().replace(/[.!?]*$/, '') + '?';
		}

		// === REPLACE ===
		const replaceMatch = lower.match(/(?:vervang|replace|verwissel)\s+["']?(.+?)["']?\s+(?:door|met|naar|with|by|to)\s+["']?(.+?)["']?$/);
		if (replaceMatch) {
			const [, oldWord, newWord] = replaceMatch;
			return original.replace(new RegExp(oldWord.trim(), 'gi'), newWord.trim());
		}

		// === SHORTEN ===
		if (lower.includes('korter') || lower.includes('shorter') || lower.includes('inkorten') || lower.includes('verkort')) {
			const sentences = original.split(/(?<=[.!?])\s+/);
			if (sentences.length > 1) {
				return sentences[0].trim();
			}
			const parts = original.split(/,\s*/);
			if (parts.length > 1) {
				return parts[0].trim() + '.';
			}
			if (original.length > 100) {
				return original.substring(0, 100).trim() + '...';
			}
			return original;
		}

		// Return original if no transformation matched
		return original;
	}

	/**
	 * Local fallback for URL parsing from speech
	 */
	private parseUrlLocally(description: string): string {
		let text = description.toLowerCase().trim();

		// Replace common spoken URL patterns
		const replacements: [RegExp, string][] = [
			[/\s*punt\s*/g, '.'],
			[/\s*slash\s*/g, '/'],
			[/\s*streepje\s*/g, '-'],
			[/\s*underscore\s*/g, '_'],
			[/\s*at\s*/g, '@'],
			[/\s*dubbele punt\s*/g, ':'],
			[/\s*www\s*/g, 'www.'],
			[/\s*http\s*/g, 'http'],
			[/\s*https\s*/g, 'https'],
			[/\s*com\b/g, '.com'],
			[/\s*nl\b/g, '.nl'],
			[/\s*be\b/g, '.be'],
			[/\s*org\b/g, '.org'],
			[/\s*net\b/g, '.net'],
			[/\s*io\b/g, '.io'],
		];

		for (const [pattern, replacement] of replacements) {
			text = text.replace(pattern, replacement);
		}

		// Remove remaining spaces
		text = text.replace(/\s+/g, '');

		// Common website shortcuts
		const websiteShortcuts: Record<string, string> = {
			'google': 'https://www.google.com',
			'youtube': 'https://www.youtube.com',
			'facebook': 'https://www.facebook.com',
			'linkedin': 'https://www.linkedin.com',
			'linkedinlearning': 'https://www.linkedin.com/learning',
			'twitter': 'https://www.twitter.com',
			'x': 'https://www.x.com',
			'instagram': 'https://www.instagram.com',
			'eventbrite': 'https://www.eventbrite.com',
			'meetup': 'https://www.meetup.com',
			'coursera': 'https://www.coursera.org',
			'udemy': 'https://www.udemy.com',
			'zoom': 'https://zoom.us',
			'teams': 'https://teams.microsoft.com',
			'microsoftteams': 'https://teams.microsoft.com',
			'vaia': 'https://www.vaia.be',
		};

		// Check if it's a known shortcut
		const shortcutKey = text.replace(/[^a-z]/g, '');
		if (websiteShortcuts[shortcutKey]) {
			return websiteShortcuts[shortcutKey];
		}

		// Add protocol if missing
		if (!text.startsWith('http://') && !text.startsWith('https://')) {
			text = 'https://' + text;
		}

		// Add www if it looks like a domain without it
		if (text.match(/^https?:\/\/[^w]/) && !text.includes('://www.')) {
			text = text.replace(/^(https?:\/\/)/, '$1www.');
		}

		return text;
	}

	/**
	 * Process a spell-out for a URL
	 * Converts spelled letters to actual characters
	 * Example: "aa bee cee" -> "abc"
	 */
	processSpelledUrl(spelledText: string): string {
		const letterMap: Record<string, string> = {
			'aa': 'a', 'bee': 'b', 'cee': 'c', 'dee': 'd', 'ee': 'e', 'ef': 'f',
			'gee': 'g', 'ha': 'h', 'ie': 'i', 'jee': 'j', 'ka': 'k', 'el': 'l',
			'em': 'm', 'en': 'n', 'oh': 'o', 'pee': 'p', 'que': 'q', 'er': 'r',
			'es': 's', 'tee': 't', 'uu': 'u', 'vee': 'v', 'wee': 'w', 'ix': 'x',
			'ij': 'y', 'zet': 'z', 'be': 'b', 'ce': 'c', 'de': 'd', 'ge': 'g',
			'je': 'j', 'pe': 'p', 've': 'v', 'we': 'w',
			'nul': '0', 'een': '1', 'één': '1', 'twee': '2', 'drie': '3',
			'vier': '4', 'vijf': '5', 'zes': '6', 'zeven': '7', 'acht': '8', 'negen': '9',
			'punt': '.', 'streepje': '-', 'underscore': '_', 'slash': '/'
		};

		const parts = spelledText.toLowerCase().split(/\s+/);
		let result = '';

		for (const part of parts) {
			if (letterMap[part]) {
				result += letterMap[part];
			} else if (part.length === 1 && /[a-z0-9]/.test(part)) {
				result += part;
			} else if (part === 'punt' || part === '.') {
				result += '.';
			} else if (part === 'slash' || part === '/') {
				result += '/';
			}
		}

		return result;
	}

	/**
	 * Check if OpenAI is configured
	 */
	isAIEnabled(): boolean {
		return !!this.apiKey;
	}

	clearCache(): void {
		this.cache.clear();
	}
}

export const editService = new EditService();
