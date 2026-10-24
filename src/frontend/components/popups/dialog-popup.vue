<template>
    <div class="popup-overlay" id="dialog-popup-overlay" v-if="isOpen" v-on:click="closeDialog(null)"></div>
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
            <button v-for="(buttonText, buttonIndex) in buttons" v-on:click="closeDialog(buttonIndex)">
                {{ buttonText }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';
import { registerPopupCloseHandle, unregisterPopupCloseHandle } from '../../popup-close-bus';

const isOpen = ref(false);
const title = ref('');
const message = ref('');
const buttons = ref<string[]>([]);

registerPopupCloseHandle(() => closeDialog(null));

let promiseResolver: ((buttonIndex: number | null) => void) | null = null;

function openDialog(options: {
    title: string,
    message: string,
    buttons: string[],
    callback?: (buttonIndex?: number) => void,
}): Promise<number | null> {
    isOpen.value = true;
    registerPopupCloseHandle(cancel);
    title.value = options.title;
    message.value = options.message;
    buttons.value = options.buttons;

    // focus first button after opening the popup.
    nextTick(() => {
        const firstButton = document.querySelector("#dialog-popup .popup-buttons button") as HTMLButtonElement;
        if (firstButton) {
            // focusVisible tells the browser to display the focus ring as if the element was focused via keyboard navigation.
            firstButton.focus({ focusVisible: true });
        }
    });

    return new Promise<number | null>((resolve) => {
        promiseResolver = resolve;
    });
}

onBeforeUnmount(() => {
    unregisterPopupCloseHandle(close)
})

function closeDialog(buttonIndex: number | null) {
    isOpen.value = false;
    unregisterPopupCloseHandle(cancel);
    if (promiseResolver) {
        promiseResolver(buttonIndex);
        promiseResolver = null;
    }
}

function cancel() {
    closeDialog(null);
}

defineExpose({
    openDialog
})

</script>

<style scoped></style>