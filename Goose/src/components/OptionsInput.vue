
<template>
  <div class="container">
    <ion-label color="tertiary">{{ question }}</ion-label>
    <ion-chip v-for="option in options" @click="toggleSelection(option)" :class="selectedOptions.includes(option)?'selected':''">
      {{ option }}
    </ion-chip>
  </div>
</template>


<script setup lang="ts">
import { IonLabel, IonChip} from '@ionic/vue';
import { ref } from 'vue';

const props = defineProps({
    question: String,
    options: [String],
    multiple: Boolean
});

const emit = defineEmits(['inputCallback']);
const selectedOptions = ref<string[]>([]);

const toggleSelection = (option: string) => {
  if(props.multiple){
    if (selectedOptions.value.includes(option)) {
      selectedOptions.value = selectedOptions.value.filter((opt) => opt !== option);
    } else {
      selectedOptions.value.push(option);
    }
  } else {
    selectedOptions.value = [option];
  }
  emit('inputCallback', selectedOptions.value);
};

</script>


<style lang="css" scoped>

.container{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-top: 2rem;
}

ion-label{
    font-size: 1.6rem;
    padding-left: 0.4rem;
    margin-bottom: 10px;
}

ion-chip{
    font-size: 1.5rem;
    --color: var(--ion-color-primary-secondary);
    --background: var(--input-field-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-chip.selected {
  --color: var(--ion-color-primary-contrast);
  --background: var(--ion-color-primary);
}

</style>