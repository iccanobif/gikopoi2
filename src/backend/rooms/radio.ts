import { Room } from "../types.js";

export const radioRoom: Room = {
    id: "radio",
    group: "gikopoi",
    scale: 1,
    size: { x: 7, y: 10 },
    originCoordinates: { x: 0, y: 371 },
    spawnPoint: "down",
    backgroundImageUrl: "rooms/radio/background.svg",
    objects: [
        { x:  5, y:  1, offset: { x:  254, y:  389 }, url: "hopes_and_dreams.svg" },
        { x:  5, y:  8, offset: { x:  534, y:  249 }, url: "hopes_and_dreams.svg" },
    ],
    sit: [
        { x:  4, y:  0 },
        { x:  4, y:  1 },
        { x:  4, y:  2 },
        
        { x:  6, y:  0 },
        { x:  6, y:  1 },
        { x:  6, y:  2 },
        
        { x:  4, y:  7 },
        { x:  4, y:  8 },
        { x:  4, y:  9 },
        
        { x:  6, y:  7 },
        { x:  6, y:  8 },
        { x:  6, y:  9 },
    ],
    blocked: [
        { x:  5, y:  1 },
        { x:  5, y:  8 },
    ],
    forbiddenMovements: [],
    doors: {
        down: { x: 1, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "barrier" } },
        door1: { x: 0, y: 2, direction: "right", target: { roomId: "radio_room1", doorId: "right" } },
        single_door: { x: 0, y: 6, direction: "right", target: { roomId: "radio_gakuya", doorId: "right" } },
        door2: { x: 0, y: 8, direction: "right", target: { roomId: "radio_room2", doorId: "right" } },
        door3: { x: 2, y: 9, direction: "down", target: { roomId: "radio_room3", doorId: "down" } },
    },
    streamSlotCount: 0,
}