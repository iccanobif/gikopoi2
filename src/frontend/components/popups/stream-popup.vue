<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="cancel()"></div>
    <fieldset id="stream-popup" class="popup" v-if="isOpen" :disabled="waitingForDevicePermission">
        <div class="popup-titlebar">
            <div class="popup-title">{{ $t("ui.stream_form_title") }}</div>
        </div>
        <div class="popup-content">
            <div class="popup-item">
                <span>{{ $t("ui.stream_form_mode") }}</span><input id="stream-form-video-sound-mode" type="radio"
                    value="video_sound" v-model="outboundStreamSettings.streamMode"><label
                    for="stream-form-video-sound-mode">{{ $t("ui.stream_form_video_sound_mode") }}</label>
                <input id="stream-form-sound-only-mode" type="radio" value="sound"
                    v-model="outboundStreamSettings.streamMode"><label
                    for="stream-form-sound-only-mode">{{ $t("ui.stream_form_sound_only_mode") }}</label>
                <input id="stream-form-video-only-mode" type="radio" value="video"
                    v-model="outboundStreamSettings.streamMode"><label
                    for="stream-form-video-only-mode">{{ $t("ui.stream_form_video_only_mode") }}</label>
            </div>
            <div class="popup-item" v-if="outboundStreamSettings.streamMode != 'sound'">
                <input id="stream-form-screen-capture" type="checkbox"
                    v-model="outboundStreamSettings.streamScreenCapture"><label for="stream-form-screen-capture">{{
                        $t("ui.stream_form_screen_capture") }}</label>
            </div>
            <div class="popup-item">
                <span>{{ $t("ui.stream_form_stream_target") }}</span>
                <input id="stream-form-visible-to-all-room" type="radio" value="all_room"
                    v-model="outboundStreamSettings.streamTarget"><label
                    for="stream-form-visible-to-all-room">{{ $t("ui.stream_form_visible_to_all_room") }}</label>
                <input id="stream-form-visible-only-to-specific-users" type="radio" value="specific_users"
                    v-model="outboundStreamSettings.streamTarget"><label
                    for="stream-form-visible-only-to-specific-users">{{
                        $t("ui.stream_form_visible_only_to_specific_users") }}</label>
            </div>
            <div class="popup-item"
                v-if="outboundStreamSettings.streamMode == 'video_sound' || outboundStreamSettings.streamMode == 'video'">
                <input id="stream-form-vtuber-mode" type="checkbox"
                        v-model="outboundStreamSettings.streamIsVtuberMode"><label for="stream-form-vtuber-mode">{{
                        $t("ui.stream_form_vtuber_mode") }}</label>
            </div>
            <div class="popup-item"
                v-if="outboundStreamSettings.streamMode == 'video_sound' || outboundStreamSettings.streamMode == 'video'">
                <input id="stream-form-niconico-mode" type="checkbox"
                        v-model="outboundStreamSettings.isNicoNicoMode"><label for="stream-form-niconico-mode">{{
                        $t("ui.stream_form_niconico_mode") }}</label>
            </div>
            <div v-if="outboundStreamSettings.streamMode != 'video'">
                <div class="popup-item">
                    <button v-on:click="toggleAdvancedSettings()">
                        {{ outboundStreamSettings.displayAdvancedStreamSettings
                            ? $t("ui.stream_form_hide_advanced")
                            : $t("ui.stream_form_show_advanced") }}
                    </button>
                </div>
                <div v-if="outboundStreamSettings.displayAdvancedStreamSettings">
                    <div class="popup-item"
                        v-if="outboundStreamSettings.streamMode != 'sound' && outboundStreamSettings.streamScreenCapture">
                        <div>
                            <input id="stream-form-screen-capture-audio" type="checkbox"
                                v-model="outboundStreamSettings.streamScreenCaptureAudio"><label
                                for="stream-form-screen-capture-audio">{{ $t("ui.stream_form_screen_capture_audio")
                                }}</label>
                        </div>
                        <div class="popup-notice">{{ $t("ui.stream_form_screen_capture_audio_notice") }}</div>
                    </div>
                    <!-- hide advanced audio settings for video only streams and streams with screen capture audio -->
                    <div class="popup-item"
                        v-if="!outboundStreamSettings.streamScreenCapture || !(outboundStreamSettings.streamScreenCaptureAudio && outboundStreamSettings.streamMode == 'video_sound')">
                        <div>
                            <input id="stream-form-echo-cancellation" type="checkbox"
                                v-model="outboundStreamSettings.streamEchoCancellation"><label
                                for="stream-form-echo-cancellation">{{ $t("ui.stream_form_echo_cancellation") }}</label>
                        </div>
                        <div>
                            <input id="stream-form-noise-suppression" type="checkbox"
                                v-model="outboundStreamSettings.streamNoiseSuppression"><label
                                for="stream-form-noise-suppression">{{ $t("ui.stream_form_noise_suppression") }}</label>
                        </div>
                        <div>
                            <input id="stream-form-auto-gain" type="checkbox"
                                v-model="outboundStreamSettings.streamAutoGain"><label for="stream-form-auto-gain">{{
                                    $t("ui.stream_form_auto_gain") }}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="popup-buttons">
            <button v-on:click="confirm()">{{ $t("ui.stream_form_button_stream") }}</button><button
                v-on:click="cancel()">{{ $t("ui.popup_button_cancel") }}</button>
        </div>
    </fieldset>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { setAndPersist } from '../../preferences';
