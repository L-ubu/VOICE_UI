<template>
    <div>
        <video
            autoplay
            muted
            loop
            playsinline
        >
            <source src="@/assets/videos/goose-animation.mp4" type="video/mp4" />
        </video>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
video {
    width: 100%;
    border-radius: 12px;
}
</style>