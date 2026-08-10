import { Room } from "../types";

export const takadaiRoom: Room = {
    id: "takadai",
    group: "gikopoi",
    scale: 1,
    size: { x: 9, y: 14 },
    originCoordinates: { x: 870-320, y: 1165-300 },
    spawnPoint: "left",
    backgroundImageUrl: "rooms/takadai/background.svg",
    onlyDrawOverBackgroundImage: true,
    objects: [
        { x:  9, y:  0, offset: { x:  176-320, y:  849-300 }, url: "fences_and_thicket.svg" },

        { x:  1, y:  1, offset: { x:  923-320, y:  911-300 }, url: "house.svg" },
        { x:  0, y:  5, offset: { x:  927-320, y:  939-300 }, url: "house_under.svg" },
        { x:  2, y:  6, offset: { x: 1178-320, y:  978-300 }, url: "hanging_thing.svg" },
        { x:  1, y:  6, offset: { x: 1150-320, y: 1035-300 }, url: "seat.svg" },
        { x:  0, y:  6, offset: { x: 1110-320, y: 1015-300 }, url: "seat.svg" },
        { x:  2, y:  1, offset: { x: 1007-320, y: 1103-300 }, url: "a_frame_sign.svg" },
        { x:  1, y:  7, offset: { x: 1205-320, y:  936-300 }, url: "radio.svg" },
        { x:  0, y: 10, offset: { x: 1272-320, y:  887-300 }, url: "telescope.svg" },
        { x:  0, y: 12, offset: { x: 1352-320, y:  847-300 }, url: "telescope.svg" },
        { x:  5, y:  5, offset: { x: 1290-320, y: 1076-300 }, url: "fire/1.svg",
            animation: { type: "cycle", scenes: { "main": { framesUrlPattern: { "prefix": "fire/", amount: 4, suffix: ".svg" } } }, frameDelay: 250 } },
        { x:  8, y:  0, offset: { x: 1178-320, y: 1124-300 }, url: "denwa_box.svg" },
        { x:  8, y:  2, offset: { x: 1285-320, y: 1218-300 }, url: "jizou_mini.svg" },
        { x:  8, y:  3, offset: { x: 1317-320, y: 1171-300 }, url: "jizou_0.svg" },
        { x:  8, y:  4, offset: { x: 1357-320, y: 1151-300 }, url: "jizou_0.svg" },
        { id: "moving_jizou", x:  8, y:  5, offset: { x: 1397-320, y: 1131-300 }, url: ["jizou_0.svg", "jizou_1.svg", "jizou_2.svg", "jizou_3.svg", "jizou_4.svg"] },

        { x:  9, y:  7, offset: { x: 1509-320, y: 1098-300 }, url: "wall_front_with_bush.svg" },
        { x:  8, y:  7, offset: { x: 1469-320, y: 1078-300 }, url: "wall_front_with_bush_and_hole.svg" },
        { x:  7, y:  7, offset: { x: 1429-320, y: 1058-300 }, url: "wall_front_with_bush.svg" },
        { x:  6, y:  7, offset: { x: 1388-320, y: 1029-300 }, url: "wall_front_with_bush_lamp.svg" },
        
        { x:  6, y:  6, offset: { x: 1388-320, y: 1082-300 }, url: "bush_cover.svg" },
        { x:  7, y:  6, offset: { x: 1429-320, y: 1102-300 }, url: "bush_cover.svg" },
        { x:  8, y:  6, offset: { x: 1469-320, y: 1122-300 }, url: "bush_cover.svg" },
        
        { x:  6, y:  8, offset: { x: 1385-320, y: 1010-300 }, url: "wall_back_with_bush_and_sign.svg" },
        { x:  6, y:  9, offset: { x: 1452-320, y:  990-300 }, url: "wall_back.svg" },
        { x:  6, y: 10, offset: { x: 1492-320, y:  970-300 }, url: "wall_back_with_hole.svg" },
        { x:  6, y: 11, offset: { x: 1532-320, y:  950-300 }, url: "wall_back.svg" },
        { x:  4, y: 11, offset: { x: 1504-320, y:  918-300 }, url: "wall_front.svg" },
        
        { x:  7, y: 12, offset: { x: 1549-320, y:  863-300 }, url: "tree.svg" },
        { x:  8, y: 13, offset: { x: 1719-320, y:  979-300 }, url: "mp_sign.svg" },
        { x:  9, y:  9, offset: { x: 1524-320, y: 1006-300 }, url: "tub_front.svg" },
        { x:  7, y: 10, offset: { x: 1526-320, y: 1040-300 }, url: "tub_back.svg" },
        { x:  8, y:  9, offset: { x: 1569-320, y: 1053-300 }, url: "water_surface.svg" },
    ],
    sit: [
        { x:  2, y:  5 },
        { x:  2, y:  6 },
        { x:  1, y:  6 },

        { x:  6, y:  9 },
        { x:  6, y: 10 },
    ],
    blocked: [
        // dango flag
        { x:  0, y:  0 },
        // naito shop
        { x:  0, y:  1 },
        { x:  1, y:  1 },
        { x:  1, y:  7 },
        { x:  0, y:  1 },
        { x:  0, y:  2 },
        { x:  0, y:  5 },

        { x:  0, y: 10 },
        { x:  0, y: 12 },
        { x:  5, y:  8 },
        { x:  5, y:  9 },

        { x:  6, y:  8 },
        { x:  7, y:  8 },
        { x:  8, y:  8 },

        { x:  2, y:  1 },

        { x:  5, y:  5 },

        { x:  7, y:  0 },
        { x:  8, y:  1 },

        { x:  8, y:  2 },
        { x:  8, y:  3 },
        { x:  8, y:  4 },
        { x:  8, y:  5 },

        { x:  6, y: 12 },
        { x:  8, y: 13 },
    ],
    forbiddenMovements: [
        { xFrom: 2, yFrom: 2, xTo: 1, yTo: 2 },
        { xFrom: 2, yFrom: 3, xTo: 1, yTo: 3 },
        { xFrom: 1, yFrom: 2, xTo: 2, yTo: 2 },
        { xFrom: 1, yFrom: 3, xTo: 2, yTo: 3 },

        { xFrom: 5, yFrom: 10, xTo: 6, yTo: 10 },
        { xFrom: 6, yFrom: 10, xTo: 5, yTo: 10 },
        { xFrom: 5, yFrom: 11, xTo: 6, yTo: 11 },
        { xFrom: 6, yFrom: 11, xTo: 5, yTo: 11 },

        { xFrom: 5, yFrom: 11, xTo: 5, yTo: 12 },
        { xFrom: 5, yFrom: 12, xTo: 5, yTo: 11 },
        { xFrom: 4, yFrom: 11, xTo: 4, yTo: 12 },
        { xFrom: 4, yFrom: 12, xTo: 4, yTo: 11 },

        { xFrom: 6, yFrom: 10, xTo: 7, yTo: 10 },
        { xFrom: 7, yFrom: 10, xTo: 6, yTo: 10 },
        { xFrom: 7, yFrom: 11, xTo: 7, yTo: 10 },
        { xFrom: 7, yFrom: 10, xTo: 7, yTo: 11 },
        
        { xFrom: 7, yFrom: 1, xTo: 7, yTo: 2 },
        { xFrom: 7, yFrom: 2, xTo: 7, yTo: 1 },
        
        { xFrom: 1, yFrom: 5, xTo: 1, yTo: 6 },
        { xFrom: 1, yFrom: 6, xTo: 1, yTo: 5 },
    ],
    doors: {
        left: { x: 1, y: 0, direction: "up", target: { roomId: "kaidan", doorId: "top_left" } },
        right: { x: 5, y: 0, direction: "up", target: { roomId: "silo", doorId: "right" } },
    },
    streamSlotCount: 2,
}