import { Room } from "../types";

export const schoolGroundRoom: Room = {
    id: "school_ground",
    group: "gikopoi",
    scale: 1,
    size: { x: 9, y: 9 },
    originCoordinates: { x: 111, y: 391 },
    spawnPoint: "down",
    backgroundImageUrl: "rooms/school_ground/background.svg",
    objects: [
        { x:  7, y:  6, offset: { x:  505, y:  373 }, url: 'soiled.svg' },
        { x:  7, y:  8, offset: { x:  653, y:  251 }, url: 'coup.svg' },
        { x:  2, y:  7, offset: { x:  484, y:  183 }, url: 'swing_chain.svg' },
        { x:  3, y:  7, offset: { x:  524, y:  202 }, url: 'swing_chain.svg' },
        { x:  0, y:  1, offset: { x:  123, y:  230 }, url: 'jungle.svg' },
        { x:  1, y:  1, offset: { x:  161, y:  248 }, url: 'jungle.svg' },
        { x:  2, y:  1, offset: { x:  200, y:  268 }, url: 'jungle.svg' },
        { x:  6, y:  1, offset: { x:  396, y:  445 }, url: 'norimono_pink.svg' },
        { x:  7, y:  1, offset: { x:  437, y:  467 }, url: 'norimono.svg' },
        { x:  4, y:  4, offset: { x:  416, y:  318 }, url: 'carton.svg' },
        { x:  4, y:  3, offset: { x:  426, y:  336 }, url: 'carton_front.svg' },
    ],
    sit: [
        // swing
        { x:  1, y:  7 },
        { x:  2, y:  7 },
        
        // carton
        { x:  4, y:  4 },
        
        // pit
        { x:  7, y:  3 },
        { x:  7, y:  4 },
        { x:  7, y:  5 },
        { x:  8, y:  3 },
        { x:  8, y:  4 },
        { x:  8, y:  5 },
        
        // norimono
        { x:  6, y:  1 },
        { x:  7, y:  1 },
    ],
    blocked: [
        // jungle
        { x:  0, y:  1 },
        { x:  0, y:  0 },
        { x:  1, y:  0 },
        { x:  2, y:  0 },
        { x:  2, y:  1 },
        
        // swing
        { x:  0, y:  7 },
        { x:  0, y:  8 },
        { x:  1, y:  8 },
        { x:  2, y:  8 },
        { x:  3, y:  8 },
        { x:  3, y:  7 },
        
        // coup
        { x:  6, y:  8 },
        { x:  7, y:  8 },
        { x:  8, y:  8 },
        
        // norimono
        { x:  6, y:  0 },
        { x:  7, y:  0 },
    ],
    forbiddenMovements: [
        { xFrom:  1, yFrom:  7, xTo:  2, yTo:  7 }, { xFrom:  2, yFrom:  7, xTo:  1, yTo:  7 },
        { xFrom:  1, yFrom:  1, xTo:  1, yTo:  2 }, { xFrom:  1, yFrom:  2, xTo:  1, yTo:  1 },
        
        { xFrom:  4, yFrom:  3, xTo:  4, yTo:  4 }, { xFrom:  4, yFrom:  4, xTo:  4, yTo:  3 },
        { xFrom:  4, yFrom:  5, xTo:  4, yTo:  4 }, { xFrom:  4, yFrom:  4, xTo:  4, yTo:  5 },
        { xFrom:  5, yFrom:  4, xTo:  4, yTo:  4 }, { xFrom:  4, yFrom:  4, xTo:  5, yTo:  4 },
    ],
    doors: {
        up: { x: 4, y: 8, direction: "down", target: { roomId: "school_rouka", doorId: "down" } },
        left: { x: 0, y: 5, direction: "right", target: { roomId: "taiikukan", doorId: "left_door" } },
        down: { x: 5, y: 0, direction: "up", target: { roomId: "busstop", doorId: "up" } },
        warp: { x: 8, y: 0, direction: "up", target: { roomId: "school_ground", doorId: "jungle" } },
        jungle: { x: 1, y: 1, direction: "down", target: null },
    },
    streamSlotCount: 0,
    games: ["janken"],
}