import { coordRange } from "../rooms.js";
import { Coordinates, Room } from "../types.js";

export const enkaiRoom: Room = {
    id: "enkai",
    group: "gikopoi",
    scale: 1,
    size: { x: 21, y: 19 },
    originCoordinates: { x: 0, y: 575 },
    spawnPoint: "right",
    backgroundImageUrl: "rooms/enkai/background.svg",
    objects: [
        { x: 20, y:  0, offset: { x:    1, y:   53 }, url: "terawarosuw.svg" },
        
        { x:  4, y:  3, offset: { x:  279, y:  344 }, url: "speaker_left.svg" },
        { x:  4, y: 12, offset: { x:  640, y:  164 }, url: "speaker_right.svg" },
    
        { x:  8, y: 14, offset: { x:  895, y:  270 }, url: "sao.svg" },
        { x: 16, y: 14, offset: { x: 1215, y:  431 }, url: "sao.svg" },
        
        { x:  0, y: 13, offset: { x:  544, y:  254 }, url: "stage_part.svg" },
        { x:  0, y: 13, offset: { x:   70, y:  254 }, url: "stage.svg" }, // TODO fix layering to make this work eventually
        
        { x:  1, y:  1, offset: { x:   76, y:  512 }, url: "studio.svg" },
        
    
        { x:  6, y: 12, offset: { x:  688, y:  391 }, url: "table_and_zabuton.svg" },
        { x:  7, y: 12, offset: { x:  728, y:  411 }, url: "table_and_zabuton.svg" },
        { x:  8, y: 12, offset: { x:  768, y:  431 }, url: "table_and_zabuton.svg" },
        { x:  9, y: 12, offset: { x:  808, y:  451 }, url: "table_and_zabuton.svg" },
        
        { x: 11, y: 12, offset: { x:  888, y:  491 }, url: "table_and_zabuton.svg" },
        { x: 12, y: 12, offset: { x:  928, y:  511 }, url: "table_and_zabuton.svg" },
        { x: 13, y: 12, offset: { x:  968, y:  531 }, url: "table_and_zabuton.svg" },
        { x: 14, y: 12, offset: { x: 1008, y:  551 }, url: "table_and_zabuton.svg" },
        
        { x: 16, y: 12, offset: { x: 1088, y:  591 }, url: "table_and_zabuton.svg" },
        { x: 17, y: 12, offset: { x: 1128, y:  611 }, url: "table_and_zabuton.svg" },
        
        
        { x:  6, y:  9, offset: { x:  568, y:  451 }, url: "table_and_zabuton.svg" },
        { x:  7, y:  9, offset: { x:  608, y:  471 }, url: "table_and_zabuton.svg" },
        { x:  8, y:  9, offset: { x:  648, y:  491 }, url: "table_and_zabuton.svg" },
        { x:  9, y:  9, offset: { x:  688, y:  511 }, url: "table_and_zabuton.svg" },
        
        { x: 11, y:  9, offset: { x:  768, y:  551 }, url: "table_and_zabuton.svg" },
        { x: 12, y:  9, offset: { x:  808, y:  571 }, url: "table_and_zabuton.svg" },
        { x: 13, y:  9, offset: { x:  848, y:  591 }, url: "table_and_zabuton.svg" },
        { x: 14, y:  9, offset: { x:  888, y:  611 }, url: "table_and_zabuton.svg" },
        
        { x: 16, y:  9, offset: { x:  968, y:  651 }, url: "table_and_zabuton.svg" },
        { x: 17, y:  9, offset: { x: 1008, y:  671 }, url: "table_and_zabuton.svg" },
        
        
        { x:  6, y:  6, offset: { x:  448, y:  511 }, url: "table_and_zabuton.svg" },
        { x:  7, y:  6, offset: { x:  488, y:  531 }, url: "table_and_zabuton.svg" },
        { x:  8, y:  6, offset: { x:  528, y:  551 }, url: "table_and_zabuton.svg" },
        { x:  9, y:  6, offset: { x:  568, y:  571 }, url: "table_and_zabuton.svg" },
        
        { x: 11, y:  6, offset: { x:  648, y:  611 }, url: "table_and_zabuton.svg" },
        { x: 12, y:  6, offset: { x:  688, y:  631 }, url: "table_and_zabuton.svg" },
        { x: 13, y:  6, offset: { x:  728, y:  651 }, url: "table_and_zabuton.svg" },
        { x: 14, y:  6, offset: { x:  768, y:  671 }, url: "table_and_zabuton.svg" },
        
        { x: 16, y:  6, offset: { x:  848, y:  711 }, url: "table_and_zabuton.svg" },
        { x: 17, y:  6, offset: { x:  888, y:  731 }, url: "table_and_zabuton.svg" },
        
        
        { x:  6, y:  3, offset: { x:  328, y:  571 }, url: "table_and_zabuton.svg" },
        { x:  7, y:  3, offset: { x:  368, y:  591 }, url: "table_and_zabuton.svg" },
        { x:  8, y:  3, offset: { x:  408, y:  611 }, url: "table_and_zabuton.svg" },
        { x:  9, y:  3, offset: { x:  448, y:  631 }, url: "table_and_zabuton.svg" },
        
        { x: 11, y:  3, offset: { x:  528, y:  671 }, url: "table_and_zabuton.svg" },
        { x: 12, y:  3, offset: { x:  568, y:  691 }, url: "table_and_zabuton.svg" },
        { x: 13, y:  3, offset: { x:  608, y:  711 }, url: "table_and_zabuton.svg" },
        { x: 14, y:  3, offset: { x:  648, y:  731 }, url: "table_and_zabuton.svg" },
        
        { x: 16, y:  3, offset: { x:  728, y:  771 }, url: "table_and_zabuton.svg" },
        { x: 17, y:  3, offset: { x:  768, y:  791 }, url: "table_and_zabuton.svg" },
    ],
    sit: [
        // lower cushions
        { x:  6, y: 13 },
        { x:  7, y: 13 },
        { x:  8, y: 13 },
        { x:  9, y: 13 },
        
        { x: 11, y: 13 },
        { x: 12, y: 13 },
        { x: 13, y: 13 },
        { x: 14, y: 13 },
        
        { x: 16, y: 13 },
        { x: 17, y: 13 },
        
        
        { x:  6, y: 11 },
        { x:  7, y: 11 },
        { x:  8, y: 11 },
        { x:  9, y: 11 },
        
        { x: 11, y: 11 },
        { x: 12, y: 11 },
        { x: 13, y: 11 },
        { x: 14, y: 11 },
        
        { x: 16, y: 11 },
        { x: 17, y: 11 },
        
        
        { x:  6, y: 10 },
        { x:  7, y: 10 },
        { x:  8, y: 10 },
        { x:  9, y: 10 },
        
        { x: 11, y: 10 },
        { x: 12, y: 10 },
        { x: 13, y: 10 },
        { x: 14, y: 10 },
        
        { x: 16, y: 10 },
        { x: 17, y: 10 },
        
        
        { x:  6, y:  8 },
        { x:  7, y:  8 },
        { x:  8, y:  8 },
        { x:  9, y:  8 },
        
        { x: 11, y:  8 },
        { x: 12, y:  8 },
        { x: 13, y:  8 },
        { x: 14, y:  8 },
        
        { x: 16, y:  8 },
        { x: 17, y:  8 },
        
        
        { x:  6, y:  7 },
        { x:  7, y:  7 },
        { x:  8, y:  7 },
        { x:  9, y:  7 },
        
        { x: 11, y:  7 },
        { x: 12, y:  7 },
        { x: 13, y:  7 },
        { x: 14, y:  7 },
        
        { x: 16, y:  7 },
        { x: 17, y:  7 },
        
        
        { x:  6, y:  5 },
        { x:  7, y:  5 },
        { x:  8, y:  5 },
        { x:  9, y:  5 },
        
        { x: 11, y:  5 },
        { x: 12, y:  5 },
        { x: 13, y:  5 },
        { x: 14, y:  5 },
        
        { x: 16, y:  5 },
        { x: 17, y:  5 },
        
        
        { x:  6, y:  4 },
        { x:  7, y:  4 },
        { x:  8, y:  4 },
        { x:  9, y:  4 },
        
        { x: 11, y:  4 },
        { x: 12, y:  4 },
        { x: 13, y:  4 },
        { x: 14, y:  4 },
        
        { x: 16, y:  4 },
        { x: 17, y:  4 },
        
        
        { x:  6, y:  2 },
        { x:  7, y:  2 },
        { x:  8, y:  2 },
        { x:  9, y:  2 },
        
        { x: 11, y:  2 },
        { x: 12, y:  2 },
        { x: 13, y:  2 },
        { x: 14, y:  2 },
        
        { x: 16, y:  2 },
        { x: 17, y:  2 },
        
        // upper cushions
        { x:  4, y: 18 },
        { x:  5, y: 18 },
        
        { x:  7, y: 18 },
        { x:  8, y: 18 },
        { x:  9, y: 18 },
        
        { x: 11, y: 18 },
        { x: 12, y: 18 },
        { x: 13, y: 18 },
        
        // bottles
        { x:  6, y:  1 },
        { x: 10, y:  7 },
    ],
    blocked: ([
        // studio
        { x:  1, y:  1 },
        
        // speaker left
        { x:  4, y:  3 },
        
        // speaker right
        { x:  4, y: 12 },
        
        
        // ends of upper floor
        { x: 19, y: 16 },
        { x: 20, y: 16 },
        
        // entrance to upper floor
        { x:  1, y: 18 },
        { x: 15, y: 18 },
    
        // tables
        { x:  6, y: 12 },
        { x:  7, y: 12 },
        { x:  8, y: 12 },
        { x:  9, y: 12 },
        
        { x: 11, y: 12 },
        { x: 12, y: 12 },
        { x: 13, y: 12 },
        { x: 14, y: 12 },
        
        { x: 16, y: 12 },
        { x: 17, y: 12 },
        
        
        { x:  6, y:  9 },
        { x:  7, y:  9 },
        { x:  8, y:  9 },
        { x:  9, y:  9 },
        
        { x: 11, y:  9 },
        { x: 12, y:  9 },
        { x: 13, y:  9 },
        { x: 14, y:  9 },
        
        { x: 16, y:  9 },
        { x: 17, y:  9 },
        
        
        { x:  6, y:  6 },
        { x:  7, y:  6 },
        { x:  8, y:  6 },
        { x:  9, y:  6 },
        
        { x: 11, y:  6 },
        { x: 12, y:  6 },
        { x: 13, y:  6 },
        { x: 14, y:  6 },
        
        { x: 16, y:  6 },
        { x: 17, y:  6 },
        
        
        { x:  6, y:  3 },
        { x:  7, y:  3 },
        { x:  8, y:  3 },
        { x:  9, y:  3 },
        
        { x: 11, y:  3 },
        { x: 12, y:  3 },
        { x: 13, y:  3 },
        { x: 14, y:  3 },
        
        { x: 16, y:  3 },
        { x: 17, y:  3 },
    ] as Coordinates[])
        // lower wall
        .concat(coordRange({ x:  0, y: 15 }, { x: 18, y: 15 }))
        // upper wall
        .concat(coordRange({ x:  2, y: 17 }, { x: 14, y: 17 })),
    forbiddenMovements: [
        // stage front
        { xFrom:  4, yFrom:  4, xTo:  5, yTo:  4 }, { xFrom:  5, yFrom:  4, xTo:  4, yTo:  4 },
        { xFrom:  4, yFrom:  5, xTo:  5, yTo:  5 }, { xFrom:  5, yFrom:  5, xTo:  4, yTo:  5 },
        { xFrom:  4, yFrom:  6, xTo:  5, yTo:  6 }, { xFrom:  5, yFrom:  6, xTo:  4, yTo:  6 },
        { xFrom:  4, yFrom:  7, xTo:  5, yTo:  7 }, { xFrom:  5, yFrom:  7, xTo:  4, yTo:  7 },
        { xFrom:  4, yFrom:  6, xTo:  5, yTo:  8 }, { xFrom:  5, yFrom:  8, xTo:  4, yTo:  8 },
        { xFrom:  4, yFrom:  9, xTo:  5, yTo:  9 }, { xFrom:  5, yFrom:  9, xTo:  4, yTo:  9 },
        { xFrom:  4, yFrom: 10, xTo:  5, yTo: 10 }, { xFrom:  5, yFrom: 10, xTo:  4, yTo: 10 },
        { xFrom:  4, yFrom: 11, xTo:  5, yTo: 11 }, { xFrom:  5, yFrom: 11, xTo:  4, yTo: 11 },
        
        // stage left
        { xFrom:  0, yFrom:  1, xTo:  0, yTo:  2 }, { xFrom:  0, yFrom:  2, xTo:  0, yTo:  1 },
        { xFrom:  2, yFrom:  1, xTo:  2, yTo:  2 }, { xFrom:  2, yFrom:  2, xTo:  2, yTo:  1 },
        { xFrom:  3, yFrom:  1, xTo:  3, yTo:  2 }, { xFrom:  3, yFrom:  2, xTo:  3, yTo:  1 },
        { xFrom:  4, yFrom:  1, xTo:  4, yTo:  2 }, { xFrom:  4, yFrom:  2, xTo:  4, yTo:  1 },
        
        // stage right
        { xFrom:  0, yFrom: 13, xTo:  0, yTo: 14 }, { xFrom:  0, yFrom: 14, xTo:  0, yTo: 13 },
        { xFrom:  1, yFrom: 13, xTo:  1, yTo: 14 }, { xFrom:  1, yFrom: 14, xTo:  1, yTo: 13 },
        { xFrom:  2, yFrom: 13, xTo:  2, yTo: 14 }, { xFrom:  2, yFrom: 14, xTo:  2, yTo: 13 },
        { xFrom:  3, yFrom: 13, xTo:  3, yTo: 14 }, { xFrom:  3, yFrom: 14, xTo:  3, yTo: 13 },
    ],
    doors: {
        right: { x: 20, y: 8, direction: "left", target: { roomId: "cafe_st", doorId: "cafe" } },
        left_warp_bottom: { x: 0, y: 14, direction: "right", target: { roomId: "enkai", doorId: "left_warp_top" } },
        left_warp_top: { x: 2, y: 18, direction: "right", target: { roomId: "enkai", doorId: "left_warp_bottom" } },
        right_warp_bottom: { x: 19, y: 15, direction: "down", target: { roomId: "enkai", doorId: "right_warp_top" } },
        right_warp_top: { x: 14, y: 18, direction: "left", target: { roomId: "enkai", doorId: "right_warp_bottom" } },
    },
    streamSlotCount: 3,
}