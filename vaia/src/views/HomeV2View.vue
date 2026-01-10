<template>
	<main :key="renderKey" ref="mainRef">
		<section>
			<h1>Voeg je eigen opleiding of leermateriaal toe</h1>
			<p>Geef hier de informatie van je cursus of leermateriaal door. We kijken hem zo snel mogelijk na en zetten het online.</p>
			<p>💡 Bij beschrijving krijg je veel plaats om je opleiding uit te leggen: denk hier aan structuur, gebruik headings & bullets. Probeer deze hulpvraagjes te beantwoorden: Wat gaan mensen leren? Waarom moet je deze opleiding volgen? Wat zijn de voordelen voor je job? Wie zijn de lesgevers?</p>
			<p>Benieuwd hoe jouw pagina eruit zal zien? Zo ziet een opleiding eruit op de <a href='https://www.vaia.be/nl/opleidingen/artifici%C3%ABle-intelligentie-in-de-kunst' target='_blank' class="link">VAIA-website</a>.</p>
			<p>Neem zeker contact op met <a href='mailto:info@vaia.be' class='link'>info@vaia.be</a> als je vragen hebt.</p>
		</section>

		<section v-if="formStep === 0">
			<FormCallToActionComponent @handleSubmit="handleFormCallToActionSubmit" :autofill="true" />
		</section>

		<section v-show="formStep === 1">
			<h2>Content</h2>
			<InputFieldTextComponent id='title' label='Aantrekkelijke, duidelijke titel over de inhoud van je opleiding' :suggestions="getOpenaiResponse?.title" :modelValue="formData.title.value" @update:modelValue="formData.title.value = $event; validator.validateField('title')" :error="formData.titleError.value" required :autofill="true" />
			<InputFieldTextareaComponent id='introduction' label='Beknopte inleiding. Denk aan wat, wie, waarom en de voordelen' :suggestions="getOpenaiResponse?.introduction" :modelValue="formData.introduction.value" @update:modelValue="formData.introduction.value = $event; validator.validateField('introduction')" :error="formData.introductionError.value" required :autofill="true" />
			<InputFieldTextComponent id='subtitle' label='Ondertitel (meer info bij de titel, bv. "3 workshops")' :suggestions="getOpenaiResponse?.subtitle" :modelValue="formData.subtitle.value" @update:modelValue="formData.subtitle.value = $event; validator.validateField('subtitle')" :error="formData.subtitleError.value" required :autofill="true" />
			<InputFieldRichTextComponent id='description' label='Beschrijving (gebruik headings en bullets voor meer structuur)' :suggestions="getOpenaiResponse?.description" :modelValue="formData.description.value" @update:modelValue="formData.description.value = $event" :error="formData.descriptionError.value" :required="false" :autofill="true" />
			<InputFieldTextComponent id='courseLink' label='Link naar inschrijving of meer informatie' :suggestions="linkSuggestions" :modelValue="formData.courseLink.value" @update:modelValue="formData.courseLink.value = $event; validator.validateField('courseLink')" :error="formData.courseLinkError.value" required />
			<InputFieldRadioComponent id='courseType' label='Type opleiding' :suggestions="getOpenaiResponse?.courseType" :modelValue="formData.courseType.value" @update:modelValue="formData.courseType.value = $event; validator.validateField('courseType')" :error="formData.courseTypeError.value" :options="courseTypeOptions" required />
			
			<div v-if="formData.courseType.value === 'Deze opleiding gaat door op een bepaalde datum of over een bepaalde periode.'">
				<div class='input-row'>
					<InputFieldTextComponent id='startDate' label='Startdatum' :modelValue="formData.startDate.value" @update:modelValue="formData.startDate.value = $event; validator.validateField('startDate')" :error="formData.startDateError.value" type='date' required />
					<InputFieldTextComponent id='endDate' label='Einddatum' :modelValue="formData.endDate.value" @update:modelValue="formData.endDate.value = $event; validator.validateField('endDate')" :error="formData.endDateError.value" type='date' required />
				</div>
				<div class="input-row">
					<InputFieldTextComponent id='startTime' label='Starttijd' :modelValue="formData.startTime.value" @update:modelValue="formData.startTime.value = $event; validator.validateField('startTime')" :error="formData.startTimeError.value" type='time' :required="false" />
					<InputFieldTextComponent id='endTime' label='Eindtijd' :modelValue="formData.endTime.value" @update:modelValue="formData.endTime.value = $event; validator.validateField('endTime')" :error="formData.endTimeError.value" type='time' :required="false" />
				</div>
			</div>
		</section>

		<section v-show="formStep === 2">
			<h2>Categorieën & metadata</h2>
			<div class='input-row'>
				<InputFieldDropdownSelectComponenet id='organisers' label='Organisator(en)' :multiple="true" :options="organisersOptions" :modelValue="formData.organisers.value" @update:model-value="formData.organisers.value = $event; validator.validateField('organisers')" :error="formData.organisersError.value" required />
				<InputFieldCheckboxComponent id='PrimaryTargetGroup' label='Primaire doelgroep' :modelValue="formData.PrimaryTargetGroup.value" @update:model-value="formData.PrimaryTargetGroup.value = $event; validator.validateField('PrimaryTargetGroup')" :options="PrimaryTargetGroupOptions" :error="formData.PrimaryTargetGroupError.value" required />
				<InputFieldTextComponent id='targetGroup' label='Doelgroep (voor wie is deze opleiding bedoeld? Max. 125 tekens)' :suggestions="getOpenaiResponse?.targetGroup" :modelValue="formData.targetGroup.value" @update:modelValue="formData.targetGroup.value = $event; validator.validateField('targetGroup')" :error="formData.targetGroupError.value" required :autofill="true" />
				<InputFieldDropdownSelectComponenet id='knowledgeLevel' label='Kennisniveau' :multiple="true" :options="knowledgeLevelOptions" :modelValue="formData.knowledgeLevel.value" @update:model-value="formData.knowledgeLevel.value = $event; validator.validateField('knowledgeLevel')" :error="formData.knowledgeLevelError.value" required :autofill="true" />
				<InputFieldTextComponent id='requirements' label='Voorkennis / Vereisten' :suggestions="getOpenaiResponse?.requirements" :modelValue="formData.requirements.value" @update:modelValue="formData.requirements.value = $event; validator.validateField('requirements')" :error="formData.requirementsError.value" required :autofill="true" />
				<InputFieldDropdownSelectComponenet id='priceLevel' label='Prijs (grootteorde)' :multiple="false" :options="priceLevelOptions" :modelValue="formData.priceLevel.value" @update:model-value="formData.priceLevel.value = $event; validator.validateField('priceLevel')" :error="formData.priceLevelError.value" required :autofill="true" />
				<InputFieldTextComponent id='exactPrice' label='Prijs (exact)' :suggestions="getOpenaiResponse?.exactPrice" :modelValue="formData.exactPrice.value" @update:modelValue="formData.exactPrice.value = $event; validator.validateField('exactPrice')" :type="'number'" :error="formData.exactPriceError.value" required :autofill="true" />
				<InputFieldDropdownSelectComponenet id='afterCourseGoals' label='Na deze cursus wil ik' :multiple="true" :options="afterCourseGoalsOptions" :modelValue="formData.afterCourseGoals.value" @update:model-value="formData.afterCourseGoals.value = $event; validator.validateField('afterCourseGoals')" :error="formData.afterCourseGoalsError.value" required :autofill="true" />
				<InputFieldDropdownSelectComponenet id='scopeOfApplication' label='Toepassingsgebied' :multiple="true" :options="scopeOfApplicationOptions" :modelValue="formData.scopeOfApplication.value" @update:model-value="formData.scopeOfApplication.value = $event; validator.validateField('scopeOfApplication')" :error="formData.scopeOfApplicationError.value" required :autofill="true" />
				<InputFieldDropdownSelectComponenet id='ethicDomains' label='Ethisch domein' :multiple="true" :options="ethicDomainsOptions" :modelValue="formData.ethicDomains.value" @update:model-value="formData.ethicDomains.value = $event; validator.validateField('ethicDomains')" :error="formData.ethicDomainsError.value" :required="false" :autofill="true" />
				<InputFieldDropdownSelectComponenet id='certificate' label='Certificaat' :multiple="false" :options="certificateOptions" :modelValue="formData.certificate.value" @update:model-value="formData.certificate.value = $event; validator.validateField('certificate')" :error="formData.certificateError.value" :required="false" :autofill="true" />
				<InputFieldDropdownSelectComponenet id='language' label='Taal' :multiple="false" :options="languageOptions" :modelValue="formData.language.value" @update:model-value="formData.language.value = $event; validator.validateField('language')" :error="formData.languageError.value" required :autofill="true" />
				<InputFieldTextComponent id='totalHours' label='Totaal aantal lesuren' :suggestions="getOpenaiResponse?.totalHours" :modelValue="formData.totalHours.value" @update:model-value="formData.totalHours.value = $event; validator.validateField('totalHours')" :error="formData.totalHoursError.value" required :autofill="true" />
				<InputFieldDropdownSelectComponenet id='locationZone' label='Regio' :multiple="false" :options="locationZoneOptions" :modelValue="formData.locationZone.value" @update:model-value="formData.locationZone.value = $event; validator.validateField('locationZone')" :error="formData.locationZoneError.value" required :autofill="true" />
				<InputFieldTextComponent id='locationAddress' label='Waar gaat de opleiding door?' :suggestions="getOpenaiResponse?.locationAddress" :modelValue="formData.locationAddress.value" @update:model-value="formData.locationAddress.value = $event; validator.validateField('locationAddress')" :error="formData.locationAddressError.value" required :autofill="true" />
			</div>

			<div>
				<h2>Wie mag VAIA contacteren met vragen over deze opleiding? (niet publiek)</h2>
				<div class="input-row no-clarity">
					<InputFieldTextComponent id='firstName' label='Voornaam' :model-value="formData.firstName.value" @update:model-value="formData.firstName.value = $event; validator.validateField('firstName')" :error="formData.firstNameError.value" required />
					<InputFieldTextComponent id='lastName' label='Achternaam' :model-value="formData.lastName.value" @update:model-value="formData.lastName.value = $event; validator.validateField('lastName')" :error="formData.lastNameError.value" required />
					<InputFieldTextComponent id='email' label='E-mailadres' :model-value="formData.email.value" @update:model-value="formData.email.value = $event; validator.validateField('email')" :error="formData.emailError.value" required />
					<InputFieldTextComponent id='organisationName' label='Organisatie' :model-value="formData.organisationName.value" @update:model-value="formData.organisationName.value = $event; validator.validateField('organisationName')" :error="formData.organisationNameError.value" required />
				</div>
			</div>
		</section>

		<div class="section" v-if="formStep != 0">
			<button v-if="formStep > 1" @click="handleGoBack()" class="btn secondary">Vorige stap</button>
			<button ref="submitButton" @click="handleSubmit()" class="btn">Volgende stap</button>
		</div>
	</main>

	<VUIControlComponent ref="vuiControl" @command="handleCommand" @transcript="handleTranscript" />
	<LoadingComponent v-if="loading" />
	
	<!-- Research Control Panel (for testing/research) -->
	<ResearchControlPanel ref="researchPanel" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useOpenaiResponseStore } from '@/stores/openaiResponseStore';
