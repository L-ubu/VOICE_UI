<template>
	<main :key="renderKey" ref="mainRef">
		<section>
			<h1>Voeg je eigen opleiding of leermateriaal toe</h1>
			<p>
				Geef hier de informatie van je cursus of leermateriaal door. We kijken hem zo snel mogelijk na en zetten
				het online.
			</p>
			<p>
				💡 Bij beschrijving krijg je veel plaats om je opleiding uit te leggen: denk hier aan structuur, gebruik
				headings & bullets. Probeer deze hulpvraagjes te beantwoorden: Wat gaan mensen leren? Waarom moet je
				deze opleiding volgen? Wat zijn de voordelen voor je job? Wie zijn de lesgevers? Voor doelgroep en
				locatie volgen lager in het formulier aparte velden.
			</p>
			<p>
				Benieuwd hoe jouw pagina eruit zal zien? Zo ziet een opleiding eruit op de <a
					href='https://www.vaia.be/nl/opleidingen/artifici%C3%ABle-intelligentie-in-de-kunst' target='_blank'
					class="link">VAIA-website</a> en zo ziet dezelfde opleiding eruit op de <a
					href='https://www.uacno.be/nl/opleiding/artificiele-intelligentie-ai-in-de-kunst-79340'
					target='_blank' class='link'>website van de aanbieder</a>.
			</p>
			<p>
				Neem zeker contact op met <a href='mailto:info@vaia.be' class='link'>info@vaia.be</a> als je vragen
				hebt.
			</p>
		</section>

		<section v-if="formStep === 0">
			<FormCallToActionComponent @handleSubmit="formStep = 1" :autofill="false"></FormCallToActionComponent>
		</section>

		<section v-show="formStep === 1">
			<h2>Content</h2>
			<InputFieldTextComponent id='title' label='Aantrekkelijke, duidelijke titel over de inhoud van je opleiding' :suggestions="getOpenaiResponse?.title" :modelValue="formData.title.value" @update:modelValue="formData.title.value = $event; validator.validateField('title')" :error="formData.titleError.value" required></InputFieldTextComponent>
			<InputFieldTextareaComponent id='introduction' label='Beknopte inleiding. Denk aan wat, wie, waarom en de voordelen' :suggestions="getOpenaiResponse?.introduction" :modelValue="formData.introduction.value" @update:modelValue="formData.introduction.value = $event; validator.validateField('introduction')" :error="formData.introductionError.value" required></InputFieldTextareaComponent>
			<InputFieldTextComponent id='subtitle' label='Ondertitel (meer info bij de titel, bv. "3 workshops")' :suggestions="getOpenaiResponse?.subtitle" :modelValue="formData.subtitle.value" @update:modelValue="formData.subtitle.value = $event; validator.validateField('subtitle')" :error="formData.subtitleError.value" required></InputFieldTextComponent>
			<InputFieldRichTextComponent id='description' label='Beschrijving (gebruik headings en bullets voor meer structuur. Vermeld inhoud, programma, waarom, voordelen, lesgevers.)' :suggestions="getOpenaiResponse?.description" :modelValue="formData.description.value" @update:modelValue="formData.description.value = $event" :error="formData.descriptionError.value" :required="false"></InputFieldRichTextComponent>
			<InputFieldTextComponent id='courseLink' label='Link naar inschrijving of meer informatie' :suggestions="[]" :modelValue="formData.courseLink.value" @update:modelValue="formData.courseLink.value = $event; validator.validateField('courseLink')" :error="formData.courseLinkError.value" required></InputFieldTextComponent>
			<InputFieldRadioComponent id='courseType' label='Type opleiding' :suggestions="getOpenaiResponse?.courseType" :modelValue="formData.courseType.value" @update:modelValue="formData.courseType.value = $event; validator.validateField('courseType')" :error="formData.courseTypeError.value" :options=courseTypeOptions required></InputFieldRadioComponent>
			
			<div v-if="formData.courseType.value === 'Deze opleiding gaat door op een bepaalde datum of over een bepaalde periode.'">
				<div class='input-row'>
					<InputFieldTextComponent id='startDate' label='Startdatum' :suggestions="getOpenaiResponse?.startDate" :modelValue="formData.startDate.value" @update:modelValue="formData.startDate.value = $event; validator.validateField('startDate')" :error="formData.startDateError.value" type='date' required></InputFieldTextComponent>
					<InputFieldTextComponent id='endDate' label='Einddatum' :suggestions="getOpenaiResponse?.endDate" :modelValue="formData.endDate.value" @update:modelValue="formData.endDate.value = $event; validator.validateField('endDate')" :error="formData.endDateError.value" type='date' required></InputFieldTextComponent>
				</div>
				<div class="input-row">
					<InputFieldTextComponent id='startTime' label='Starttijd' :suggestions="getOpenaiResponse?.startTime" :modelValue="formData.startTime.value" @update:modelValue="formData.startTime.value = $event; validator.validateField('startTime')" :error="formData.startTimeError.value" type='time' :required="false"></InputFieldTextComponent>
					<InputFieldTextComponent id='endTime' label='Eindtijd' :suggestions="getOpenaiResponse?.endTime" :modelValue="formData.endTime.value" @update:modelValue="formData.endTime.value = $event; validator.validateField('endTime')" :error="formData.endTimeError.value" type='time' :required="false"></InputFieldTextComponent>
				</div>
			</div>
		</section>

		<section v-show="formStep === 2">
			<h2>Categorieën & metadata</h2>
			<div class='input-row'>
				<InputFieldDropdownSelectComponenet id='organisers' label='Organisator(en)' :multiple=true  :options="organisersOptions" :modelValue="formData.organisers.value" @update:model-value="formData.organisers.value = $event; validator.validateField('organisers')" :error="formData.organisersError.value" required></InputFieldDropdownSelectComponenet>
				<InputFieldCheckboxComponent id='PrimaryTargetGroup' label='Primaire doelgroep' :modelValue="formData.PrimaryTargetGroup.value" @update:model-value="formData.PrimaryTargetGroup.value = $event; validator.validateField('PrimaryTargetGroup')" :options="PrimaryTargetGroupOptions" :error="formData.PrimaryTargetGroupError.value" required></InputFieldCheckboxComponent>
				<InputFieldTextComponent id='targetGroup' label='Doelgroep (voor wie is deze opleiding bedoeld? Max. 125 tekens)' :suggestions="getOpenaiResponse?.targetGroup" :modelValue="formData.targetGroup.value" @update:modelValue="formData.targetGroup.value = $event; validator.validateField('targetGroup')" :error="formData.targetGroupError.value" required></InputFieldTextComponent>
				<InputFieldDropdownSelectComponenet id='knowledgeLevel' label='Kennisniveau' :multiple=true :options="knowledgeLevelOptions" :modelValue="formData.knowledgeLevel.value" @update:model-value="formData.knowledgeLevel.value = $event; validator.validateField('knowledgeLevel')" :error="formData.knowledgeLevelError.value" required></InputFieldDropdownSelectComponenet>
				<InputFieldTextComponent id='requirements' label='Voorkennis / Vereisten' :suggestions="getOpenaiResponse?.requirements" :modelValue="formData.requirements.value" @update:modelValue="formData.requirements.value = $event; validator.validateField('requirements')" :error="formData.requirementsError.value" required></InputFieldTextComponent>
				
				<InputFieldDropdownSelectComponenet id='priceLevel' label='Prijs (grootteorde)' :multiple=false  :options="priceLevelOptions" :modelValue="formData.priceLevel.value" @update:model-value="formData.priceLevel.value = $event; validator.validateField('priceLevel')" :error="formData.priceLevelError.value" required></InputFieldDropdownSelectComponenet>
				<InputFieldTextComponent id='exactPrice' label='Prijs (exact)' :suggestions="getOpenaiResponse?.exactPrice" :modelValue="formData.exactPrice.value" @update:modelValue="formData.exactPrice.value = $event; validator.validateField('exactPrice')" :type="'number'" :error="formData.exactPriceError.value" required></InputFieldTextComponent>
				
				<InputFieldDropdownSelectComponenet id='afterCourseGoals' label='Na deze cursus wil ik' :multiple=true :options="afterCourseGoalsOptions" :modelValue="formData.afterCourseGoals.value" @update:model-value="formData.afterCourseGoals.value = $event; validator.validateField('afterCourseGoals')" :error="formData.afterCourseGoalsError.value" required></InputFieldDropdownSelectComponenet>
				<InputFieldDropdownSelectComponenet id='scopeOfApplication' label='Toepassingsgebied' :multiple=true :options="scopeOfApplicationOptions" :modelValue="formData.scopeOfApplication.value" @update:model-value="formData.scopeOfApplication.value = $event; validator.validateField('scopeOfApplication')" :error="formData.scopeOfApplicationError.value" required></InputFieldDropdownSelectComponenet>
				<InputFieldDropdownSelectComponenet id='ethicDomains' label='Ethisch domein' :multiple=true :options="ethicDomainsOptions" :modelValue="formData.ethicDomains.value" @update:model-value="formData.ethicDomains.value = $event; validator.validateField('ethicDomains')" :error="formData.ethicDomainsError.value" :required="false"></InputFieldDropdownSelectComponenet>
				<InputFieldDropdownSelectComponenet id='certificate' label='Certificaat' :multiple=false :options="certificateOptions" :modelValue="formData.certificate.value" @update:model-value="formData.certificate.value = $event; validator.validateField('certificate')" :error="formData.certificateError.value" :required="false"></InputFieldDropdownSelectComponenet>
				
				<InputFieldDropdownSelectComponenet id='language' label='Taal' :multiple=false :options="languageOptions" :modelValue="formData.language.value" @update:model-value="formData.language.value = $event; validator.validateField('language')" :error="formData.languageError.value" required></InputFieldDropdownSelectComponenet>
				<InputFieldTextComponent id='totalHours' label='Totaal aantal lesuren' :suggestions="getOpenaiResponse?.totalHours" :modelValue="formData.totalHours.value" @update:model-value="formData.totalHours.value = $event; validator.validateField('totalHours')" :error="formData.totalHoursError.value" required></InputFieldTextComponent>
				<InputFieldDropdownSelectComponenet id='locationZone' label='Regio' :multiple=false :options="locationZoneOptions" :modelValue="formData.locationZone.value" @update:model-value="formData.locationZone.value = $event; validator.validateField('locationZone')" :error="formData.locationZoneError.value" required></InputFieldDropdownSelectComponenet>
				<InputFieldTextComponent id='locationAddress' label='Waar gaat de opleiding door?' :suggestions="getOpenaiResponse?.locationAddress" :modelValue="formData.locationAddress.value" @update:model-value="formData.locationAddress.value = $event; validator.validateField('locationAddress')" :error="formData.locationAddressError.value" required></InputFieldTextComponent>
			</div>

			<div>
				<h2>Wie mag VAIA contacteren met vragen over deze opleiding? (niet publiek)</h2>

				<div class="input-row no-clarity">
					<InputFieldTextComponent id='firstName' label='Voornaam' :model-value="formData.firstName.value" @update:model-value="formData.firstName.value = $event; validator.validateField('firstName')" :error="formData.firstNameError.value" required></InputFieldTextComponent>
					<InputFieldTextComponent id='lastName' label='Achternaam' :model-value="formData.lastName.value" @update:model-value="formData.lastName.value = $event; validator.validateField('lastName')" :error="formData.lastNameError.value" required>"></InputFieldTextComponent>
					<InputFieldTextComponent id='email' label='E-mailadres' :model-value="formData.email.value" @update:model-value="formData.email.value = $event; validator.validateField('email')" :error="formData.emailError.value" required></InputFieldTextComponent>
					<InputFieldTextComponent id='organisationName' label='Organisatie' :model-value="formData.organisationName.value" @update:model-value="formData.organisationName.value = $event; validator.validateField('organisationName')" :error="formData.organisationNameError.value" required></InputFieldTextComponent>
				</div>
			</div>
		</section>

		<div class="section" v-if="formStep != 0">
			<button v-if="formStep > 1" @click="handleGoBack()" class="btn secondary">Vorige stap</button>
			<button ref="submitButton" @click="handleSubmit()" class="btn">Volgende stap</button>
		</div>
	</main>

	<div>
		
	</div>
	<LoadingComponent v-if="loading"></loadingComponent>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
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
import { storeToRefs } from 'pinia';
import { useToast } from 'vue-toast-notification';
import { storeInfto } from '@/firebase';

