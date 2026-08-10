import { Room } from "../types";

export const radioRoom2: Room = {
    id: "radio_room2",
    group: "gikopoi",
    scale: 1,
    size: { x: 11, y: 9 },
    originCoordinates: { x: 1, y: 452 },
    spawnPoint: "right",
    backgroundImageUrl: "rooms/radio_room2/background.svg",
    objects: [
        { x:  1, y:  0, offset: { x:   82, y:  348 }, url: "light.svg" },
        { x:  2, y:  0, offset: { x:  118, y:  366 }, url: "light.svg" },
        { x:  3, y:  0, offset: { x:  153, y:  384 }, url: "light.svg" },
        
        { x:  1, y:  1, offset: { x:  118, y:  330 }, url: "light.svg" },
        { x:  2, y:  1, offset: { x:  153, y:  348 }, url: "light.svg" },
        { x:  3, y:  1, offset: { x:  189, y:  366 }, url: "light.svg" },
        
        { x:  1, y:  2, offset: { x:  153, y:  312 }, url: "light.svg" },
        { x:  2, y:  2, offset: { x:  189, y:  330 }, url: "light.svg" },
        { x:  3, y:  2, offset: { x:  225, y:  348 }, url: "light.svg" },
        
        { x:  2, y:  4, offset: { x:  227, y:  339 }, url: "turntable.svg" },
        
        { x:  1, y:  5, offset: { x:  283, y:  248 }, url: "light.svg" },
        { x:  2, y:  5, offset: { x:  319, y:  266 }, url: "light.svg" },
        { x:  3, y:  5, offset: { x:  354, y:  284 }, url: "light.svg" },
        
        { x:  1, y:  6, offset: { x:  318, y:  230 }, url: "light.svg" },
        { x:  2, y:  6, offset: { x:  353, y:  248 }, url: "light.svg" },
        { x:  3, y:  6, offset: { x:  387, y:  266 }, url: "light.svg" },
        
        { x:  1, y:  7, offset: { x:  353, y:  212 }, url: "light.svg" },
        { x:  2, y:  7, offset: { x:  388, y:  230 }, url: "light.svg" },
        { x:  3, y:  7, offset: { x:  422, y:  248 }, url: "light.svg" },
        
        { x:  5, y:  8, offset: { x:  536, y:  324 }, url: "counter_side.svg" },
        { x:  5, y:  7, offset: { x:  518, y:  345 }, url: "counter_corner.svg" },
        { x:  6, y:  7, offset: { x:  523, y:  365 }, url: "counter_strike.svg" },
        { x:  7, y:  7, offset: { x:  563, y:  385 }, url: "counter_strike.svg" },
        { x:  8, y:  7, offset: { x:  603, y:  405 }, url: "counter_strike.svg" },
        { x:  9, y:  7, offset: { x:  643, y:  425 }, url: "counter_strike.svg" },
        
        { x:  7, y:  0, offset: { x:  300, y:  538 }, url: "table.svg" },
        { x: 10, y:  2, offset: { x:  501, y:  558 }, url: "table.svg" },
        
    ],
    sit: [
        { x:  6, y:  6 },
        { x:  7, y:  6 },
        { x:  8, y:  6 },
        { x:  9, y:  6 },
        
        { x:  6, y:  0 },
        { x:  8, y:  0 },
        
        { x:  10, y:  1 },
        { x:  10, y:  3 },
    ],
    blocked: [
        // stage edge
        { x:  4, y:  0 },
        { x:  4, y:  1 },
        { x:  4, y:  2 },
        { x:  4, y:  3 },
        { x:  4, y:  4 },
        { x:  4, y:  5 },
        { x:  4, y:  6 },
        { x:  4, y:  7 },
        { x:  4, y:  8 },
        
        // counters
        { x:  5, y:  8 },
        { x:  5, y:  7 },
        { x:  6, y:  7 },
        { x:  7, y:  7 },
        { x:  8, y:  7 },
        { x:  9, y:  7 },
        
        // tables
        { x:  7, y:  0 },
        { x: 10, y:  2 },
        
    ],
    forbiddenMovements: [
        { xFrom:  1, yFrom:  4, xTo:  2, yTo:  4 }, { xFrom:  2, yFrom:  4, xTo:  1, yTo:  4 },
    ],
    doors: {
        stage_door: { x: 0, y: 1, direction: "right", target: { roomId: "radio_backstage", doorId: "center" } },
        right: { x: 10, y: 4, direction: "left", target: { roomId: "radio", doorId: "door2" } },
    },
    streamSlotCount: 1,
}