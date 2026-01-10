<template>
	<div class='input-field' ref='inputContainer' :class="className">
		<label :for="id">{{ label }} <span v-if="!required" class="optional">(optioneel)</span></label>
		<div class="input-container">
			<input :type="type ? type : 'text'" v-model="modelValue" :id="id" :placeholder="placeholder" :required="required" :class="className" @focus="handleFocus" @blur="handleBlur"/>
			<button v-if="filteredSuggestions.length" @click="handleWandClick">
				<img src="@/assets/images/wand.svg" alt="AI icon" />
			</button>
		</div>

		<div class='suggestion-box' v-if="filteredSuggestions && filteredSuggestions?.length > 0 && showSuggestion">
			<SuggestionBoxComponent :suggestions="filteredSuggestions" content_type='string' @accept="handleAccept" @decline="handleDecline"></SuggestionBoxComponent>
		</div>
		<InputFieldErrorComponent v-if="error" :value="error" :class="className" />
	</div>
</template>

<script setup lang='ts'>
import { defineProps, defineEmits, watch, ref, onMounted, onBeforeUnmount } from 'vue';
import InputFieldErrorComponent from '@/components/InputFieldErrorComponent.vue';
import type { InputFieldTextProps } from '@/typings';
import SuggestionBoxComponent from '@/components/SuggestionBoxComponent.vue';

const props = defineProps<InputFieldTextProps>();
const emits = defineEmits(['update:modelValue']);

const modelValue = ref<string>('');
const showSuggestion = ref<boolean>(false);
const showSuggestionOnFocus = ref<boolean>(true);
const filteredSuggestions = ref<string[]>([]);
const inputContainer = ref<HTMLDivElement | null>(null);

watch(modelValue, () => {
	emits('update:modelValue', modelValue.value);
	showSuggestion.value = false;
});

watch(() => props.modelValue, (newValue) => {
	modelValue.value = newValue;
});

watch(() => props.suggestions, (newSuggestions) => {
	if (newSuggestions?.length) {
		filteredSuggestions.value = newSuggestions.filter(suggestion => suggestion !== '' && suggestion !== 'null');

		if (props.autofill && !modelValue.value && filteredSuggestions.value.length > 0) {
			modelValue.value = filteredSuggestions.value[0];
			emits('update:modelValue', modelValue.value);
		}
	}
});

const handleAccept = (selectedSuggestion: string) => {
    // modelValue.value = props.type === 'number' ? selectedSuggestion.replace(',', '.') : selectedSuggestion;
    modelValue.value = selectedSuggestion;
    showSuggestion.value = false;
}

const handleDecline = () => {
	showSuggestionOnFocus.value = false;
	showSuggestion.value = false;
}

const handleFocus = () => {
	if (showSuggestionOnFocus.value) {
		showSuggestion.value = true;
	}
}

const handleBlur = () => {
	// Close suggestions when field loses focus
	setTimeout(() => {
		// Check if focus moved to another element in the same input field
		const activeElement = document.activeElement;
		if (!inputContainer.value?.contains(activeElement)) {
			showSuggestion.value = false;
		}
	}, 200); // Small delay to allow for click events on suggestions
}

const handleWandClick = () => {
	showSuggestionOnFocus.value = true;
	showSuggestion.value = true;
}

const handleClickOutside = (event: MouseEvent) => {
  if (inputContainer.value && !inputContainer.value.contains(event.target as Node)) {
    showSuggestion.value = false;
  }
};

onMounted(() => {
	if (props.suggestions?.length) {
		filteredSuggestions.value = props.suggestions.filter(suggestion => suggestion !== '' && suggestion !== 'null');
	}
  	document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  	document.removeEventListener('click', handleClickOutside);
});

</script>


<style scoped lang='scss'>
@use '@/assets/scss/main.scss' as *;
.input-field {
    width: 100%;
	position: relative;

	label,
	input {
		display: block;
		width: calc(100% - 7rem);
	}

	label {
		font-size: 1.85rem;
		line-height: 2.5rem;
		font-weight: 600;
		margin: 2rem 0 1rem 0;
		
		.optional {
			font-weight: 400;
			font-size: 1.6rem;
			opacity: 0.8;
		}
	}

	&.cta {
		label {
			font-size: 1.6rem;
		}
	}

	.input-container {
		position: relative;

		button {
			position: absolute;
			top: 0.5rem;
			right: 0.5rem;
			width: 4rem;
			height: 3.5rem;
			border-radius: 1rem;
			background-color: #ffffff;
			border-bottom-left-radius: 0;
			box-shadow: none;
			padding: 0.3rem;
			cursor: pointer;

			img {
				width: 100%;
				height: 100%;
			}
		}

		input {
			font-size: 1.6em;
			height: 4.7rem;
			margin-bottom: 1rem;
			line-height: 2;
			padding: 0 6rem 0 1rem;
			border: none;
			border-radius: 0.2rem;
			background-color: $gray;
	
			&:focus {
				outline: none;
				background-color: transparent;
				border: $font-color .1rem solid;
			}

			&.cta {
				background-color: #ffffff;

				&:focus {
					border: 0.2rem solid $font-color;
				}
			}
		}
	}


    .suggestion-box {
        position: relative;
    }
}
</style>