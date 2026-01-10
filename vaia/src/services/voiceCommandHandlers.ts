import { focusFirstFieldInStep, focusNextFieldInStep, type FormStep } from './formFieldNavigator';
import { linkSuggestionService } from './linkSuggestionService';
import { editService } from './editService';

// Number word to digit mapping
const NUMBER_WORDS: Record<string, number> = {
	'een': 1, 'één': 1, 'twee': 2, 'drie': 3, 'vier': 4, 'vijf': 5,
	'zes': 6, 'zeven': 7, 'acht': 8, 'negen': 9, 'tien': 10, 'elf': 11, 'twaalf': 12,
	'dertien': 13, 'veertien': 14, 'vijftien': 15, 'zestien': 16, 'zeventien': 17,
	'achttien': 18, 'negentien': 19, 'twintig': 20, 'eenentwintig': 21,
	'tweeëntwintig': 22, 'drieëntwintig': 23, 'vierentwintig': 24,
	'vijfentwintig': 25, 'zesentwintig': 26, 'zevenentwintig': 27,
	'achtentwintig': 28, 'negenentwintig': 29, 'dertig': 30, 'eenendertig': 31,
	'nul': 0
};

// Month name mapping
const MONTH_MAP: Record<string, number> = {
	'januari': 1, 'january': 1, 'jan': 1, 'februari': 2, 'february': 2, 'feb': 2,
	'maart': 3, 'march': 3, 'mrt': 3, 'april': 4, 'apr': 4, 'mei': 5, 'may': 5,
	'juni': 6, 'june': 6, 'jun': 6, 'juli': 7, 'july': 7, 'jul': 7,
	'augustus': 8, 'august': 8, 'aug': 8, 'september': 9, 'sep': 9, 'sept': 9,
	'oktober': 10, 'october': 10, 'okt': 10, 'november': 11, 'nov': 11,
	'december': 12, 'dec': 12
};

// Letter name to letter mapping
const SPELLED_LETTERS: Record<string, string> = {
	'aa': 'A', 'bee': 'B', 'cee': 'C', 'dee': 'D', 'ee': 'E', 'ef': 'F',
	'gee': 'G', 'ha': 'H', 'ie': 'I', 'jee': 'J', 'ka': 'K', 'el': 'L',
	'em': 'M', 'en': 'N', 'oh': 'O', 'pee': 'P', 'que': 'Q', 'er': 'R',
	'es': 'S', 'tee': 'T', 'uu': 'U', 'vee': 'V', 'wee': 'W', 'ix': 'X',
	'ij': 'Y', 'zet': 'Z', 'be': 'B', 'ce': 'C', 'de': 'D', 'ge': 'G',
	'je': 'J', 'pe': 'P', 've': 'V', 'we': 'W'
};

// Field name aliases
const FIELD_NAME_MAP: Record<string, string> = {
	'titel': 'title', 'aantrekkelijke': 'title', 'inleiding': 'introduction', 'beknopte': 'introduction',
	'ondertitel': 'subtitle', 'beschrijving': 'description', 'uitgebreide': 'description',
	'link': 'courseLink', 'type': 'courseType', 'type opleiding': 'courseType', 'opleiding': 'courseType',
	'startdatum': 'startDate', 'start': 'startDate', 'einddatum': 'endDate', 'eind': 'endDate',
	'starttijd': 'startTime', 'eindtijd': 'endTime', 'organisator': 'organisers', 'organisatoren': 'organisers',
	'doelgroep': 'targetGroup', 'primaire': 'PrimaryTargetGroup', 'primaire doelgroep': 'PrimaryTargetGroup',
	'kennisniveau': 'knowledgeLevel', 'voorkennis': 'requirements', 'vereisten': 'requirements',
	'prijs': 'priceLevel', 'exacte prijs': 'exactPrice', 'toepassingsgebied': 'scopeOfApplication',
	'ethisch': 'ethicDomains', 'certificaat': 'certificate', 'taal': 'language',
	'lesuren': 'totalHours', 'regio': 'locationZone', 'locatie': 'locationAddress',
	'voornaam': 'firstName', 'achternaam': 'lastName', 'email': 'email', 'organisatie': 'organisationName'
};

