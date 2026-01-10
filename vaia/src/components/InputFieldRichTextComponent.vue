<template>
	<div class='input-field' ref='inputContainer'>
		<label :for="id">{{ label }} <span v-if="!required" class="optional">(optioneel)</span></label>
		<div class="input-container">
			<ckeditor :id="id" :editor="editor" @ready="onReady" :config="editorConfig" v-model="modelValue" :class="className" @focus="handleFocus"></ckeditor>
			<button v-if="filteredSuggestions.length" @click="handleWandClick">
				<img src="@/assets/images/wand.svg" alt="AI icon" />
			</button>
		</div>
		<div class='suggestion-box' v-if="filteredSuggestions && filteredSuggestions?.length > 0 && showSuggestion">
			<SuggestionBoxComponent :suggestions="filteredSuggestions" content_type='html' @accept="handleAccept" @decline="handleDecline"></SuggestionBoxComponent>
		</div>
		<InputFieldErrorComponent v-if="error" :value="error" />
	</div>
</template>

<script setup lang='ts'>
import { defineProps, defineEmits, watch, ref, onMounted, onBeforeUnmount } from 'vue';
import type { InputFieldTextProps } from '@/typings';
import InputFieldErrorComponent from '@/components/InputFieldErrorComponent.vue';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import SuggestionBoxComponent from '@/components/SuggestionBoxComponent.vue';

const props = defineProps<InputFieldTextProps>();
const emits = defineEmits(['update:modelValue']);


const editor = ref<any>(DecoupledEditor);
const modelValue = ref<string>('');
const showSuggestion = ref<boolean>(false);
const showSuggestionOnFocus = ref<boolean>(true);
const filteredSuggestions = ref<string[]>([]);
const inputContainer = ref<HTMLDivElement | null>(null);

const editorConfig = {
	toolbar: ['heading', 'bold', 'italic', 'bulletedList', 'link']
}

watch(modelValue, () => {
	emits('update:modelValue', modelValue.value);
	showSuggestion.value = false;
});

watch(() => props.modelValue, (newValue) => {
	modelValue.value = newValue;
});

watch(() => props.suggestions, (newSuggestions) => {
	if (newSuggestions?.length) {
		filteredSuggestions.value = newSuggestions.filter(suggestion => suggestion !== '');

		if (props.autofill && !modelValue.value && filteredSuggestions.value.length > 0) {
			modelValue.value = filteredSuggestions.value[0];
			emits('update:modelValue', modelValue.value);
		}
	}
});

const onReady = (editor: any) => {
	editor.ui.getEditableElement().parentElement.insertBefore(
		editor.ui.view.toolbar.element,
		editor.ui.getEditableElement()
	);
}

const handleAccept = (selectedSuggestion: string) => {
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
	document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside);
});


</script>


<style scoped lang='scss'>
@use '@/assets/scss/main.scss' as *;

.input-field {

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

	.input-container {
		position: relative;

		button {
			position: absolute;
			top: 4.5rem;
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

		.ck-editor__editable,
		.ck-content {
			min-height: 20rem !important;
			max-height: 30rem;
			padding: 0 6rem 0 1rem !important;
			width: calc(100% - 7rem) !important;
			background-color: $gray;

			&.ck-focused {
				background-color: transparent;
				border: $font-color .1rem solid !important;
			}
		}

		#description {
				font-size: 1.6rem !important;
		}
	}

	.suggestion-box {
		position: relative;
	}
}
</style>