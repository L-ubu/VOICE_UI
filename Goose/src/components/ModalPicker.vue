<template>
    <ion-item button @click="openModal" lines="full">
      <ion-label>
        {{ selectedOption ? selectedOption.text : placeholder }}
      </ion-label>
    </ion-item>
  
    <ion-modal :is-open="showModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Cancel</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item
            v-for="option in options"
            :key="option.value"
            button
            @click="selectOption(option)"
          >
            <ion-label>{{ option.text }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, withDefaults, defineProps, defineEmits } from 'vue';
  import {
    IonItem,
    IonLabel,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList
  } from '@ionic/vue';
  

  // Define component props with defaults
  const props = withDefaults(defineProps<{
    options: PickerObject[];
    modelValue: PickerObject | null;
    placeholder?: string;
    title?: string;
  }>(), {
    modelValue: null,
    placeholder: 'Select an option',
    title: 'Select Option'
  });
  
  // Define component emits
  const emit = defineEmits<{
    (e: 'update:modelValue', value: PickerObject): void;
  }>();
  
  // Reactive property to control modal visibility
  const showModal = ref(false);
  
  // Computed property to determine the currently selected option
  const selectedOption = computed(() =>
    props.options.find(option => option.value === props.modelValue?.value)  
  );
  
  // Open the modal
  const openModal = () => {
    showModal.value = true;
  };
  
  // Close the modal
  const closeModal = () => {
    showModal.value = false;
  };
  
  // Handle option selection
  const selectOption = (option: PickerObject) => {
    emit('update:modelValue', option);
    closeModal();
  };
  </script>

<style lang="css" scoped>


ion-item {
  width: 100%;
}

</style>