export const cleanText = (text: string): string => 
	text.toLowerCase().replace(/[.,!?;:()\[\]{}'"]/g, '').replace(/\s+/g, ' ').trim();

export const parseNumber = (text: string): number | null => {
	const num = NUMBER_WORDS[text] ?? parseInt(text, 10);
	return isNaN(num) ? null : num;
};

export const parseDateFromSpeech = (speech: string): string | null => {
	const lower = cleanText(speech);
	const parts = lower.split(/\s+/);
	let day: number | null = null, month: number | null = null, year = new Date().getFullYear();

	for (const part of parts) {
		if (day === null && (NUMBER_WORDS[part] !== undefined || /^\d{1,2}$/.test(part))) {
			day = NUMBER_WORDS[part] ?? parseInt(part, 10);
		} else if (month === null && MONTH_MAP[part] !== undefined) {
			month = MONTH_MAP[part];
		} else if (/^\d{4}$/.test(part)) {
			year = parseInt(part, 10);
		}
	}

	if (day && month) {
		const date = new Date(Date.UTC(year, month - 1, day));
		if (!isNaN(date.getTime())) {
			return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
		}
	}

	const match = lower.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
	if (match) {
		const date = new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
		if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
	}

	return null;
};

export const parseTimeFromSpeech = (speech: string): string | null => {
	let lower = cleanText(speech).replace(/u$|uur$/i, '');
	
	const timeMatch = lower.match(/(\d{1,2})[:.](\d{2})/);
	if (timeMatch) {
		const h = parseInt(timeMatch[1], 10), m = parseInt(timeMatch[2], 10);
		if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
			return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
		}
	}

	const parts = lower.split(/\s+/);
	let hour: number | null = null, minute = 0;
	
	for (const part of parts) {
		if (hour === null && (NUMBER_WORDS[part] !== undefined || /^\d{1,2}$/.test(part))) {
			hour = NUMBER_WORDS[part] ?? parseInt(part, 10);
		} else if (NUMBER_WORDS[part] !== undefined || /^\d{1,2}$/.test(part)) {
			minute = NUMBER_WORDS[part] ?? parseInt(part, 10);
		}
	}

	if (hour !== null && hour >= 0 && hour <= 23) {
		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	}

	return null;
};

export const fillFieldValue = (field: HTMLInputElement | HTMLTextAreaElement, value: string, speak: (text: string) => void): boolean => {
	if (field.type === 'date') {
		const parsed = parseDateFromSpeech(value);
		if (parsed) {
			field.value = parsed;
			field.dispatchEvent(new Event('input', { bubbles: true }));
			field.dispatchEvent(new Event('change', { bubbles: true }));
			speak(`Datum ingevuld: ${parsed}`);
			return true;
		}
	} else if (field.type === 'time') {
		const parsed = parseTimeFromSpeech(value);
		if (parsed) {
			field.value = parsed;
			field.dispatchEvent(new Event('input', { bubbles: true }));
			field.dispatchEvent(new Event('change', { bubbles: true }));
			speak(`Tijd ingevuld: ${parsed}`);
			return true;
		}
	} else if (field.type === 'number') {
		const num = parseFloat(value);
		if (!isNaN(num)) {
			field.value = num.toString();
			field.dispatchEvent(new Event('input', { bubbles: true }));
			field.dispatchEvent(new Event('change', { bubbles: true }));
			speak(`Ingevuld: ${num}`);
			return true;
		}
	}
	
	field.value = value;
	field.dispatchEvent(new Event('input', { bubbles: true }));
	field.dispatchEvent(new Event('change', { bubbles: true }));
	speak(`Ingevuld: ${value}`);
	return true;
};

export const closeAllSuggestions = (): void => {
	document.querySelectorAll('.suggestion-box').forEach(box => {
		const input = box.closest('.input-field')?.querySelector('input, textarea');
		input?.dispatchEvent(new Event('blur'));
	});
};

export const navigateToField = (fieldId: string, speak: (text: string) => void): void => {
	closeAllSuggestions();
	const field = document.getElementById(fieldId);
	
	if (field) {
		field.focus();
		field.scrollIntoView({ behavior: 'smooth', block: 'center' });

		if (fieldId === 'organisers') {
			const dropdown = field.closest('.dropdown-container')?.querySelector('.dropdown-header') as HTMLElement;
			const popup = document.querySelector('.organisers-popup.open');
			if (!popup && dropdown) setTimeout(() => dropdown.click(), 100);
		}

		if (fieldId === 'courseType') speak('Kies tussen selecteer bepaalde datum of eigen tijd');
		else if (fieldId === 'courseLink') speak('Beschrijf welke website je hebt gebruikt voor link suggesties.');
		else speak(`Genavigeerd naar ${fieldId}`);
	} else if (fieldId === 'courseType') {
		const radio = document.querySelector('input[type="radio"][name="courseType"]') as HTMLInputElement;
		if (radio) {
			radio.focus();
			radio.scrollIntoView({ behavior: 'smooth', block: 'center' });
			speak('Kies tussen selecteer bepaalde datum of eigen tijd');
		}
	}
};

export const handleNavigateCommand = (transcript: string, speak: (text: string) => void): void => {
	const lower = cleanText(transcript);
	const match = lower.match(/^(?:ga naar|navigeer naar)\s+(.+)/);
	if (!match) return;

	const search = match[1].trim();
	let targetField: string | null = null;

	// Check field name map
	for (const [key, value] of Object.entries(FIELD_NAME_MAP)) {
		if (search === key || search.startsWith(key + ' ') || search.includes(key)) {
			targetField = value;
			break;
		}
	}

	// Search labels if not found
	if (!targetField) {
		document.querySelectorAll('input, textarea, select, .dropdown-container').forEach(field => {
			const label = field.closest('.input-field')?.querySelector('label')?.textContent || '';
			const cleanLabel = cleanText(label);
			const labelWords = cleanLabel.split(/\s+/);
			if (search === labelWords[0] || search === labelWords.slice(0, 2).join(' ') || cleanLabel.includes(search)) {
				targetField = (field as HTMLElement).id || null;
			}
		});
	}

	if (targetField) navigateToField(targetField, speak);
	else speak('Veld niet gevonden. Probeer opnieuw.');
};

export const handleNextFieldCommand = (formStep: number, speak: (text: string) => void): void => {
	closeAllSuggestions();
	const step = (formStep === 2 ? 2 : 1) as FormStep;
	const moved = focusNextFieldInStep(step, 1);
	
	if (moved.to) speak('Volgende veld');
	else if (moved.atEdge === 'end') {
		speak(moved.from === 'courseType' ? 'Kies tussen selecteer bepaalde datum of eigen tijd' : 'Laatste veld van deze pagina');
	} else speak('Geen volgend veld gevonden');
};

export const handlePreviousFieldCommand = (formStep: number, speak: (text: string) => void): void => {
	closeAllSuggestions();
	const step = (formStep === 2 ? 2 : 1) as FormStep;
	const moved = focusNextFieldInStep(step, -1);
	
	if (moved.to) speak('Vorige veld');
	else if (moved.atEdge === 'start') speak('Eerste veld van deze pagina');
	else speak('Geen vorig veld gevonden');
};

export const handleWriteCommand = (transcript: string, speak: (text: string) => void): void => {
	const lower = cleanText(transcript);
	// Support both "schrijf" and "schreef"
	const match = lower.match(/^(?:schrijf|schreef|typ)\s+(.+)/);
	if (!match) return;

	const text = match[1].trim();
	const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
	
	if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
		speak('Geen veld geselecteerd. Navigeer eerst naar een veld.');
		return;
	}

	fillFieldValue(active, text, speak);
};