import InputFieldTextComponent from '@/components/InputFieldTextComponent.vue';
import InputFieldTextareaComponent from '@/components/InputFieldTextareaComponent.vue';
import InputFieldRichTextComponent from '@/components/InputFieldRichTextComponent.vue';
import InputFieldRadioComponent from '@/components/InputFieldRadioComponent.vue';
import InputFieldCheckboxComponent from '@/components/InputFieldCheckboxComponent.vue';
import InputFieldDropdownSelectComponenet from '@/components/InputFieldDropdownSelectComponenet.vue';
import { resetFormData, useFormData, useFormValidator, type FieldName } from '@/utils';
import { afterCourseGoals, certificates, ethicDomains, knowledgeLevels, languages, locationZones, organisers, priceLevels, scopeOfApplications } from '@/utils/formData';
import FormCallToActionComponent from '@/components/formCallToActionComponent.vue';
import LoadingComponent from '@/components/LoadingComponent.vue';
import VUIControlComponent from '@/components/VUIControlComponent.vue';
import ResearchControlPanel from '@/components/ResearchControlPanel.vue';
import { storeToRefs } from 'pinia';
import { researchLogger } from '@/services/researchDataLogger';
import { useToast } from 'vue-toast-notification';
import { storeInfto } from '@/firebase';
import {
	focusFirstFieldInStep, handleNavigateCommand, handleNextFieldCommand, handlePreviousFieldCommand,
	handleWriteCommand, handleDirectInput, handleSelectRadioCommand, handleSelectCheckboxCommand,
	handleNavigateLetterCommand, handleSelectOrganiserNumberCommand, handleClosePopupCommand,
	handleSelectSuggestionCommand, handleAcceptSuggestionCommand, handleReadSuggestionCommand,
	handleReadFieldCommand, handleClearFieldCommand, handleFillCommand, handleSelectDropdownNumberCommand,
	handleEditCommand, handleLinkCommand
} from '@/services/voiceCommandHandlers';

