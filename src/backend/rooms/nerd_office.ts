import { Room } from "../types";

export const nerdOfficeRoom: Room = {
    id: "nerd_office",
    group: "gikopoipoi",
    scale: 1,
    size: { x: 10, y: 6 },
    originCoordinates: { x: 0, y: 262 },
    spawnPoint: "door",
    backgroundImageUrl: "rooms/nerd_office/background.svg",
    objects: [
        { x: 1, y: 0, offset: { x: 67, y: 242 }, url: "chair.svg" },
        { x: 1, y: 4, offset: { x: 227, y: 162 }, url: "chair.svg" },
        { x: 3, y: 4, offset: { x: 307, y: 202 }, url: "chair.svg" },
        { x: 0, y: 1, offset: { x: 3.8, y: 153.5 }, url: "ham_set.svg" },
        { x: 3, y: 2, width: 4, offset: { x: 204.5, y: 218 }, url: "meeting_table.svg" },
        { x: 2, y: 1, width: 3, offset: { x: 177.5, y: 260.3 }, url: "cushions.svg" },
        { x: 7, y: 2, offset: { x: 375.5, y: 317 }, url: "cushion_blue.svg" }
    ],
    objectRenderSortMethod: "diagonal_scan",
    sit: [
        { x: 1, y: 4 },
        { x: 1, y: 0 },
        { x: 3, y: 4 },
        { x: 2, y: 2 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
        { x: 6, y: 1 },
        { x: 7, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 5, y: 3 },
        { x: 6, y: 3 },
    ],
    blocked: [
        //hamset
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        //colorbox
        { x: 0, y: 3 },
        { x: 0, y: 4 },
        //dustbox
        { x: 0, y: 5 },
        //pcs
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 7, y: 5 },
        { x: 8, y: 5 },
        { x: 9, y: 5 },
        //meeting_table
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 6, y: 2 },
    ],
    forbiddenMovements: [],
    doors: {
        door: { x: 9, y: 0, direction: "up", target: { roomId: "bar_giko_square", doorId: "office" } },
    },
    streamSlotCount: 1,
}