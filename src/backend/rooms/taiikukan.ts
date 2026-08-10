import { coordRange } from "../rooms";
import { Coordinates, Room } from "../types";

export const taiikukanRoom: Room = {
    id: "taiikukan",
    group: "gikopoipoi",
    scale: (10.5 * 80)/1202,
    size: { x: 29, y: 17 },
    originCoordinates: { x: -225*((10.5 * 80)/1202), y: 630*((10.5 * 80)/1202) },
    spawnPoint: "left_door",
    backgroundImageUrl: "rooms/taiikukan/background.svg",
    objects: [
        { x: 9, y: 4, height: 5, scale: (10.5 * 80)/1202, offset: { x: 286, y: 558}, url: "wall.svg" },
        { x: 29, y: -1, scale: (10.5 * 80)/1202, offset: { x: 0, y: 0 }, url: "foreground.svg" },
    ],
    objectRenderSortMethod: "diagonal_scan",
    sit: [
        // matt
        { x: 4, y: 0 },
        { x: 4, y: 1 },
        { x: 5, y: 0 },
        { x: 5, y: 1 },

        // stools
        { x: 27, y: 14 },
        { x: 27, y: 15 },
    ]
        // back wall
        .concat(coordRange({x: 11, y:  0}, {x: 26, y:  0})),
    blocked: ([
        {x: 28, y: 10},
        {x:  7, y:  7},
    ] as Coordinates[])
        //left wall
        .concat(coordRange({x:  8, y:  0}, {x:  8, y:  4}))
        .concat(coordRange({x:  8, y:  7}, {x:  8, y: 10}))
        .concat(coordRange({x:  5, y:  4}, {x:  5, y: 14}))
        .concat(coordRange({x:  0, y: 15}, {x:  4, y: 15}))
        .concat(coordRange({x:  6, y:  2}, {x:  6, y:  6}))
        .concat(coordRange({x:  3, y:  0}, {x:  3, y:  1}))
        .concat(coordRange({x:  0, y:  3}, {x:  4, y:  3}))
        .concat(coordRange({x:  4, y:  2}, {x:  5, y:  2}))
        .concat(coordRange({x:  6, y:  0}, {x:  7, y:  0}))
        .concat(coordRange({x:  4, y: 11}, {x:  4, y: 13}))

        //stage
        .concat(coordRange({x:  9, y: 11}, {x: 27, y: 11}))
        .concat(coordRange({x: 10, y: 12}, {x: 23, y: 12}))
        .concat(coordRange({x:  9, y: 13}, {x:  9, y: 16}))
        .concat(coordRange({x: 24, y: 13}, {x: 24, y: 16}))

        // backroom
        .concat(coordRange({x: 26, y: 12}, {x: 26, y: 16})),
    forbiddenMovements: [],
    doors: {
        left_door: { x: 10, y: 10, direction: "down", target: { roomId: "school_ground", doorId: "left" } },

        stage_left_top: { x: 10, y: 13, direction: "up", target: { roomId: "taiikukan", doorId: "stage_left_bottom" } },
        stage_left_bottom: { x: 12, y: 10, direction: "down", target: { roomId: "taiikukan", doorId: "stage_left_top" } },

        stage_right_top: { x: 23, y: 13, direction: "up", target: { roomId: "taiikukan", doorId: "stage_right_bottom" } },
        stage_right_bottom: { x: 25, y: 10, direction: "down", target: { roomId: "taiikukan", doorId: "stage_right_top" } },

        balcony_bottom: { x: 8, y: 6, direction: "down", target: { roomId: "taiikukan", doorId: "balcony_top" } },
        balcony_top: { x: 4, y: 14, direction: "left", target: { roomId: "taiikukan", doorId: "balcony_bottom" } },

        booth_outside: { x: 27, y: 10, direction: "down", target: { roomId: "taiikukan", doorId: "booth_inside" } },
        booth_inside: { x: 27, y: 12, direction: "right", target: { roomId: "taiikukan", doorId: "booth_outside" } },
    },
    streamSlotCount: 3,
}