import { Room } from "../types";

export const barGiko2Room: Room = {
    id: "bar_giko2",
    group: "bar_giko",
    scale: 1,
    size: { x: 16, y: 16 },
    originCoordinates: { x: 1, y: 443 },
    spawnPoint: "stairs",
    backgroundImageUrl: "rooms/bar_giko2/background.svg",
    backgroundColor: "#222",
    objects: [
        // walls
        { x:  0, y:  8, offset: { x:  281, y:  141 }, url: "wall_left.svg" },
        { x:  7, y: 15, offset: { x:  881, y:  141 }, url: "wall_right.svg" },
        { x:  7, y:  7, offset: { x:  560, y:  280 }, url: "pillar.svg" },
    
        // bar
        { x:  0, y: 14, offset: { x:  560, y:   90 }, url: "counter_cube.svg" },
        { x:  1, y: 14, offset: { x:  600, y:  110 }, url: "counter_top_right.svg" },
        { x:  1, y: 13, offset: { x:  560, y:  130 }, url: "counter_right.svg" },
        { x:  1, y: 12, offset: { x:  520, y:  150 }, url: "counter_right.svg" },
        { x:  1, y: 11, offset: { x:  480, y:  170 }, url: "counter_right.svg" },
        { x:  1, y: 10, offset: { x:  440, y:  190 }, url: "counter_right.svg" },
        
        { x:  5, y: 14, offset: { x:  760, y:  190 }, url: "table_hori.svg" },
        { x:  5, y: 13, offset: { x:  720, y:  210 }, url: "table_hori.svg" },
        { x:  5, y: 11, offset: { x:  640, y:  250 }, url: "table_hori.svg" },
        { x:  5, y: 10, offset: { x:  600, y:  270 }, url: "table_hori.svg" },
    
        // tables left
        { x:  1, y:  2, offset: { x:  120, y:  350 }, url: "table_vert.svg" },
        { x:  2, y:  2, offset: { x:  160, y:  370 }, url: "table_vert.svg" },
        { x:  3, y:  2, offset: { x:  200, y:  390 }, url: "table_vert.svg" },
        { x:  5, y:  2, offset: { x:  280, y:  430 }, url: "table_vert.svg" },
        
        { x:  1, y:  6, offset: { x:  280, y:  270 }, url: "table_vert.svg" },
        { x:  3, y:  6, offset: { x:  360, y:  310 }, url: "table_vert.svg" },
        { x:  4, y:  6, offset: { x:  400, y:  330 }, url: "table_vert.svg" },
        { x:  5, y:  6, offset: { x:  440, y:  350 }, url: "table_vert.svg" },
        
        // tables right
        { x: 10, y:  9, offset: { x:  760, y:  390 }, url: "table_vert.svg" },
        { x: 11, y:  9, offset: { x:  800, y:  410 }, url: "table_vert.svg" },
        { x: 13, y:  9, offset: { x:  880, y:  450 }, url: "table_vert.svg" },
        { x: 14, y:  9, offset: { x:  920, y:  470 }, url: "table_vert.svg" },
        
        { x: 10, y: 13, offset: { x:  920, y:  310 }, url: "table_vert.svg" },
        { x: 12, y: 13, offset: { x: 1000, y:  350 }, url: "table_vert.svg" },
        { x: 14, y: 13, offset: { x: 1080, y:  390 }, url: "table_vert.svg" },
        
        // counter circle
        { x: 10, y:  2, offset: { x:  480, y:  530 }, url: "counter_bottom_left.svg" },
        { x: 11, y:  2, offset: { x:  520, y:  550 }, url: "counter_bottom.svg" },
        { x: 12, y:  2, offset: { x:  560, y:  570 }, url: "counter_bottom.svg" },
        { x: 13, y:  2, offset: { x:  600, y:  590 }, url: "counter_bottom_right.svg" },
        { x: 13, y:  3, offset: { x:  640, y:  570 }, url: "counter_right.svg" },
        { x: 13, y:  4, offset: { x:  680, y:  550 }, url: "counter_right.svg" },
        { x: 13, y:  5, offset: { x:  720, y:  530 }, url: "counter_top_right.svg" },
        { x: 12, y:  5, offset: { x:  680, y:  510 }, url: "counter_cube.svg" },
        { x: 11, y:  5, offset: { x:  640, y:  490 }, url: "counter_cube.svg" },
        { x: 10, y:  5, offset: { x:  600, y:  479 }, url: "counter_top_left.svg" },
        { x: 10, y:  4, offset: { x:  560, y:  490 }, url: "counter_cube.svg" },
        { x: 10, y:  3, offset: { x:  520, y:  510 }, url: "counter_cube.svg" },
    ],
    sit: [
        // bar
        { x:  2, y: 13 },
        { x:  2, y: 12 },
        { x:  2, y: 11 },
        { x:  2, y: 10 },
        
        { x:  4, y: 14 },
        { x:  4, y: 13 },
        { x:  4, y: 11 },
        { x:  4, y: 10 },
        { x:  6, y: 14 },
        { x:  6, y: 13 },
        { x:  6, y: 11 },
        { x:  6, y: 10 },
        
        // stools left
        { x:  1, y:  1 },
        { x:  2, y:  1 },
        { x:  3, y:  1 },
        { x:  5, y:  1 },
        { x:  1, y:  3 },
        { x:  2, y:  3 },
        { x:  3, y:  3 },
        { x:  5, y:  3 },
        
        { x:  1, y:  5 },
        { x:  3, y:  5 },
        { x:  4, y:  5 },
        { x:  5, y:  5 },
        { x:  1, y:  7 },
        { x:  3, y:  7 },
        { x:  4, y:  7 },
        { x:  5, y:  7 },
        
        // stools right
        { x: 10, y:  8 },
        { x: 11, y:  8 },
        { x: 13, y:  8 },
        { x: 14, y:  8 },
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 13, y: 10 },
        { x: 14, y: 10 },
        
        { x: 10, y: 12 },
        { x: 12, y: 12 },
        { x: 14, y: 12 },
        { x: 10, y: 14 },
        { x: 12, y: 14 },
        { x: 14, y: 14 },
        
        // stool circle
        { x: 10, y:  1 },
        { x: 11, y:  1 },
        { x: 12, y:  1 },
        { x: 13, y:  1 },
        { x: 14, y:  2 },
        { x: 14, y:  3 },
        { x: 14, y:  4 },
        { x: 14, y:  5 },
        { x: 10, y:  6 },
        { x: 11, y:  6 },
        { x: 12, y:  6 },
        { x: 13, y:  6 },
        { x:  9, y:  2 },
        { x:  9, y:  3 },
        { x:  9, y:  4 },
        { x:  9, y:  5 },
    ],
    blocked: [
        // walls
        { x:  0, y:  8 },
        { x:  0, y:  7 },
        { x: 15, y:  8 },
        { x: 15, y:  7 },
        { x:  7, y: 15 },
        { x:  8, y: 15 },
        { x:  7, y: 0 },
        { x:  8, y: 0 },
        
        { x:  7, y:  7 },
        { x:  8, y:  7 },
        { x:  7, y:  8 },
        { x:  8, y:  8 },
    
        // bar
        { x:  0, y: 14 },
        { x:  1, y: 14 },
        { x:  1, y: 13 },
        { x:  1, y: 12 },
        { x:  1, y: 11 },
        { x:  1, y: 10 },
        
        { x:  5, y: 14 },
        { x:  5, y: 13 },
        { x:  5, y: 11 },
        { x:  5, y: 10 },
    
        // tables left
        { x:  1, y:  2 },
        { x:  2, y:  2 },
        { x:  3, y:  2 },
        { x:  5, y:  2 },
        
        { x:  1, y:  6 },
        { x:  3, y:  6 },
        { x:  4, y:  6 },
        { x:  5, y:  6 },
        
        // tables right
        { x: 10, y:  9 },
        { x: 11, y:  9 },
        { x: 13, y:  9 },
        { x: 14, y:  9 },
        
        { x: 10, y: 13 },
        { x: 12, y: 13 },
        { x: 14, y: 13 },
        
        // counter circle
        { x: 10, y:  2 },
        { x: 11, y:  2 },
        { x: 12, y:  2 },
        { x: 13, y:  2 },
        { x: 13, y:  3 },
        { x: 13, y:  4 },
        { x: 13, y:  5 },
        { x: 12, y:  5 },
        { x: 11, y:  5 },
        { x: 10, y:  5 },
        { x: 10, y:  4 },
        { x: 10, y:  3 },
    ],
    forbiddenMovements: [],
    doors: {
        stairs: { x: 0, y: 15, direction: "right", target: { roomId: "bar_giko", doorId: "right" } },
    },
    streamSlotCount: 1,
}