<template>
    <div>
        <img src="@/assets/images/goose.svg" />
        <img v-if="type == 'asking'" src="@/assets/images/asking.svg" class="addition" ref="animatedElement"/>
        <img v-else src="@/assets/images/thinking.svg" class="addition"/>
    </div>
</template>

<script setup lang="ts">
import { createAnimation, Animation } from '@ionic/vue';
import { onMounted, ref } from 'vue';

const animatedElement = ref<HTMLElement | null>();
let animation:Animation;

defineProps<{ 
    type: 'asking' | 'suggesting';
}>();



onMounted (() => {
    if(animatedElement.value) {
        animation = createAnimation()
            .addElement(animatedElement.value)
            .duration(1000)
            .fromTo('opacity', '0', '1')
            .easing('ease-out');
        animation.play();
    }
})
</script>

<style scoped>
div {
    height: 20rem;
    margin: 1rem auto;
    position: relative;
}
img {
    width: 15rem;
    &.addition {
        position: absolute;
        left: calc(50% + 5rem);
        top: 0;
        width: 10rem;
    }
    &:not(.addition){
        margin-top: 5rem;
    }
}

</style>