export const handleDirectInput = (transcript: string, speak: (text: string) => void): void => {
	const active = document.activeElement as HTMLInputElement | null;
	if (!active) return;
	
	const text = cleanText(transcript);
	if (active.type === 'date') {
		const parsed = parseDateFromSpeech(text);
		if (parsed) {
			active.value = parsed;
			active.dispatchEvent(new Event('input', { bubbles: true }));
			active.dispatchEvent(new Event('change', { bubbles: true }));
			speak(`Datum ingevuld: ${parsed}`);
		}
	} else if (active.type === 'time') {
		const parsed = parseTimeFromSpeech(text);
		if (parsed) {
			active.value = parsed;
			active.dispatchEvent(new Event('input', { bubbles: true }));
			active.dispatchEvent(new Event('change', { bubbles: true }));
			speak(`Tijd ingevuld: ${parsed}`);
		}
	}
};

export const handleSelectRadioCommand = (transcript: string, speak: (text: string) => void): void => {
	const lower = cleanText(transcript);
	const radios = document.querySelectorAll('input[type="radio"][name="courseType"]') as NodeListOf<HTMLInputElement>;

	for (const radio of Array.from(radios)) {
		const label = cleanText(radio.nextElementSibling?.textContent || '');

		if ((lower.includes('bepaalde datum') || lower.includes('vaste datum') || lower.includes('bepaalde periode') ||
			lower.includes('selecteer deze') || lower.includes('deze opleiding')) && label.includes('bepaalde')) {
			radio.checked = true;
			radio.dispatchEvent(new Event('change', { bubbles: true }));
			speak('Type opleiding geselecteerd: bepaalde datum');
			setTimeout(() => navigateToField('startDate', speak), 500);
			return;
		}

		if ((lower.includes('eigen tijd') || lower.includes('geen vaste') || lower.includes('selecteer de') ||
			lower.includes('de deelnemer')) && (label.includes('eigen tijd') || label.includes('deelnemer'))) {
			radio.checked = true;
			radio.dispatchEvent(new Event('change', { bubbles: true }));
			speak('Type opleiding geselecteerd: eigen tijd');
			return;
		}
	}

	speak('Type opleiding niet gevonden');
};

