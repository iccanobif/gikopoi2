import { Room } from "../types";

export const radioBackstageRoom: Room = {
    id: "radio_backstage",
    group: "gikopoi",
    scale: 1,
    size: { x: 3, y: 9 },
    originCoordinates: { x: 0, y: 432 },
    spawnPoint: "spawn",
    backgroundImageUrl: "rooms/radio_backstage/background.svg",
    backgroundColor: "#333333",
    objects: [
        { x:  0, y:  1, offset: { x:   56, y:  323 }, url: "manekin.svg" },
    ],
    sit: [],
    blocked: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 7 },
        { x: 0, y: 8 },
    ],
    forbiddenMovements: [],
    doors: {
        bottom: { x: 2, y: 1, direction: "left", target: { roomId: "radio_gakuya", doorId: "door" } },
        center: { x: 2, y: 4, direction: "left", target: { roomId: "radio_room2", doorId: "stage_door" } },
        top: { x: 2, y: 7, direction: "left", target: { roomId: "radio_room3", doorId: "stage_door" } },
        spawn: { x: 2, y: 2, direction: "left", target: null }
    },
    streamSlotCount: 0,
}