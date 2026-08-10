import { Room } from "../types";

export const schoolStRoom: Room = {
    id: "school_st",
    group: "gikopoi",
    scale: 1,
    size: { x: 6, y: 8 },
    originCoordinates: { x: -1, y: 273 },
    spawnPoint: "school",
    backgroundImageUrl: "rooms/school_st/background.svg",
    objects: [
        { x: 0, y: 4, url: "wall.svg", offset: { x: 120, y: 84 } },
    ],
    sit: [],
    blocked: [
        { x: 0, y: 3 },
        { x: 0, y: 4 },
        { x: 0, y: 4 },
        { x: 0, y: 6 },
        { x: 0, y: 7 },
    ],
    forbiddenMovements: [],
    worldSpawns: [
        { x: 3, y: 4, direction: "down", target: null }
    ],
    doors: {
        left: { x: 0, y: 2, direction: "right", target: { roomId: "busstop", doorId: "right" } },
        school: { x: 0, y: 5, direction: "right", target: { roomId: "school_rouka", doorId: "right_top" } },
        up: { x: 3, y: 7, direction: "down", target: { roomId: "bar_st", doorId: "down" } },
        right: { x: 5, y: 2, direction: "left", target: { roomId: "cafe_st", doorId: "left" } },
        manhole: { x: 4, y: 1, direction: "down", target: { roomId: "basement", doorId: "down_left" } }
    },
    streamSlotCount: 0,
}