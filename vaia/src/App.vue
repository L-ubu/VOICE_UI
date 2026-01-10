
<template>
	<header>
		<HeaderComponent />
	</header>

	<main>
		<router-view :key="$route.fullPath" />
	</main>

	<footer>
	</footer>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import HeaderComponent from '@/components/HeaderComponent.vue'
import Clarity from '@microsoft/clarity';
const projectId = "s9671kkxjj";
Clarity.init(projectId);

</script>



<style lang="scss">
@use './assets/scss/normalize.scss' as *;
@use './assets/scss/main.scss' as *;
@import url("https://use.typekit.net/scv1lpc.css");

#app {
	font-family: 'New_Rubrik', sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: $font-color;
}
</style>
