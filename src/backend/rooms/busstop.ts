import { Room } from "../types.js";

export const busStopRoom: Room = {
    id: "busstop",
    group: "gikopoi",
    scale: 1,
    size: { x: 8, y: 5 },
    originCoordinates: { x: 6, y: 215 },
    spawnPoint: "right",
    backgroundImageUrl: "rooms/busstop/background.svg",
    objects: [
        { x:  1, y:  1, offset: { x: 105, y:  85 }, url: "sign.svg" },
        { x:  0, y:  1, offset: { x:  72, y: 129 }, url: "poland.svg" },
        { x:  5, y:  1, offset: { x: 272, y: 229 }, url: "poland.svg" },
        { x:  7, y:  1, offset: { x: 352, y: 269 }, url: "poland.svg" },
        { x:  0, y:  3, offset: { x: 182, y:  64 }, url: "trash.svg" },
        { x:  0, y:  4, offset: { x: 218, y: 103 }, url: "comfy_sofa.svg" },
        { x:  2, y:  4, offset: { x: 298, y: 143 }, url: "comfy_sofa.svg" },
        { x:  4, y:  3, offset: { x: 156, y:   0 }, url: "roof.svg" },
    ],
    sit: [
        { x:  1, y:  4 },
        { x:  2, y:  4 },
        { x:  3, y:  4 },
        { x:  4, y:  4 },
    ],
    blocked: [
        { x:  0, y:  1 },
        { x:  1, y:  1 },
        { x:  5, y:  1 },
        { x:  7, y:  1 },
    ],
    forbiddenMovements: [
        { xFrom:  0, yFrom:  3, xTo:  0, yTo:  4 }, { xFrom:  0, yFrom:  4, xTo:  0, yTo:  3 },
    ],
    doors: {
        up: { x: 6, y: 4, direction: "down", target: { roomId: "school_ground", doorId: "down" } },
        right: { x: 7, y: 2, direction: "left", target: { roomId: "school_st", doorId: "left" } },
        down: { x: 3, y: 0, direction: "up", target: { roomId: "densha", doorId: "left_top" } },
        left: { x: 0, y: 2, direction: "right", target: { roomId: "seashore", doorId: "right" } },
    },
    streamSlotCount: 0,
}