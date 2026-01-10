<script setup lang="ts">
import { IonLabel, IonTextarea } from '@ionic/vue';
import { text } from 'ionicons/icons';
import { defineProps, ref, watch} from 'vue';

defineProps({
    question: String
});

const emit = defineEmits(['inputCallback']);
const textValue = ref<string>('')

watch(textValue, (newVal) => {
  emit('inputCallback', newVal);
})

</script>

<template>
    <div class="container">
        <ion-label>{{ question }}</ion-label>
        <ion-textarea 
            placeholder="Begin te typen of plak je bericht" 
            v-model="textValue"
            fill="outline"
            mode="md"
            autoGrow="true">

        </ion-textarea>
    </div>

</template>

<style lang="css" scoped>

ion-label{
    font-size: 1.6rem;
    padding-left: 0.4rem;
    margin-bottom: 10px;
}


ion-textarea.textarea-fill-outline {
    font-size: 1.6rem;
    margin-bottom: 10px;
    --border-radius: 10px;
    border-radius: 10px;
    --padding-bottom: 18px;
    min-height: 30rem;
    background-color: var(--input-field-color);
  }

.container{
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 2rem;
}

</style>