export const handleSelectCheckboxCommand = (transcript: string, speak: (text: string) => void): void => {
	const lower = cleanText(transcript);
	
	let container: Element | null = document.querySelector('.input-field:has(#PrimaryTargetGroup) .checkbox-wrapper');
	if (!container) {
		document.querySelectorAll('label').forEach(label => {
			if (label.textContent?.toLowerCase().includes('primaire doelgroep')) {
				container = label.closest('.input-field')?.querySelector('.checkbox-wrapper') || null;
			}
		});
	}

	if (!container) { speak('Primaire doelgroep veld niet gevonden'); return; }

	const checkboxes = container.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
	for (const cb of Array.from(checkboxes)) {
		const label = cleanText(cb.nextElementSibling?.textContent || '');

		if (lower.includes('onderzoek') && label.includes('onderzoek')) {
			cb.checked = !cb.checked;
			cb.dispatchEvent(new Event('change', { bubbles: true }));
			speak(cb.checked ? 'Onderzoek geselecteerd' : 'Onderzoek gedeselecteerd');
			return;
		}

		if ((lower.includes('levenslang') || lower.includes('leren')) && (label.includes('levenslang') || label.includes('leren'))) {
			cb.checked = !cb.checked;
			cb.dispatchEvent(new Event('change', { bubbles: true }));
			speak(cb.checked ? 'Levenslang leren geselecteerd' : 'Levenslang leren gedeselecteerd');
			return;
		}
	}

	speak('Optie niet gevonden. Probeer "onderzoek" of "levenslang leren".');
};

export const handleNavigateLetterCommand = (transcript: string, speak: (text: string) => void): void => {
	const lower = cleanText(transcript);
	const match = lower.match(/^(?:ga naar |letter |sorteer |naar )?(.+)$/);
	if (!match) return;

	const letterPart = match[1].trim();
	const letter = SPELLED_LETTERS[letterPart] || (letterPart.length === 1 ? letterPart.toUpperCase() : null);
	if (!letter) return;

	const popup = document.querySelector('.organisers-popup.open');
	if (popup) {
		const buttons = popup.querySelectorAll('.letter-button') as NodeListOf<HTMLElement>;
		for (const btn of Array.from(buttons)) {
			if (btn.textContent?.trim().toUpperCase() === letter) {
				btn.click();
				speak(`Genavigeerd naar ${letter}`);
				return;
			}
		}
	} else {
		const dropdown = document.getElementById('organisers')?.closest('.dropdown-container')?.querySelector('.dropdown-header') as HTMLElement;
		if (dropdown) {
			dropdown.click();
			setTimeout(() => handleNavigateLetterCommand(transcript, speak), 200);
		}
	}
};