import { GikopoipoiPreferences, OutboundStreamSettings } from '../../types';
import { showAlert } from '../../utils';

type StreamField =
    | 'streamMode'
    | 'streamScreenCapture'
    | 'streamTarget'
    | 'streamIsVtuberMode'
    | 'isNicoNicoMode'
    | 'displayAdvancedStreamSettings'
    | 'streamScreenCaptureAudio'
    | 'streamEchoCancellation'
    | 'streamNoiseSuppression'
    | 'streamAutoGain'

const props = defineProps<{
    waitingForDevicePermission: boolean,
    preferences: GikopoipoiPreferences
}>()

const emit = defineEmits<{
    close: [],
    start: [],
}>()

defineExpose({
    openPopup
})

function getDefaultOutboundStreamSettings(): OutboundStreamSettings {
    return {
        displayAdvancedStreamSettings: props.preferences.displayAdvancedStreamSettings,
        streamMode: props.preferences.streamMode,
        streamScreenCapture: props.preferences.streamScreenCapture,
        streamTarget: props.preferences.streamTarget,
        streamIsVtuberMode: props.preferences.streamIsVtuberMode,
        isNicoNicoMode: props.preferences.isNicoNicoMode,
        streamScreenCaptureAudio: props.preferences.streamScreenCaptureAudio,
        streamEchoCancellation: props.preferences.streamEchoCancellation,
        streamNoiseSuppression: props.preferences.streamNoiseSuppression,
        streamAutoGain: props.preferences.streamAutoGain,
    };
}

const isOpen = ref(false);
const outboundStreamSettings = ref<OutboundStreamSettings>(getDefaultOutboundStreamSettings());

let promiseResolver: ((settings: OutboundStreamSettings | null) => void) | null = null;

function openPopup(): Promise<OutboundStreamSettings | null> {
    if (!window.RTCPeerConnection) {
        showAlert("msg.no_webrtc");
        return Promise.resolve(null);
    }

    outboundStreamSettings.value = getDefaultOutboundStreamSettings();

    isOpen.value = true;

    return new Promise<OutboundStreamSettings | null>((resolve) => {
        promiseResolver = resolve;
    });
}

function cancel() {
    // TODO: i guess i need a global store for waitingForDevicePermission (pinia?)

    // If there's a native device selection popup open, let's keep the poipoi device selection
    // open and disabled, so that the user is forced to either give permissions or deny them.
    if (props.waitingForDevicePermission)
        return

    isOpen.value = false;

    if (promiseResolver) {
        promiseResolver(null);
        promiseResolver = null;
    }
}

function confirm() {
    isOpen.value = false;

    if (promiseResolver) {
        promiseResolver(outboundStreamSettings.value);
        promiseResolver = null;
    }
}

function handleKeydown(ev: KeyboardEvent) {
    if (ev.code === "Escape" && isOpen.value) {
        // If we let the event propagate, other dialogs would also close.
        ev.stopPropagation();
        cancel();
    }
}

onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
});

function toggleAdvancedSettings() {
    outboundStreamSettings.value.displayAdvancedStreamSettings = !outboundStreamSettings.value.displayAdvancedStreamSettings;
}

</script>

<style scoped></style>
