export * from '../common/common_types'

import type User from './user'
import type { RenderCache } from './rendercache'

import type { Coordinates, Room, RoomObject } from '../common/common_types'

export interface Users { [id: string]: User }
export type IgnoredUserIds = Set<string>

export interface ImageLayer {
    tags?: string[],
    image: HTMLImageElement
}

export interface ClientRoomObject extends RoomObject
{
    isHidden?: boolean
    physicalPositionX?: number
    physicalPositionY?: number
    image?: RenderCache
    allImages?: RenderCache[]
    // jizou
    lastUserCameOrLeftTime?: number
    currentFrame?: number
    needToTurnAround?: boolean
}

export interface ClientRoom extends Room
{
    objects: ClientRoomObject[]
    backgroundImage?: RenderCache
}

interface RoomObjectCanvasObject
{
    o: ClientRoomObject
    type: "room-object"
    x?: number
    y?: number
}

interface UserCanvasObject
{
    o: User
    type: "user"
    x?: number
    y?: number
}

export type CanvasObject = RoomObjectCanvasObject | UserCanvasObject

export type DeviceInfo = {
    id: string
    name: string
    type: MediaDeviceKind
}

export interface PopupUserList {
    id: string
    name: string | null
    isInRoom: boolean
    isInactive: boolean
}

export interface PointerState {
    dist: number | null
    pos: Coordinates
}

export type PopupCallback = (buttonIndex: number) => void

export interface GikopoipoiPreferences {
    areaId: string
    bubbleOpacity: number
    canvasHeight: string | null // string because CSSStyleDeclaration.style.height is typed as string.
    characterId: string
    customMentionSoundPattern: string
    displayAdvancedStreamSettings: boolean
    enableTextToSpeech: boolean
    isBubbleSectionVisible: boolean
    isCoinSoundEnabled: boolean
    isCommandSectionVisible: boolean
    isCrispModeEnabled: boolean
    isIdleAnimationDisabled: boolean
    isIgnoreOnBlock: boolean
    isInfoboxVisible: boolean
    isLoginSoundEnabled: boolean
    isLogoutButtonVisible: boolean
    isLowQualityEnabled: boolean
    isMessageSoundEnabled: boolean
    isMoveSectionVisible: boolean
    isNameMentionSoundEnabled: boolean
    isNewlineOnShiftEnter: boolean
    isStreamAutoResumeEnabled: boolean
    isStreamInboundVuMeterEnabled: boolean
    language: string // this is relevant only for areas that don't have a restricted language (for gikopoipoi.net, _for)
    rulaRoomListSortKey: RulaRoomListSortKey
    rulaRoomListSortDirection: 1 | -1
    showIgnoreIndicatorInLog: boolean
    showLogAboveToolbar: boolean
    showLogDividers: boolean
    showNotifications: boolean
    showUsernameBackground: boolean
    streamAutoGain: boolean
    streamEchoCancellation: boolean
    streamMode: StreamMode
    streamNoiseSuppression: boolean
    streamScreenCapture: boolean
    streamScreenCaptureAudio: boolean
    timestampsInCopiedLog: boolean
    ttsVoiceURI: string
    uiTheme: string
    username: string
    underlinedUsernames: boolean
    voiceVolume: number,
    streamTarget: StreamTarget
    streamIsVtuberMode: boolean
    isNicoNicoMode: boolean
    soundEffectVolume: number // 0~1
    slotVolume: { [slotId: number]: number } // key: slot Id / value: volume
}

export type RulaRoomListSortKey = 'sortName' | 'userCount' | 'streamerCount'
export type StreamMode = 'video_sound' | 'sound' | 'video'
export type StreamTarget = 'all_room' | 'specific_users'

import type { RTCPeer } from "./rtcpeer";
export interface RTCPeerSlot {
    attempts: number
    rtcPeer: RTCPeer | null
}

export interface VideoContainer extends HTMLElement
{
    originalPreviousSibling: HTMLElement | null
}