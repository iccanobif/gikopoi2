import type { RenderCache } from '../client/rendercache'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Coordinates
{
    x: number;
    y: number;
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

export interface SpecialObjects
{
    name: string;
    x: number;
    y: number;
    value?: number;
}

export interface AnimationFrame
{
    url: string;
    frameDelay?: number;
    // frontend additions
    image?: RenderCache
}

export interface RoomObject
{
    id?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    url: string | string[];
    animation?:
    {
        type: string;
        scenes: {
            [sceneId: string]: {
                frames?: AnimationFrame[],
                framesUrlPattern?: {
                    prefix: string;
                    suffix: string;
                    amount: number;
                }
                frameDelay?: number;
            }
        }
        frameDelay?: number;
        cycleShift?: number;
        currentFrame?: AnimationFrame
    }
    scale?: number;
    offset?: {
        x: number;
        y: number;
    }
}

export interface Room
{
    id: string;
    group: "bar_giko" | "gikopoi" | "gikopoipoi";
    variant?: string;
    scale: number;
    size: Coordinates;
    originCoordinates: Coordinates;
    backgroundImageUrl: string;
    backgroundColor?: string;
    backgroundOffset?: Coordinates;
    spawnPoint: string;
    needsFixedCamera?: boolean;
    isBackgroundImageOffsetEdge?: boolean;
    objects: RoomObject[];
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
    games?: string[];
    specialObjects?: SpecialObjects[];
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

export interface JankenStateDto {
    stage: string,
    namedPlayerId: string | null,
    player1Id: string | null,
    player2Id: string | null,
    player1Hand: "rock" | "paper" | "scissors" | null,
    player2Hand: "rock" | "paper" | "scissors" | null,
}

export interface ChessboardStateDto
{
    fenString: string | null,
    blackUserID: string | null,
    whiteUserID: string | null,
    turn: "b" | "w" | null,
}
