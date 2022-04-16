import { Player } from "./users";
import { ChessInstance } from "chess.js"

const JanusClient = require('janus-videoroom-client').Janus;

export type Direction = 'up' | 'down' | 'left' | 'right'
export type Area = 'for' | 'gen'

export interface Coordinates
{
    x: number;
    y: number;
}

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
}

export interface Door
{
    x: number;
    y: number;
    direction: Direction | null;
    target: {
        roomId: string
        doorId: string
    } | string | null;
}

export interface Room
{
    id: string;
    group: "bar_giko" | "gikopoi" | "gikopoipoi";
    scale: number;
    size: Coordinates;
    originCoordinates: Coordinates;
    backgroundImageUrl: string;
    backgroundColor?: string;
    backgroundOffset?: Coordinates;
    spawnPoint: string;
    needsFixedCamera?: boolean;
    isBackgroundImageOffsetEdge?: boolean;
    objects: {
        x: number;
        y: number;
        width?: number;
        height?: number;
        url: string;
        scale?: number;
        offset?: {
            x: number;
            y: number;
        },
        occupiedBlocks?: {
            x: number;
            y: number;
        }[]
    }[];
    objectRenderSortMethod?: "diagonal_scan" | "priority";
    sit: Coordinates[];
    blocked: Coordinates[];
    forbiddenMovements: { xFrom: number, yFrom: number, xTo: number, yTo: number }[],
    doors: { [doorId: string]: Door };
    worldSpawns?: Door[];
    streamSlotCount: number;
    secret?: boolean;
    forcedAnonymous?: boolean;
    blockWidth?: number;
    blockHeight?: number;
    hasChessboard?: boolean;
    specialObjects?: SpecialObjects[];
}

export interface SpecialObjects
{
    name: string;
    x: number;
    y: number;
    value?: number;
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
    coinCounter: number
}

export interface RoomStateDto
{
    currentRoom: Room,
    connectedUsers: PlayerDto[],
    streams: StreamSlotDto[],
    chessboardState: ChessboardStateDto,
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

export interface PersistedState
{
    users: Player[],
    bannedIPs: string[],
    forCoinCount: number,
    genCoinCount: number,
}

export interface CharacterSvgDto
{
    isBase64: boolean
    frontSitting: string
    frontStanding: string
    frontWalking1: string
    frontWalking2: string
    backSitting: string
    backStanding: string
    backWalking1: string
    backWalking2: string
    frontSittingAlt: string | null
    frontStandingAlt: string | null
    frontWalking1Alt: string | null
    frontWalking2Alt: string | null
    backSittingAlt: string | null
    backStandingAlt: string | null
    backWalking1Alt: string | null
    backWalking2Alt: string | null
}
