export * from '../shared/shared_types'
import type { Direction, Room, JankenStateDto } from '../shared/shared_types'

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

export interface RoomStateDto
{
    currentRoom: Room,
    connectedUsers: PlayerDto[],
    streams: StreamSlotDto[],
    chessboardState: ChessboardStateDto,
    jankenState: JankenStateDto,
    coinCounter: number,
    hideStreams: boolean,
}

export interface LoginResponseDto
{
    appVersion: number,
    isLoginSuccessful: boolean,
    error?: "invalid_username" | "ip_restricted",
    userId?: string,
    privateUserId?: string,
}

export interface PlayerDto
{
    id: string,
    name: string,
    position: { x: number, y: number },
    direction: Direction,
    roomId: string,
    characterId: string,
    isInactive: boolean,
    bubblePosition: Direction,
    voicePitch: number,
    lastRoomMessage: string,
    isAlternateCharacter: boolean,
    lastMovement: number,
}

export interface StreamSlotDto
{
    isActive: boolean,
    isReady: boolean,
    withSound: boolean | null,
    withVideo: boolean | null,
    userId: string | null,
    isAllowed: boolean | null,
    isVisibleOnlyToSpecificUsers: boolean | null,
    streamIsVtuberMode: boolean | null,
    isNicoNicoMode: boolean | null,
}

export interface ChessboardState {
    instance: ChessInstance | null,
    blackUserID: string | null,
    whiteUserID: string | null,
    lastMoveTime: number | null,
    timer: any
}

export interface ChessboardStateDto
{
    fenString: string | null,
    blackUserID: string | null,
    whiteUserID: string | null,
    turn: "b" | "w" | null,
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