export const handleSelectOrganiserNumberCommand = (transcript: string, speak: (text: string) => void): void => {
	const lower = cleanText(transcript);
	const isDeselect = lower.startsWith('deselecteer');
	const match = lower.match(/(?:selecteer|deselecteer)\s+(?:organisator\s+)?(?:nummer\s+)?(\d+|\w+)/);
	if (!match) return;

	const num = parseNumber(match[1]);
	if (!num) return;

	const popup = document.querySelector('.organisers-popup.open');
	if (!popup) { speak('Popup niet open. Open eerst de popup.'); return; }

	const optionItem = popup.querySelector(`[data-number="${num}"]`) as HTMLElement;
	if (!optionItem) { speak(`Optie ${num} niet gevonden`); return; }

	optionItem.click();
	setTimeout(() => {
		const fresh = document.querySelector('.organisers-popup.open')?.querySelector(`[data-number="${num}"]`);
		const isSelected = fresh?.classList.contains('selected');
		speak(isDeselect ? (!isSelected ? `Optie ${num} gedeselecteerd` : `Optie ${num} is nog steeds geselecteerd`)
			: (isSelected ? `Optie ${num} geselecteerd` : `Optie ${num} gedeselecteerd`));
	}, 300);
};

export const handleClosePopupCommand = (speak: (text: string) => void): void => {
	// First try to close organisers popup
	const popup = document.querySelector('.organisers-popup.open');
	if (popup) {
		const btn = popup.querySelector('.done-button, .close-button, .popup-overlay') as HTMLElement;
		btn?.click();
		speak('Popup gesloten');
		return;
	}

	// Then try to close any open dropdown
	const openHeader = document.querySelector('.dropdown-header.open') as HTMLElement;
	if (openHeader) {
		openHeader.click();
		speak('Dropdown gesloten');
		return;
	}

	speak('Geen dropdown of popup open');
};

export const handleSelectSuggestionCommand = (transcript: string, speak: (text: string) => void): void => {
	const match = transcript.toLowerCase().match(/(?:selecteer|kies|nummer|accepteer)\s+(\d+|\w+)/);
	if (!match) return;

	const num = parseNumber(match[1]);
	if (!num) return;

	const active = document.activeElement as HTMLElement;
	const box = active.closest('.input-field')?.querySelector('.suggestion-box .container');
	if (!box) return;

	const radios = box.querySelectorAll('.radio input[type="radio"]') as NodeListOf<HTMLInputElement>;
	if (radios[num - 1]) {
		radios[num - 1].checked = true;
		radios[num - 1].dispatchEvent(new Event('change', { bubbles: true }));
		(box.querySelector('.button.secondary') as HTMLElement)?.click();
		speak(`AI suggestie ${num} geselecteerd`);
	}
};

export const handleAcceptSuggestionCommand = (speak: (text: string) => void): void => {
	const active = document.activeElement as HTMLElement;
	const btn = active.closest('.input-field')?.querySelector('.suggestion-box .container .button.secondary') as HTMLElement;
	if (btn) { btn.click(); speak('AI suggestie geaccepteerd'); }
	else speak('Geen suggestie beschikbaar');
};

export const handleReadSuggestionCommand = (speak: (text: string) => void): void => {
	const active = document.activeElement as HTMLElement;
	const radios = active.closest('.input-field')?.querySelector('.suggestion-box .container')?.querySelectorAll('.radio label');
	if (radios && radios.length > 0) {
		const text = Array.from(radios).slice(0, 3).map((l, i) => `Suggestie ${i + 1}: ${l.textContent?.trim()}`).join('. ');
		speak(text);
	} else speak('Geen suggestie beschikbaar');
};

export const handleReadFieldCommand = (speak: (text: string) => void): void => {
	const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
	if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
		speak(`Huidige waarde: ${active.value || 'Leeg'}`);
	} else speak('Geen veld geselecteerd');
};

export const handleClearFieldCommand = (speak: (text: string) => void): void => {
	const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
	if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
		active.value = '';
		active.dispatchEvent(new Event('input', { bubbles: true }));
		active.dispatchEvent(new Event('change', { bubbles: true }));
		speak('Veld gewist');
	} else speak('Geen veld geselecteerd');
};

