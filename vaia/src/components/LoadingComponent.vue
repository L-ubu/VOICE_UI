<template>
	<div class="container">
		<div class="flipping">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>

		<p>{{ message ? message : 'Even geduld, we analyseren je cursusinformatie.' }}</p>
	</div>
</template>

<script setup lang="ts">
defineProps<{ message?: string }>();
</script>

<style lang="scss" scoped>
@use '@/assets/scss/main.scss' as *;

.container {
	width: 100vw;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 100;
	background-color: rgba($color: #ffffff, $alpha: 0.9);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	p {
	font-size: 2rem;
	font-weight: 600;
	color: $fuchsia;
	text-align: center;
}
}

.flipping {
	width: 67.2px;
	height: 67.2px;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(3, 1fr);
}

.flipping div {
	animation: flipping-18i5bq 1.5s calc(var(--delay) * 1s) infinite backwards;
	background-color: $fuchsia;
}

.flipping div:nth-child(1) {
	--delay: 0.1;
}

.flipping div:nth-child(2) {
	--delay: 0.2;
}

.flipping div:nth-child(3) {
	--delay: 0.3;
}

.flipping div:nth-child(4) {
	--delay: 0.4;
}

.flipping div:nth-child(5) {
	--delay: 0.5;
}

.flipping div:nth-child(6) {
	--delay: 0.6;
}

.flipping div:nth-child(7) {
	--delay: 0.7;
}

.flipping div:nth-child(8) {
	--delay: 0.8;
}

.flipping div:nth-child(9) {
	--delay: 0.9;
}

@keyframes flipping-18i5bq {
	0% {
		transform: perspective(67.2px) rotateX(-90deg);
	}

	50%,
	75% {
		transform: perspective(67.2px) rotateX(0);
	}

	100% {
		opacity: 0;
		transform: perspective(67.2px) rotateX(0);
	}
}
</style>