export interface Coordinates
{
    x: number;
    y: number;
}

export interface Room 
{
    scale: number;
    grid: number[];
    originCoordinates: Coordinates;
    spawnPoint: {
        x: number;
        y: number;
        direction: string;
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
        withVideo: boolean | null
    }[];
}
