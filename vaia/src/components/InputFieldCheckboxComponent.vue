<template>
	<div class='input-field'>
		<label :for="id" :id="id">{{ label }}</label>
		<div class='checkbox-wrapper'>
			<div v-for="(option, index) in options" :key="index" class='checkbox'>
				<input :id="`${id}-${index}`" type='checkbox' :name="id" :value="option.value" v-model="modelValue" :required="required" :class="className" />
				<label :for="`${id}-${index}`">{{ option.label }}</label>
			</div>
		</div>
		<InputFieldErrorComponent v-if="error" :value="error" />
	</div>
</template>

<script setup lang='ts'>
import { defineProps, defineEmits, watch, ref } from 'vue';
import InputFieldErrorComponent from '@/components/InputFieldErrorComponent.vue';
import type { InputFieldCheckboxProps } from '@/typings';

const props = defineProps<InputFieldCheckboxProps>();
const emits = defineEmits(['update:modelValue']);

const modelValue = ref<string[]>(props.modelValue);

watch(modelValue, () => {
	emits('update:modelValue', modelValue.value);
});

watch(() => props.modelValue, (newValue) => {
	modelValue.value = newValue;
});

</script>


<style scoped lang='scss'>
@use '@/assets/scss/main.scss' as *;
.input-field {

	label {
		font-size: 1.85rem;
		line-height: 2.5rem;
		font-weight: 600;
		margin: 2rem 0 1rem 0;
        display: block;
	}

	.checkbox-wrapper {
		.checkbox {
            display: flex;
            align-items: center;
            align-content: center;

			label {
                margin-left: 1rem;
				font-size: 1.6em;
                margin-top: 1rem;
			}
            input[type=checkbox] {
                margin-top: 1;
            }
		}
	}
}
</style>

0