const toast = useToast();
const formData = useFormData();
let validator = useFormValidator(formData);

const formStep = ref(0);
const renderKey = ref(0);
const loading = ref(false);
const mainRef = ref<HTMLElement | null>(null);
const submitButton = ref<HTMLButtonElement | null>(null);
const vuiControl = ref<InstanceType<typeof VUIControlComponent> | null>(null);
const researchPanel = ref<InstanceType<typeof ResearchControlPanel> | null>(null);
const openaiResponseStore = useOpenaiResponseStore();
const { getOpenaiResponse } = storeToRefs(openaiResponseStore);
const linkSuggestions = ref<string[]>([]);

// Command deduplication
let lastCommandTime = 0;
let lastCommandType = '';
const DEBOUNCE_MS = 500;

// Form options
const courseTypeOptions = [
	{ label: "Deze opleiding gaat door op een bepaalde datum of over een bepaalde periode.", value: "Deze opleiding gaat door op een bepaalde datum of over een bepaalde periode." },
	{ label: "De deelnemer kan deze opleiding in zijn eigen tijd volgen. Deze opleiding heeft geen vaste datum.", value: "De deelnemer kan deze opleiding in zijn eigen tijd volgen. Deze opleiding heeft geen vaste datum." }
];
const organisersOptions = [{ group_name: '', options: organisers }];
const PrimaryTargetGroupOptions = [{ label: 'Onderzoek', value: 'Onderzoek' }, { label: 'Levenslang leren', value: 'Levenslang leren' }];

