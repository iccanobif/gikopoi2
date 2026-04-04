import type { GikopoipoiPreferences, RulaRoomListSortKey, StreamMode, StreamTarget } from "./types"

export function loadPreferencesFromLocalStorage(): GikopoipoiPreferences
{
    return {
        bubbleOpacity: getNumberPreference("bubbleOpacity", 100),
        canvasHeight: localStorage.getItem("canvasHeight"),
        customMentionSoundPattern: getStringPreference("customMentionSoundPattern", ""),
        displayAdvancedStreamSettings: getBooleanPreference("displayAdvancedStreamSettings", false),
        enableTextToSpeech: getBooleanPreference("enableTextToSpeech", true),
        isBubbleSectionVisible: getBooleanPreference("isBubbleSectionVisible", true),
        isCoinSoundEnabled: getBooleanPreference("isCoinSoundEnabled", true),
        isCommandSectionVisible: getBooleanPreference("isCommandSectionVisible", true),
        isCrispModeEnabled: getBooleanPreference("isCrispModeEnabled", false),
        isIdleAnimationDisabled: getBooleanPreference("isIdleAnimationDisabled", false),
        isInfoboxVisible: getBooleanPreference("isInfoboxVisible", false),
        isIgnoreOnBlock: getBooleanPreference("isIgnoreOnBlock", false),
        isLoginSoundEnabled: getBooleanPreference("isLoginSoundEnabled", true),
        isLogoutButtonVisible: getBooleanPreference("isLogoutButtonVisible", true),
        isLowQualityEnabled: getBooleanPreference("isLowQualityEnabled", false),
        isMessageSoundEnabled: getBooleanPreference("isMessageSoundEnabled", true),
        isMoveSectionVisible: getBooleanPreference("isMoveSectionVisible", true),
        isNameMentionSoundEnabled: getBooleanPreference("isNameMentionSoundEnabled", false),
        isNewlineOnShiftEnter: getBooleanPreference("isNewlineOnShiftEnter", true),
        isStreamAutoResumeEnabled: getBooleanPreference("isStreamAutoResumeEnabled", true),
        isStreamInboundVuMeterEnabled: getBooleanPreference("isStreamInboundVuMeterEnabled", true),
        language: getStringPreference("language", "en"),
        rulaRoomListSortKey: getUnionTypePreference<RulaRoomListSortKey>(
            "rulaRoomListSortKey",
            "sortName",
            ["sortName", "userCount", "streamerCount"],
        ),
        rulaRoomListSortDirection: getUnionTypePreference<1 | -1>(
            "rulaRoomListSortDirection",
            1,
            [1, -1],
        ),
        showIgnoreIndicatorInLog: getBooleanPreference("showIgnoreIndicatorInLog", false),
        showLogAboveToolbar: getBooleanPreference("showLogAboveToolbar", false),
        showLogDividers: getBooleanPreference("showLogDividers", false),
        showNotifications: getBooleanPreference("showNotifications", true),
        showUsernameBackground: getBooleanPreference("showUsernameBackground", true),
        streamAutoGain: getBooleanPreference("streamAutoGain", false),
        streamEchoCancellation: getBooleanPreference("streamEchoCancellation", false),
        streamMode: getUnionTypePreference<StreamMode>(
            "streamMode",
            "video_sound",
            ["video_sound", "sound", "video"],
        ),
        streamNoiseSuppression: getBooleanPreference("streamNoiseSuppression", false),
        streamScreenCapture: getBooleanPreference("streamScreenCapture", false),
        streamScreenCaptureAudio: getBooleanPreference("streamScreenCaptureAudio", false),
        timestampsInCopiedLog: getBooleanPreference("timestampsInCopiedLog", true),
        ttsVoiceURI: getStringPreference("ttsVoiceURI", "automatic"),
        uiTheme: getStringPreference("uiTheme", "gikopoi"),
        underlinedUsernames: getBooleanPreference("underlinedUsernames", false),
        voiceVolume: getNumberPreference("voiceVolume", 0),
        isNicoNicoMode: getBooleanPreference("isNicoNicoMode", false),
        streamIsVtuberMode: getBooleanPreference("streamIsVtuberMode", false),
        streamTarget: getUnionTypePreference<StreamTarget>(
            "streamTarget",
            "all_room",
            ["all_room", "specific_users"],
        ),
        soundEffectVolume: getNumberPreference("soundEffectVolume", 0),
    }
}

export function setAndPersist<K extends keyof GikopoipoiPreferences>(preferences: GikopoipoiPreferences, key: K, value: GikopoipoiPreferences[K])
{
    preferences[key] = value

    // stringify if the value is an object
    if (typeof value === "object") {
        localStorage.setItem(key, JSON.stringify(value))
    } else {
        localStorage.setItem(key, String(value))
    }
}

function getStringPreference(key: string, defaultValue: string): string
{
    return localStorage.getItem(key) ?? defaultValue
}

function getBooleanPreference(key: string, defaultValue: boolean): boolean
{
    const value = localStorage.getItem(key)
    if (value === null) {
        return defaultValue
    }
    return value === "true"
}

function getNumberPreference(key: string, defaultValue: number): number
{
    const value = localStorage.getItem(key)
    if (value === null) {
        return defaultValue
    }
    return parseFloat(value)
}

function getUnionTypePreference<T>(
    key: string,
    defaultValue: T,
    allowedValues: readonly T[],
): T
{
    const value = localStorage.getItem(key)
    if (value === null) {
        return defaultValue
    }

    return allowedValues.includes(value as T) ? (value as T) : defaultValue
}