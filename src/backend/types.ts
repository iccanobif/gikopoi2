export * from '../common/common_types'
import type { Direction, Room, StreamSlotDto, JankenStateDto, ChessboardStateDto } from '../common/common_types'

import { Player } from "./users";
import { ChessInstance } from "chess.js"

const JanusClient = require('janus-videoroom-client').Janus;

export interface Participant
{
    user: Player;
    janusHandle: any;
}

export interface StreamSlot
{
    streamId: number,
    janusServer: JanusServer | null,
    janusSession: any,
    janusRoomIntName: number | null,
    janusRoomName: string | null,
    isActive: boolean,
    isReady: boolean,
    withSound: boolean | null,
    withVideo: boolean | null,
    publisher: Participant | null,
    listeners: Participant[],
    isVisibleOnlyToSpecificUsers: boolean | null,
    allowedListenerIDs: string[],
    streamIsVtuberMode: boolean | null,
    isNicoNicoMode: boolean | null,
}

export interface JanusServer
{
    id: string;
    client: typeof JanusClient;
}

export type RoomStateCollection = {
    [areaId: string]: { [roomId: string]: RoomState }
}

export interface RoomState
{
    streams: StreamSlot[],
    chess: ChessboardState,
    janken: JankenState,
    coinCounter: number
}

export interface LoginResponseDto
{
    appVersion: number,
    isLoginSuccessful: boolean,
    error?: "invalid_username" | "ip_restricted",
    userId?: string,
    privateUserId?: string,
}

export interface ChessboardState {
    instance: ChessInstance | null,
    blackUserID: string | null,
    whiteUserID: string | null,
    lastMoveTime: number | null,
    timer: any
}

export interface JankenState extends JankenStateDto {
    timeoutTimer: any,
}

export interface PersistedState
{
    users: Player[],
    bannedIPs: string[],
    areas: { id: string, coinCounter: number }[],
    forCoinCount?: number, // backwards compatibility
    genCoinCount?: number // backwards compatibility
}

export type DynamicRoomBuildFunction = (currentAnnualEvents: string[], addedEvents: string[], removedEvents: string[]) => Room

export interface DynamicRoom
{
    roomId: string
    subscribedAnnualEvents: string[]
    build: DynamicRoomBuildFunction
}
