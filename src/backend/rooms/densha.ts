import { Room } from "../types";

export const denshaRoom: Room = {
    id: "densha",
    group: "gikopoipoi",
    scale: 1,
    size: { x: 3, y: 15 },
    originCoordinates: { x: 3, y: 451 },
    blockWidth: 80,
    blockHeight: 40,
    spawnPoint: "left_top",
    backgroundImageUrl: "rooms/densha/background.svg",
    backgroundColor: "#414141",
    objects: [
        { x:  0, y: -1, offset: { x:    0, y:  390 }, url: 'bench_cover.svg' },
        
        { x:  0, y:  2, offset: { x:    1, y:  296 }, url: 'bench_left_1.svg' },
        { x:  0, y:  2, offset: { x:  130, y:  277 }, url: 'bench_left_2_panel.svg' },
        { x:  0, y:  7, offset: { x:  132, y:  196 }, url: 'bench_left_2.svg' },
        { x:  0, y:  7, offset: { x:  330, y:  177 }, url: 'bench_left_3_panel.svg' },
        { x:  0, y: 12, offset: { x:  331, y:   96 }, url: 'bench_left_3.svg' },
        { x:  0, y: 12, offset: { x:  529, y:   77 }, url: 'bench_left_4_panel.svg' },
        
        { x:  2, y: -1, offset: { x:   90, y:  414 }, url: 'bench_right_1_over.svg' },
        { x:  2, y:  2, offset: { x:   94, y:  411 }, url: 'bench_right_1_under.svg' },
        { x:  2, y:  2, offset: { x:  220, y:  314 }, url: 'bench_right_2_over.svg' },
        { x:  2, y:  7, offset: { x:  225, y:  311 }, url: 'bench_right_2_under.svg' },
        { x:  2, y:  7, offset: { x:  420, y:  214 }, url: 'bench_right_3_over.svg' },
        { x:  2, y: 12, offset: { x:  425, y:  211 }, url: 'bench_right_3_under.svg' },
        { x:  2, y: 12, offset: { x:  620, y:  150 }, url: 'bench_right_4_over.svg' },
        
        { x:  2, y:  0, offset: { x:    0, y:    0 }, url: 'rings.svg' },
    ],
    sit: [
        { x:  0, y:  0 },
        { x:  0, y:  1 },
        
        { x:  0, y:  3 },
        { x:  0, y:  4 },
        { x:  0, y:  5 },
        { x:  0, y:  6 },
        
        { x:  0, y:  8 },
        { x:  0, y:  9 },
        { x:  0, y: 10 },
        { x:  0, y: 11 },
        
        { x:  0, y: 13 },
        { x:  0, y: 14 },
        
        { x:  2, y:  0 },
        { x:  2, y:  1 },
        
        { x:  2, y:  3 },
        { x:  2, y:  4 },
        { x:  2, y:  5 },
        { x:  2, y:  6 },
        
        { x:  2, y:  8 },
        { x:  2, y:  9 },
        { x:  2, y: 10 },
        { x:  2, y: 11 },
        
        { x:  2, y: 13 },
        { x:  2, y: 14 },
    ],
    blocked: [],
    forbiddenMovements: [
        { xFrom:  0, yFrom:  1, xTo:  0, yTo:  2 }, { xFrom:  0, yFrom:  2, xTo:  0, yTo:  1 },
        { xFrom:  0, yFrom:  2, xTo:  0, yTo:  3 }, { xFrom:  0, yFrom:  3, xTo:  0, yTo:  2 },
        
        { xFrom:  0, yFrom:  6, xTo:  0, yTo:  7 }, { xFrom:  0, yFrom:  7, xTo:  0, yTo:  6 },
        { xFrom:  0, yFrom:  7, xTo:  0, yTo:  8 }, { xFrom:  0, yFrom:  8, xTo:  0, yTo:  7 },
        
        { xFrom:  0, yFrom: 11, xTo:  0, yTo: 12 }, { xFrom:  0, yFrom: 12, xTo:  0, yTo: 11 },
        { xFrom:  0, yFrom: 12, xTo:  0, yTo: 13 }, { xFrom:  0, yFrom: 13, xTo:  0, yTo: 12 },
        
        { xFrom:  2, yFrom:  1, xTo:  2, yTo:  2 }, { xFrom:  2, yFrom:  2, xTo:  2, yTo:  1 },
        { xFrom:  2, yFrom:  2, xTo:  2, yTo:  3 }, { xFrom:  2, yFrom:  3, xTo:  2, yTo:  2 },
        
        { xFrom:  2, yFrom:  6, xTo:  2, yTo:  7 }, { xFrom:  2, yFrom:  7, xTo:  2, yTo:  6 },
        { xFrom:  2, yFrom:  7, xTo:  2, yTo:  8 }, { xFrom:  2, yFrom:  8, xTo:  2, yTo:  7 },
        
        { xFrom:  2, yFrom: 11, xTo:  2, yTo: 12 }, { xFrom:  2, yFrom: 12, xTo:  2, yTo: 11 },
        { xFrom:  2, yFrom: 12, xTo:  2, yTo: 13 }, { xFrom:  2, yFrom: 13, xTo:  2, yTo: 12 },
    ],
    doors: {
        left_top: { x: 0, y: 12, direction: "right", target: { roomId: "busstop", doorId: "down" } },
        left_middle: { x: 0, y: 7, direction: "right", target: { roomId: "bar_giko_square", doorId: "up" } },
        top: { x: 1, y: 14, direction: "down", target: { roomId: "densha", doorId: "bottom" } },
        bottom: { x: 1, y: 0, direction: "up", target: { roomId: "densha", doorId: "top" } },
        left_bottom: { x: 0, y: 2, direction: "right", target: { roomId: "river", doorId: "right"} },
    },
    streamSlotCount: 1,
}