import { Room } from "../types.js";

export const adminBarRoom: Room = {
    id: "admin_bar",
    group: "gikopoi",
    scale: 1,
    size: { x: 12, y: 10 },
    originCoordinates: { x: 0, y: 371 },
    spawnPoint: "spawn",
    backgroundImageUrl: "rooms/admin_bar/background.svg",
    objects: [
        { x:  0, y:  7, offset: { x:   1, y: 106 }, url: "shelves.svg" },
        
        { x:  8, y:  1, offset: { x: 391, y: 417 }, url: "table.svg" },
        { x:  8, y:  6, offset: { x: 591, y: 318 }, url: "table.svg" },
        
        { x:  3, y:  0, offset: { x: 122, y: 365 }, url: "counter_right.svg" },
        { x:  3, y:  1, offset: { x: 162, y: 345 }, url: "counter_right.svg" },
        { x:  3, y:  2, offset: { x: 202, y: 325 }, url: "counter_right.svg" },
        { x:  3, y:  3, offset: { x: 242, y: 305 }, url: "counter_right.svg" },
        { x:  3, y:  4, offset: { x: 282, y: 285 }, url: "counter_right.svg" },
        { x:  3, y:  5, offset: { x: 322, y: 265 }, url: "counter_right.svg" },
        { x:  3, y:  6, offset: { x: 362, y: 245 }, url: "counter_right.svg" },
        { x:  3, y:  7, offset: { x: 402, y: 225 }, url: "counter_top_right.svg" },
        { x:  2, y:  7, offset: { x: 362, y: 205 }, url: "counter_top.svg" },
    ],
    sit: [
        // bar stools
        { x:  4, y:  0 },
        { x:  4, y:  1 },
        { x:  4, y:  2 },
        { x:  4, y:  3 },
        { x:  4, y:  4 },
        { x:  4, y:  5 },
        { x:  4, y:  6 },
        { x:  4, y:  7 },
        
        // table stools
        { x:  8, y:  0 },
        { x:  9, y:  0 },
        { x:  8, y:  3 },
        { x:  9, y:  3 },
        { x:  7, y:  1 },
        { x:  7, y:  2 },
        { x: 10, y:  1 },
        { x: 10, y:  2 },
        
        { x:  8, y:  5 },
        { x:  9, y:  5 },
        { x:  8, y:  8 },
        { x:  9, y:  8 },
        { x:  7, y:  6 },
        { x:  7, y:  7 },
        { x: 10, y:  6 },
        { x: 10, y:  7 },
    ],
    blocked: [
        // shelves
        { x:  0, y:  0 },
        { x:  0, y:  1 },
        { x:  0, y:  2 },
        { x:  0, y:  3 },
        { x:  0, y:  4 },
        { x:  0, y:  5 },
        { x:  0, y:  6 },
        { x:  0, y:  7 },
        
        // counters
        { x:  3, y:  0 },
        { x:  3, y:  1 },
        { x:  3, y:  2 },
        { x:  3, y:  3 },
        { x:  3, y:  4 },
        { x:  3, y:  5 },
        { x:  3, y:  6 },
        { x:  3, y:  7 },
        { x:  2, y:  7 },
        
        // tables
        { x:  8, y:  1 },
        { x:  9, y:  1 },
        { x:  8, y:  2 },
        { x:  9, y:  2 },
        
        { x:  8, y:  6 },
        { x:  9, y:  6 },
        { x:  8, y:  7 },
        { x:  9, y:  7 },            
    ],
    forbiddenMovements: [],
    doors: {
        spawn: { x: 6, y: 0, direction: "up", target: null },
        down: { x: 11, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "admin" } },
    },
    streamSlotCount: 2,
}