<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="emit('close')"></div>
    <fieldset id="stream-popup" class="popup" v-if="isOpen" :disabled="waitingForDevicePermission">
        <div class="popup-titlebar">
            <div class="popup-title">{{ $t("ui.stream_form_title") }}</div>
        </div>
        <div class="popup-content">
            <div class="popup-item">
                <span>{{ $t("ui.stream_form_mode") }}</span><input
                    id="stream-form-video-sound-mode"
                    type="radio"
                    value="video_sound"
                    :checked="streamMode === 'video_sound'"
                    v-on:change="onFieldChange('streamMode', 'video_sound')"><label
                    for="stream-form-video-sound-mode">{{ $t("ui.stream_form_video_sound_mode") }}</label>

                <input
                    id="stream-form-sound-only-mode"
                    type="radio"
                    value="sound"
                    :checked="streamMode === 'sound'"
                    v-on:change="onFieldChange('streamMode', 'sound')"><label
                    for="stream-form-sound-only-mode">{{ $t("ui.stream_form_sound_only_mode") }}</label>

                <input
                    id="stream-form-video-only-mode"
                    type="radio"
                    value="video"
                    :checked="streamMode === 'video'"
                    v-on:change="onFieldChange('streamMode', 'video')"><label
                    for="stream-form-video-only-mode">{{ $t("ui.stream_form_video_only_mode") }}</label>
            </div>
            <div class="popup-item" v-if="streamMode != 'sound'">
                <input
                    id="stream-form-screen-capture"
                    type="checkbox"
                    :checked="streamScreenCapture"
                    v-on:change="onCheckboxChange('streamScreenCapture', $event)"><label
                    for="stream-form-screen-capture">{{ $t("ui.stream_form_screen_capture") }}</label>
            </div>
            <div class="popup-item">
                <span>{{ $t("ui.stream_form_stream_target") }}</span>

                <input
                    id="stream-form-visible-to-all-room"
                    type="radio"
                    value="all_room"
                    :checked="streamTarget === 'all_room'"
                    v-on:change="onFieldChange('streamTarget', 'all_room')"><label
                    for="stream-form-visible-to-all-room">{{ $t("ui.stream_form_visible_to_all_room") }}</label>

                <input
                    id="stream-form-visible-only-to-specific-users"
                    type="radio"
                    value="specific_users"
                    :checked="streamTarget === 'specific_users'"
                    v-on:change="onFieldChange('streamTarget', 'specific_users')"><label
                    for="stream-form-visible-only-to-specific-users">{{ $t("ui.stream_form_visible_only_to_specific_users") }}</label>
            </div>
            <div class="popup-item" v-if="streamMode == 'video_sound' || streamMode == 'video'">
                <input
                    id="stream-form-vtuber-mode"
                    type="checkbox"
                    :checked="streamIsVtuberMode"
                    v-on:change="onCheckboxChange('streamIsVtuberMode', $event)"><label
                    for="stream-form-vtuber-mode">{{ $t("ui.stream_form_vtuber_mode") }}</label>
            </div>
            <div class="popup-item" v-if="streamMode == 'video_sound' || streamMode == 'video'">
                <input
                    id="stream-form-niconico-mode"
                    type="checkbox"
                    :checked="isNicoNicoMode"
                    v-on:change="onCheckboxChange('isNicoNicoMode', $event)"><label
                    for="stream-form-niconico-mode">{{ $t("ui.stream_form_niconico_mode") }}</label>
            </div>
            <div v-if="streamMode != 'video'">
                <div class="popup-item">
                    <button
                        v-if="!displayAdvancedStreamSettings"
                        v-on:click="emit('set-pref', 'displayAdvancedStreamSettings', true)">{{ $t("ui.stream_form_show_advanced") }}</button>
                    <button
                        v-if="displayAdvancedStreamSettings"
                        v-on:click="emit('set-pref', 'displayAdvancedStreamSettings', false)">{{ $t("ui.stream_form_hide_advanced") }}</button>
                </div>
                <div v-if="displayAdvancedStreamSettings">
                    <div class="popup-item" v-if="streamMode != 'sound' && streamScreenCapture">
                        <div>
                            <input
                                id="stream-form-screen-capture-audio"
                                type="checkbox"
                                :checked="streamScreenCaptureAudio"
                                v-on:change="onCheckboxChange('streamScreenCaptureAudio', $event)"><label
                                for="stream-form-screen-capture-audio">{{ $t("ui.stream_form_screen_capture_audio") }}</label>
                        </div>
                        <div class="popup-notice">{{ $t("ui.stream_form_screen_capture_audio_notice") }}</div>
                    </div>
                    <div class="popup-item" v-if="!streamScreenCapture || !(streamScreenCaptureAudio && streamMode == 'video_sound')">
                        <div>
                            <input
                                id="stream-form-echo-cancellation"
                                type="checkbox"
                                :checked="streamEchoCancellation"
                                v-on:change="onCheckboxChange('streamEchoCancellation', $event)"><label
                                for="stream-form-echo-cancellation">{{ $t("ui.stream_form_echo_cancellation") }}</label>
                        </div>
                        <div>
                            <input
                                id="stream-form-noise-suppression"
                                type="checkbox"
                                :checked="streamNoiseSuppression"
                                v-on:change="onCheckboxChange('streamNoiseSuppression', $event)"><label
                                for="stream-form-noise-suppression">{{ $t("ui.stream_form_noise_suppression") }}</label>
                        </div>
                        <div>
                            <input
                                id="stream-form-auto-gain"
                                type="checkbox"
                                :checked="streamAutoGain"
                                v-on:change="onCheckboxChange('streamAutoGain', $event)"><label
                                for="stream-form-auto-gain">{{ $t("ui.stream_form_auto_gain") }}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="popup-buttons">
            <button v-on:click="emit('start')">{{ $t("ui.stream_form_button_stream") }}</button><button
                v-on:click="emit('close')">{{ $t("ui.popup_button_cancel") }}</button>
        </div>
    </fieldset>
</template>

<script setup lang="ts">
type StreamMode = 'video_sound' | 'sound' | 'video'
type StreamTarget = 'all_room' | 'specific_users'
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
    isOpen: boolean,
    waitingForDevicePermission: boolean,
    streamMode: StreamMode,
    streamScreenCapture: boolean,
    streamTarget: StreamTarget,
    streamIsVtuberMode: boolean,
    isNicoNicoMode: boolean,
    displayAdvancedStreamSettings: boolean,
    streamScreenCaptureAudio: boolean,
    streamEchoCancellation: boolean,
    streamNoiseSuppression: boolean,
    streamAutoGain: boolean,
}>()

const emit = defineEmits<{
    close: [],
    start: [],
    'set-pref': [field: StreamField, value: string | boolean],
}>()

function onFieldChange(field: StreamField, value: string | boolean)
{
    emit('set-pref', field, value)
}

function onCheckboxChange(field: StreamField, event: Event)
{
    const target = event.target as HTMLInputElement
    emit('set-pref', field, target.checked)
}
</script>

<style scoped>
</style>
