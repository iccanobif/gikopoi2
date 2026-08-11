import { Room } from "../types.js";

export const idoARoom: Room = {
    id: "idoA",
    group: "gikopoi",
    scale: 1,
    size: { x: 8, y: 8 },
    originCoordinates: { x: 18, y: 264 },
    spawnPoint: "left",
    backgroundImageUrl: "rooms/idoA/background.svg",
    objects: [
        { x:  8, y: -1, offset: { x:   39, y:  204 }, url: "plants.svg" },
        { x:  3, y:  4, offset: { x:  237, y:  159 }, url: "well.svg" },
        
        { x:  2, y:  2, offset: { x:  197, y:  221 }, url: "chair_vert.svg" },
        { x:  3, y:  2, offset: { x:  237, y:  241 }, url: "chair_vert.svg" },
        { x:  4, y:  2, offset: { x:  277, y:  261 }, url: "chair_vert.svg" },
        
        { x:  5, y:  3, offset: { x:  360, y:  262 }, url: "chair_hori.svg" },
        { x:  5, y:  4, offset: { x:  400, y:  242 }, url: "chair_hori.svg" },
        { x:  5, y:  5, offset: { x:  440, y:  223 }, url: "chair_hori.svg" },
        
        { x:  4, y:  6, offset: { x:  437, y:  181 }, url: "chair_vert.svg" },
        { x:  3, y:  6, offset: { x:  397, y:  161 }, url: "chair_vert.svg" },
        { x:  2, y:  6, offset: { x:  357, y:  141 }, url: "chair_vert.svg" },
        
        { x:  1, y:  5, offset: { x:  280, y:  143 }, url: "chair_hori.svg" },
        { x:  1, y:  4, offset: { x:  240, y:  163 }, url: "chair_hori.svg" },
        { x:  1, y:  3, offset: { x:  200, y:  182 }, url: "chair_hori.svg" },
        
        { x:  6, y:  6, offset: { x:  519, y:  236 }, url: "nothing_to_see_here.svg" },
    ],
    sit: [
        { x:  2, y:  2 },
        { x:  3, y:  2 },
        { x:  4, y:  2 },
        
        { x:  5, y:  3 },
        { x:  5, y:  4 },
        { x:  5, y:  5 },
        
        { x:  4, y:  6 },
        { x:  3, y:  6 },
        { x:  2, y:  6 },
        
        { x:  1, y:  5 },
        { x:  1, y:  4 },
        { x:  1, y:  3 },
    ],
    blocked: [
        { x:  2, y:  3 },
        { x:  3, y:  3 },
        { x:  4, y:  3 },
        { x:  4, y:  4 },
        { x:  4, y:  5 },
        { x:  3, y:  5 },
        { x:  2, y:  5 },
        { x:  2, y:  4 },
        
        // { x:  6, y:  6 },
    ],
    forbiddenMovements: [],
    doors: {
        left: { x: 0, y: 0, direction: "right", target: { roomId: "cafe_st", doorId: "water" } },
    },
    streamSlotCount: 1,
}