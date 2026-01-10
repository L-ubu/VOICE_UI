<template>
	<div>
		<div class='dropdown-container' :id="id">
			<label :for="id" :id="id">{{ label }} <span v-if="!required" class="optional">(optioneel)</span></label>
			<span class='hint' v-if="multiple">Je kan er meerdere kiezen.</span>
			<div class='dropdown-header' @click="toggleDropdown" :class="{ 'open': isOpen }">
				<div class='selected-tags'>
					<div v-for="option, index in selectedOptions" :key="index" class='tag'>
						<span>{{ option }}</span>
						<button class='tag-remove' @click="removeOption(option)"> | x</button>
					</div>
					<input ref='filterRef' class='filter' v-model="filter"></input>
				</div>

				<svg class='dropdown-arrow' :class="{ 'rotated': isOpen }" width='12' height='12' viewBox='0 0 12 12'
					fill='none'>
					<path d='M3 4.5L6 7.5L9 4.5' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'
						stroke-linejoin='round' />
				</svg>
			</div>

			<OrganisersPopupComponent
				v-if="shouldUsePopup"
				:options="allOptions"
				:modelValue="selectedOptions"
				:isOpen="showOrganisersPopup"
				:title="`Selecteer ${label.toLowerCase()}`"
				@update:modelValue="selectedOptions = $event"
				@update:isOpen="showOrganisersPopup = $event"
				ref="organisersPopupRef"
			/>

			<div class='dropdown-menu' v-show="isOpen && !shouldUsePopup">
				<div v-for="(group, groupIndex) in filteredOptions" :key="group.group_name + groupIndex" class='option-group'>
					<div v-if="group.group_name === 'AI suggesties'" class='ai-suggestions-header'>
						<img src="@/assets/images/wand.svg" alt="AI icon" />
						<span class='group-title'>AI Suggesties</span>
					</div>

					<div v-for="(option, optionIndex) in group.options" :key="optionIndex" class='option-item'
						:class="{ 'selected': selectedOptions.includes(option), 'ai-suggestion': group.group_name === 'AI suggesties' }"
						@click="toggleOption(option, multiple)"
						:data-number="getDisplayNumber(groupIndex, optionIndex)">
						<span class='option-number'>{{ getDisplayNumber(groupIndex, optionIndex) }}</span>
						<span class='option-text'>{{ option }}</span>
						<div class='checkbox' :class="{ 'checked': selectedOptions.includes(option) }">
							<svg v-if="selectedOptions.includes(option)" width='12' height='12' viewBox='0 0 12 12'
								fill='none'>
								<path d='M2 6L5 9L10 3' stroke='currentColor' stroke-width='2' stroke-linecap='round'
									stroke-linejoin='round' />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>
		<InputFieldErrorComponent v-if="error" :value="error" />
	</div>
</template>

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import InputFieldErrorComponent from './InputFieldErrorComponent.vue';
import OrganisersPopupComponent from './OrganisersPopupComponent.vue';
import type { InputFieldDropdownSelectProps } from '@/typings';

const props = defineProps<InputFieldDropdownSelectProps>();
const emits = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const showOrganisersPopup = ref(false);
const organisersPopupRef = ref<InstanceType<typeof OrganisersPopupComponent> | null>(null);

const selectedOptions = ref<string[]>(props.modelValue);
const filter = ref<string>('');
const filterRef = ref<HTMLInputElement>();

watch(selectedOptions, () => {
	emits('update:modelValue', selectedOptions.value);
});

watch(() => props.modelValue, (newValue) => {
	selectedOptions.value = newValue;
});

watch(() => props.options, (newOptions) => {
	if (props.autofill && newOptions?.length) {
		const aiGroup = newOptions.find(group => group.group_name === 'AI suggesties');

		if (aiGroup && aiGroup.options.length > 0) {
			if (selectedOptions.value.length === 0) {
				if (props.multiple) {
					selectedOptions.value = [...aiGroup.options];
				} else {
					selectedOptions.value = [aiGroup.options[0]];
				}
			}
		}
	}
});


const filteredOptions = computed(() => {
	if (!filter.value.trim()) {
		return props.options;
	}

	const searchTerm = filter.value.toLowerCase();

	return props.options
		.map(group => ({
			group_name: group.group_name,
			options: group.options.filter(option =>
				option.toLowerCase().includes(searchTerm)
			)
		}))
		.filter(group => group.options.length > 0); // remove empty groups
});

const allOptions = computed(() => {
	const all: string[] = [];
	props.options.forEach(group => {
		all.push(...group.options);
	});
	return all;
});

const totalOptionsCount = computed(() => {
	return allOptions.value.length;
});

