<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="cancel()"></div>
    <fieldset class="popup" v-if="isOpen">
        <div class="popup-titlebar">
            <div class="popup-title">{{ $t("ui.device_selection_title") }}</div>
        </div>
        <div class="popup-content">
            <div class="popup-section" v-if="audioDevices.length">
                <div class="popup-header">{{ $t("ui.device_selection_audio_devices") }}</div>
                <div class="popup-item" v-for="device in audioDevices" :key="device.id">
                    <input type="radio" name="audio-device" :id="device.id" :value="device.id"
                        v-model="deviceSelection.selectedAudioDeviceId"><label :for="device.id">{{ device.name
                        }}</label>
                </div>
            </div>
            <div class="popup-section" v-if="videoDevices.length">
                <div class="popup-header">{{ $t("ui.device_selection_video_devices") }}</div>
                <div class="popup-item" v-for="device in videoDevices" :key="device.id">
                    <input type="radio" name="video-device" :id="device.id" :value="device.id"
                        v-model="deviceSelection.selectedVideoDeviceId"><label :for="device.id">{{ device.name
                        }}</label>
                </div>
            </div>
        </div>
        <div class="popup-buttons">
            <button v-on:click="confirm()" ref="confirmButton">{{ $t("ui.stream_form_button_stream") }}</button>
            <button v-on:click="cancel()">{{ $t("ui.popup_button_cancel") }}</button>
        </div>
    </fieldset>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import type { DeviceInfo, DeviceSelection, GikopoipoiPreferences } from '../../types'
import { showAlert } from '../../utils';
import i18next from 'i18next';
import { registerPopupCloseHandle, unregisterPopupCloseHandle } from '../../popup-close-bus';

const props = defineProps<{
    preferences: GikopoipoiPreferences
}>()

defineExpose({
    openPopup
})

const isOpen = ref(false);
const deviceList = ref<DeviceInfo[]>([]);
const deviceSelection = ref<DeviceSelection>(getDefaultDeviceSelection());

const confirmButton = useTemplateRef<HTMLButtonElement>("confirmButton");

const audioDevices = computed(() => deviceList.value.filter(d => d.type == 'audioinput'))
const videoDevices = computed(() => deviceList.value.filter(d => d.type == 'videoinput'))

let promiseResolver: ((value: DeviceSelection | null) => void) | null = null

function getDefaultDeviceSelection(): DeviceSelection {
    return {
        selectedAudioDeviceId: props.preferences.selectedAudioDeviceId,
        selectedVideoDeviceId: props.preferences.selectedVideoDeviceId,
    }
}

function openPopup(deviceListParam: DeviceInfo[]): Promise<DeviceSelection | null> {
    deviceSelection.value = getDefaultDeviceSelection();
    deviceList.value = deviceListParam;

    isOpen.value = true
    registerPopupCloseHandle(cancel);

    try
    {
        // Automatically select device if there is only one of its kind
        if (audioDevices.value.length == 1)
            deviceSelection.value.selectedAudioDeviceId = audioDevices.value[0].id
        if (videoDevices.value.length == 1)
            deviceSelection.value.selectedVideoDeviceId = videoDevices.value[0].id

        // If a previously selected device isn't available anymore, clear the selection.
        // This also handles scenarios where, for example, a previous stream used a video device
        // while this new stream is only audio: in that case videoDevices will be an empty list
        // and deviceSelection.value.selectedVideoDeviceId will be correctly set to null.
        if (!audioDevices.value.find(d => d.id == deviceSelection.value.selectedAudioDeviceId))
            deviceSelection.value.selectedAudioDeviceId = null;
        if (!videoDevices.value.find(d => d.id == deviceSelection.value.selectedVideoDeviceId))
            deviceSelection.value.selectedVideoDeviceId = null;

        nextTick(() => {
            confirmButton.value?.focus({ focusVisible: true });
        });
    }
    catch (err) {
        console.error(err)
        showAlert(i18next.t("msg.error_obtaining_media"));
        cancel()
    }

    return new Promise<DeviceSelection | null>((resolve) => {
        promiseResolver = resolve
    })
}

onBeforeUnmount(() => {
    unregisterPopupCloseHandle(close)
})

function confirm() {

    // Validate device selection
    if ((props.preferences.streamMode != "sound" && !deviceSelection.value.selectedVideoDeviceId && !props.preferences.streamScreenCapture)
        || (props.preferences.streamMode != "video" && !deviceSelection.value.selectedAudioDeviceId && !props.preferences.streamScreenCaptureAudio)) {
        showAlert(i18next.t("msg.error_didnt_select_device"));
        return;
    }

    isOpen.value = false

    if (promiseResolver) {
        promiseResolver(deviceSelection.value)
        promiseResolver = null
    }
}

function cancel() {
    unregisterPopupCloseHandle(cancel);

    isOpen.value = false
    if (promiseResolver) {
        promiseResolver(null)
        promiseResolver = null
    }
}

</script>

<style scoped></style>
