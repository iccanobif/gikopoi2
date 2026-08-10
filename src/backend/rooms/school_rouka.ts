import { Room } from "../types";

export const schoolRoukaRoom: Room = {
    id: "school_rouka",
    group: "gikopoi",
    scale: 1,
    size: { x: 5, y: 8 },
    originCoordinates: { x: 0, y: 335 },
    spawnPoint: "right_top",
    backgroundImageUrl: "rooms/school_rouka/background.svg",
    objects: [
        { x:  2, y:  6, offset: { x:  359, y:  149 }, url: 'wall_part.svg' },
        { x:  4, y:  6, offset: { x:  361, y:  40 }, url: 'wall.svg' },
    ],
    sit: [
    ],
    blocked: [
        { x:  0, y:  7 },
        { x:  1, y:  7 },
    ],
    forbiddenMovements: [
        { xFrom:  2, yFrom:  6, xTo:  2, yTo:  7 }, { xFrom:  2, yFrom:  7, xTo:  2, yTo:  6 },
        { xFrom:  4, yFrom:  6, xTo:  4, yTo:  7 }, { xFrom:  4, yFrom:  7, xTo:  4, yTo:  6 },
    ],
    doors: {
        door_left: { x: 0, y: 2, direction: "right", target: { roomId: "school_international", doorId: "right" } },
        door_right: { x: 0, y: 5, direction: "right", target: { roomId: "school", doorId: "right" } },
        down: { x: 1, y: 0, direction: "up", target: { roomId: "school_ground", doorId: "up" } },
        right_top: { x: 4, y: 4, direction: "left", target: { roomId: "school_st", doorId: "school" } },
        right_bottom: { x: 4, y: 1, direction: "left", target: { roomId: "school_pc", doorId: "door" } },
    },
    streamSlotCount: 0,
}