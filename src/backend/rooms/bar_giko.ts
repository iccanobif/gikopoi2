import { Room } from "../types";

export const barGikoRoom: Room = {
    id: "bar_giko",
    group: "bar_giko",
    scale: 1,
    size: { x: 14, y: 20 },
    originCoordinates: { x: 1, y: 382 },
    spawnPoint: "stairs",
    backgroundImageUrl: "rooms/bar_giko/background_with_stools.svg",
    backgroundColor: "#222",
    objects: [
        { x:  2, y:  5, offset: { x:  280, y:  250 }, url: "counter_left.svg" },
        { x:  2, y:  4, offset: { x:  240, y:  270 }, url: "counter_bottom_left.svg" },
        { x:  3, y:  4, offset: { x:  280, y:  290 }, url: "counter_bottom.svg" },
        { x:  4, y:  4, offset: { x:  320, y:  310 }, url: "counter_bottom.svg" },
        { x:  5, y:  4, offset: { x:  360, y:  330 }, url: "counter_bottom.svg" },
        { x:  6, y:  4, offset: { x:  400, y:  350 }, url: "counter_bottom.svg" },
        { x:  7, y:  4, offset: { x:  440, y:  370 }, url: "counter_bottom.svg" },
        { x:  8, y:  4, offset: { x:  480, y:  390 }, url: "counter_bottom_right.svg" },
        { x:  8, y:  5, offset: { x:  520, y:  370 }, url: "counter_right.svg" },
        
        { x:  8, y:  7, offset: { x:  600, y:  330 }, url: "counter_right.svg" },
        { x:  8, y:  8, offset: { x:  640, y:  310 }, url: "counter_right.svg" },
        { x:  8, y:  9, offset: { x:  680, y:  290 }, url: "counter_right.svg" },
        { x:  8, y: 10, offset: { x:  720, y:  270 }, url: "counter_right.svg" },
        { x:  8, y: 11, offset: { x:  760, y:  250 }, url: "counter_right.svg" },
        
        { x:  8, y: 13, offset: { x:  840, y:  210 }, url: "counter_right.svg" },
        { x:  8, y: 14, offset: { x:  880, y:  190 }, url: "counter_right.svg" },
        { x:  8, y: 15, offset: { x:  920, y:  170 }, url: "counter_right.svg" },
        { x:  8, y: 16, offset: { x:  960, y:  150 }, url: "counter_right.svg" },
        { x:  8, y: 17, offset: { x: 1000, y:  130 }, url: "counter_right.svg" },
        { x:  8, y: 18, offset: { x: 1040, y:  110 }, url: "counter_top_right.svg" },
        { x:  7, y: 18, offset: { x: 1000, y:   90 }, url: "counter_top.svg" },
        /*
        { x:  1, y:  5, offset: { x:  269, y:  263 }, url: "chair.svg" },
        { x:  1, y:  4, offset: { x:  229, y:  283 }, url: "chair.svg" },
        
        { x:  2, y:  3, offset: { x:  229, y:  323 }, url: "chair.svg" },
        { x:  3, y:  3, offset: { x:  269, y:  343 }, url: "chair.svg" },
        { x:  4, y:  3, offset: { x:  309, y:  363 }, url: "chair.svg" },
        { x:  5, y:  3, offset: { x:  349, y:  383 }, url: "chair.svg" },
        { x:  6, y:  3, offset: { x:  389, y:  403 }, url: "chair.svg" },
        { x:  7, y:  3, offset: { x:  429, y:  423 }, url: "chair.svg" },
        { x:  8, y:  3, offset: { x:  469, y:  443 }, url: "chair.svg" },
        
        { x:  9, y:  4, offset: { x:  549, y:  443 }, url: "chair.svg" },
        { x:  9, y:  5, offset: { x:  589, y:  423 }, url: "chair.svg" },
        
        { x:  9, y:  7, offset: { x:  669, y:  383 }, url: "chair.svg" },
        { x:  9, y:  8, offset: { x:  709, y:  363 }, url: "chair.svg" },
        { x:  9, y:  9, offset: { x:  749, y:  343 }, url: "chair.svg" },
        { x:  9, y: 10, offset: { x:  789, y:  323 }, url: "chair.svg" },
        { x:  9, y: 11, offset: { x:  829, y:  303 }, url: "chair.svg" },
        
        { x:  9, y: 13, offset: { x:  909, y:  263 }, url: "chair.svg" },
        { x:  9, y: 14, offset: { x:  949, y:  243 }, url: "chair.svg" },
        { x:  9, y: 15, offset: { x:  989, y:  223 }, url: "chair.svg" },
        { x:  9, y: 16, offset: { x: 1029, y:  203 }, url: "chair.svg" },
        { x:  9, y: 17, offset: { x: 1070, y:  183 }, url: "chair.svg" },
        */
        //{ x:  2, y:  0, offset: { x:  109, y:  383 }, url: "chair.svg" },
        { x:  3, y:  0, offset: { x:  120, y:  370 }, url: "table_hori.svg" },
        //{ x:  4, y:  0, offset: { x:  189, y:  423 }, url: "chair.svg" },
        
        //{ x:  7, y:  0, offset: { x:  309, y:  483 }, url: "chair.svg" },
        { x:  8, y:  0, offset: { x:  320, y:  470 }, url: "table_hori.svg" },
        //{ x:  9, y:  0, offset: { x:  389, y:  523 }, url: "chair.svg" },
        
        //{ x: 12, y:  1, offset: { x:  549, y:  563 }, url: "chair.svg" },
        //{ x: 13, y:  1, offset: { x:  589, y:  583 }, url: "chair.svg" },
        { x: 12, y:  2, offset: { x:  560, y:  510 }, url: "table_vert.svg" },
        { x: 13, y:  2, offset: { x:  600, y:  530 }, url: "table_vert.svg" },
        //{ x: 12, y:  3, offset: { x:  629, y:  523 }, url: "chair.svg" },
        //{ x: 13, y:  3, offset: { x:  669, y:  543 }, url: "chair.svg" },
        
        //{ x: 12, y:  5, offset: { x:  709, y:  483 }, url: "chair.svg" },
        //{ x: 13, y:  5, offset: { x:  749, y:  503 }, url: "chair.svg" },
        { x: 12, y:  6, offset: { x:  720, y:  430 }, url: "table_vert.svg" },
        { x: 13, y:  6, offset: { x:  760, y:  450 }, url: "table_vert.svg" },
        //{ x: 12, y:  7, offset: { x:  789, y:  443 }, url: "chair.svg" },
        //{ x: 13, y:  7, offset: { x:  829, y:  463 }, url: "chair.svg" },
        
        //{ x: 12, y: 12, offset: { x:  989, y:  343 }, url: "chair.svg" },
        //{ x: 13, y: 12, offset: { x: 1029, y:  363 }, url: "chair.svg" },
        { x: 12, y: 13, offset: { x: 1000, y:  290 }, url: "table_vert.svg" },
        { x: 13, y: 13, offset: { x: 1040, y:  310 }, url: "table_vert.svg" },
        //{ x: 12, y: 14, offset: { x: 1069, y:  303 }, url: "chair.svg" },
        //{ x: 13, y: 14, offset: { x: 1109, y:  323 }, url: "chair.svg" },
        
        //{ x: 12, y: 16, offset: { x: 1149, y:  263 }, url: "chair.svg" },
        //{ x: 13, y: 16, offset: { x: 1189, y:  283 }, url: "chair.svg" },
        { x: 12, y: 17, offset: { x: 1160, y:  210 }, url: "table_vert.svg" },
        { x: 13, y: 17, offset: { x: 1200, y:  230 }, url: "table_vert.svg" },
        //{ x: 12, y: 18, offset: { x: 1229, y:  223 }, url: "chair.svg" },
        //{ x: 13, y: 18, offset: { x: 1269, y:  243 }, url: "chair.svg" },
    ],
    sit: [
        { x:  0, y: 13 },
        { x:  1, y: 13 },
        { x:  2, y: 13 },
        { x:  3, y: 13 },
        { x:  4, y: 13 },
        { x:  0, y: 14 },
        { x:  2, y: 14 },
        { x:  0, y: 15 },
        { x:  1, y: 15 },
        { x:  2, y: 15 },
        { x:  3, y: 15 },
        { x:  4, y: 15 },
        
        // counter chairs
        { x:  1, y:  5 },
        { x:  1, y:  4 },
        
        { x:  2, y:  3 },
        { x:  3, y:  3 },
        { x:  4, y:  3 },
        { x:  5, y:  3 },
        { x:  6, y:  3 },
        { x:  7, y:  3 },
        { x:  8, y:  3 },
        
        { x:  9, y:  4 },
        { x:  9, y:  5 },
        
        { x:  9, y:  7 },
        { x:  9, y:  8 },
        { x:  9, y:  9 },
        { x:  9, y: 10 },
        { x:  9, y: 11 },
        
        { x:  9, y: 13 },
        { x:  9, y: 14 },
        { x:  9, y: 15 },
        { x:  9, y: 16 },
        { x:  9, y: 17 },
        
        // single table chairs
        { x:  2, y:  0 },
        { x:  4, y:  0 },
        
        { x:  7, y:  0 },
        { x:  9, y:  0 },
        
        // double table chairs
        { x: 12, y:  1 },
        { x: 13, y:  1 },
        
        { x: 12, y:  3 },
        { x: 13, y:  3 },
        
        { x: 12, y:  5 },
        { x: 13, y:  5 },
        
        { x: 12, y:  7 },
        { x: 13, y:  7 },
        
        { x: 12, y: 12 },
        { x: 13, y: 12 },
        
        { x: 12, y: 14 },
        { x: 13, y: 14 },
        
        { x: 12, y: 16 },
        { x: 13, y: 16 },
        
        { x: 12, y: 18 },
        { x: 13, y: 18 },
    ],
    blocked: [
        { x:  0, y:  8 },
        { x:  1, y:  8 },
        { x:  2, y:  8 },
        { x:  3, y:  8 },
        { x:  4, y:  8 },
        { x:  0, y:  9 },
        { x:  0, y: 10 },
        { x:  1, y: 10 },
        { x:  2, y: 10 },
        { x:  0, y: 11 },
        { x:  0, y: 12 },
        { x:  1, y: 12 },
        { x:  2, y: 12 },
        { x:  3, y: 12 },
        { x:  4, y: 12 },
        
        { x:  0, y: 16 },
        { x:  1, y: 16 },
        { x:  2, y: 16 },
        { x:  3, y: 16 },
        { x:  4, y: 16 },
        { x:  0, y: 17 },
        { x:  2, y: 17 },
        { x:  0, y: 18 },
    
        // wall
        { x:  0, y:  6 },
        { x:  1, y:  6 },
        { x:  2, y:  6 },
        { x:  3, y:  6 },
        { x:  4, y:  6 },
        { x:  5, y:  6 },
        { x:  6, y:  6 },
        { x:  6, y:  7 },
        { x:  6, y:  8 },
        { x:  6, y:  9 },
        { x:  6, y: 10 },
        { x:  6, y: 11 },
        { x:  6, y: 12 },
        { x:  6, y: 13 },
        { x:  6, y: 14 },
        { x:  6, y: 15 },
        { x:  6, y: 16 },
        { x:  6, y: 17 },
        { x:  6, y: 18 },
        { x:  6, y: 19 },
        
        { x: 13, y:  9 },
        { x: 13, y: 10 },
        
        // counters
        { x:  2, y:  5 },
        { x:  2, y:  4 },
        { x:  3, y:  4 },
        { x:  4, y:  4 },
        { x:  5, y:  4 },
        { x:  6, y:  4 },
        { x:  7, y:  4 },
        { x:  8, y:  4 },
        { x:  8, y:  5 },
        
        { x:  8, y:  7 },
        { x:  8, y:  8 },
        { x:  8, y:  9 },
        { x:  8, y: 10 },
        { x:  8, y: 11 },
        
        { x:  8, y: 13 },
        { x:  8, y: 14 },
        { x:  8, y: 15 },
        { x:  8, y: 16 },
        { x:  8, y: 17 },
        { x:  8, y: 18 },
        { x:  7, y: 18 },
        
        // single tables
        { x:  3, y:  0 },
        { x:  8, y:  0 },
        
        // double tables
        { x: 12, y:  2 },
        { x: 13, y:  2 },
        
        { x: 12, y:  6 },
        { x: 13, y:  6 },
        
        { x: 12, y: 13 },
        { x: 13, y: 13 },
        
        { x: 12, y: 17 },
        { x: 13, y: 17 },
        
    ],
    forbiddenMovements: [],
    doors: {
        stairs: { x: 7, y: 19, direction: "right", target: { roomId: "bar_giko_square", doorId: "bar_giko" } },
        right: { x: 13, y: 19, direction: "left", target: { roomId: "bar_giko2", doorId: "stairs" } },
    },
    streamSlotCount: 3,
}