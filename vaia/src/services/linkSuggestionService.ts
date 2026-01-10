import { functions } from '@/firebase/firebase-config';
import { httpsCallable } from 'firebase/functions';

export interface LinkSuggestion {
	url: string;
	title: string;
	description?: string;
}

class LinkSuggestionService {
	private cache: Map<string, LinkSuggestion[]> = new Map();

	async getLinkSuggestions(description: string): Promise<LinkSuggestion[]> {
		const cacheKey = description.toLowerCase().trim();
		if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

		try {
			if (functions) {
				const searchLinks = httpsCallable(functions, 'searchlinks');
				const response = await searchLinks({ description });
				if (response?.data) {
					const suggestions = (response.data as any).links || [];
					if (suggestions.length > 0) {
						this.cache.set(cacheKey, suggestions);
						return suggestions;
					}
				}
			}
		} catch (e) {}

		const fallback = this.generateFallback(description);
		this.cache.set(cacheKey, fallback);
		return fallback;
	}

	private generateFallback(description: string): LinkSuggestion[] {
		const lower = description.toLowerCase();
		const suggestions: LinkSuggestion[] = [];

		const platforms: { keywords: string[]; url: string; title: string; desc: string }[] = [
			{ keywords: ['eventbrite', 'event'], url: 'https://www.eventbrite.com', title: 'Eventbrite', desc: 'Platform voor evenementen' },
			{ keywords: ['meetup', 'bijeenkomst'], url: 'https://www.meetup.com', title: 'Meetup', desc: 'Platform voor groepen' },
			{ keywords: ['coursera'], url: 'https://www.coursera.org', title: 'Coursera', desc: 'Online cursussen' },
			{ keywords: ['udemy', 'online cursus'], url: 'https://www.udemy.com', title: 'Udemy', desc: 'Online trainingen' },
			{ keywords: ['linkedin'], url: 'https://www.linkedin.com/learning', title: 'LinkedIn Learning', desc: 'Professionele cursussen' },
			{ keywords: ['zoom', 'webinar'], url: 'https://zoom.us', title: 'Zoom', desc: 'Video conferencing' },
			{ keywords: ['youtube', 'video', 'tutorial'], url: 'https://www.youtube.com', title: 'YouTube', desc: 'Video tutorials' },
			{ keywords: ['facebook', 'fb'], url: 'https://www.facebook.com/events', title: 'Facebook Events', desc: 'Facebook evenementen' },
			{ keywords: ['teams', 'microsoft'], url: 'https://teams.microsoft.com', title: 'Microsoft Teams', desc: 'Teams meetings' }
		];

		for (const p of platforms) {
			if (p.keywords.some(k => lower.includes(k))) {
				suggestions.push({ url: p.url, title: p.title, description: p.desc });
			}
		}

		if (lower.includes('google') && (lower.includes('form') || lower.includes('formulier'))) {
			suggestions.push({ url: 'https://docs.google.com/forms', title: 'Google Forms', description: 'Inschrijfformulieren' });
		}

		suggestions.push({
			url: `https://www.google.com/search?q=${encodeURIComponent(description)}`,
			title: `Zoeken: "${description}"`,
			description: 'Google zoekresultaten'
		});

		return suggestions;
	}

	clearCache(): void { this.cache.clear(); }
}

export const linkSuggestionService = new LinkSuggestionService();
