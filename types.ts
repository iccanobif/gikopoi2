export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Coordinates
{
    x: number;
    y: number;
}

export interface StreamSlot {
    isActive: boolean,
    isReady: boolean,
    withSound: boolean | null,
    withVideo: boolean | null,
    userId: string | null,
    firstChunk: any | null,
}

export interface Room
{
    id: string;
    scale: number;
    size: Coordinates;
    originCoordinates: Coordinates;
    backgroundImageUrl: string;
    backgroundColor: string;
    spawnPoint: {
        x: number;
        y: number;
        direction: Direction;
    };
    objects: {
        x: number;
        y: number;
        url: string;
        scale?: number;
        xOffset?: number;
        yOffset?: number;
    }[];
    sit: Coordinates[];
    blocked: Coordinates[];
    doors: {
        x: number,
        y: number,
        targetRoomId: string,
        targetX: number,
        targetY: number
    }[];
    streams: StreamSlot[];
    // users: Player[]
}