const shouldUsePopup = computed(() => {
	return totalOptionsCount.value > 10;
});

const toggleDropdown = () => {
	if (shouldUsePopup.value) {
		showOrganisersPopup.value = !showOrganisersPopup.value;
	} else {
		isOpen.value = !isOpen.value;
		if (isOpen.value) {
			filterRef.value?.focus();
		} else {
			filter.value = '';
		}
	}
	emits('update:modelValue', selectedOptions.value);
}

const toggleOption = (option: string, multiple: boolean) => {
	const index = selectedOptions.value.indexOf(option);
	if (index > -1) {
		selectedOptions.value.splice(index, 1);
	} else {
		if (multiple) {
			selectedOptions.value.push(option);
			filterRef.value?.focus();
		} else {
			selectedOptions.value = [option];
			isOpen.value = false;
		}
		filter.value = '';
	}
}

const removeOption = (option: string) => {
	const index = selectedOptions.value.indexOf(option);
	if (index > -1) {
		selectedOptions.value.splice(index, 1);
	}
}

// Calculate sequential number for display
const getDisplayNumber = (groupIndex: number, optionIndex: number): number => {
	let number = 1;
	for (let g = 0; g < groupIndex; g++) {
		number += filteredOptions.value[g]?.options.length || 0;
	}
	return number + optionIndex;
}

const handleClickOutside = (event: MouseEvent) => {
	const target = event.target as HTMLElement;
	if (!target.closest('#' + props.id)) {
		isOpen.value === true && toggleDropdown();
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside);
})

defineExpose({
	organisersPopup: organisersPopupRef
});
</script>

<style scoped lang='scss'>
@use '../assets/scss/main.scss' as *;

.dropdown-container {
	position: relative;
	width: 100%;

	label {
		display: block;
		font-size: 1.85rem;
		line-height: 2.5rem;
		font-weight: 600;
		margin: 2rem 0 1rem 0;
		width: calc(100% - 2rem);

		.optional {
			font-weight: 400;
			font-size: 1.6rem;
			opacity: 0.8;
		}
	}

	.hint {
		display: inline-block;
		font-size: 1.4rem;
		margin: 1rem 0rem 1rem 0;
	}


	.dropdown-header {
		display: flex;
		align-items: center;
		cursor: pointer;
		font-size: 1.6em;
		min-height: 3.7rem;
		margin-bottom: 1rem;
		padding: 1rem;
		border: none;
		border-radius: 0.2rem;
		background-color: $gray;

		&.open {
			border: $font-color .1rem solid;
		}

		.selected-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
			width: 100%;

			.filter {
				background-color: transparent;
				border: none;
				outline: none;
				margin: 0;
				padding: 0;
			}

			.tag {
				display: inline-flex;
				align-items: center;
				gap: 0.8rem;
				background: $fuchsia;
				color: #ffffff;
				padding: 0.5rem 0.5rem 0.5rem 1rem;
				border-radius: 1.5rem;
				font-size: 1.4rem;
				font-weight: 500;

				.tag-remove {
					display: flex;
					align-items: center;
					justify-content: center;
					background: none;
					border: none;
					color: #ffffff;
					cursor: pointer;
					font-weight: 800;
					padding-left: 0;
				}
			}
		}

		.dropdown-arrow {
			color: $fuchsia;
			transition: transform 0.2s ease;
			min-width: 1.2rem;

			&.rotated {
				transform: rotate(180deg);
			}
		}
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: #ffffff;
		box-shadow: 5px 5px 20px 0px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		max-height: 30rem;
		overflow-y: auto;

		.option-group {
			background-color: $light-gray;
			margin: 1rem;
			border-radius: 1rem;
			overflow: hidden;

			.ai-suggestions-header {
				display: flex;
				align-items: center;
				gap: 0.8rem;
				padding: 1rem;

				img {
					width: 2rem;
				}

				.group-title {
					font-size: 1.2rem;
					font-weight: 800;
					color: #dc2626;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}
			}

				.option-item {
					display: flex;
					align-items: center;
					gap: 1rem;
					padding: 1rem 1.6rem;
					cursor: pointer;
					transition: background-color 0.15s ease;

					&:hover {
						background-color: $fuchsia;
						color: #ffffff;
					}

					&.selected {
						font-weight: 600;
					}

					.option-number {
						font-weight: 700;
						color: $fuchsia;
						min-width: 2.5rem;
						font-size: 1.4rem;
					}

					.option-text {
						font-size: 1.6rem;
						flex: 1;
					}

					.checkbox {
						display: flex;
						align-items: center;
						transition: all 0.15s ease;
						flex-shrink: 0;
						color: $fuchsia;
					}

				}
		}
	}
}
</style>