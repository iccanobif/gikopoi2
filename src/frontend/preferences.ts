import type { GikopoipoiPreferences } from './types'

export function loadPreferencesFromLocalStorage(): GikopoipoiPreferences
{
    return {
        bubbleOpacity: parseInt(localStorage.getItem('bubbleOpacity') || '100'),
        customMentionSoundPattern: localStorage.getItem('customMentionSoundPattern') || '',
        displayAdvancedStreamSettings: localStorage.getItem('displayAdvancedStreamSettings') == 'true',
        enableTextToSpeech: localStorage.getItem('enableTextToSpeech') != 'false',
        isBubbleSectionVisible: localStorage.getItem('isBubbleSectionVisible') != 'false',
        isCoinSoundEnabled: localStorage.getItem('isCoinSoundEnabled') != 'false',
        isCommandSectionVisible: localStorage.getItem('isCommandSectionVisible') != 'false',
        isCrispModeEnabled: localStorage.getItem('isCrispModeEnabled') == 'true',
        isIdleAnimationDisabled: localStorage.getItem('isIdleAnimationDisabled') == 'true',
        isInfoboxVisible: localStorage.getItem('isInfoboxVisible') == 'true',
        isIgnoreOnBlock: localStorage.getItem('isIgnoreOnBlock') == 'true',
        isLoginSoundEnabled: localStorage.getItem('isLoginSoundEnabled') != 'false',
        isLogoutButtonVisible: localStorage.getItem('isLogoutButtonVisible') != 'false',
        isLowQualityEnabled: localStorage.getItem('isLowQualityEnabled') == 'true',
        isMessageSoundEnabled: localStorage.getItem('isMessageSoundEnabled') != 'false',
        isMoveSectionVisible: localStorage.getItem('isMoveSectionVisible') != 'false',
        isNameMentionSoundEnabled: localStorage.getItem('isNameMentionSoundEnabled') == 'true',
        isNewlineOnShiftEnter: localStorage.getItem('isNewlineOnShiftEnter') != 'false',
        isStreamAutoResumeEnabled: localStorage.getItem('isStreamAutoResumeEnabled') != 'false',
        isStreamInboundVuMeterEnabled: localStorage.getItem('isStreamInboundVuMeterEnabled') != 'false',
        language: localStorage.getItem('language') || 'en',
        showIgnoreIndicatorInLog: localStorage.getItem('showIgnoreIndicatorInLog') == 'true',
        showLogAboveToolbar: localStorage.getItem('showLogAboveToolbar') == 'true',
        showLogDividers: localStorage.getItem('showLogDividers') == 'true',
        showNotifications: localStorage.getItem('showNotifications') != 'false',
        showUsernameBackground: localStorage.getItem('showUsernameBackground') != 'false',
        streamAutoGain: localStorage.getItem('streamAutoGain') == 'true',
        streamEchoCancellation: localStorage.getItem('streamEchoCancellation') == 'true',
        streamMode: (localStorage.getItem('streamMode') || 'video_sound') as 'video_sound' | 'sound' | 'video',
        streamNoiseSuppression: localStorage.getItem('streamNoiseSuppression') == 'true',
        streamScreenCapture: localStorage.getItem('streamScreenCapture') == 'true',
        streamScreenCaptureAudio: localStorage.getItem('streamScreenCaptureAudio') == 'true',
        timestampsInCopiedLog: localStorage.getItem('timestampsInCopiedLog') != 'false',
        ttsVoiceURI: localStorage.getItem('ttsVoiceURI') || 'automatic',
        uiTheme: localStorage.getItem('uiTheme') || 'gikopoi',
        underlinedUsernames: localStorage.getItem('underlinedUsernames') == 'true',
        voiceVolume: parseInt(localStorage.getItem('voiceVolume') || '0'),
    }
}

export function setAndPersist<K extends keyof GikopoipoiPreferences>(preferences: GikopoipoiPreferences, key: K, value: GikopoipoiPreferences[K])
{
    preferences[key] = value

    // stringify if the value is an object
    if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value))
    } else {
        localStorage.setItem(key, String(value))
    }
}