<template>
	<div class="vui-control" :class="{ 'active': isListening, 'speaking': isSpeaking }">
		<div class="vui-header">
			<button @click="toggleListening" class="vui-button" :class="{ 'listening': isListening }" :disabled="isSpeaking">
				<span class="mic-icon">{{ isListening ? '🎤' : '🎙️' }}</span>
				<span class="button-text">{{ isListening ? 'Luisteren...' : 'Spraak' }}</span>
			</button>
			<div class="vui-status-compact">
				<span v-if="isListening" class="status-listening">🎤</span>
				<span v-else-if="isSpeaking" class="status-speaking">🔊</span>
				<span v-else class="status-idle">●</span>
			</div>
		</div>

		<div v-if="lastTranscript" class="vui-transcript"><p>{{ lastTranscript }}</p></div>
		<div v-if="error" class="vui-error"><p>{{ error }}</p></div>

		<div class="vui-help" v-if="showHelp">
			<div class="help-content">
				<div class="help-section"><strong>Navigatie:</strong> "Ga naar [veld]", "Volgende veld", "Vorige veld"</div>
				<div class="help-section"><strong>Invoer:</strong> "Schrijf [tekst]", "Vul [veld] in met [tekst]", of gewoon datum/tijd zeggen</div>
				<div class="help-section"><strong>Bewerken:</strong> "Verbeter [instructie]", bijv. "Verbeter maak korter", "Bewerk vervang X door Y"</div>
				<div class="help-section"><strong>Link:</strong> "Link [website]", bijv. "Link eventbrite", "Link google punt com"</div>
				<div class="help-section"><strong>Selectie:</strong> "Selecteer [nummer]", "Selecteer [optie]", "Accepteer suggestie"</div>
				<div class="help-section"><strong>Andere:</strong> "Lees veld", "Wis veld", "Stop"</div>
			</div>
		</div>

		<button @click="showHelp = !showHelp" class="help-toggle">{{ showHelp ? '▲' : '▼' }}</button>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { vuiService, VUIService, type VUIEvent } from '@/services/vuiService';
import { dataLogger } from '@/services/dataLogger';

const props = defineProps<{ onCommand?: (command: string, transcript: string) => void }>();
const emit = defineEmits<{ command: [command: string, transcript: string]; transcript: [transcript: string] }>();

const isListening = ref(false);
const isSpeaking = ref(false);
const lastTranscript = ref('');
const error = ref('');
const showHelp = ref(false);

let unsubscribe: (() => void) | null = null;

onMounted(() => {
	unsubscribe = vuiService.onEvent(handleVUIEvent);
	if (!VUIService.isSupported()) {
		error.value = 'Spraakherkenning wordt niet ondersteund in deze browser. Gebruik Chrome of Edge.';
	}
});

onBeforeUnmount(() => {
	unsubscribe?.();
	vuiService.stopListening();
	vuiService.stopSpeaking();
});

const handleVUIEvent = (event: VUIEvent) => {
	switch (event.type) {
		case 'recognition-start':
			isListening.value = true;
			error.value = '';
			dataLogger.logInteraction('system', 'vui-listening-start', {});
			break;
		case 'recognition-result':
			if (event.data?.transcript) {
				const transcript = event.data.transcript.trim();
				lastTranscript.value = transcript;
				if (event.data.isFinal) {
					const systemPhrases = ['genavigeerd naar', 'ingevuld', 'geaccepteerd', 'afgewezen', 'commando niet herkend', 'ai suggestie', 'geen veld', 'geen suggestie', 'type opleiding geselecteerd'];
					if (systemPhrases.some(p => transcript.toLowerCase().includes(p))) return;
					if (transcript.length > 100 || transcript.split('.').length > 3) {
						vuiService.speak('Commando te lang. Probeer opnieuw.');
						return;
					}
					emit('transcript', transcript);
					const command = parseCommand(transcript);
					if (command) {
						emit('command', command, transcript);
						props.onCommand?.(command, transcript);
						dataLogger.logInteraction('voice', 'command', { command, transcript });
					} else {
						dataLogger.logInteraction('voice', 'input', { transcript });
					}
				}
			}
			break;
		case 'recognition-error':
			isListening.value = false;
			error.value = `Fout bij spraakherkenning: ${event.data?.error || 'Onbekende fout'}`;
			dataLogger.logInteraction('voice', 'error', { error: event.data?.error }, undefined, error.value);
			break;
		case 'speech-start': isSpeaking.value = true; break;
		case 'speech-end': isSpeaking.value = false; break;
	}
};

