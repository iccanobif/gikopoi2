import { Room } from "../types.js";

export const jinjaStRoom: Room = {
    id: "jinja_st",
    group: "gikopoi",
    scale: 1,
    size: { x: 9, y: 5 },
    originCoordinates: { x: 41, y: 268 },
    spawnPoint: "right",
    backgroundImageUrl: "rooms/jinja_st/background.svg",
    objects: [
        { x:  1, y:  3, offset: { x:   90, y:   48 }, url: "torii.svg" },
        { x:  4, y:  0, offset: { x:   73, y:  118 }, url: "take.svg" },
    ],
    sit: [
        { x:  8, y:  4 },
        { x:  8, y:  0 },
        { x:  5, y:  4 },
        { x:  5, y:  0 },
    ],
    blocked: [
        { x:  4, y:  4 },
        { x:  2, y:  4 },
        { x:  0, y:  3 },
        { x:  0, y:  1 },
        { x:  3, y:  0 },
        { x:  4, y:  0 },
    ],
    forbiddenMovements: [
        { xFrom:  1, yFrom:  0, xTo:  1, yTo:  1 }, { xFrom:  1, yFrom:  1, xTo:  1, yTo:  0 },
    ],
    doors: {
        torii: { x: 0, y: 2, direction: "right", target: { roomId: "jinja", doorId: "steps" } },
        right: { x: 8, y: 2, direction: "left", target: { roomId: "long_st", doorId: "left" } },
    },
    streamSlotCount: 0,
}