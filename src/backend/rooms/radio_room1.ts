import { Room } from "../types";

export const radioRoom1: Room = {
        id: "radio_room1",
        group: "gikopoi",
        scale: 1,
        size: { x: 7, y: 8 },
        originCoordinates: { x: 2, y: 332 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/radio_room1/background.svg",
        objects: [
            { x:  6, y:  3, offset: { x:  381, y:  338 }, url: "table.svg" },
        ],
        sit: [
            { x:  0, y:  0 },
            { x:  0, y:  1 },
            { x:  0, y:  2 },
            { x:  0, y:  3 },
            { x:  0, y:  4 },
            { x:  0, y:  5 },
            { x:  0, y:  6 },
            { x:  0, y:  7 },
            
            { x:  2, y:  0 },
            { x:  2, y:  1 },
            { x:  2, y:  2 },
            { x:  2, y:  3 },
            { x:  2, y:  4 },
            { x:  2, y:  5 },
            { x:  2, y:  6 },
            { x:  2, y:  7 },
            
            { x:  4, y:  0 },
            { x:  4, y:  1 },
            { x:  4, y:  2 },
            { x:  4, y:  3 },
            { x:  4, y:  4 },
            { x:  4, y:  5 },
            { x:  4, y:  6 },
            { x:  4, y:  7 },
            
            { x:  6, y:  2 },
            { x:  6, y:  4 },
        ],
        blocked: [
            { x:  6, y:  3 },
        ],
        forbiddenMovements: [],
        doors: {
            right: { x: 6, y: 6, direction: "left", target: { roomId: "radio", doorId: "door1" } },
        },
        streamSlotCount: 2,
    }