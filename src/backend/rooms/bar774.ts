import { Room } from "../types.js";

export const bar774Room: Room = {
    id: "bar774",
    group: "gikopoi",
    scale: 1,
    size: { x: 6, y: 8 },
    originCoordinates: { x: -1, y: 298 },
    spawnPoint: "down",
    backgroundImageUrl: "rooms/bar774/background.svg",
    objects: [
        { x:  5, y:  2, offset: { x: 289, y: 295 }, url: "table.svg" },
        { x:  5, y:  6, offset: { x: 449, y: 215 }, url: "table.svg" },
        
        { x:  2, y:  7, offset: { x: 360, y: 129 }, url: "counter_right.svg" },
        { x:  2, y:  6, offset: { x: 320, y: 149 }, url: "counter_right.svg" },
        { x:  2, y:  5, offset: { x: 280, y: 169 }, url: "counter_right.svg" },
        { x:  2, y:  4, offset: { x: 240, y: 189 }, url: "counter_right.svg" },
        { x:  2, y:  3, offset: { x: 200, y: 209 }, url: "counter_right.svg" },
        { x:  2, y:  2, offset: { x: 160, y: 229 }, url: "counter_right.svg" },
        { x:  2, y:  1, offset: { x: 136, y: 244 }, url: "counter_bottom_right.svg" },
        { x:  1, y:  1, offset: { x:  96, y: 224 }, url: "counter_bottom.svg" },
        
        { x:  0, y:  1, offset: { x:  83, y: 107 }, url: "light.svg" },
        { x:  0, y:  5, offset: { x: 243, y:  27 }, url: "light.svg" },
    ],
    sit: [
        // crate
        { x:  0, y:  7 },
        
        // bar stools
        { x:  3, y:  7 },
        { x:  3, y:  6 },
        { x:  3, y:  5 },
        { x:  3, y:  4 },
        { x:  3, y:  3 },
        { x:  3, y:  2 },
        
        // table stools
        { x:  5, y:  1 },
        { x:  5, y:  3 },
        { x:  5, y:  5 },
        { x:  5, y:  7 },
        
    ],
    blocked: [
        // tables
        { x:  5, y:  2 },
        { x:  5, y:  6 },
        
        // counters
        { x:  2, y:  7 },
        { x:  2, y:  6 },
        { x:  2, y:  5 },
        { x:  2, y:  4 },
        { x:  2, y:  3 },
        { x:  2, y:  2 },
        { x:  2, y:  1 },
        { x:  1, y:  1 },
    ],
    forbiddenMovements: [],
    doors: {
        down: { x: 4, y: 0, direction: "up", target: { roomId: "basement", doorId: "bar774" } },
    },
    streamSlotCount: 0,
    forcedAnonymous: true,
}