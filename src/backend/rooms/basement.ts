import { Room } from "../types.js";

export const basementRoom: Room = {
    id: "basement",
    group: "gikopoi",
    scale: 1,
    size: { x: 10, y: 4 },
    originCoordinates: { x: 0, y: 217 },
    spawnPoint: "secret_bar",
    backgroundImageUrl: "rooms/basement/background.svg",
    objects: [
        { x:  0, y: -1, offset: { x:    4, y:   68 }, url: "light_hori.svg" },
        { x:  0, y:  2, offset: { x:  123, y:    8 }, url: "light_hori.svg" },
        { x:  3, y:  2, offset: { x:  253, y:   68 }, url: "light_vert.svg" },
        { x:  6, y:  2, offset: { x:  373, y:  128 }, url: "light_vert.svg" },
        { x:  9, y:  2, offset: { x:  493, y:  188 }, url: "light_vert.svg" },
    ],
    sit: [],
    blocked: [
        { x: 4, y: 3 }
    ],
    forbiddenMovements: [
    ],
    doors: {
        left: { x: 0, y: 2, direction: "right", target: { roomId: "bar", doorId: "hatch" } },
        up_left: { x: 1, y: 3, direction: "down", target: { roomId: "bar_st", doorId: "manhole" } },
        secret_bar: { x: 3, y: 3, direction: "down", target: { roomId: "izakaya774", doorId: "down" } },
        bar774: { x: 6, y: 3, direction: "down", target: { roomId: "bar774", doorId: "down" } },
        up_right_1: { x: 8, y: 3, direction: "down", target: { roomId: "admin_st", doorId: "manhole_left" } },
        up_right_2: { x: 9, y: 3, direction: "down", target: { roomId: "admin_st", doorId: "manhole_right" } },
        down_left: { x: 1, y: 0, direction: "up", target: { roomId: "school_st", doorId: "manhole" } },
        down_right: { x: 8, y: 0, direction: "up", target: { roomId: "cafe_st", doorId: "manhole" } },
    },
    streamSlotCount: 0,
}