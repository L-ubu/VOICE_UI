<template>
	<div class='container' ref="suggestionBox">
		<div class='ai-suggestions-header'>
			<!--<svg width='16' height='16' viewBox='0 0 16 16' fill='none' class='ai-icon'>
				<path d='M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z' fill='#FF6B35' />
			</svg>-->
			<img src="@/assets/images/wand.svg" alt="AI icon" />
			<h3>AI suggesties</h3>
		</div>
		<ul class='content'>
			
			<li v-for="(suggestion, index) in suggestions" :key="suggestion" class='radio'>
				<input :id="`${index}`" type='radio' :name="`${index}`" :value="suggestion" v-model="selectedSuggestion" :class="content_type === 'html' ? 'hide':''"/>
				<label v-if="content_type === 'string'" :for="`${index}`">{{ formatDate(suggestion) }}</label>
				<label v-else :for="`${index}`" v-html="suggestion"></label>
			</li>

		</ul>
		<div class='buttons'>
			<button class='button secondary' @click="handleClick('accept')">
				<svg width='20' height='20' viewBox='0 0 12 12' fill='none'>
					<path d='M2 6L5 9L10 3' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' />
				</svg>
			</button>
			<button class='button secondary' @click="handleClick('decline')">
				<span>x</span>
			</button>
		</div>
	</div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue';

const props = defineProps<{suggestions: string[], content_type: 'string' | 'html'}>();
const emit = defineEmits(['accept', 'decline']);

const selectedSuggestion = ref<string>('');
const suggestionBox = ref<HTMLDivElement | null>(null);

const formatDate = (value: string) => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (dateRegex.test(value)) {
		const [year, month, day] = value.split('-');
		return `${day}-${month}-${year}`;
	}
	return value;
}

onMounted(() => {
	if (props.suggestions.length > 0) {
		selectedSuggestion.value = props.suggestions[0];
	}

	setTimeout(() => {
		if(suggestionBox.value) {
			suggestionBox.value.scrollIntoView({block: 'center', inline: 'center'});
		}
	}, 100);
})


const handleClick = (action: string) => {
	switch (action) {
		case 'accept':
			emit('accept', selectedSuggestion.value);
			break;
		case 'decline':
			emit('decline');
			break;
	}
}
</script>

<style scoped lang='scss'>
@use '@/assets/scss/main.scss' as *;

.container {
	position: absolute;
	top: 1rem;
	left: 50%;
	transform: translate(-50%, 0);
	z-index: 999;
	width: calc(100% - 4rem);
	height: 33rem;
	background-color: $gray;
	padding: 2rem;
	border-radius: 1rem;
	box-shadow: 5px 5px 10px 1px rgba(0, 0, 0, 0.1);

    &::before {
        content: '';
        position: absolute;
        top: -0.8rem;
        left: 50%;
        transform: translate(-50%, 0);
        transform: rotate(45deg);
        width: 2rem;
        height: 2rem;
        background-color: $gray;
        border-top-left-radius: 0.5rem;
    }


	.ai-suggestions-header {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		height: 3rem;

		img {
			width: 2rem;
		}

		h3 {
			font-size: 1.4rem;
			font-weight: 800;
			color: #dc2626;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
	}

	.content {
        background-color: #ffffff;
		height: 23rem;
		overflow: scroll;
		font-size: 1.6rem;
		line-height: 2rem;
		list-style-type: none;
		margin: 1rem 0;
		padding: 1rem;
        border-radius: 1rem;

		.radio {
			margin-bottom: 2rem;
			display: flex;
			align-items: center;
			align-content: center;

			label {
				margin-left: 1rem;
			}

            .hide {
                display: none;
            }
		}
	}

	.buttons {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		height: 4rem;

		span {
			font-size: 3rem;
			font-weight: 700;
			line-height: 1.5rem;
		}
	}
}

@media screen and (min-width: 500px) {
	.container {
		width: 40rem;
	}
	
}
</style>