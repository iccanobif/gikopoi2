import { Room } from "../types";

export const siloRoom: Room =
{
        id: "silo",
        group: "gikopoipoi",
        scale: 0.6,
        size: { x: 12, y: 12 },
        originCoordinates: { x: 740-345, y: 1310-393 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/silo/silo.svg",
        onlyDrawOverBackgroundImage: true,
        objects: [
            { x: 4, y: 6, url: "piano.svg", scale: 1, offset: { x: 1092-345, y: 1192-393 } },
        ],
        sit: [
            { x: 3, y: 10 },
        ],
        blocked: [
            { x: 0, y: 3 },
            { x: 0, y: 2 },
            { x: 1, y: 1 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },

            { x: 9, y: 0 },
            { x: 10, y: 1 },
            { x: 11, y: 2 },

            { x: 11, y: 8 },
            { x: 11, y: 9 },
            { x: 10, y: 10 },
            { x: 9, y: 11 },
            { x: 8, y: 11 },

            { x: 4, y: 11 },
            { x: 3, y: 11 },
            { x: 2, y: 11 },
            { x: 1, y: 10 },
            { x: 0, y: 9 },
            { x: 0, y: 8 },
            // piano:
            { x: 4, y: 6 },
            { x: 4, y: 7 },
        ],
        forbiddenMovements: [],
        doors: {
            spawn: { x: 6, y: 5, direction: "down", target: null },
            down: { x: 6, y: 0, direction: "up", target: { roomId: "badend", doorId: "rip" } },
            right: { x: 11, y: 5, direction: "left", target: { roomId: "takadai", doorId: "right" } }
        },
        streamSlotCount: 2,
    }