const priceLevelOptions = computed(() => getOpenaiResponse.value?.priceLevel ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.priceLevel }, { group_name: '', options: priceLevels }] : [{ group_name: '', options: priceLevels }]);
const afterCourseGoalsOptions = computed(() => getOpenaiResponse.value?.afterCourseGoals ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.afterCourseGoals }, { group_name: '', options: afterCourseGoals }] : [{ group_name: '', options: afterCourseGoals }]);
const ethicDomainsOptions = computed(() => getOpenaiResponse.value?.ethicDomains ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.ethicDomains }, { group_name: '', options: ethicDomains }] : [{ group_name: '', options: ethicDomains }]);
const certificateOptions = computed(() => getOpenaiResponse.value?.certificate ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.certificate }, { group_name: '', options: certificates }] : [{ group_name: '', options: certificates }]);
const knowledgeLevelOptions = computed(() => getOpenaiResponse.value?.knowledgeLevel ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.knowledgeLevel }, { group_name: '', options: knowledgeLevels }] : [{ group_name: '', options: knowledgeLevels }]);
const scopeOfApplicationOptions = computed(() => getOpenaiResponse.value?.scopeOfApplication ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.scopeOfApplication }, { group_name: '', options: scopeOfApplications }] : [{ group_name: '', options: scopeOfApplications }]);
const languageOptions = computed(() => getOpenaiResponse.value?.language ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.language }, { group_name: '', options: languages }] : [{ group_name: '', options: languages }]);
const locationZoneOptions = computed(() => getOpenaiResponse.value?.locationZone ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.locationZone }, { group_name: '', options: locationZones }] : [{ group_name: '', options: locationZones }]);

// Watchers
watch(formStep, async (newStep) => {
	if (newStep === 1 || newStep === 2) {
		await nextTick();
		setTimeout(() => {
			focusFirstFieldInStep(newStep as 1 | 2);
			if (newStep === 2) {
				setTimeout(() => {
					const dropdown = document.getElementById('organisers')?.closest('.dropdown-container')?.querySelector('.dropdown-header') as HTMLElement;
					if (dropdown && !document.querySelector('.organisers-popup.open')) dropdown.click();
				}, 1000);
			}
		}, 800);
	}
});

onMounted(() => setTimeout(() => focusFirstFieldInStep(1), 1000));

