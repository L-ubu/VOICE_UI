<template>

	<div class="response_container">

		<ion-text>

		</ion-text><br>
		<ion-text color="medium">Klik op een suggestie om er dieper op in te gaan.</ion-text>
		<ion-list :inset="true" lines="none">

			<ion-item v-for="suggestion in response.suggestions" detail="true"
				
				@click="emit('handleElaborate', suggestion, response)">
				{{ suggestion }}
			</ion-item>
			
		</ion-list>
		<ion-text>

		</ion-text>
	</div>

</template>

<script setup lang="ts">
import {
	IonText,
	IonItem,
	IonList
} from '@ionic/vue';

defineProps<{
	response: FormatResponse,
	selectedSuggestion: string | null
}>();

const emit = defineEmits([
	'handleElaborate'
]);

</script>

<style lang="css" scoped>
ion-list{
	background-color: transparent;
}

ion-item {
	--inner-padding-top: 1rem;
	--inner-padding-bottom: 1rem;
	margin-bottom: 1rem;
	border-radius: 1rem;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	color: var(--ion-color-tertiary);
}

ion-text {
	display: block;
}


</style>