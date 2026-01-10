<template>
	<div class="organisers-popup" :class="{ 'open': isOpen }" v-if="isOpen">
		<div class="popup-overlay" @click="closePopup"></div>
		<div class="popup-content">
			<div class="popup-header">
				<h3>{{ title }}</h3>
				<button class="close-button" @click="closePopup">×</button>
			</div>
			
			<div class="popup-body">
				<div class="letters-nav" ref="lettersNavRef">
					<button
						v-for="letter in availableLetters"
						:key="letter"
						@click="scrollToLetter(letter)"
						class="letter-button"
						:class="{ 'active': currentLetter === letter }"
					>
						{{ letter }}
					</button>
				</div>
				
				<div class="options-list" ref="optionsListRef">
					<div v-for="(group, letter) in groupedOptions" :key="letter" class="letter-group" :data-letter="letter">
						<h4 class="letter-header">{{ letter }}</h4>
						<div
							v-for="(option, index) in group"
							:key="index"
							class="option-item"
							:class="{ 'selected': selectedOptions.includes(option) }"
							@click="toggleOption(option)"
							:data-number="getOptionNumber(option)"
						>
							<span class="option-number">{{ getOptionNumber(option) }}</span>
							<span class="option-text">{{ option }}</span>
							<div class="checkbox" :class="{ 'checked': selectedOptions.includes(option) }">
								<svg v-if="selectedOptions.includes(option)" width='12' height='12' viewBox='0 0 12 12' fill='none'>
									<path d='M2 6L5 9L10 3' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' />
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="popup-footer">
				<button class="done-button" @click="closePopup">Klaar</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue';

const props = withDefaults(defineProps<{
	options: string[];
	modelValue: string[];
	isOpen: boolean;
	title?: string;
}>(), {
	title: 'Selecteer optie(s)'
});

const emit = defineEmits<{
	'update:modelValue': [value: string[]];
	'update:isOpen': [value: boolean];
}>();

const selectedOptions = ref<string[]>(props.modelValue);
const currentLetter = ref<string>('');
const optionsListRef = ref<HTMLElement | null>(null);
const lettersNavRef = ref<HTMLElement | null>(null);

watch(() => props.modelValue, (newValue) => {
	selectedOptions.value = newValue;
});

watch(selectedOptions, () => {
	emit('update:modelValue', selectedOptions.value);
});

const groupedOptions = computed(() => {
	const groups: Record<string, string[]> = {};
	props.options.forEach(option => {
		const firstLetter = option.charAt(0).toUpperCase();
		if (!groups[firstLetter]) {
			groups[firstLetter] = [];
		}
		groups[firstLetter].push(option);
	});
	
	Object.keys(groups).forEach(letter => {
		groups[letter].sort();
	});
	
	return groups;
});

const availableLetters = computed(() => {
	return Object.keys(groupedOptions.value).sort();
});

const numberedOptions = computed(() => {
	const all: Array<{ option: string; number: number }> = [];
	let number = 1;
	availableLetters.value.forEach(letter => {
		groupedOptions.value[letter].forEach(option => {
			all.push({ option, number: number++ });
		});
	});
	return all;
});

const getOptionNumber = (option: string): number => {
	const found = numberedOptions.value.find(item => item.option === option);
	return found ? found.number : 0;
};

const getOptionByNumber = (number: number): string | null => {
	const found = numberedOptions.value.find(item => item.number === number);
	return found ? found.option : null;
};

const toggleOption = (option: string) => {
	const index = selectedOptions.value.indexOf(option);
	if (index > -1) {
		selectedOptions.value.splice(index, 1);
	} else {
		selectedOptions.value.push(option);
	}
};

const scrollToLetter = async (letter: string) => {
	currentLetter.value = letter;
	await nextTick();
	const groupElement = optionsListRef.value?.querySelector(`[data-letter="${letter}"]`) as HTMLElement;
	if (groupElement) {
		groupElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
};

const closePopup = () => {
	emit('update:isOpen', false);
};

defineExpose({
	scrollToLetter,
	getOptionByNumber,
	toggleOptionByNumber: (number: number) => {
		const option = getOptionByNumber(number);
		if (option) {
			toggleOption(option);
		}
	},
	selectOptionByNumber: (number: number) => {
		const option = getOptionByNumber(number);
		if (option && !selectedOptions.value.includes(option)) {
			selectedOptions.value.push(option);
		}
	},
	deselectOptionByNumber: (number: number) => {
		const option = getOptionByNumber(number);
		if (option) {
			const index = selectedOptions.value.indexOf(option);
			if (index > -1) {
				selectedOptions.value.splice(index, 1);
			}
		}
	}
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/main.scss' as *;

.organisers-popup {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 2000;
	display: none;
	
	&.open {
		display: block;
	}
}

.popup-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
}

.popup-content {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: white;
	border-radius: 1rem;
	width: 90%;
	max-width: 600px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 2rem;
	border-bottom: 1px solid #e0e0e0;
	
	h3 {
		margin: 0;
		font-size: 2rem;
		font-weight: 600;
	}
	
	.close-button {
		background: none;
		border: none;
		font-size: 3rem;
		cursor: pointer;
		color: #666;
		line-height: 1;
		padding: 0;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		
		&:hover {
			color: $fuchsia;
		}
	}
}

.popup-body {
	display: flex;
	flex: 1;
	overflow: hidden;
}

.letters-nav {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem;
	background: $light-gray;
	border-right: 1px solid #e0e0e0;
	overflow-y: auto;
	flex-shrink: 0;
	position: sticky;
	top: 0;
	height: 100%;
	min-height: fit-content;
	overflow: visible;
	
	.letter-button {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		padding: 0.8rem 1rem;
		cursor: pointer;
		font-size: 1.4rem;
		font-weight: 600;
		color: $font-color;
		transition: all 0.2s ease;
		min-width: 4rem;
		
		&:hover {
			background: $fuchsia;
			color: white;
			border-color: $fuchsia;
		}
		
		&.active {
			background: $fuchsia;
			color: white;
			border-color: $fuchsia;
		}
	}
}

.options-list {
	flex: 1;
	overflow-y: auto;
	padding: 1rem;
}

.letter-group {
	margin-bottom: 3rem;
	
	.letter-header {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: $fuchsia;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid $fuchsia;
	}
}

.option-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem 1.5rem;
	margin-bottom: 0.5rem;
	cursor: pointer;
	border-radius: 0.5rem;
	transition: background-color 0.2s ease;
	
	&:hover {
		background: $light-gray;
	}
	
	&.selected {
		background: rgba($fuchsia, 0.1);
		font-weight: 600;
	}
	
	.option-number {
		font-weight: 700;
		color: $fuchsia;
		min-width: 3rem;
		font-size: 1.6rem;
	}
	
	.option-text {
		flex: 1;
		font-size: 1.6rem;
	}
	
	.checkbox {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: 2px solid $fuchsia;
		border-radius: 0.3rem;
		flex-shrink: 0;
		color: $fuchsia;
		
		&.checked {
			background: $fuchsia;
			color: white;
		}
	}
}

.popup-footer {
	padding: 1.5rem 2rem;
	border-top: 1px solid #e0e0e0;
	display: flex;
	justify-content: flex-end;
	
	.done-button {
		background: $fuchsia;
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 1rem 2rem;
		font-size: 1.6rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease;
		
		&:hover {
			background: darken($fuchsia, 10%);
		}
	}
}
</style>

