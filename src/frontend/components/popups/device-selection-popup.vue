<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="cancel()"></div>
    <fieldset class="popup" v-if="isOpen" :disabled="isWaitingForDevicePermission">
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
import { getDeviceList, showAlert } from '../../utils';
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
const isWaitingForDevicePermission = ref(false);

const confirmButton = useTemplateRef<HTMLButtonElement>("confirmButton");

const audioDevices = computed(() => deviceList.value.filter(d => d.type == 'audioinput'))
const videoDevices = computed(() => deviceList.value.filter(d => d.type == 'videoinput'))

let promiseResolver: ((value: DeviceSelection | null) => void) | null = null

function getDefaultDeviceSelection(): DeviceSelection {
    // TODO: Remember device selection through local storage.
    return {
        selectedAudioDeviceId: null,
        selectedVideoDeviceId: null,
    }
}

function openPopup(): Promise<DeviceSelection | null> {
    deviceSelection.value = getDefaultDeviceSelection();

    isOpen.value = true
    registerPopupCloseHandle(cancel);

    loadDeviceList(); // Launch asynchronously without await


    return new Promise<DeviceSelection | null>((resolve) => {
        promiseResolver = resolve
    })
}

onBeforeUnmount(() => {
    unregisterPopupCloseHandle(close)
})

async function loadDeviceList() {
    try
    {
        const withVideo = props.preferences.streamMode != "sound" && !props.preferences.streamScreenCapture;
        const withSound = props.preferences.streamMode == "sound"
            || (props.preferences.streamMode == "video_sound" && !(props.preferences.streamScreenCapture && props.preferences.streamScreenCaptureAudio));

        isWaitingForDevicePermission.value = true;
        deviceList.value = await getDeviceList(withSound, withVideo)
        isWaitingForDevicePermission.value = false;

        // Automatically select device if there is only one of its kind
        // const audioDevices = deviceList.value.filter(d => d.type == "audioinput")
        // const videoDevices = deviceList.value.filter(d => d.type == "videoinput")
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
        isWaitingForDevicePermission.value = false;
        cancel()
    }
}

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
    // If there's a native device selection popup open, let's keep the poipoi device selection
    // open and disabled, so that the user is forced to either give permissions or deny them.
    if (isWaitingForDevicePermission.value)
        return;

    unregisterPopupCloseHandle(cancel);

    isOpen.value = false
    if (promiseResolver) {
        promiseResolver(null)
        promiseResolver = null
    }
}

/*
TODO: fix the following regressions.
- [x] A definite solution for the Escape key handling might be to have a dedicated event bus, where the event gets
      propagated only to the currently active popup, that is to say the last one who registered for the event. (a kind of stack-based approach)
- [ ] When you confirm() without selecting a device, the alert is shown but if you press Escape, not only the alert
      disappears but we go back to the outbound stream settings popup
- [ ] after confirming i always get a msg.start_stream_stream_slot_does_not_exist error
    can reproduce only if i confirm with no selected devices, hit esc and then try to confirm again (with devices selected).
- [ ] when moving from ouotbound stream settings popup to device selection, the device fetch is executed while displaying the device selection popup,
      displaying in the meanwhile an out-of-date device list. Also, the first time you open the device selection popup, the device list is empty 
      and looks very bad.
- [ ] The second time i stream, it doesn't remember the previously selected devices
*/

</script>

<style scoped></style>
