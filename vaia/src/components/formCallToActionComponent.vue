<template>
	<div class='content-wrapper'>
		<LoadingComponent v-if="loading" :message="loadingMessage"/>
		<p>
			Geef hieronder de link naar de eventpagina of website met de cursusinformatie.<br/> Onze AI analyseert de inhoud en geeft je suggesties voor de velden, zodat je deze makkelijk kunt invullen.
		</p>

		<InputFieldTextComponent v-show="!showInputFieldPlainText" id='courseUrl' label='Link naar de eventpagina of website met de cursusinformatie' :modelValue="courseUrl" @update:modelValue="courseUrl = $event;" :error="courseUrlError" required className='cta' :placeholder="'https://www.eventpagina.be/cursusinformatie'"></InputFieldTextComponent>

		<InputFieldTextareaComponent v-show="showInputFieldPlainText" id='coursePlainText' label='Plak hieronder alle informatie over de opleiding' :modelValue="coursePlainText" @update:modelValue="coursePlainText = $event;" :error="coursePlainTextError" :placeholder="'Plak hier alle informatie over de opleiding'" required className='cta'></InputFieldTextareaComponent>
		
		<div class="checkbox" v-if="showCheckboxInputfieldPlainText">
			<input id="checkboxInputfieldPlainText" type='checkbox' v-model="checkboxInputfieldPlainText" />
			<label for="checkboxInputfieldPlainText" id="checkboxInputfieldPlainText">Ik geef de cursusinformatie liever in tekstvorm aan.</label>
		</div>
		
		<div>
			<button v-if="currentHandler" ref="submitButton" @click="currentHandler" class="btn">Analyseer</button>
			<button @click="handleDecline()" class="secondary">Ga door zonder AI suggesties</button>
		</div>
	</div>

</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue';
import InputFieldTextComponent from './InputFieldTextComponent.vue';
import InputFieldTextareaComponent from './InputFieldTextareaComponent.vue';
import LoadingComponent from './LoadingComponent.vue';
import { useOpenaiResponseStore } from '@/stores/openaiResponseStore';
import { validationRules } from '@/utils';
import { useToast } from 'vue-toast-notification';

import { functions } from '@/firebase/firebase-config' 
import { httpsCallable } from 'firebase/functions';
import type { OpenAiResponse } from '@/typings';

const props = defineProps<{ autofill: boolean }>();
const emits = defineEmits(['handleSubmit']);
const toast = useToast();

const openaiResponseStore = useOpenaiResponseStore();

const courseUrl = ref<string>('');
const courseUrlError = ref<string | null>(null);

const checkboxInputfieldPlainText = ref <boolean>(false);
const coursePlainText = ref<string>('');
const coursePlainTextError = ref<string>('');

const showCheckboxInputfieldPlainText = ref<boolean>(true);
const showInputFieldPlainText = ref<boolean>(false);
const loading = ref<boolean>(false);
const loadingMessage = ref<string>('');

const currentHandler = ref<EventListener | null>(null);


onMounted(() => {
	currentHandler.value = handleSubmitUrl;
});

watch(checkboxInputfieldPlainText, () => {
	if (checkboxInputfieldPlainText.value) {
		showInputFieldPlainText.value = true;
		currentHandler.value = handleSubmitPlainText;
	} else {
		showInputFieldPlainText.value = false;
		currentHandler.value = handleSubmitUrl;
	}
});

const handleDecline = () => {
	emits('handleSubmit');
}

const handleSubmitUrl = () => {
	if (!courseUrl.value) {
		courseUrlError.value = 'Vul eerst de link in naar de eventpagina of website met cursusinformatie.';
		return;
	}
	courseUrlError.value = validationRules.url(courseUrl.value);

	if (courseUrlError.value) {
		return;
	}
	
	scrapeContent();
}

const handleSubmitPlainText = () => {
	if (!coursePlainText.value) {
		coursePlainTextError.value = 'Vul eerst alle informatie over de opleiding in.';
		return;
	}

	sendContentToOpenai(coursePlainText.value);
}

const scrapeContent = async () => {
	try {
		loading.value = true;
		loadingMessage.value = 'Even geduld, we halen de inhoud van de website op...';
		const response = await fetch(`https://vaia-scraper-production.up.railway.app/scrape?url=${courseUrl.value}`);
		if (!response.ok) {
			const errorDetails = await response.json();
			throw new Error(errorDetails.detail);
		}

		const content = await response.json();
		await sendContentToOpenai(content.content);
		
	} catch (error: any) {
		loading.value = false;
		toast.info('De website laat het niet toe om de inhoud te scrapen. Surf zelf naar de link, kopieer de inhoud en plak het hieronder.', {
			position: 'top',
			duration: 10000,
			dismissible: true
		});
		showCheckboxInputfieldPlainText.value = false;
		showInputFieldPlainText.value = true;
		currentHandler.value = handleSubmitPlainText;
	}
}

const sendContentToOpenai = async (plainText: string) => {
	if (plainText.trim()) {
		try {
			loading.value = true;
			loadingMessage.value = 'We analyseren je cursusinformatie...';
			
			setTimeout(() => {
				loadingMessage.value = 'We zijn er bijna...';
			}, 15000);

			const analyseContent = httpsCallable(functions, 'analysecontent');
			const response = await analyseContent({ content: plainText });

			if (response) {
				openaiResponseStore.setOpenaiResponse(response.data as OpenAiResponse);

				const toastText = props.autofill ? 'Het formulier is automatisch ingevuld met AI-suggesties. Controleer de gegevens zorgvuldig en pas ze aan als iets niet klopt.':'AI suggesties zijn beschikbaar! Klik op een veld om een voorstel te krijgen. Controleer altijd de suggesties, want AI kan onjuiste informatie geven.';
				toast.info(toastText, {
					position: 'top',
					duration: 10000,
					dismissible: true
				});
			}

			loading.value = false;
			emits('handleSubmit');

		} catch (error: any) {
			loading.value = false;
			toast.error('Er is iets fout gegaan met het analyseren van je cursusinformatie. AI suggesties niet beschikbaar.', {
				position: 'top',
				duration: 5000,
				dismissible: true
			});
			console.log(error);
		}
	}
}

</script>

<style lang='scss' scoped>
@use '@/assets/scss/main.scss' as *;
.content-wrapper {
	margin-top: 5rem;
	margin-bottom: 6rem;
	padding: 2rem;
	color: #ffffff;
	background: $gradient;
	border-radius: 1rem;
	
	div:not(:last-child) {
		margin-bottom: 3rem;
	}

	.checkbox {
		font-size: 1.8rem;

		label {
			margin-left: 1rem;
			cursor: pointer;
		}
		input {
			cursor: pointer;
		}
	}

	p {
		max-width: 100%;
		font-size: 2rem;
		font-weight: 600;
	}

	.btn {
		margin-right: 1rem;
		margin-bottom: 1rem;
	}

}
</style>