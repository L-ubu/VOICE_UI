<template>
	<p class='error' :class="className">{{ value }}</p>
</template>

<script setup lang='ts'>
const props = defineProps(['value', 'className']);
</script>

<style lang='scss' scoped>
.error {
	display: block;
	color: #E73E1C;

	&.cta {
		position: relative;
		background-color: #ffffff;
		width: fit-content;
		margin: 2rem auto;
		padding: 1rem;
		border-radius: 0.5rem;
		text-align: center;
		max-width: max-content;
		

		&::before {
			content: '';
			position: absolute;
			top: -0.5rem;
			left: 50%;
			transform: translate(-50%, 0);
			transform: rotate(45deg);
			width: 1.5rem;
			height: 1.5rem;
			border-top-left-radius: 0.5rem;
			background-color: #ffffff;
		}
	}
}
</style>