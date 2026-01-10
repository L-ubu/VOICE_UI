<template>
    <div class='header-wrapper'>
        <router-link to='/' class='logo'>
            <img src='@/assets/images/vaia-logo.svg'>
        </router-link>

        <button class='burger' @click="toggleNav" ref='burger'>
            <span></span>
            <span></span>
            <span></span>
        </button>
        
        <nav ref='navList'>
            <ul class='navlist' @click="closeNav">
                <li><a href='https://febacademy.ugent.be/programma/volledig-aanbod/2025-2026-eb22genaidissemination-genai-als-financiele-professional-klaar' target='_blank'>Opleidingen</a></li>
                <li><router-link to='/blog'>Blog</router-link></li>
                <li><router-link to='/experts'>Experts</router-link></li>
                <li><router-link to='/organisaties'>Organisaties</router-link></li>
                <li><router-link to='/samenwerken'>Samenwerken</router-link></li>
            </ul>
        </nav>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';


const burger = ref<HTMLButtonElement | null>(null);
const navList = ref<HTMLUListElement | null>(null);


const toggleNav = () => {
    navList.value?.classList.toggle('nav-active');
    burger.value?.classList.toggle('toggle');
}

const closeNav = () => {
    navList.value?.classList.remove('nav-active');
    burger.value?.classList.remove('toggle');
}

</script>


<style lang='scss' scoped>
@use '@/assets/scss/main.scss' as main;
.header-wrapper {
    
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    margin: 4.5rem main.$padding 2rem main.$padding;
    justify-content: space-between;
    gap: 5rem;

    .logo img {
        width: 25rem;
    }

    @media screen and (min-width: main.$breakpoint) {
        margin: 2rem main.$padding_dt 2rem main.$padding_dt;
        align-items: flex-end;
    }
}


nav {

    display: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #FFF;
    z-index: 9;

    ul {
        gap: 3rem;
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: center;
        margin-bottom: 0;
        padding: 5rem 0 0 0;

        li {
            margin-bottom: 2rem;
            list-style-type: none;
            cursor: pointer;
        }

        a {
            font-size: 2rem;
            font-weight: 600;
            color: main.$font-color;
            text-decoration: none;

            &.router-link-exact-active {
                color: main.$fuchsia;
            }
        }

    }

    &.nav-active {
        display: flex;
    }

    @media screen and (min-width: 1170px) {
        display: block;
        position: relative;
        width: auto;

        ul {

            flex-direction: row;

            li {
                margin-bottom: 0;
            }
        }
    }
}

button.burger {
    border: none;
    background: none;
    padding: 0;

    span {
        border-bottom: 0.3rem solid main.$font-color;
        width: 2.5rem;
        display: block;
        border-radius: 0.8rem;
    }

    margin: 0;
    z-index: 999;
    align-items: center;
    height: 2.5rem;
    width: 2.5rem;
    min-width: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 100ms ease-in-out;
    margin-bottom: 1rem;

    &.toggle {

        transform: rotate(180deg);
        z-index: 999;


        span:nth-child(1) {
            transform: rotate(45deg) translateX(4px);
            transform-origin: top left;
        }

        span:nth-child(2) {
            opacity: 0;
        }

        span:nth-child(3) {
            transform: rotate(-45deg) translateX(4px);
            transform-origin: bottom left;
        }

    }

    @media screen and (min-width: 1170px) {
        display: none;
    }
}


</style>