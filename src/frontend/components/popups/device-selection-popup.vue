<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="emit('close')"></div>
    <fieldset class="popup" v-if="isOpen" :disabled="waitingForDevicePermission">
        <div class="popup-titlebar">
            <div class="popup-title">{{ $t("ui.device_selection_title") }}</div>
        </div>
        <div class="popup-content">
            <div class="popup-section" v-if="audioDevices.length">
                <div class="popup-header">{{ $t("ui.device_selection_audio_devices") }}</div>
                <div class="popup-item" v-for="device in audioDevices" :key="device.id">
                    <input
                        type="radio"
                        :id="device.id"
                        :value="device.id"
                        :checked="selectedAudioDeviceId === device.id"
                        v-on:change="emit('set-audio-device', device.id)"><label
                        :for="device.id">{{ device.name }}</label>
                </div>
            </div>
            <div class="popup-section" v-if="videoDevices.length">
                <div class="popup-header">{{ $t("ui.device_selection_video_devices") }}</div>
                <div class="popup-item" v-for="device in videoDevices" :key="device.id">
                    <input
                        type="radio"
                        :id="device.id"
                        :value="device.id"
                        :checked="selectedVideoDeviceId === device.id"
                        v-on:change="emit('set-video-device', device.id)"><label
                        :for="device.id">{{ device.name }}</label>
                </div>
            </div>
        </div>
        <div class="popup-buttons">
            <button v-on:click="emit('start')">{{ $t("ui.stream_form_button_stream") }}</button>
            <button v-on:click="emit('close')">{{ $t("ui.popup_button_cancel") }}</button>
        </div>
    </fieldset>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DeviceInfo } from '../../types'

const props = defineProps<{
    isOpen: boolean,
    waitingForDevicePermission: boolean,
    deviceList: DeviceInfo[],
    selectedAudioDeviceId: string | null,
    selectedVideoDeviceId: string | null,
}>()

const emit = defineEmits<{
    close: [],
    start: [],
    'set-audio-device': [deviceId: string],
    'set-video-device': [deviceId: string],
}>()

const audioDevices = computed(() => props.deviceList.filter(d => d.type == 'audioinput'))
const videoDevices = computed(() => props.deviceList.filter(d => d.type == 'videoinput'))
</script>

<style scoped>
</style>
