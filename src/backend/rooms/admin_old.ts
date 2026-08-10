import { Room } from "../types";

export const adminOldroom: Room = {
    id: "admin_old",
    group: "gikopoi",
    scale: 1,
    size: { x: 8, y: 6 },
    originCoordinates: { x: -1, y: 240 },
    spawnPoint: "down",
    backgroundImageUrl: "rooms/admin_old/background.svg",
    objects: [
        { x: 3, y: 2, url: "round_table.svg", offset: { x: 190, y: 164 } },
    ],
    sit: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 2 },
        { x: 4, y: 3 },
    ],
    blocked: [
        { x: 0, y: 5 },
        
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
    ],
    forbiddenMovements: [],
    doors: {
        down: { x: 6, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "admin" } }
    },
    streamSlotCount: 1,
    secret: true,
}