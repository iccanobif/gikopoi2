import { Room } from "../types";

export const karaokeBoxRoom: Room = {
    id: "karaoke_box",
    group: "gikopoi",
    backgroundColor: "#000000",
    scale: 0.7,
    size: { x: 7, y: 5 },
    objectRenderSortMethod: "diagonal_scan",
    originCoordinates: { x: 0, y: 240 },
    spawnPoint: "door",
    backgroundImageUrl: "rooms/karaoke_box/background.svg",
    objects: [
        {"x":7,"y":-1,"width":1,"height":1,"url":"overlay.svg","scale":0.7,"offset":{"x":0,"y":0}},
        {"x":2,"y":0,"width":4,"height":1,"url":"sofa-left.svg","scale":0.93,"offset":{"x":87,"y":238}},
        {"x":0,"y":-1,"width":4,"height":1,"url":"sofa-right.svg","scale":0.93,"offset":{"x":87,"y":239}},
        {"x":6,"y":0,"width":1,"height":1,"url":"stool.svg","scale":0.93,"offset":{"x":88,"y":237}},
    ],
    sit: [
        // left sofa
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
        { x: 6, y: 0 },
        // right sofa
        { x: 6, y: 1 },
        { x: 6, y: 2 },
        { x: 6, y: 3 },
        { x: 6, y: 4 },
    ],
    blocked: [
        // stuff on the left
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 0, y: 4 },
        // table in the middle
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 2 },
        { x: 4, y: 3 },
    ],
    forbiddenMovements: [
        // { xFrom: 4, yFrom: 4, xTo: 5, yTo: 4 },
    ],
    doors: {
        door: { x: 0, y: 0, direction: "right", target: { roomId: "bar_giko_square", doorId: "big_dicks" } },
    },
    streamSlotCount: 3
}