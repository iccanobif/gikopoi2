export interface Coordinates
{
    x: number;
    y: number;
}

export interface Room
{
    id: string;
    scale: number;
    grid: number[];
    originCoordinates: Coordinates;
    backgroundImageUrl: string;
    spawnPoint: {
        x: number;
        y: number;
        direction: 'up' | 'down' | 'left' | 'right';
    };
    objects: {
        x: number;
        y: number;
        url: string;
    }[];
    sit: number[][];
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
        userName: string | null,
    }[];
    // users: Player[]
}