const parseCommand = (transcript: string): string | null => {
	let lower = transcript.toLowerCase().trim().replace(/[.,!?;:]/g, '');

	// Edit commands - should be checked early (Dutch words for easy recognition)
	if (lower.startsWith('verbeter') || lower.startsWith('bewerk') || lower.startsWith('wijzig') || 
		lower.startsWith('pas aan') || lower.startsWith('verander') || lower.startsWith('corrigeer') ||
		lower.startsWith('herschrijf')) {
		return 'edit';
	}

	// Link/URL commands - for the link field
	if (lower.startsWith('link ') || lower.startsWith('url ') || 
		lower.startsWith('spel link') || lower.startsWith('spel url') ||
		(lower.startsWith('website ') && !lower.includes('gebruikt') && !lower.includes('hebt'))) {
		return 'link';
	}

	// Navigation commands
	if (lower.startsWith('ga naar') || lower.startsWith('navigeer naar')) return 'navigate';

	// Website description commands
	if (lower.includes('zoek link') || lower.includes('vind link') ||
		(lower.includes('website') && (lower.includes('gebruikt') || lower.includes('gebruik') || lower.includes('hebt'))) ||
		(lower.includes('site') && (lower.includes('gebruikt') || lower.includes('gebruik') || lower.includes('hebt')))) {
		return 'fill';
	}

	// Fill field commands
	if (lower.includes('vul') && (lower.includes('in met') || lower.includes('in '))) return 'fill';

	// Write commands (includes "schreef" as alias for "schrijf")
	if (lower.startsWith('schrijf') || lower.startsWith('schreef') || lower.startsWith('typ')) return 'write';

	// Organisers popup commands (check first as it takes priority)
	const popup = document.querySelector('.organisers-popup.open');
	if (popup) {
		if (lower === 'klaar' || lower === 'sluit' || lower === 'sluit popup' || lower.startsWith('sluit pop')) return 'close-popup';
		const letterPattern = /^(?:ga naar |letter |sorteer |naar )?([a-z]|aa|bee|cee|dee|ee|ef|gee|ha|ie|jee|ka|el|em|en|oh|pee|que|er|es|tee|uu|vee|wee|ix|ij|zet)$/;
		if (lower.match(letterPattern)) return 'navigate-letter';
		if (lower.match(/^(?:selecteer|deselecteer|kies)\s+(?:organisator\s+)?(?:optie\s+)?(?:nummer\s+)?(\d+|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|dertien|veertien|vijftien|zestien|zeventien|achttien|negentien|twintig)/)) {
			return 'select-organiser-number';
		}
	}

	// Dropdown selection - check if any dropdown is open
	const isDropdownOpen = () => {
		// Check for open dropdown headers
		const openHeader = document.querySelector('.dropdown-header.open');
		if (openHeader) return true;
		
		// Check for visible dropdown menus
		const menus = document.querySelectorAll('.dropdown-menu');
		for (const menu of Array.from(menus)) {
			const style = getComputedStyle(menu);
			if (style.display !== 'none' && style.visibility !== 'hidden') {
				return true;
			}
		}
		return false;
	};
	
	if (isDropdownOpen() && lower.match(/^(?:selecteer|deselecteer|kies)\s+(?:optie\s+)?(?:nummer\s+)?(\d+|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|dertien|veertien|vijftien|zestien|zeventien|achttien|negentien|twintig)$/)) {
		return 'select-dropdown-number';
	}

	// AI suggestion commands
	const suggestionBox = document.querySelector('.suggestion-box');
	if (suggestionBox && lower.match(/(?:selecteer|kies|nummer|accepteer)\s+(?:\d+|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf)/)) {
		return 'select-suggestion';
	}
	if (lower.includes('lees suggestie') || lower.includes('lees ai suggestie')) return 'read-suggestion';
	if (lower.includes('accepteer suggestie') || (lower.includes('accepteer') && !lower.match(/\d+/))) return 'accept-suggestion';
	if (lower.includes('wijs suggestie af') || lower.includes('afwijzen')) return 'reject-suggestion';

	// Form navigation
	if (lower.includes('volgende pagina')) return 'next-step';
	if (lower.includes('volgende veld') || lower.includes('volgende stap')) return 'next-field';
	if (lower.includes('vorige pagina')) return 'previous-step';
	if (lower.includes('vorige veld') || lower.includes('vorige stap')) return 'previous-field';
	if (lower.includes('terug') && lower.includes('pagina')) return 'previous-step';

	// Radio button selection
	if (lower.includes('selecteer') && (
		lower.includes('bepaalde datum') || lower.includes('vaste datum') || lower.includes('bepaalde periode') ||
		lower.includes('eigen tijd') || lower.includes('geen vaste datum') || lower.includes('type opleiding') ||
		(lower.includes('deze opleiding') && !lower.includes('link')) ||
		(lower.includes('opleiding') && (lower.includes('gaat door') || lower.includes('datum') || lower.includes('tijd')))
	)) return 'select-radio';

	// Checkbox selection
	if ((lower.includes('selecteer') || lower.includes('deselecteer') || lower.includes('vink')) &&
		(lower.includes('onderzoek') || lower.includes('levenslang') || lower.includes('leren') ||
		lower.includes('primaire') || lower.includes('checkbox') || lower.includes('vinkje'))) {
		return 'select-checkbox';
	}

	// Close dropdown/popup
	if (lower === 'klaar' || lower === 'sluit' || lower === 'sluiten' || lower === 'close') {
		// Check if any dropdown or popup is open
		if (document.querySelector('.organisers-popup.open') || document.querySelector('.dropdown-header.open')) {
			return 'close-popup';
		}
	}

	// General commands
	if (lower.includes('wis') || lower.includes('leeg') || lower.includes('clear')) return 'clear-field';
	if (lower.includes('lees veld') || lower.includes('wat staat er') || lower.includes('lees waarde')) return 'read-field';
	if (lower === 'stop' || lower === 'stop luisteren') return 'stop';

	// Direct date/time input - check if focused on date/time field
	const active = document.activeElement as HTMLInputElement;
	if (active?.type === 'date' || active?.type === 'time') {
		// Check if it looks like a date (has month name or numbers)
		const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
		const hasMonth = months.some(m => lower.includes(m));
		const hasNumbers = /\d/.test(lower);
		if (hasMonth || hasNumbers) return 'direct-input';
	}

	return null;
};

