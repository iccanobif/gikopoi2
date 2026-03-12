<template>
    <div
        class="popup-overlay"
        id="dialog-popup-overlay"
        v-if="isOpen"
        v-on:click="emit('close')"></div>
    <div class="popup" id="dialog-popup" v-if="isOpen">
        <div class="popup-titlebar" v-if="title">
            <div class="popup-title">{{ title }}</div>
        </div>
        <div class="popup-content">
            <div class="popup-item">
                {{ message }}
            </div>
        </div>
        <div class="popup-buttons">
            <button
                v-for="(buttonText, buttonIndex) in buttons"
                v-on:click="emit('close', buttonIndex)">{{ buttonText }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    isOpen: boolean,
    title: string,
    message: string,
    buttons: string[],
}>()

const emit = defineEmits<{
    close: [buttonIndex?: number],
}>()
</script>

<style scoped>
</style>