// Form handlers
const handleSubmit = async () => {
	validator = useFormValidator(formData);
	if (formStep.value === 1) {
		const { isValid, errors } = validator.validateFields(['title', 'introduction', 'subtitle', 'courseLink', 'courseType', 'startDate', 'endDate', 'startTime', 'endTime']);
		if (isValid) {
			formStep.value = 2;
			mainRef.value?.scrollIntoView();
			if (submitButton.value) submitButton.value.innerText = 'Verzenden';
		} else scrollToFirstError(errors);
	} else {
		const { isValid, errors } = validator.validateFields(['organisers', 'PrimaryTargetGroup', 'requirements', 'priceLevel', 'afterCourseGoals', 'locationAddress', 'targetGroup', 'exactPrice', 'knowledgeLevel', 'scopeOfApplication', 'language', 'locationZone', 'totalHours', 'firstName', 'lastName', 'email', 'organisationName']);
		if (isValid) {
			formStep.value = 0;
			await storeInfto(formData);
			openaiResponseStore.clearOpenaiResponse();
			resetFormData(formData);
			renderKey.value++;
			toast.success('Bedankt om het formulier in te vullen! We proberen het zo snel mogelijk na te kijken.', { duration: 10000, position: 'top' });
		} else scrollToFirstError(errors);
	}
};

const handleFormCallToActionSubmit = () => { formStep.value = 1; setTimeout(() => focusFirstFieldInStep(1), 500); };
const handleGoBack = () => { formStep.value = 1; if (submitButton.value) submitButton.value.innerText = 'Volgende stap'; setTimeout(() => focusFirstFieldInStep(1), 500); };
const scrollToFirstError = (errors: FieldName[]) => { if (errors.length) document.getElementById(errors[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
const handleTranscript = (_: string) => {};

const speak = (text: string) => vuiControl.value?.speak(text);

const handleCommand = (command: string, transcript: string) => {
	const now = Date.now();
	if (command === lastCommandType && (now - lastCommandTime) < DEBOUNCE_MS) return;
	lastCommandTime = now;
	lastCommandType = command;
	if (!vuiControl.value) return;

	// Log voice command for research
	const activeField = document.activeElement as HTMLElement | null;
	const fieldId = activeField?.id || activeField?.closest('[id]')?.id;
	researchLogger.logVoiceCommand(command, transcript, true, fieldId);

	const s = speak;
	switch (command) {
		case 'navigate': handleNavigateCommand(transcript, s); researchLogger.logNavigation(fieldId || null, 'target', 'voice'); break;
		case 'fill': handleFillCommand(transcript, s, (v) => { linkSuggestions.value = v; }); break;
		case 'write': handleWriteCommand(transcript, s); break;
		case 'edit': handleEditCommand(transcript, s); break;
		case 'link': handleLinkCommand(transcript, s, (v) => { linkSuggestions.value = v; }); break;
		case 'direct-input': handleDirectInput(transcript, s); break;
		case 'next-field': handleNextFieldCommand(formStep.value, s); break;
		case 'previous-field': handlePreviousFieldCommand(formStep.value, s); break;
		case 'next-step': handleSubmit(); speak('Volgende stap'); break;
		case 'previous-step': handleGoBack(); speak('Vorige stap'); break;
		case 'select-checkbox': handleSelectCheckboxCommand(transcript, s); break;
		case 'select-radio': handleSelectRadioCommand(transcript, s); break;
		case 'select-suggestion': handleSelectSuggestionCommand(transcript, s); break;
		case 'accept-suggestion': handleAcceptSuggestionCommand(s); break;
		case 'reject-suggestion': s('AI suggestie afgewezen'); break;
		case 'read-suggestion': handleReadSuggestionCommand(s); break;
		case 'read-field': handleReadFieldCommand(s); break;
		case 'clear-field': handleClearFieldCommand(s); break;
		case 'stop': vuiControl.value.stopListening(); break;
		case 'navigate-letter': handleNavigateLetterCommand(transcript, s); break;
		case 'select-organiser-number': handleSelectOrganiserNumberCommand(transcript, s); break;
		case 'close-popup': handleClosePopupCommand(s); break;
		case 'select-dropdown-number': handleSelectDropdownNumberCommand(transcript, s); break;
	}
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/main.scss' as *;

@media screen and (min-width: 50rem) {
	.input-row { & > * { margin-top: 3rem; } }
}

h2 { margin-top: 6rem; }
.btn { margin: 5rem auto; &:first-child { margin-right: 2rem; } }
p { font-size: 2.2rem; line-height: 3rem; }
</style>
