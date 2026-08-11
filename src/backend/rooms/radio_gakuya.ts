import { Room } from "../types.js";

export const radioGakuyaRoom: Room = {
    id: "radio_gakuya",
    group: "gikopoi",
    scale: 1,
    size: { x: 9, y: 8 },
    originCoordinates: { x: 0, y: 358 },
    spawnPoint: "right",
    backgroundImageUrl: "rooms/radio_gakuya/background.svg",
    objects: [
        { x:  2, y:  1, offset: { x:  139, y:  305 }, url: "tabletop.svg" },
        
        { x:  2, y:  7, offset: { x:  369, y:  146 }, url: "mirror.svg" },
        { x:  3, y:  7, offset: { x:  409, y:  166 }, url: "mirror.svg" },
        { x:  4, y:  7, offset: { x:  449, y:  186 }, url: "mirror.svg" },
        { x:  5, y:  7, offset: { x:  489, y:  206 }, url: "mirror.svg" },
        { x:  6, y:  7, offset: { x:  529, y:  226 }, url: "mirror.svg" },
    ],
    sit: [
        // zubon
        { x:  2, y:  0 },
        { x:  3, y:  0 },
        { x:  4, y:  0 },
        { x:  5, y:  0 },
        { x:  6, y:  0 },
        
        { x:  2, y:  3 },
        { x:  3, y:  3 },
        { x:  4, y:  3 },
        { x:  5, y:  3 },
        { x:  6, y:  3 },
        
        // stools
        { x:  2, y:  6 },
        { x:  3, y:  6 },
        { x:  4, y:  6 },
        { x:  5, y:  6 },
        { x:  6, y:  6 },
    ],
    blocked: [
        // table
        { x:  2, y:  1 },
        { x:  3, y:  1 },
        { x:  4, y:  1 },
        { x:  5, y:  1 },
        { x:  6, y:  1 },
        
        { x:  2, y:  2 },
        { x:  3, y:  2 },
        { x:  4, y:  2 },
        { x:  5, y:  2 },
        { x:  6, y:  2 },
        
        // mirrors
        { x:  2, y:  7 },
        { x:  3, y:  7 },
        { x:  4, y:  7 },
        { x:  5, y:  7 },
        { x:  6, y:  7 },
    ],
    forbiddenMovements: [],
    doors: {
        door: { x: 0, y: 5, direction: "right", target: { roomId: "radio_backstage", doorId: "bottom" } },
        right: { x: 8, y: 5, direction: "left", target: { roomId: "radio", doorId: "single_door" } },
    },
    streamSlotCount: 0,
    games: ["janken"],
}