const toast = useToast();
const formData = useFormData();
let validator = useFormValidator(formData);

const formStep = ref<number>(0);
const renderKey = ref<number>(0);
const loading = ref<boolean>(false);
const mainRef = ref<HTMLElement | null>(null);
const submitButton = ref<HTMLButtonElement | null>(null);
const openaiResponseStore = useOpenaiResponseStore();
const { getOpenaiResponse } = storeToRefs(openaiResponseStore);


const courseTypeOptions = [{ label: "Deze opleiding gaat door op een bepaalde datum of over een bepaalde periode.", value: "Deze opleiding gaat door op een bepaalde datum of over een bepaalde periode." }, { label: "De deelnemer kan deze opleiding in zijn eigen tijd volgen. Deze opleiding heeft geen vaste datum.", value: "De deelnemer kan deze opleiding in zijn eigen tijd volgen. Deze opleiding heeft geen vaste datum." },]
const organisersOptions = [{ group_name: '', options: organisers }];
const PrimaryTargetGroupOptions = [{label: 'Onderzoek', value: 'Onderzoek'}, {label: 'Levenslang leren', value: 'Levenslang leren'}];

const priceLevelOptions = computed(() => getOpenaiResponse.value?.priceLevel ? [{ group_name: 'AI suggesties', options: getOpenaiResponse.value.priceLevel }, { group_name: '', options: priceLevels }]: [{ group_name: '', options: priceLevels }]);
const afterCourseGoalsOptions = computed(() => getOpenaiResponse.value?.afterCourseGoals ? [{group_name: 'AI suggesties', options: getOpenaiResponse.value.afterCourseGoals}, {group_name: '', options: afterCourseGoals}] : [{group_name: '', options: afterCourseGoals}]);
const ethicDomainsOptions = computed(() => getOpenaiResponse.value?.ethicDomains ? [{group_name: 'AI suggesties', options: getOpenaiResponse.value.ethicDomains}, {group_name: '', options: ethicDomains}] : [{group_name: '', options: ethicDomains}]);
const certificateOptions = computed(() => getOpenaiResponse.value?.certificate ? [{group_name: 'AI suggesties', options: getOpenaiResponse.value.certificate}, {group_name: '', options: certificates}] : [{group_name: '', options: certificates}]);
const knowledgeLevelOptions = computed(() => getOpenaiResponse.value?.knowledgeLevel ? [{group_name: 'AI suggesties', options: getOpenaiResponse.value.knowledgeLevel}, {group_name: '', options: knowledgeLevels}] : [{group_name: '', options: knowledgeLevels}]);
const scopeOfApplicationOptions =  computed(() => getOpenaiResponse.value?.scopeOfApplication ? [{group_name: 'AI suggesties', options: getOpenaiResponse.value.scopeOfApplication}, {group_name: '', options: scopeOfApplications}] : [{group_name: '', options: scopeOfApplications}]);
const languageOptions = computed(() => getOpenaiResponse.value?.language ? [{group_name: 'AI suggesties', options: getOpenaiResponse.value.language}, {group_name: '', options: languages}] : [{group_name: '', options: languages}]);
const locationZoneOptions = computed(() => getOpenaiResponse.value?.locationZone ? [{group_name: 'AI suggesties', options: getOpenaiResponse.value.locationZone}, {group_name: '', options: locationZones}] : [{group_name: '', options: locationZones}]);

