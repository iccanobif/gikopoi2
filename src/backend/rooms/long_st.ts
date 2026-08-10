import { Room } from "../types";

export const longStRoom: Room = {
    id: "long_st",
    group: "gikopoi",
    scale: 1,
    size: { x: 3, y: 33 },
    originCoordinates: { x: 14, y: 864 },
    spawnPoint: "down",
    backgroundImageUrl: "rooms/long_st/long_st.svg",
    objects: [],
    sit: [
        { x: 0, y: 0 }
    ],
    blocked: [
        { x: 2, y: 32 }
    ],
    forbiddenMovements: [],
    doors: {
        down: { x: 1, y: 0, direction: "up", target: { roomId: "bar_st", doorId: "up" } },
        up: { x: 1, y: 32, direction: "down", target: { roomId: "long_st", doorId: "down" } },
        left: { x: 0, y: 30, direction: "right", target: { roomId: "jinja_st", doorId: "right" } }
    },
    streamSlotCount: 0,
}