export const handleFillCommand = async (
	transcript: string,
	speak: (text: string) => void,
	setLinkSuggestions: (suggestions: string[]) => void
): Promise<void> => {
	const lower = cleanText(transcript);
	const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;

	// Handle "vul in met" pattern
	const matchWithField = lower.match(/vul\s+(.+?)\s+in\s+met\s+(.+)/);
	if (matchWithField) {
		const fieldName = matchWithField[1].trim();
		const value = matchWithField[2].trim();
		const fieldId = FIELD_NAME_MAP[fieldName] || fieldName;
		const field = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
		if (field) fillFieldValue(field, value, speak);
		return;
	}

	// Handle "vul in [value]" pattern
	const matchDirect = lower.match(/vul\s+in\s+(.+)/);
	if (matchDirect && active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
		fillFieldValue(active, matchDirect[1].trim(), speak);
		return;
	}

	// Handle website description for link field
	if (active?.id === 'courseLink') {
		let desc = '';
		if (lower.includes('zoek link') || lower.includes('vind link')) {
			desc = lower.replace(/^(?:zoek|vind)\s+link\s+(?:voor\s+)?/, '').trim();
		} else if (lower.includes('website') || lower.includes('site')) {
			desc = lower.replace(/.*?(?:website|site)\s+(?:is|was|gebruikt|gebruik|hebt|heb)\s+/, '').trim();
		}

		if (desc && desc.length > 3 && !desc.match(/^https?:\/\//)) {
			speak('Zoek naar link suggesties...');
			const suggestions = await linkSuggestionService.getLinkSuggestions(desc);
			if (suggestions.length > 0) {
				setLinkSuggestions(suggestions.map(s => s.url));
				active.focus();
				speak(`${suggestions.length} link suggesties gevonden`);
			} else speak('Geen link suggesties gevonden');
		}
	}
};

export const handleSelectDropdownNumberCommand = (transcript: string, speak: (text: string) => void): void => {
	const lower = transcript.toLowerCase();
	const isDeselect = lower.includes('deselecteer');
	const match = lower.match(/(?:selecteer|deselecteer|kies)\s+(?:optie\s+)?(?:nummer\s+)?(\d+|\w+)/);
	if (!match) return;

	const num = parseNumber(match[1]);
	if (!num) return;

	// Try to find an open dropdown menu
	const openDropdowns = document.querySelectorAll('.dropdown-container');
	let targetMenu: HTMLElement | null = null;
	
	for (const dropdown of Array.from(openDropdowns)) {
		const header = dropdown.querySelector('.dropdown-header');
		const menu = dropdown.querySelector('.dropdown-menu') as HTMLElement;
		
		// Check if this dropdown is open (header has 'open' class or menu is visible)
		if (header?.classList.contains('open') || (menu && getComputedStyle(menu).display !== 'none')) {
			targetMenu = menu;
			break;
		}
	}

	// Also check for visible dropdown menus
	if (!targetMenu) {
		targetMenu = document.querySelector('.dropdown-menu:not([style*="display: none"])') as HTMLElement;
	}

	if (!targetMenu) {
		speak('Geen dropdown geopend. Open eerst een dropdown.');
		return;
	}

	const item = targetMenu.querySelector(`[data-number="${num}"]`) as HTMLElement;
	if (item) {
		item.click();
		const optionText = item.querySelector('.option-text')?.textContent?.trim() || `Optie ${num}`;
		const wasSelected = item.classList.contains('selected');
		
		// After click, check new state
		setTimeout(() => {
			const isNowSelected = item.classList.contains('selected');
			if (isDeselect) {
				speak(isNowSelected ? `${optionText} is nog steeds geselecteerd` : `${optionText} gedeselecteerd`);
			} else {
				speak(isNowSelected ? `${optionText} geselecteerd` : `${optionText} gedeselecteerd`);
			}
		}, 100);
	} else {
		// Try to find by looking at all option items with numbers
		const allItems = targetMenu.querySelectorAll('.option-item[data-number]');
		if (allItems.length > 0) {
			speak(`Optie ${num} niet gevonden. Er zijn ${allItems.length} opties beschikbaar.`);
		} else {
			speak(`Optie ${num} niet gevonden`);
		}
	}
};

/**
 * Handle "verbeter" voice command (edit)
 * Allows user to say "verbeter [instruction]" to modify the current field's content
 * Examples:
 * - "verbeter maak korter" -> Makes the text shorter
 * - "bewerk vervang hallo door welkom" -> Replaces "hallo" with "welkom"
 * - "wijzig hoofdletter" -> Capitalizes the text
 */
export const handleEditCommand = async (
	transcript: string,
	speak: (text: string) => void
): Promise<void> => {
	const lower = cleanText(transcript);
	
	// Extract the edit instruction from the transcript
	// Patterns: "verbeter [instruction]", "bewerk [instruction]", "wijzig [instruction]", etc.
	const match = lower.match(/^(?:verbeter|bewerk|wijzig|pas aan|verander|corrigeer|herschrijf)\s+(.+)/);
	if (!match) {
		speak('Geef een bewerkingsinstructie. Bijvoorbeeld: verbeter maak korter');
		return;
	}

	const instruction = match[1].trim();
	const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;

	if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
		speak('Geen veld geselecteerd. Navigeer eerst naar een veld.');
		return;
	}

	const originalText = active.value;
	if (!originalText || originalText.trim().length === 0) {
		speak('Het veld is leeg. Er is niets om te bewerken.');
		return;
	}

	speak('Bezig met bewerken...');

	try {
		const fieldType = active.id === 'courseLink' ? 'link' : 
						  active.id === 'description' ? 'description' : 'text';
		
		const result = await editService.editText(originalText, instruction, fieldType);
		
		if (result.success && result.editedText) {
			active.value = result.editedText;
			active.dispatchEvent(new Event('input', { bubbles: true }));
			active.dispatchEvent(new Event('change', { bubbles: true }));
			speak(`Bewerkt: ${result.editedText.substring(0, 50)}${result.editedText.length > 50 ? '...' : ''}`);
		} else {
			speak(result.error || 'Bewerking mislukt. Probeer opnieuw.');
		}
	} catch (error) {
		speak('Er is een fout opgetreden bij het bewerken.');
		console.error('Edit command error:', error);
	}
};