const handleSubmit = async () => {
	validator = useFormValidator(formData);
	if (formStep.value === 1) {
		const { isValid, errors } = validator.validateFields(['title', 'introduction', 'subtitle', 'courseLink', 'courseType', 'startDate', 'endDate', 'startTime', 'endTime']);
		if (isValid) {
			formStep.value = 2;
			mainRef.value && mainRef.value.scrollIntoView();
			submitButton.value && (submitButton.value.innerText = 'Verzenden');
		}
		else {
			scrollToFirstError(errors);
		}

	}
	else {
		const { isValid, errors } = validator.validateFields(['organisers', 'PrimaryTargetGroup', 'requirements', 'priceLevel', 'afterCourseGoals', 'locationAddress', 'targetGroup', 'exactPrice', 'knowledgeLevel', 'scopeOfApplication', 'language', 'locationZone', 'totalHours', 'firstName', 'lastName', 'email', 'organisationName']);
		if (isValid) {
			
			formStep.value = 0;
			await storeInfto(formData);
			openaiResponseStore.clearOpenaiResponse();
			resetFormData(formData);
			renderKey.value++;
			toast.success('Bedankt om het formulier in te vullen! We proberen het zo snel mogelijk na te kijken en zetten het online.', {
				duration: 10000,
				position: 'top'
			});

		}
		else {
			scrollToFirstError(errors);
		}
	}
}

const handleGoBack = () => {
	formStep.value = 1;
	submitButton.value && (submitButton.value.innerText = 'Volgende stap');

}

const scrollToFirstError = (errorFields: FieldName[]): void => {
	if (errorFields.length > 0) {
		const firstErrorField = document.getElementById(errorFields[0])
		if (firstErrorField) {
			firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}
}

</script>



<style lang="scss" scoped>
@use '@/assets/scss/main.scss' as *;

@media screen and (min-width: 50rem) {
	.input-row {
		& > * {
			margin-top: 3rem;
		}
	}
	
}

h2 {
	margin-top: 6rem;
}

.btn {
	margin: 5rem auto;

	&:first-child {
		margin-right: 2rem;
	}
}

p {
	font-size: 2.2rem;
	line-height: 3rem;
}

</style>