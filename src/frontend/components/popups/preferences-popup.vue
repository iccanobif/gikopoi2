<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="emit('close')"></div>
    <div class="popup" v-if="isOpen">
        <div class="popup-titlebar">
            <div class="popup-title">{{ $t("ui.preferences_title") }}</div>
        </div>
        <div class="popup-content">
            <div class="popup-section">
                <div class="popup-header">{{ $t("ui.preferences_title_general") }}</div>
                <div class="popup-item">
                    <label for="preferences-ui-theme">{{ $t("ui.preferences_ui_theme") }}</label>
                    <select id="preferences-ui-theme" :value="preferences.uiTheme" v-on:change="onSelectChange('uiTheme', $event, 'ui-theme-changed')">
                        <option value="gikopoi">{{ $t("ui.preferences_ui_theme_gikopoi") }}</option>
                        <option value="shaddox">{{ $t("ui.preferences_ui_theme_shaddox") }}</option>
                        <option value="dark">{{ $t("ui.preferences_ui_theme_dark") }}</option>
                    </select>
                </div>
                <div class="popup-item" v-if="!siteLanguageRestricted">
                    <label for="preferences-language">{{ $t("ui.preferences_language") }}</label>
                    <select id="preferences-language" :value="preferences.language" v-on:change="onSelectChange('language', $event, 'language-changed')">
                        <template v-for="lang in langEntries" :key="lang.id">
                            <option :value="lang.id">{{ lang.name }}</option>
                            <option disabled v-if="lang.endOfTopEntries">---</option>
                        </template>
                    </select>
                </div>
            </div>
            <div class="popup-section">
                <div class="popup-header">{{ $t("ui.preferences_title_tts") }}</div>
                <div class="popup-item">
                    <input
                        id="preferences-text-to-speech"
                        type="checkbox"
                        :checked="preferences.enableTextToSpeech"
                        v-on:change="onCheckboxChange('enableTextToSpeech', $event, 'enable-tts-changed')"><label
                        for="preferences-text-to-speech">{{ $t("ui.preferences_enable_text_to_speech") }}</label>
                </div>
                <div class="popup-item">
                    <label for="preferences-tts-voice">{{ $t("ui.preferences_tts_voice") }}</label>
                    <select id="preferences-tts-voice" :value="preferences.ttsVoiceURI" v-on:change="onSelectChange('ttsVoiceURI', $event, 'tts-voice-changed')">
                        <option value="automatic">{{ $t("ui.preferences_tts_voice_automatic") }}</option>
                        <option value="animalese">{{ $t("ui.preferences_tts_voice_animalese") }}</option>
                        <option v-for="voice in availableTTSVoices" :key="voice.voiceURI" :value="voice.voiceURI">{{ voice.name }}</option>
                    </select>
                </div>
            </div>
            <div class="popup-section">
                <div class="popup-header">{{ $t("ui.preferences_title_chat") }}</div>
                <div class="popup-item">
                    <input
                        id="preferences-shift-enter"
                        type="checkbox"
                        :checked="preferences.isNewlineOnShiftEnter"
                        v-on:change="onCheckboxChange('isNewlineOnShiftEnter', $event)"><label
                        for="preferences-shift-enter">{{ $t("ui.preferences_shift_enter") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-underlined-usernames"
                        type="checkbox"
                        :checked="preferences.underlinedUsernames"
                        v-on:change="onCheckboxChange('underlinedUsernames', $event)"><label
                        for="preferences-underlined-usernames">{{ $t("ui.preferences_underlined_usernames") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-timestamps-in-copied-log"
                        type="checkbox"
                        :checked="preferences.timestampsInCopiedLog"
                        v-on:change="onCheckboxChange('timestampsInCopiedLog', $event)"><label
                        for="preferences-timestamps-in-copied-log">{{ $t("ui.preferences_timestamps_in_copied_log") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-ignore-indicator-in-log"
                        type="checkbox"
                        :checked="preferences.showIgnoreIndicatorInLog"
                        v-on:change="onCheckboxChange('showIgnoreIndicatorInLog', $event)"><label
                        for="preferences-ignore-indicator-in-log">{{ $t("ui.preferences_ignore_indicator_in_log") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-ignore-on-block"
                        type="checkbox"
                        :checked="preferences.isIgnoreOnBlock"
                        v-on:change="onCheckboxChange('isIgnoreOnBlock', $event)"><label
                        for="preferences-ignore-on-block">{{ $t("ui.preferences_ignore_on_block") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-show-log-above-toolbar"
                        type="checkbox"
                        :checked="preferences.showLogAboveToolbar"
                        v-on:change="onCheckboxChange('showLogAboveToolbar', $event)"><label
                        for="preferences-show-log-above-toolbar">{{ $t("ui.preferences_show_log_above_toolbar") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-show-log-dividers"
                        type="checkbox"
                        :checked="preferences.showLogDividers"
                        v-on:change="onCheckboxChange('showLogDividers', $event)"><label
                        for="preferences-show-log-dividers">{{ $t("ui.preferences_show_log_dividers") }}</label>
                </div>
                <div class="popup-item">
                    <button v-on:click="emit('clear-log')">{{ $t("ui.preferences_clear_log") }}</button>
                </div>
            </div>
            <div class="popup-section">
                <div class="popup-header">{{ $t("ui.preferences_title_notifications") }}</div>
                <div class="popup-item">
                    <div>
                        <input
                            id="preferences-show-notifications"
                            type="checkbox"
                                :checked="preferences.showNotifications"
                            v-on:change="onCheckboxChange('showNotifications', $event, 'notifications-changed')"><label
                            for="preferences-show-notifications">{{ $t("ui.preferences_show_notifications") }}</label>
                    </div>
                    <div v-if="!notificationPermissionsGranted" class="popup-notice">{{ $t("ui.notifications_are_denied") }}</div>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-login-sound-enabled"
                        type="checkbox"
                        :checked="preferences.isLoginSoundEnabled"
                        v-on:change="onCheckboxChange('isLoginSoundEnabled', $event)"><label
                        for="preferences-login-sound-enabled">{{ $t("ui.preferences_login_sound_enabled") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-message-sound-enabled"
                        type="checkbox"
                        :checked="preferences.isMessageSoundEnabled"
                        v-on:change="onCheckboxChange('isMessageSoundEnabled', $event)"><label
                        for="preferences-message-sound-enabled">{{ $t("ui.preferences_message_sound_enabled") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="enable-coin-sound"
                        type="checkbox"
                        :checked="preferences.isCoinSoundEnabled"
                        v-on:change="onCheckboxChange('isCoinSoundEnabled', $event, 'coin-sound-toggled')"><label
                        for="enable-coin-sound">{{ $t("ui.preferences_enable_coin_sound") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-name-mention-sound-enabled"
                        type="checkbox"
                        :checked="preferences.isNameMentionSoundEnabled"
                        v-on:change="onCheckboxChange('isNameMentionSoundEnabled', $event, 'mention-sound-changed')"><label
                        for="preferences-name-mention-sound-enabled">{{ $t("ui.preferences_name_mention_sound_enabled") }}</label>
                </div>
                <div class="popup-item">
                    <div>
                        <label for="preferences-custom-mention-sound-pattern">{{ $t("ui.preferences_custom_mention_sound_pattern") }}</label>
                        <input
                            id="preferences-custom-mention-sound-pattern"
                            type="text"
                                :value="preferences.customMentionSoundPattern"
                            v-on:change="onTextChange('customMentionSoundPattern', $event, 'mention-pattern-changed')">
                    </div>
                    <div class="popup-notice">{{ $t("ui.preferences_custom_mention_sound_notice") }}</div>
                </div>
            </div>
            <div class="popup-section">
                <div class="popup-header">{{ $t("ui.preferences_title_game") }}</div>
                <div class="popup-item">
                    <input
                        id="preferences-name-bg"
                        type="checkbox"
                        :checked="preferences.showUsernameBackground"
                        v-on:change="onCheckboxChange('showUsernameBackground', $event, 'username-background-toggled')"><label
                        for="preferences-name-bg">{{ $t("ui.preferences_name_bg") }}</label>
                </div>
                <div class="popup-item">
                    <label for="preferences-bubble-opacity">{{ $t("ui.preferences_bubble_opacity") }}</label>
                    <input
                        id="preferences-bubble-opacity"
                        type="range"
                        min="50"
                        max="100"
                        :value="preferences.bubbleOpacity"
                        v-on:change="onRangeChange('bubbleOpacity', $event, 'bubble-opacity-changed')"><div
                        class="preferences-percentage">{{ preferences.bubbleOpacity }}%</div>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-crisp-mode"
                        type="checkbox"
                        :checked="preferences.isCrispModeEnabled"
                        v-on:change="onCheckboxChange('isCrispModeEnabled', $event, 'crisp-mode-changed')"><label
                        for="preferences-crisp-mode">{{ $t("ui.preferences_crisp_mode") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-low-quality"
                        type="checkbox"
                        :checked="preferences.isLowQualityEnabled"
                        v-on:change="onCheckboxChange('isLowQualityEnabled', $event, 'low-quality-changed')"><label
                        for="preferences-low-quality">{{ $t("ui.preferences_low_quality") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-disable-idle-animations"
                        type="checkbox"
                        :checked="preferences.isIdleAnimationDisabled"
                        v-on:change="onCheckboxChange('isIdleAnimationDisabled', $event, 'idle-animation-changed')"><label
                        for="preferences-disable-idle-animations">{{ $t("ui.preferences_disable_idle_animations") }}</label>
                </div>
            </div>
            <div class="popup-section">
                <div class="popup-header">{{ $t("ui.preferences_title_streams") }}</div>
                <div class="popup-item">
                    <input
                        id="preferences-streams-auto-resume"
                        type="checkbox"
                        :checked="preferences.isStreamAutoResumeEnabled"
                        v-on:change="onCheckboxChange('isStreamAutoResumeEnabled', $event)"><label
                        for="preferences-streams-auto-resume">{{ $t("ui.preferences_streams_auto_resume") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-streams-inbound-vu-meter-enabled"
                        type="checkbox"
                        :checked="preferences.isStreamInboundVuMeterEnabled"
                        v-on:change="onCheckboxChange('isStreamInboundVuMeterEnabled', $event)"><label
                        for="preferences-streams-inbound-vu-meter-enabled">{{ $t("ui.preferences_streams_inbound_vu_meter_enabled") }}</label>
                </div>
            </div>
            <div class="popup-section">
                <div class="popup-header">{{ $t("ui.preferences_title_toolbar") }}</div>
                <div class="popup-item">
                    <input
                        id="preferences-command-section-visible"
                        type="checkbox"
                        :checked="preferences.isCommandSectionVisible"
                        v-on:change="onCheckboxChange('isCommandSectionVisible', $event)"><label
                        for="preferences-command-section-visible">{{ $t("ui.preferences_command_section_visible") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-move-section-visible"
                        type="checkbox"
                        :checked="preferences.isMoveSectionVisible"
                        v-on:change="onCheckboxChange('isMoveSectionVisible', $event)"><label
                        for="preferences-move-section-visible">{{ $t("ui.preferences_move_section_visible") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-bubble-section-visible"
                        type="checkbox"
                        :checked="preferences.isBubbleSectionVisible"
                        v-on:change="onCheckboxChange('isBubbleSectionVisible', $event)"><label
                        for="preferences-bubble-section-visible">{{ $t("ui.preferences_bubble_section_visible") }}</label>
                </div>
                <div class="popup-item">
                    <input
                        id="preferences-logout-button-visible"
                        type="checkbox"
                        :checked="preferences.isLogoutButtonVisible"
                        v-on:change="onCheckboxChange('isLogoutButtonVisible', $event)"><label
                        for="preferences-logout-button-visible">{{ $t("ui.preferences_logout_button_visible") }}</label>
                </div>
            </div>
        </div>
        <div class="popup-buttons">
            <button v-on:click="emit('close')">{{ $t("ui.popup_button_ok") }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { GikopoipoiPreferences } from '../../types'

interface LangEntry {
    id: string
    name: string
    endOfTopEntries: boolean
}

type PreferenceField = keyof GikopoipoiPreferences

const props = defineProps<{
    isOpen: boolean,
    siteLanguageRestricted: boolean,
    preferences: GikopoipoiPreferences,
    langEntries: LangEntry[],
    availableTTSVoices: SpeechSynthesisVoice[],
    notificationPermissionsGranted: boolean,
}>()

const emit = defineEmits<{
    close: [],
    'set-pref': [field: PreferenceField, value: string | number | boolean],
    'ui-theme-changed': [],
    'language-changed': [],
    'enable-tts-changed': [],
    'tts-voice-changed': [],
    'clear-log': [],
    'notifications-changed': [],
    'coin-sound-toggled': [],
    'mention-sound-changed': [],
    'mention-pattern-changed': [],
    'username-background-toggled': [],
    'bubble-opacity-changed': [],
    'crisp-mode-changed': [],
    'low-quality-changed': [],
    'idle-animation-changed': [],
}>()

type ActionEvent =
    | 'ui-theme-changed'
    | 'language-changed'
    | 'enable-tts-changed'
    | 'tts-voice-changed'
    | 'notifications-changed'
    | 'coin-sound-toggled'
    | 'mention-sound-changed'
    | 'mention-pattern-changed'
    | 'username-background-toggled'
    | 'bubble-opacity-changed'
    | 'crisp-mode-changed'
    | 'low-quality-changed'
    | 'idle-animation-changed'

function emitOptionalAction(actionEvent?: ActionEvent)
{
    if (actionEvent)
        emit(actionEvent)
}

function onCheckboxChange(field: PreferenceField, event: Event, actionEvent?: ActionEvent)
{
    const target = event.target as HTMLInputElement
    emit('set-pref', field, target.checked)
    emitOptionalAction(actionEvent)
}

function onTextChange(field: PreferenceField, event: Event, actionEvent?: ActionEvent)
{
    const target = event.target as HTMLInputElement
    emit('set-pref', field, target.value)
    emitOptionalAction(actionEvent)
}

function onRangeChange(field: PreferenceField, event: Event, actionEvent?: ActionEvent)
{
    const target = event.target as HTMLInputElement
    emit('set-pref', field, Number(target.value))
    emitOptionalAction(actionEvent)
}

function onSelectChange(field: PreferenceField, event: Event, actionEvent?: ActionEvent)
{
    const target = event.target as HTMLSelectElement
    emit('set-pref', field, target.value)
    emitOptionalAction(actionEvent)
}
</script>

<style scoped>
</style>
