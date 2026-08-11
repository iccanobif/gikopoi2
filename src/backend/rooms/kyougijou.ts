import { coordRange } from "../rooms.js";
import { Room } from "../types.js";

export const kyougijouRoom: Room = {
    // 元     -> 五輪    -> 戻
    // 872929 -> 8A83CE -> 872929
    // A04C49 -> C4A8D3 -> A04C49
    // 835754 -> 665483 -> 835754
    // B55E5A -> E3C6F3 -> A04C49
    id: "kyougijou",
    group: "gikopoipoi",
    scale: 0.35,// (10.5 * 80)/1202,
    size: { x: 9, y: 28 },
    originCoordinates: { x: 203, y: 684 },
    spawnPoint: "door",
    backgroundImageUrl: "rooms/kyougijou/background.svg",
    objects: [
    ],
    sit: coordRange({x: 2, y:  5}, {x:  5, y:  5})
        .concat(coordRange({x: 2, y: 7 }, {x: 5, y: 7}))
        .concat(coordRange({x: 2, y: 9 }, {x: 5, y: 9}))
        .concat(coordRange({x: 2, y: 11 }, {x: 5, y: 11}))
        .concat(coordRange({x: 2, y: 13 }, {x: 5, y: 13}))
        .concat(coordRange({x: 2, y: 15 }, {x: 5, y: 15}))
        .concat(coordRange({x: 2, y: 17 }, {x: 5, y: 17}))
        .concat(coordRange({x: 2, y: 19 }, {x: 5, y: 19})),
    blocked: [
        { x: 8, y: 25 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 0, y: 27 },
    ],
    forbiddenMovements: [],
    doors: {
        door: { x: 8, y: 2, direction: "left", target: { roomId: "bar_giko_square", doorId: "very_left" } },
    },
    streamSlotCount: 3,
}