/**
 * Handle spoken link command for the link field
 * Allows user to describe or spell out a URL
 * Examples:
 * - "link eventbrite" -> https://www.eventbrite.com
 * - "link google punt com slash forms" -> https://google.com/forms
 * - "spel link ee vee ee en tee bee er ie tee ee punt cee oh em" -> https://eventbrite.com
 */
export const handleLinkCommand = async (
	transcript: string,
	speak: (text: string) => void,
	setLinkSuggestions: (suggestions: string[]) => void
): Promise<void> => {
	const lower = cleanText(transcript);
	
	// Check if user is spelling out the URL
	const isSpelling = lower.includes('spel') || lower.includes('letter voor letter');
	
	// Extract the link description
	const match = lower.match(/^(?:link|url|website|spel link|spel url)\s+(.+)/);
	if (!match) {
		speak('Geef een website naam of spel de URL. Bijvoorbeeld: link eventbrite');
		return;
	}

	const description = match[1].trim();
	const active = document.activeElement as HTMLInputElement | null;

	// Check if we're in the link field or navigate to it
	let linkField = active?.id === 'courseLink' ? active : 
					document.getElementById('courseLink') as HTMLInputElement | null;

	if (!linkField) {
		speak('Link veld niet gevonden.');
		return;
	}

	// Focus the link field if not already focused
	if (active?.id !== 'courseLink') {
		linkField.focus();
		linkField.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	speak('Bezig met verwerken...');

	try {
		let result;
		if (isSpelling) {
			// Process spelled URL
			const spelledUrl = editService.processSpelledUrl(description);
			result = { url: spelledUrl, success: true };
		} else {
			// Parse spoken description
			result = await editService.parseSpokenLink(description);
		}

		if (result.success && result.url) {
			// Set the URL in the field
			linkField.value = result.url;
			linkField.dispatchEvent(new Event('input', { bubbles: true }));
			linkField.dispatchEvent(new Event('change', { bubbles: true }));
			
			// Also provide as suggestion
			setLinkSuggestions([result.url]);
			
			speak(`Link ingevuld: ${result.url}`);
		} else {
			speak(result.error || 'Kon de link niet verwerken. Probeer opnieuw.');
		}
	} catch (error) {
		speak('Er is een fout opgetreden bij het verwerken van de link.');
		console.error('Link command error:', error);
	}
};

export { focusFirstFieldInStep };
