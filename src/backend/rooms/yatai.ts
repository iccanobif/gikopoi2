import { Room } from "../types";

export const yataiRoom: Room = {
    id: "yatai",
    group: "gikopoi",
    scale: 1,
    size: { x: 8, y: 8 },
    originCoordinates: { x: -1, y: 417 },
    spawnPoint: "down",
    backgroundImageUrl: "rooms/yatai/background.svg",
    objectRenderSortMethod: "diagonal_scan",
    objects: [
        { x:  7, y:  0, offset: { x:   64, y:  106 }, url: 'roof.svg' },
        { x:  1, y:  5, offset: { x:  264, y:  120 }, url: 'pole.svg' },
        { x:  1, y:  3, offset: { x:  151, y:  194 }, url: 'bucket_squid.svg' },
        { x:  6, y:  5, offset: { x:  460, y:  218 }, url: 'pole.svg' },
        { x:  6, y:  3, offset: { x:  348, y:  225 }, url: 'panel.svg' },
        { x:  1, y:  2, width: 5, offset: { x:  133, y:  310 }, url: 'vendor_counter.svg' },
        { x:  1, y:  0, offset: { x:   49, y:  201 }, url: 'sign.svg' },
        { x:  7, y:  3, offset: { x:  413, y:  444 }, url: 'seat_with_bottle.svg' },
    ],
    sit: [
        { x:  1, y:  1 },
        { x:  2, y:  1 },
        { x:  3, y:  1 },
        { x:  4, y:  1 },
        { x:  5, y:  1 },
        
        { x:  7, y:  3 },
    ],
    blocked: [
        { x:  1, y:  3 },
        { x:  1, y:  2 },
        { x:  2, y:  2 },
        { x:  3, y:  2 },
        { x:  4, y:  2 },
        { x:  5, y:  2 },
        
        { x:  7, y:  7 },
    ],
    forbiddenMovements: [
        { xFrom:  5, yFrom:  3, xTo:  6, yTo:  3 }, { xFrom:  6, yFrom:  3, xTo:  5, yTo:  3 },
    ],
    doors: {
        down: { x: 7, y: 0, direction: "up", target: { roomId: "bar_st", doorId: "up_right" } },
    },
    streamSlotCount: 0,
}