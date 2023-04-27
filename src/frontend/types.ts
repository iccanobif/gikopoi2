export * from '../common/common_types'

import type User from './user'
import type { RenderCache } from './rendercache'

import type { RoomObject } from '../common/common_types'

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

export interface CanvasObject
{
    o: ClientRoomObject
    type: "room-object" | "user"
    x?: number
    y?: number
}
