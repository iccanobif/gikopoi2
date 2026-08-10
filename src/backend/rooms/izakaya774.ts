import { Room } from "../types";

export const izakaya774Room: Room = {
    id: "izakaya774",
    group: "gikopoi",
    scale: 1,
    size: { x: 6, y: 6 },
    originCoordinates: { x: 2, y: 269 },
    spawnPoint: "down",
    backgroundImageUrl: "rooms/izakaya774/background.svg",
    objects: [
        { x:  2, y:  2, offset: { x: 165, y:  189 }, url: "tabular.svg" },
    ],
    sit: [
        { x:  2, y:  1 },
        { x:  3, y:  1 },
        { x:  4, y:  2 },
        { x:  4, y:  3 },
        { x:  3, y:  4 },
        { x:  2, y:  4 },
        { x:  1, y:  3 },
        { x:  1, y:  2 },
        
        { x:  5, y:  5 },
    ],
    blocked: [
        { x:  2, y:  2 },
        { x:  3, y:  2 },
        { x:  2, y:  3 },
        { x:  3, y:  3 },
    ],
    forbiddenMovements: [],
    doors: {
        down: { x: 5, y: 0, direction: "up", target: { roomId: "basement", doorId: "secret_bar" } },
    },
    streamSlotCount: 3,
    forcedAnonymous: true,
}