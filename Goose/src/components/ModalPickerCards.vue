<template>
	<ion-card v-for="option in options"
            :key="option.value"
            @click="selectOption(option)">

		<ion-icon :icon="chatbubblesOutline"></ion-icon>
		<div>
			<ion-card-header>
				<ion-card-title color="tertiary">{{ splitText(option.text).title }}</ion-card-title>
			</ion-card-header>
			<ion-card-content>{{ splitText(option.text).content || '' }}</ion-card-content>
		</div>

	</ion-card>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/vue';
import { chatbubblesOutline } from 'ionicons/icons';

const props = withDefaults(defineProps<{
	options: PickerObject[];
	modelValue: PickerObject | null;
}>(), {
	modelValue: null,
});

const splitText = (text: string) => {
	const [title, content] = text.split(';').map(part => part.trim())
	console.log(title, content);

	return {
		title,
		content
	}
}

const emit = defineEmits<{
	(e: 'update:modelValue', value: PickerObject): void;
}>();

const selectOption = (option: PickerObject) => {
	emit('update:modelValue', option);
};



</script>

<style lang="css" scoped>

ion-card {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	margin: 1rem auto;
}

ion-icon {
	font-size: 3rem;
	width: 20%;
	display: block;
}

div {
	width: 80%;

	ion-card-header {
		padding-left: 0;
		padding-bottom: 0;
	}

	ion-card-content {
		font-size: 1.3rem;
		padding-left: 0;
	}
}






</style>