const toggleListening = () => {
	if (isSpeaking.value) { error.value = 'Wacht tot de spraak is afgelopen'; return; }
	if (isListening.value) {
		vuiService.stopListening();
		isListening.value = false;
		lastTranscript.value = '';
	} else {
		if (vuiService.startListening()) {
			isListening.value = true;
			error.value = '';
			lastTranscript.value = '';
		} else {
			error.value = 'Kon niet starten met luisteren. Controleer microfoon toestemming.';
		}
	}
};

defineExpose({
	speak: (text: string) => vuiService.speak(text),
	stopListening: () => {
		vuiService.stopListening();
		vuiService.stopSpeaking();
		isListening.value = false;
	},
	isListening: () => isListening.value,
	isSpeaking: () => isSpeaking.value
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/main.scss' as *;

.vui-control {
	position: fixed;
	bottom: 1.5rem;
	right: 1.5rem;
	background: white;
	border-radius: 0.8rem;
	padding: 1rem;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	max-width: 280px;
	z-index: 1000;
	border: 2px solid $font-color;
	transition: all 0.3s ease;

	&.active { border-color: #4CAF50; box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4); }
	&.speaking { border-color: #2196F3; box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4); }

	.vui-header { display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; }

	.vui-button {
		display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem;
		background: $gradient; color: white; border: none; border-radius: 0.5rem;
		cursor: pointer; font-size: 1.3rem; font-weight: 600; transition: all 0.3s ease; flex: 1;
		&:hover:not(:disabled) { transform: scale(1.05); }
		&:disabled { opacity: 0.6; cursor: not-allowed; }
		&.listening { background: #f44336; animation: pulse 1.5s infinite; }
		.mic-icon { font-size: 1.6rem; }
		.button-text { font-size: 1.2rem; }
	}

	.vui-status-compact {
		display: flex; align-items: center; justify-content: center;
		width: 2.4rem; height: 2.4rem; border-radius: 50%; font-size: 1.2rem;
		.status-listening { color: #4CAF50; animation: pulse 1.5s infinite; }
		.status-speaking { color: #2196F3; animation: pulse 1.5s infinite; }
		.status-idle { color: #9e9e9e; }
	}

	.vui-transcript { margin: 0.5rem 0; padding: 0.5rem; background: #f5f5f5; border-radius: 0.4rem; font-size: 1.2rem; p { margin: 0; } }
	.vui-error { margin: 0.5rem 0; padding: 0.5rem; background: #ffebee; border-left: 3px solid #f44336; border-radius: 0.4rem; color: #c62828; font-size: 1.2rem; p { margin: 0; } }

	.vui-help {
		margin-top: 0.8rem; padding: 0.8rem; background: #f9f9f9; border-radius: 0.5rem;
		font-size: 1.1rem; max-height: 300px; overflow-y: auto;
		.help-content { display: flex; flex-direction: column; gap: 0.6rem; }
		.help-section { padding: 0.5rem; background: white; border-radius: 0.4rem; line-height: 1.4; strong { color: $fuchsia; display: block; margin-bottom: 0.3rem; font-size: 1.15rem; } }
	}

	.help-toggle {
		width: 100%; margin-top: 0.6rem; padding: 0.4rem; background: transparent;
		border: 1px solid #ddd; border-radius: 0.4rem; cursor: pointer;
		font-size: 1rem; color: $font-color; text-align: center; transition: all 0.2s ease;
		&:hover { background: #f5f5f5; border-color: $fuchsia; }
	}
}

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
@media (max-width: 768px) { .vui-control { bottom: 1rem; right: 1rem; left: 1rem; max-width: none; } }
</style>
