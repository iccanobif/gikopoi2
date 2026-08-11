import { Room } from "../types.js";

export const barStRoom: Room = {
    id: "bar_st",
    group: "gikopoi",
    scale: 1,
    size: { x: 10, y: 9 },
    originCoordinates: { x: -1, y: 323 },
    spawnPoint: "spawn",
    backgroundImageUrl: "rooms/bar_st/background.svg",
    objects: [
        { x: 4, y: 5, url: "doorstep.svg", offset: { x: 362, y: 187 } },
        { x: 5, y: 5, url: "signboard.svg", offset: { x: 360, y: 132 } },
    ],
    sit: [
        { x: 0, y: 7 },
        { x: 0, y: 8 },

        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },

        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },

        { x: 4, y: 7 },
        { x: 4, y: 8 },
    ],
    blocked: [
        // roof:
        { x: 0, y: 6 },
        { x: 1, y: 7 },
        { x: 1, y: 8 },

        // cola vending machines:
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        // building:
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 3, y: 6 },
        { x: 3, y: 7 },
        { x: 3, y: 8 },
    ],
    forbiddenMovements: [
        { xFrom: 4, yFrom: 5, xTo: 5, yTo: 5 },
        { xFrom: 4, yFrom: 5, xTo: 4, yTo: 6 },
        { xFrom: 5, yFrom: 5, xTo: 4, yTo: 5 },
        { xFrom: 4, yFrom: 6, xTo: 4, yTo: 5 },
    ],
    doors: {
        bar_roof: { x: 0, y: 8, direction: "down", target: null },
        bar: { x: 4, y: 5, direction: "right", target: { roomId: "bar", doorId: "right" } },
        spawn: { x: 4, y: 5, direction: "down", target: null },
        down: { x: 7, y: 0, direction: "up", target: { roomId: "school_st", doorId: "up" } },
        up: { x: 7, y: 8, direction: "down", target: { roomId: "long_st", doorId: "down" } },
        up_right: { x: 9, y: 8, direction: "down", target: { roomId: "yatai", doorId: "down" } },
        right: { x: 9, y: 2, direction: "left", target: { roomId: "admin_st", doorId: "left" } },
        manhole: { x: 8, y: 4, direction: "up", target: { roomId: "basement", doorId: "up_left" } }
    },
    streamSlotCount: 0,
}