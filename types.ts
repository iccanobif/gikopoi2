export interface Coordinates
{
    x: number;
    y: number;
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
        direction: 'up' | 'down' | 'left' | 'right';
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
    streams: {
        isActive: boolean,
        withSound: boolean | null,
        withVideo: boolean | null,
        userId: string | null,
    }[];
    // users: Player[]
}
