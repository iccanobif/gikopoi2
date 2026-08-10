import { Room } from "../types";

export const radioRoom3: Room = {
    id: "radio_room3",
    group: "gikopoi",
    scale: 1,
    size: { x: 12, y: 9 },
    originCoordinates: { x: -1, y: 439 },
    spawnPoint: "down",
    backgroundImageUrl: "rooms/radio_room3/background.svg",
    objects: [
        { x:  1, y:  4, offset: { x:  204, y:  289 }, url: "drumset.svg" },
        { x:  2, y:  8, offset: { x:  344, y:  243 }, url: "piano.svg" },
        
        { x:  3, y:  2, offset: { x:  187, y:  371 }, url: "mic.svg" },
        { x:  4, y:  4, offset: { x:  307, y:  352 }, url: "mic.svg" },
        { x:  3, y:  6, offset: { x:  347, y:  292 }, url: "mic.svg" },
        
        { x:  4, y:  0, offset: { x:  172, y:  406 }, url: "speaker.svg" },
        { x:  4, y:  7, offset: { x:  456, y:  264 }, url: "speaker.svg" },
    
        { x:  7, y:  0, offset: { x:  290, y:  518 }, url: "table.svg" },
        { x: 11, y:  2, offset: { x:  530, y:  558 }, url: "table.svg" },
        { x: 11, y:  6, offset: { x:  690, y:  478 }, url: "table.svg" },
        
        { x:  9, y:  8, offset: { x:  690, y:  369 }, url: "table_with_drinks.svg" },
        { x:  8, y:  8, offset: { x:  650, y:  350 }, url: "table_with_drinks.svg" },
        { x:  7, y:  8, offset: { x:  610, y:  358 }, url: "table_with_ika.svg" },
    ],
    sit: [
        { x:  0, y:  4 },
        { x:  1, y:  8 },
        
        { x:  7, y:  2 },
        { x:  7, y:  3 },
        { x:  7, y:  4 },
        { x:  7, y:  5 },
        { x:  7, y:  6 },
        
        { x:  9, y:  2 },
        { x:  9, y:  3 },
        { x:  9, y:  4 },
        { x:  9, y:  5 },
        { x:  9, y:  6 },
        
        { x:  6, y:  0 },
        { x:  8, y:  0 },
        
        { x: 11, y:  1 },
        { x: 11, y:  3 },
        
        { x: 11, y:  5 },
        { x: 11, y:  7 },
    ],
    blocked: [
        // stage
        { x:  1, y:  4 },
        { x:  2, y:  8 },
        
        { x:  3, y:  2 },
        { x:  4, y:  4 },
        { x:  3, y:  6 },
        
        { x:  4, y:  0 },
        { x:  4, y:  7 },
        
        // tables
        { x:  7, y:  0 },
        { x: 11, y:  2 },
        { x: 11, y:  6 },
        
        { x:  9, y:  8 },
        { x:  8, y:  8 },
        { x:  7, y:  8 },
    ],
    forbiddenMovements: [
        { xFrom:  4, yFrom:  1, xTo:  5, yTo:  1 }, { xFrom:  5, yFrom:  1, xTo:  4, yTo:  1 },
        { xFrom:  4, yFrom:  2, xTo:  5, yTo:  2 }, { xFrom:  5, yFrom:  2, xTo:  4, yTo:  2 },
        { xFrom:  4, yFrom:  3, xTo:  5, yTo:  3 }, { xFrom:  5, yFrom:  3, xTo:  4, yTo:  3 },
        { xFrom:  4, yFrom:  5, xTo:  5, yTo:  5 }, { xFrom:  5, yFrom:  5, xTo:  4, yTo:  5 },
        { xFrom:  4, yFrom:  6, xTo:  5, yTo:  6 }, { xFrom:  5, yFrom:  6, xTo:  4, yTo:  6 },
    ],
    doors: {
        down: { x: 10, y: 0, direction: "up", target: { roomId: "radio", doorId: "door3" } },
        stage_door: { x: 0, y: 1, direction: "right", target: { roomId: "radio_backstage", doorId: "top" } },
    },
    streamSlotCount: 3,
}