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

export type RulaRoomListSortKey = 'sortName' | 'userCount' | 'streamerCount'

import type { RTCPeer } from "./rtcpeer";
export interface RTCPeerSlot {
    attempts: number
    rtcPeer: RTCPeer | null
}

export interface VideoContainer extends HTMLElement
{
    originalPreviousSibling: HTMLElement | null
}