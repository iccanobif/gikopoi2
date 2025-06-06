import { Room, DynamicRoom, Coordinates } from "./types";
import { getCurrentAnnualEvents } from "../common/annualevents";


function coordRange(from: Coordinates, to: Coordinates): Coordinates[]
{
    const coords = []
    for (let x=from.x; x<to.x+1; x+=(from.x<=to.x?1:-1))
    {
        for (let y=from.y; y<to.y+1; y+=(from.y<=to.y?1:-1))
        {
            coords.push({x, y})
        }
    }
    return coords
}

export const rooms: { [roomId: string]: Room } = {
    bar: {
        id: "bar",
        group: "gikopoi",
        scale: 1,
        size: { x: 9, y: 9 },
        originCoordinates: { x: 0, y: 352 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/bar/background.svg",
        objects: [
            { x: 2, y: 1, offset: { x: 130, y: 311 }, url: "table.svg" },
            { x: 2, y: 2, offset: { x: 170, y: 291 }, url: "table.svg" },
            { x: 6, y: 1, offset: { x: 290, y: 391 }, url: "table.svg" },
            { x: 6, y: 2, offset: { x: 330, y: 370 }, url: "table.svg" },
            
            { x: 2, y: 7, offset: { x: 372, y: 184 }, url: "counter_left.svg" },
            { x: 2, y: 6, offset: { x: 332, y: 204 }, url: "counter_left.svg" },
            { x: 2, y: 5, offset: { x: 315, y: 224 }, url: "counter_bottom_left.svg" },
            { x: 3, y: 5, offset: { x: 319, y: 244 }, url: "counter_bottom.svg" },
            { x: 4, y: 5, offset: { x: 359, y: 264 }, url: "counter_bottom.svg" },
            { x: 5, y: 5, offset: { x: 399, y: 284 }, url: "counter_bottom.svg" },
            { x: 6, y: 5, offset: { x: 440, y: 299 }, url: "counter_bottom_right.svg" },
            { x: 6, y: 6, offset: { x: 477, y: 279 }, url: "counter_right.svg" },
            { x: 6, y: 7, offset: { x: 517, y: 259 }, url: "counter_right.svg" },
            
            { x: 1, y: 8, offset: { x: 372, y:  86 }, url: "shelves.svg" },
            
            { x: 0, y: 0, offset: { x:  45, y: 183 }, url: "light.svg" },
            { x: 0, y: 2, offset: { x: 125, y: 143 }, url: "light.svg" },
            { x: 0, y: 4, offset: { x: 204, y: 103 }, url: "light.svg" },
        ],
        sit: [
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 5, y: 1 },
            { x: 5, y: 2 },
            { x: 7, y: 1 },
            { x: 7, y: 2 },
            { x: 1, y: 5 },
            { x: 1, y: 6 },
            { x: 1, y: 7 },
            { x: 2, y: 4 },
            { x: 3, y: 4 },
            { x: 4, y: 4 },
            { x: 5, y: 4 },
            { x: 6, y: 4 },
            { x: 7, y: 5 },
            { x: 7, y: 6 },
            { x: 7, y: 7 }
        ],
        blocked: [
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 6, y: 1 },
            { x: 6, y: 2 },
            { x: 2, y: 5 },
            { x: 3, y: 5 },
            { x: 4, y: 5 },
            { x: 5, y: 5 },
            { x: 6, y: 5 },
            { x: 2, y: 6 },
            { x: 2, y: 7 },
            { x: 6, y: 6 },
            { x: 6, y: 7 },
            { x: 1, y: 8 },
            { x: 2, y: 8 },
            { x: 3, y: 8 },
            { x: 4, y: 8 },
            { x: 5, y: 8 },
            { x: 6, y: 8 },
            { x: 7, y: 8 },
        ],
        forbiddenMovements: [],
        doors: {
            right: { x: 8, y: 4, direction: "left", target: { roomId: "bar_st", doorId: "bar" } },
            ladder: { x: 0, y: 0, direction: "right", target: { roomId: "bar_st", doorId: "bar_roof" } },
            hatch: { x: 3, y: 7, direction: "down", target: { roomId: "basement", doorId: "left" } }
        },
        streamSlotCount: 2,
    },
    admin_st: {
        id: "admin_st",
        group: "gikopoi",
        scale: 1,
        size: { x: 10, y: 9 },
        originCoordinates: { x: 0, y: 235 },
        spawnPoint: "admin",
        backgroundImageUrl: "rooms/admin_st/background.svg",
        objects: [
            { x: 1, y: 5, url: "house1.svg", offset: { x: 241, y: -28 } },
            { x: 1, y: 5, url: "house2.svg", offset: { x: 241, y: 2 } },
            { x: 5, y: 4, url: "trash-bin1.svg", offset: { x: 365, y: 169 } },
            { x: 6, y: 4, url: "trash-bin2.svg", offset: { x: 375, y: 152 } },
            { x: 5, y: 7, url: "go-table.svg", offset: { x: 492, y: 140 } },
            { x: 5, y: 6, url: "chair.svg", offset: { x: 469, y: 174 } },
            { x: 5, y: 8, url: "chair.svg", offset: { x: 549, y: 134 } },

            { x: 6, y: 5, url: "boom-barrier.svg", offset: { x: 440, y: 187 } },
            { x: 10, y: 4, url: "funkyboon.svg", offset: { x: 527, y: 217 } },
        ],
        sit: [
            { x: 5, y: 6 },
            { x: 5, y: 8 },
            { x: 2, y: 6 },
            { x: 3, y: 6 },
            { x: 3, y: 7 },

        ],
        blocked: [
            { x: 1, y: 5 },
            { x: 1, y: 6 },
            { x: 1, y: 8 },
            { x: 2, y: 5 },
            //{ x: 2, y: 7 },
            { x: 2, y: 8 },
            { x: 3, y: 5 },
            { x: 3, y: 8 },
            { x: 4, y: 5 },
            { x: 4, y: 6 },
            { x: 4, y: 7 },
            { x: 4, y: 8 },
            { x: 6, y: 5 },
            { x: 7, y: 5 },
            { x: 8, y: 5 },

            { x: 5, y: 7 }, // go table
        ],
        forbiddenMovements: [
            // can't enter the trash bin
            { xFrom: 4, yFrom: 4, xTo: 5, yTo: 4 },
            { xFrom: 6, yFrom: 4, xTo: 5, yTo: 4 },
            { xFrom: 5, yFrom: 3, xTo: 5, yTo: 4 },
            // can't exit the trash bin
            { xFrom: 5, yFrom: 4, xTo: 5, yTo: 3 },
            { xFrom: 5, yFrom: 4, xTo: 6, yTo: 4 },
            { xFrom: 5, yFrom: 4, xTo: 4, yTo: 4 },
            // can't enter funky boon
            { xFrom: 9, yFrom: 3, xTo: 9, yTo: 4 },
            { xFrom: 8, yFrom: 4, xTo: 9, yTo: 4 },
            // cant' exit funky boon
            { xFrom: 9, yFrom: 4, xTo: 9, yTo: 3 },
            { xFrom: 9, yFrom: 4, xTo: 8, yTo: 4 },
            
            { xFrom: 3, yFrom: 7, xTo: 2, yTo: 7 },
        ],
        worldSpawns: [
            { x: 3, y: 2, direction: "right", target: null },
            { x: 4, y: 2, direction: "right", target: null },
            { x: 5, y: 2, direction: "right", target: null },
            { x: 6, y: 2, direction: "right", target: null },
        ],
        doors: {
            left: { x: 0, y: 2, direction: "right", target: { roomId: "bar_st", doorId: "right" } },
            admin: { x: 2, y: 4, direction: "down", target: { roomId: "admin", doorId: "down" } },
            barrier: { x: 7, y: 4, direction: "down", target: { roomId: "radio", doorId: "down" } },
            down: { x: 7, y: 0, direction: "up", target: { roomId: "cafe_st", doorId: "up" } },
            right: { x: 9, y: 2, direction: "left", target: { roomId: "kaidan", doorId: "bottom_left" } },
            up_left: { x: 0, y: 8, direction: "down", target: { roomId: "admin_bar", doorId: "spawn" } },
            manhole_left: { x: 2, y: 0, direction: "up", target: { roomId: "basement", doorId: "up_right_1" } },
            manhole_right: { x: 9, y: 7, direction: "up", target: { roomId: "basement", doorId: "up_right_2" } },
            warp: { x: 9, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "trash" } },
            trash: { x: 5, y: 4, direction: "down", target: null },
            behind_house: { x: 1, y: 7, direction: "left", target: { roomId: "admin_st", doorId: "on_wall" } },
            on_wall: { x: 3, y: 7, direction: "down", target: null },
            admin_jump: { x: 2, y: 7, direction: "left", target: { roomId: "admin_old", doorId: "down" } },
        },
        streamSlotCount: 0,
        games: ["chess"],
    },
    basement: {
        id: "basement",
        group: "gikopoi",
        scale: 1,
        size: { x: 10, y: 4 },
        originCoordinates: { x: 0, y: 217 },
        spawnPoint: "secret_bar",
        backgroundImageUrl: "rooms/basement/background.svg",
        objects: [
            { x:  0, y: -1, offset: { x:    4, y:   68 }, url: "light_hori.svg" },
            { x:  0, y:  2, offset: { x:  123, y:    8 }, url: "light_hori.svg" },
            
            { x:  3, y:  2, offset: { x:  253, y:   68 }, url: "light_vert.svg" },
            { x:  6, y:  2, offset: { x:  373, y:  128 }, url: "light_vert.svg" },
            { x:  9, y:  2, offset: { x:  493, y:  188 }, url: "light_vert.svg" },
        ],
        sit: [],
        blocked: [
            { x: 4, y: 3 }
        ],
        forbiddenMovements: [
        ],
        doors: {
            left: { x: 0, y: 2, direction: "right", target: { roomId: "bar", doorId: "hatch" } },
            up_left: { x: 1, y: 3, direction: "down", target: { roomId: "bar_st", doorId: "manhole" } },
            secret_bar: { x: 3, y: 3, direction: "down", target: { roomId: "izakaya774", doorId: "down" } },
            bar774: { x: 6, y: 3, direction: "down", target: { roomId: "bar774", doorId: "down" } },
            up_right_1: { x: 8, y: 3, direction: "down", target: { roomId: "admin_st", doorId: "manhole_left" } },
            up_right_2: { x: 9, y: 3, direction: "down", target: { roomId: "admin_st", doorId: "manhole_right" } },
            down_left: { x: 1, y: 0, direction: "up", target: { roomId: "school_st", doorId: "manhole" } },
            down_right: { x: 8, y: 0, direction: "up", target: { roomId: "cafe_st", doorId: "manhole" } },
        },
        streamSlotCount: 0,
    },
    admin: {
        id: "admin",
        group: "gikopoi",
        scale: 1,
        size: { x: 12, y: 6 },
        originCoordinates: { x: 43, y: 268 },
        spawnPoint: "down",
        backgroundImageUrl: "rooms/admin/background.svg",
        objects: [
            { x: 2, y: 1, url: "long_table_left.svg", offset: { x: 164, y: 194 } },
            { x: 2, y: 3, url: "long_table_right.svg", offset: { x: 237, y: 164 } },
            { x: 8, y: 2, url: "round_table.svg", offset: { x: 473, y: 313 } },
        ],
        sit: [
            { x: 10, y: 2 },
            { x: 10, y: 3 },
            { x: 7, y: 2 },
            { x: 7, y: 3 },
            { x: 9, y: 1 },
            { x: 9, y: 4 },
            { x: 8, y: 1 },
            { x: 8, y: 4 },
            { x: 4, y: 1 },
            { x: 4, y: 2 },
            { x: 4, y: 3 },
            { x: 4, y: 4 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 },
        ],
        blocked: [
            { x: 0, y: 5 }, // shobon
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 2, y: 4 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 3, y: 4 },
            { x: 8, y: 2 },
            { x: 8, y: 3 },
            { x: 9, y: 2 },
            { x: 9, y: 3 },
            { x: 6, y: 5 },
        ],
        forbiddenMovements: [],
        doors: {
            down: { x: 10, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "admin" } }
        },
        streamSlotCount: 3,
    },
    admin_old: {
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
    },
    radio_backstage: {
        id: "radio_backstage",
        group: "gikopoi",
        scale: 1,
        size: { x: 3, y: 9 },
        originCoordinates: { x: 0, y: 432 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/radio_backstage/background.svg",
        backgroundColor: "#333333",
        objects: [
            { x:  0, y:  1, offset: { x:   56, y:  323 }, url: "manekin.svg" },
        ],
        sit: [],
        blocked: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 7 },
            { x: 0, y: 8 },
        ],
        forbiddenMovements: [],
        doors: {
            bottom: { x: 2, y: 1, direction: "left", target: { roomId: "radio_gakuya", doorId: "door" } },
            center: { x: 2, y: 4, direction: "left", target: { roomId: "radio_room2", doorId: "stage_door" } },
            top: { x: 2, y: 7, direction: "left", target: { roomId: "radio_room3", doorId: "stage_door" } },
            spawn: { x: 2, y: 2, direction: "left", target: null }
        },
        streamSlotCount: 0,
    },
    school_st: {
        id: "school_st",
        group: "gikopoi",
        scale: 1,
        size: { x: 6, y: 8 },
        originCoordinates: { x: -1, y: 273 },
        spawnPoint: "school",
        backgroundImageUrl: "rooms/school_st/background.svg",
        objects: [
            { x: 0, y: 4, url: "wall.svg", offset: { x: 120, y: 84 } },
        ],
        sit: [],
        blocked: [
            { x: 0, y: 3 },
            { x: 0, y: 4 },
            { x: 0, y: 4 },
            { x: 0, y: 6 },
            { x: 0, y: 7 },
        ],
        forbiddenMovements: [],
        worldSpawns: [
            { x: 3, y: 4, direction: "down", target: null }
        ],
        doors: {
            left: { x: 0, y: 2, direction: "right", target: { roomId: "busstop", doorId: "right" } },
            school: { x: 0, y: 5, direction: "right", target: { roomId: "school_rouka", doorId: "right_top" } },
            up: { x: 3, y: 7, direction: "down", target: { roomId: "bar_st", doorId: "down" } },
            right: { x: 5, y: 2, direction: "left", target: { roomId: "cafe_st", doorId: "left" } },
            manhole: { x: 4, y: 1, direction: "down", target: { roomId: "basement", doorId: "down_left" } }
        },
        streamSlotCount: 0,
    },
    bar_st: {
        id: "bar_st",
        group: "gikopoi",
        scale: 1,
        size: { x: 10, y: 9 },
        originCoordinates: { x: -1, y: 323 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/bar_st/background.svg",
        objects: [
            { x: 4, y: 5, url: "doorstep.svg", offset: { x: 362, y: 187 } },
            { x: 5, y: 5, url: "signboard.svg", offset: { x: 360, y: 132 } },
        ],
        sit: [
            { x: 0, y: 7 },
            { x: 0, y: 8 },

            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },

            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },

            { x: 4, y: 7 },
            { x: 4, y: 8 },
        ],
        blocked: [
            // roof:
            { x: 0, y: 6 },
            { x: 1, y: 7 },
            { x: 1, y: 8 },

            // cola vending machines:
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 1, y: 3 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            // building:
            { x: 3, y: 4 },
            { x: 3, y: 5 },
            { x: 3, y: 6 },
            { x: 3, y: 7 },
            { x: 3, y: 8 },
        ],
        forbiddenMovements: [
            { xFrom: 4, yFrom: 5, xTo: 5, yTo: 5 },
            { xFrom: 4, yFrom: 5, xTo: 4, yTo: 6 },
            { xFrom: 5, yFrom: 5, xTo: 4, yTo: 5 },
            { xFrom: 4, yFrom: 6, xTo: 4, yTo: 5 },
        ],
        doors: {
            bar_roof: { x: 0, y: 8, direction: "down", target: null },
            bar: { x: 4, y: 5, direction: "right", target: { roomId: "bar", doorId: "right" } },
            spawn: { x: 4, y: 5, direction: "down", target: null },
            down: { x: 7, y: 0, direction: "up", target: { roomId: "school_st", doorId: "up" } },
            up: { x: 7, y: 8, direction: "down", target: { roomId: "long_st", doorId: "down" } },
            up_right: { x: 9, y: 8, direction: "down", target: { roomId: "yatai", doorId: "down" } },
            right: { x: 9, y: 2, direction: "left", target: { roomId: "admin_st", doorId: "left" } },
            manhole: { x: 8, y: 4, direction: "up", target: { roomId: "basement", doorId: "up_left" } }
        },
        streamSlotCount: 0,
    },
    takadai: {
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
    },
    silo: {
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
    },
    badend: {
        id: "badend",
        group: "gikopoipoi",
        scale: 0.59,
        size: { x: 50, y: 50 },
        originCoordinates: { x: 0, y: 0 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/badend/badend.jpg",
        backgroundColor: "#000000",
        backgroundOffset: { x: 0, y: -320 },
        needsFixedCamera: true,
        objects: [],
        sit: [],
        blocked: [],
        forbiddenMovements: [],
        doors: {
            spawn: { x: 6, y: 7, direction: "left", target: null },
            rip: { x: -100, y: -100, direction: "left", target: null }
        },
        streamSlotCount: 0,
        secret: true
    },
    yoshinoya: {
        id: "yoshinoya",
        group: "bar_giko",
        scale: 1,
        size: { x: 12, y: 14 },
        originCoordinates: { x: 13, y: 355 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/yoshinoya/yoshinoya.svg",
        backgroundColor: "#222",
        objects: [
            { x: 3, y: 11, url: "wall-with-squid.svg", scale: 1, offset: { x: 570, y: 39 } },

            // left table
            { x: 0 + 4, y: 3, url: "counter-left.svg", scale: 1, offset: { x: 294, y: 304 } },
            { x: 1 + 4, y: 3, url: "counter-left.svg", scale: 1, offset: { x: 294 + 1 * 40, y: 304 + 1 * 20 } },
            { x: 2 + 4, y: 3, url: "counter-left.svg", scale: 1, offset: { x: 294 + 2 * 40, y: 304 + 2 * 20 } },
            { x: 3 + 4, y: 3, url: "counter-left.svg", scale: 1, offset: { x: 294 + 3 * 40, y: 304 + 3 * 20 } },
            { x: 4 + 4, y: 3, url: "counter-left.svg", scale: 1, offset: { x: 294 + 4 * 40, y: 304 + 4 * 20 } },

            { x: 0 + 4, y: 5, url: "counter-right.svg", scale: 1, offset: { x: 373, y: 265 } },
            { x: 1 + 4, y: 5, url: "counter-right.svg", scale: 1, offset: { x: 373 + 1 * 40, y: 265 + 1 * 20 } },
            { x: 2 + 4, y: 5, url: "counter-right.svg", scale: 1, offset: { x: 373 + 2 * 40, y: 265 + 2 * 20 } },
            { x: 3 + 4, y: 5, url: "counter-right.svg", scale: 1, offset: { x: 373 + 3 * 40, y: 265 + 3 * 20 } },
            { x: 4 + 4, y: 5, url: "counter-right.svg", scale: 1, offset: { x: 373 + 4 * 40, y: 265 + 4 * 20 } },

            { x: 5 + 4, y: 4, url: "counter-middle.svg", scale: 1, offset: { x: 531, y: 383 } },
            { x: 5 + 4, y: 3, url: "counter-left-corner.svg", scale: 1, offset: { x: 492, y: 403 } },
            { x: 5 + 4, y: 5, url: "counter-right-corner.svg", scale: 1, offset: { x: 570, y: 363 } },

            // right table
            { x: 5 + 4, y: 3 + 6, url: "counter-left-corner.svg", scale: 1, offset: { x: 728, y: 285 } },
            { x: 5 + 4, y: 4 + 6, url: "counter-middle.svg", scale: 1, offset: { x: 768, y: 265 } },
            { x: 5 + 4, y: 5 + 6, url: "counter-right-corner.svg", scale: 1, offset: { x: 807, y: 245 } },
            { x: 0 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, offset: { x: 531, y: 186 } },
            { x: 1 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, offset: { x: 531 + 1 * 40, y: 186 + 1 * 20 } },
            { x: 2 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, offset: { x: 531 + 2 * 40, y: 186 + 2 * 20 } },
            { x: 3 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, offset: { x: 531 + 3 * 40, y: 186 + 3 * 20 } },
            { x: 4 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, offset: { x: 531 + 4 * 40, y: 186 + 4 * 20 } },
            { x: 0 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, offset: { x: 610, y: 146 } },
            { x: 1 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, offset: { x: 610 + 1 * 40, y: 146 + 1 * 20 } },
            { x: 2 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, offset: { x: 610 + 2 * 40, y: 146 + 2 * 20 } },
            { x: 3 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, offset: { x: 610 + 3 * 40, y: 146 + 3 * 20 } },
            { x: 4 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, offset: { x: 610 + 4 * 40, y: 146 + 4 * 20 } },

            // cooking table
            { x: 3, y: 5, url: "small-wallish-thing.svg", scale: 1, offset: { x: 334 + 0 * 40, y: 241 - 0 * 20 } },
            { x: 3, y: 6, url: "small-wallish-thing.svg", scale: 1, offset: { x: 334 + 1 * 40, y: 241 - 1 * 20 } },
            { x: 3, y: 7, url: "small-wallish-thing.svg", scale: 1, offset: { x: 334 + 2 * 40, y: 241 - 2 * 20 } },
            { x: 3, y: 8, url: "small-wallish-thing.svg", scale: 1, offset: { x: 334 + 3 * 40, y: 241 - 3 * 20 } },
            { x: 3, y: 9, url: "small-wallish-thing.svg", scale: 1, offset: { x: 334 + 4 * 40, y: 241 - 4 * 20 } },

            { x: 0, y: 0, url: "left-wall.svg", scale: 1, offset: { x: 176, y: 197 } },
        ],
        sit: [
            // left table
            { x: 0 + 4, y: 2 },
            { x: 1 + 4, y: 2 },
            { x: 2 + 4, y: 2 },
            { x: 3 + 4, y: 2 },
            { x: 4 + 4, y: 2 },
            { x: 6 + 4, y: 3 },
            { x: 6 + 4, y: 4 },
            { x: 6 + 4, y: 5 },
            { x: 0 + 4, y: 6 },
            { x: 1 + 4, y: 6 },
            { x: 2 + 4, y: 6 },
            { x: 3 + 4, y: 6 },
            { x: 4 + 4, y: 6 },
            // right table
            { x: 0 + 4, y: 2 + 6 },
            { x: 1 + 4, y: 2 + 6 },
            { x: 2 + 4, y: 2 + 6 },
            { x: 3 + 4, y: 2 + 6 },
            { x: 4 + 4, y: 2 + 6 },
            { x: 6 + 4, y: 3 + 6 },
            { x: 6 + 4, y: 4 + 6 },
            { x: 6 + 4, y: 5 + 6 },
            { x: 0 + 4, y: 6 + 6 },
            { x: 1 + 4, y: 6 + 6 },
            { x: 2 + 4, y: 6 + 6 },
            { x: 3 + 4, y: 6 + 6 },
            { x: 4 + 4, y: 6 + 6 },
        ],
        blocked: [
            // left wall
            { x: 3, y: 0 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 3, y: 6 },
            { x: 3, y: 7 },
            { x: 3, y: 8 },
            { x: 3, y: 9 },
            //left table
            { x: 0 + 4, y: 3 },
            { x: 1 + 4, y: 3 },
            { x: 2 + 4, y: 3 },
            { x: 3 + 4, y: 3 },
            { x: 4 + 4, y: 3 },
            { x: 5 + 4, y: 3 },
            { x: 0 + 4, y: 5 },
            { x: 1 + 4, y: 5 },
            { x: 2 + 4, y: 5 },
            { x: 3 + 4, y: 5 },
            { x: 4 + 4, y: 5 },
            { x: 5 + 4, y: 5 },
            { x: 5 + 4, y: 4 },
            // right table
            { x: 0 + 4, y: 3 + 6 },
            { x: 1 + 4, y: 3 + 6 },
            { x: 2 + 4, y: 3 + 6 },
            { x: 3 + 4, y: 3 + 6 },
            { x: 4 + 4, y: 3 + 6 },
            { x: 5 + 4, y: 3 + 6 },
            { x: 0 + 4, y: 5 + 6 },
            { x: 1 + 4, y: 5 + 6 },
            { x: 2 + 4, y: 5 + 6 },
            { x: 3 + 4, y: 5 + 6 },
            { x: 4 + 4, y: 5 + 6 },
            { x: 5 + 4, y: 5 + 6 },
            { x: 5 + 4, y: 4 + 6 },

            // wall
            { x: 1, y: 4 },
            { x: 1, y: 5 },
            { x: 1, y: 6 },
            { x: 1, y: 7 },
            { x: 1, y: 8 },
            { x: 1, y: 9 },
            { x: 1, y: 10 },
            { x: 1, y: 11 },
            { x: 1, y: 12 },
            { x: 1, y: 13 },
            { x: 2, y: 3 },


            { x: 3, y: 11 },
            { x: 3, y: 12 },
            { x: 3, y: 5 },
        ],
        forbiddenMovements: [
        ],
        doors: {
            spawn: { x: 6, y: 7, direction: "up", target: null },
            door: { x: 11, y: 7, direction: "left", target: { roomId: "bar_giko_square", doorId: "yoshinoya" } }
        },
        streamSlotCount: 1,
    },
    long_st: {
        id: "long_st",
        group: "gikopoi",
        scale: 1,
        size: { x: 3, y: 33 },
        originCoordinates: { x: 14, y: 864 },
        spawnPoint: "down",
        backgroundImageUrl: "rooms/long_st/long_st.svg",
        objects: [],
        sit: [
            { x: 0, y: 0 }
        ],
        blocked: [
            { x: 2, y: 32 }
        ],
        forbiddenMovements: [],
        doors: {
            down: { x: 1, y: 0, direction: "up", target: { roomId: "bar_st", doorId: "up" } },
            up: { x: 1, y: 32, direction: "down", target: { roomId: "long_st", doorId: "down" } },
            left: { x: 0, y: 30, direction: "right", target: { roomId: "jinja_st", doorId: "right" } }
        },
        streamSlotCount: 0,
    },
    bar_giko: {
        id: "bar_giko",
        group: "bar_giko",
        scale: 1,
        size: { x: 14, y: 20 },
        originCoordinates: { x: 1, y: 382 },
        spawnPoint: "stairs",
        backgroundImageUrl: "rooms/bar_giko/background_with_stools.svg",
        backgroundColor: "#222",
        objects: [
            { x:  2, y:  5, offset: { x:  280, y:  250 }, url: "counter_left.svg" },
            { x:  2, y:  4, offset: { x:  240, y:  270 }, url: "counter_bottom_left.svg" },
            { x:  3, y:  4, offset: { x:  280, y:  290 }, url: "counter_bottom.svg" },
            { x:  4, y:  4, offset: { x:  320, y:  310 }, url: "counter_bottom.svg" },
            { x:  5, y:  4, offset: { x:  360, y:  330 }, url: "counter_bottom.svg" },
            { x:  6, y:  4, offset: { x:  400, y:  350 }, url: "counter_bottom.svg" },
            { x:  7, y:  4, offset: { x:  440, y:  370 }, url: "counter_bottom.svg" },
            { x:  8, y:  4, offset: { x:  480, y:  390 }, url: "counter_bottom_right.svg" },
            { x:  8, y:  5, offset: { x:  520, y:  370 }, url: "counter_right.svg" },
            
            { x:  8, y:  7, offset: { x:  600, y:  330 }, url: "counter_right.svg" },
            { x:  8, y:  8, offset: { x:  640, y:  310 }, url: "counter_right.svg" },
            { x:  8, y:  9, offset: { x:  680, y:  290 }, url: "counter_right.svg" },
            { x:  8, y: 10, offset: { x:  720, y:  270 }, url: "counter_right.svg" },
            { x:  8, y: 11, offset: { x:  760, y:  250 }, url: "counter_right.svg" },
            
            { x:  8, y: 13, offset: { x:  840, y:  210 }, url: "counter_right.svg" },
            { x:  8, y: 14, offset: { x:  880, y:  190 }, url: "counter_right.svg" },
            { x:  8, y: 15, offset: { x:  920, y:  170 }, url: "counter_right.svg" },
            { x:  8, y: 16, offset: { x:  960, y:  150 }, url: "counter_right.svg" },
            { x:  8, y: 17, offset: { x: 1000, y:  130 }, url: "counter_right.svg" },
            { x:  8, y: 18, offset: { x: 1040, y:  110 }, url: "counter_top_right.svg" },
            { x:  7, y: 18, offset: { x: 1000, y:   90 }, url: "counter_top.svg" },
            /*
            { x:  1, y:  5, offset: { x:  269, y:  263 }, url: "chair.svg" },
            { x:  1, y:  4, offset: { x:  229, y:  283 }, url: "chair.svg" },
            
            { x:  2, y:  3, offset: { x:  229, y:  323 }, url: "chair.svg" },
            { x:  3, y:  3, offset: { x:  269, y:  343 }, url: "chair.svg" },
            { x:  4, y:  3, offset: { x:  309, y:  363 }, url: "chair.svg" },
            { x:  5, y:  3, offset: { x:  349, y:  383 }, url: "chair.svg" },
            { x:  6, y:  3, offset: { x:  389, y:  403 }, url: "chair.svg" },
            { x:  7, y:  3, offset: { x:  429, y:  423 }, url: "chair.svg" },
            { x:  8, y:  3, offset: { x:  469, y:  443 }, url: "chair.svg" },
            
            { x:  9, y:  4, offset: { x:  549, y:  443 }, url: "chair.svg" },
            { x:  9, y:  5, offset: { x:  589, y:  423 }, url: "chair.svg" },
            
            { x:  9, y:  7, offset: { x:  669, y:  383 }, url: "chair.svg" },
            { x:  9, y:  8, offset: { x:  709, y:  363 }, url: "chair.svg" },
            { x:  9, y:  9, offset: { x:  749, y:  343 }, url: "chair.svg" },
            { x:  9, y: 10, offset: { x:  789, y:  323 }, url: "chair.svg" },
            { x:  9, y: 11, offset: { x:  829, y:  303 }, url: "chair.svg" },
            
            { x:  9, y: 13, offset: { x:  909, y:  263 }, url: "chair.svg" },
            { x:  9, y: 14, offset: { x:  949, y:  243 }, url: "chair.svg" },
            { x:  9, y: 15, offset: { x:  989, y:  223 }, url: "chair.svg" },
            { x:  9, y: 16, offset: { x: 1029, y:  203 }, url: "chair.svg" },
            { x:  9, y: 17, offset: { x: 1070, y:  183 }, url: "chair.svg" },
            */
            //{ x:  2, y:  0, offset: { x:  109, y:  383 }, url: "chair.svg" },
            { x:  3, y:  0, offset: { x:  120, y:  370 }, url: "table_hori.svg" },
            //{ x:  4, y:  0, offset: { x:  189, y:  423 }, url: "chair.svg" },
            
            //{ x:  7, y:  0, offset: { x:  309, y:  483 }, url: "chair.svg" },
            { x:  8, y:  0, offset: { x:  320, y:  470 }, url: "table_hori.svg" },
            //{ x:  9, y:  0, offset: { x:  389, y:  523 }, url: "chair.svg" },
            
            //{ x: 12, y:  1, offset: { x:  549, y:  563 }, url: "chair.svg" },
            //{ x: 13, y:  1, offset: { x:  589, y:  583 }, url: "chair.svg" },
            { x: 12, y:  2, offset: { x:  560, y:  510 }, url: "table_vert.svg" },
            { x: 13, y:  2, offset: { x:  600, y:  530 }, url: "table_vert.svg" },
            //{ x: 12, y:  3, offset: { x:  629, y:  523 }, url: "chair.svg" },
            //{ x: 13, y:  3, offset: { x:  669, y:  543 }, url: "chair.svg" },
            
            //{ x: 12, y:  5, offset: { x:  709, y:  483 }, url: "chair.svg" },
            //{ x: 13, y:  5, offset: { x:  749, y:  503 }, url: "chair.svg" },
            { x: 12, y:  6, offset: { x:  720, y:  430 }, url: "table_vert.svg" },
            { x: 13, y:  6, offset: { x:  760, y:  450 }, url: "table_vert.svg" },
            //{ x: 12, y:  7, offset: { x:  789, y:  443 }, url: "chair.svg" },
            //{ x: 13, y:  7, offset: { x:  829, y:  463 }, url: "chair.svg" },
            
            //{ x: 12, y: 12, offset: { x:  989, y:  343 }, url: "chair.svg" },
            //{ x: 13, y: 12, offset: { x: 1029, y:  363 }, url: "chair.svg" },
            { x: 12, y: 13, offset: { x: 1000, y:  290 }, url: "table_vert.svg" },
            { x: 13, y: 13, offset: { x: 1040, y:  310 }, url: "table_vert.svg" },
            //{ x: 12, y: 14, offset: { x: 1069, y:  303 }, url: "chair.svg" },
            //{ x: 13, y: 14, offset: { x: 1109, y:  323 }, url: "chair.svg" },
            
            //{ x: 12, y: 16, offset: { x: 1149, y:  263 }, url: "chair.svg" },
            //{ x: 13, y: 16, offset: { x: 1189, y:  283 }, url: "chair.svg" },
            { x: 12, y: 17, offset: { x: 1160, y:  210 }, url: "table_vert.svg" },
            { x: 13, y: 17, offset: { x: 1200, y:  230 }, url: "table_vert.svg" },
            //{ x: 12, y: 18, offset: { x: 1229, y:  223 }, url: "chair.svg" },
            //{ x: 13, y: 18, offset: { x: 1269, y:  243 }, url: "chair.svg" },
        ],
        sit: [
            { x:  0, y: 13 },
            { x:  1, y: 13 },
            { x:  2, y: 13 },
            { x:  3, y: 13 },
            { x:  4, y: 13 },
            { x:  0, y: 14 },
            { x:  2, y: 14 },
            { x:  0, y: 15 },
            { x:  1, y: 15 },
            { x:  2, y: 15 },
            { x:  3, y: 15 },
            { x:  4, y: 15 },
            
            // counter chairs
            { x:  1, y:  5 },
            { x:  1, y:  4 },
            
            { x:  2, y:  3 },
            { x:  3, y:  3 },
            { x:  4, y:  3 },
            { x:  5, y:  3 },
            { x:  6, y:  3 },
            { x:  7, y:  3 },
            { x:  8, y:  3 },
            
            { x:  9, y:  4 },
            { x:  9, y:  5 },
            
            { x:  9, y:  7 },
            { x:  9, y:  8 },
            { x:  9, y:  9 },
            { x:  9, y: 10 },
            { x:  9, y: 11 },
            
            { x:  9, y: 13 },
            { x:  9, y: 14 },
            { x:  9, y: 15 },
            { x:  9, y: 16 },
            { x:  9, y: 17 },
            
            // single table chairs
            { x:  2, y:  0 },
            { x:  4, y:  0 },
            
            { x:  7, y:  0 },
            { x:  9, y:  0 },
            
            // double table chairs
            { x: 12, y:  1 },
            { x: 13, y:  1 },
            
            { x: 12, y:  3 },
            { x: 13, y:  3 },
            
            { x: 12, y:  5 },
            { x: 13, y:  5 },
            
            { x: 12, y:  7 },
            { x: 13, y:  7 },
            
            { x: 12, y: 12 },
            { x: 13, y: 12 },
            
            { x: 12, y: 14 },
            { x: 13, y: 14 },
            
            { x: 12, y: 16 },
            { x: 13, y: 16 },
            
            { x: 12, y: 18 },
            { x: 13, y: 18 },
        ],
        blocked: [
            { x:  0, y:  8 },
            { x:  1, y:  8 },
            { x:  2, y:  8 },
            { x:  3, y:  8 },
            { x:  4, y:  8 },
            { x:  0, y:  9 },
            { x:  0, y: 10 },
            { x:  1, y: 10 },
            { x:  2, y: 10 },
            { x:  0, y: 11 },
            { x:  0, y: 12 },
            { x:  1, y: 12 },
            { x:  2, y: 12 },
            { x:  3, y: 12 },
            { x:  4, y: 12 },
            
            { x:  0, y: 16 },
            { x:  1, y: 16 },
            { x:  2, y: 16 },
            { x:  3, y: 16 },
            { x:  4, y: 16 },
            { x:  0, y: 17 },
            { x:  2, y: 17 },
            { x:  0, y: 18 },
        
            // wall
            { x:  0, y:  6 },
            { x:  1, y:  6 },
            { x:  2, y:  6 },
            { x:  3, y:  6 },
            { x:  4, y:  6 },
            { x:  5, y:  6 },
            { x:  6, y:  6 },
            { x:  6, y:  7 },
            { x:  6, y:  8 },
            { x:  6, y:  9 },
            { x:  6, y: 10 },
            { x:  6, y: 11 },
            { x:  6, y: 12 },
            { x:  6, y: 13 },
            { x:  6, y: 14 },
            { x:  6, y: 15 },
            { x:  6, y: 16 },
            { x:  6, y: 17 },
            { x:  6, y: 18 },
            { x:  6, y: 19 },
            
            { x: 13, y:  9 },
            { x: 13, y: 10 },
            
            // counters
            { x:  2, y:  5 },
            { x:  2, y:  4 },
            { x:  3, y:  4 },
            { x:  4, y:  4 },
            { x:  5, y:  4 },
            { x:  6, y:  4 },
            { x:  7, y:  4 },
            { x:  8, y:  4 },
            { x:  8, y:  5 },
            
            { x:  8, y:  7 },
            { x:  8, y:  8 },
            { x:  8, y:  9 },
            { x:  8, y: 10 },
            { x:  8, y: 11 },
            
            { x:  8, y: 13 },
            { x:  8, y: 14 },
            { x:  8, y: 15 },
            { x:  8, y: 16 },
            { x:  8, y: 17 },
            { x:  8, y: 18 },
            { x:  7, y: 18 },
            
            // single tables
            { x:  3, y:  0 },
            { x:  8, y:  0 },
            
            // double tables
            { x: 12, y:  2 },
            { x: 13, y:  2 },
            
            { x: 12, y:  6 },
            { x: 13, y:  6 },
            
            { x: 12, y: 13 },
            { x: 13, y: 13 },
            
            { x: 12, y: 17 },
            { x: 13, y: 17 },
            
        ],
        forbiddenMovements: [],
        doors: {
            stairs: { x: 7, y: 19, direction: "right", target: { roomId: "bar_giko_square", doorId: "bar_giko" } },
            right: { x: 13, y: 19, direction: "left", target: { roomId: "bar_giko2", doorId: "stairs" } },
        },
        streamSlotCount: 3,
    },
    jinja: {
        id: "jinja",
        group: "gikopoi",
        scale: 1,
        size: { x: 15, y: 11 },
        originCoordinates: { x: 7, y: 311 },
        spawnPoint: "steps",
        backgroundImageUrl: "rooms/jinja/background.svg",
        objects: [
            { x: 15, y:  0, offset: { x: 499, y: 369 }, url: "bamboo_left.svg" },
            { x: 14, y:  4, offset: { x: 735, y: 206 }, url: "bamboo_right.svg" },
            { x:  9, y:  9, offset: { x: 741, y: 170 }, url: "tearai.svg" },
            { x:  4, y:  8, offset: { x: 495, y: 146 }, url: "omikujiki.svg" },
            { x:  3, y:  9, offset: { x: 490, y: 110 }, url: "saku.svg" },
            { x:  3, y:  8, offset: { x: 449, y: 129 }, url: "saku.svg" },
            { x:  5, y:  6, offset: { x: 455, y: 201 }, url: "komainu.svg" },
            { x:  5, y:  2, offset: { x: 295, y: 281 }, url: "komainu.svg" },
            { x:  3, y:  6, offset: { x: 115, y:  34 }, url: "keidai.svg" },
            { x:  4, y:  0, offset: { x: 126, y: 112 }, url: "goshinboku.svg" },
            { x:  7, y:  0, offset: { x: 315, y: 411 }, url: "stool.svg" },
            { x:  8, y:  1, offset: { x: 395, y: 411 }, url: "stool.svg" },
            { x:  9, y:  0, offset: { x: 395, y: 451 }, url: "stool.svg" },
            { x:  8, y:  0, offset: { x: 338, y: 417 }, url: "chessu.svg" },
        ],
        sit: [
            // stools
            { x:  7, y:  0 },
            { x:  8, y:  1 },
            { x:  9, y:  0 },
            // poster
            { x: 13, y:  0 },
            // bamboo
            { x: 14, y:  0 },
            { x: 14, y:  1 },
            { x: 14, y:  2 },
            { x: 14, y:  5 },
            { x: 14, y:  6 },
            { x: 14, y:  7 },
            { x: 14, y:  8 },
            { x: 14, y:  9 },
            { x: 14, y: 10 },
        ],
        blocked: [
            { x:  8, y:  0 },
            
            { x: 11, y: 10 },
            { x: 11, y:  9 },
            { x: 10, y:  9 },
            { x:  9, y:  9 },
            { x:  8, y: 10 },
            { x:  7, y:  9 },
            { x:  6, y:  9 },
            { x:  5, y:  9 },
            { x:  4, y:  9 },
            { x:  3, y:  8 },
            { x:  3, y:  9 },
            { x:  2, y: 10 },
            { x:  1, y:  9 },
            { x:  1, y:  8 },
            { x:  1, y:  7 },
            { x:  2, y:  6 },
            { x:  3, y:  6 },
            { x:  3, y:  5 },
            { x:  3, y:  4 },
            { x:  3, y:  3 },
            { x:  3, y:  2 },
            { x:  2, y:  1 },
            { x:  3, y:  0 },
            { x:  4, y:  0 },
            
            { x:  5, y:  6 },
            { x:  5, y:  2 },
            
        ],
        forbiddenMovements: [
            { xFrom: 4, yFrom: 6, xTo: 4, yTo: 5 },
            { xFrom: 4, yFrom: 5, xTo: 4, yTo: 6 },
            
            { xFrom: 4, yFrom: 2, xTo: 4, yTo: 3 },
            { xFrom: 4, yFrom: 3, xTo: 4, yTo: 2 },
        ],
        doors: {
            steps: { x: 14, y: 4, direction: "left", target: { roomId: "jinja_st", doorId: "torii" } },
        },
        specialObjects: [
            { name: 'donation-text', x: 2, y: 7 },
            { name: 'donation-box', x: 3, y: 5, value: 0 },
        ],
        streamSlotCount: 4,
        games: ["chess"],
    },
    busstop: {
        id: "busstop",
        group: "gikopoi",
        scale: 1,
        size: { x: 8, y: 5 },
        originCoordinates: { x: 6, y: 215 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/busstop/background.svg",
        objects: [
            { x:  1, y:  1, offset: { x: 105, y:  85 }, url: "sign.svg" },
            { x:  0, y:  1, offset: { x:  72, y: 129 }, url: "poland.svg" },
            { x:  5, y:  1, offset: { x: 272, y: 229 }, url: "poland.svg" },
            { x:  7, y:  1, offset: { x: 352, y: 269 }, url: "poland.svg" },
            { x:  0, y:  3, offset: { x: 182, y:  64 }, url: "trash.svg" },
            { x:  0, y:  4, offset: { x: 218, y: 103 }, url: "comfy_sofa.svg" },
            { x:  2, y:  4, offset: { x: 298, y: 143 }, url: "comfy_sofa.svg" },
            { x:  4, y:  3, offset: { x: 156, y:   0 }, url: "roof.svg" },
        ],
        sit: [
            { x:  1, y:  4 },
            { x:  2, y:  4 },
            { x:  3, y:  4 },
            { x:  4, y:  4 },
        ],
        blocked: [
            { x:  0, y:  1 },
            { x:  1, y:  1 },
            { x:  5, y:  1 },
            { x:  7, y:  1 },
        ],
        forbiddenMovements: [
            { xFrom:  0, yFrom:  3, xTo:  0, yTo:  4 }, { xFrom:  0, yFrom:  4, xTo:  0, yTo:  3 },
        ],
        doors: {
            up: { x: 6, y: 4, direction: "down", target: { roomId: "school_ground", doorId: "down" } },
            right: { x: 7, y: 2, direction: "left", target: { roomId: "school_st", doorId: "left" } },
            down: { x: 3, y: 0, direction: "up", target: { roomId: "densha", doorId: "left_top" } },
            left: { x: 0, y: 2, direction: "right", target: { roomId: "seashore", doorId: "right" } },
        },
        streamSlotCount: 0,
    },
    izakaya774: {
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
    },
    bar_giko_square: {
        id: "bar_giko_square",
        group: "bar_giko",
        scale: 1,
        size: { x: 24, y: 22 },
        originCoordinates: { x: -160, y: 505 },
        spawnPoint: "up",
        backgroundImageUrl: "rooms/bar_giko_square/background.svg",
        objects: [
            { x:  3, y:  8, offset: { x:    0, y:  160 }, url: "koban.svg" },
            { x: 15, y: 18, offset: { x: 1160, y:  220 }, url: "bar_giko.svg" },
            { x: 16, y: 17, offset: { x: 1168, y:  394 }, url: "bar_giko_sign.svg" },
            { x: 12, y: 10, offset: { x:  660, y:  383 }, url: "fountain.svg" },
            { x:  5, y: 17, offset: { x:  766, y:  195 }, url: "bench.svg" },
            { x: 19, y:  4, offset: { x:  790, y:  546 }, url: "street_light_left.svg" },
            { x: 14, y: 17, offset: { x: 1110, y:  186 }, url: "street_light_left.svg" },
            { x:  9, y:  4, offset: { x:  390, y:  346 }, url: "street_light_right.svg" },
        ],
        sit: [
            { x:  6, y: 17 },
            { x:  7, y: 17 },
            { x:  8, y: 17 },
            // fountain
            { x: 13, y: 10 },
            { x: 13, y: 11 },
            { x: 11, y:  9 },
            { x: 12, y:  9 },
        ],
        blocked: [
            // Koban quarter
            { x:  8, y:  0 },
            { x:  8, y:  1 },
            { x:  8, y:  2 },
            { x:  8, y:  3 },
            { x:  7, y:  3 },
            { x:  6, y:  3 },
            { x:  5, y:  3 },
            { x:  4, y:  3 },
            { x:  3, y:  4 },
            { x:  3, y:  5 },
            { x:  3, y:  6 },
            { x:  3, y:  7 },
            { x:  3, y:  8 },
            { x:  2, y:  8 },
            { x:  1, y:  8 },
            { x:  0, y:  8 },
            
            // Yoshinoya quarter
            { x:  0, y:  13 },
            { x:  1, y:  13 },
            { x:  2, y:  13 },
            { x:  3, y:  13 },
            { x:  3, y:  14 },
            { x:  3, y:  15 },
            { x:  3, y:  16 },
            { x:  3, y:  17 },
            { x:  4, y:  18 },
            { x:  5, y:  18 },
            { x:  6, y:  18 },
            { x:  7, y:  18 },
            { x:  8, y:  18 },
            { x:  8, y:  19 },
            { x:  8, y:  20 },
            { x:  8, y:  21 },
            
            // Bar Giko quarter
            { x:  15, y:  21 },
            { x:  15, y:  20 },
            { x:  15, y:  19 },
            { x:  15, y:  18 },
            { x:  17, y:  18 },
            { x:  18, y:  18 },
            { x:  19, y:  18 },
            { x:  20, y:  17 },
            { x:  20, y:  16 },
            { x:  20, y:  15 },
            { x:  20, y:  14 },
            { x:  20, y:  13 },
            { x:  21, y:  13 },
            { x:  22, y:  13 },
            { x:  23, y:  13 },
            
            // Bar Giko sign
            { x:  16, y:  17 },
            
            // Empty quarter
            { x:  23, y:  8 },
            { x:  22, y:  8 },
            { x:  21, y:  8 },
            { x:  20, y:  8 },
            { x:  20, y:  7 },
            { x:  20, y:  6 },
            { x:  20, y:  5 },
            { x:  18, y:  3 },
            { x:  17, y:  3 },
            { x:  16, y:  3 },
            { x:  15, y:  3 },
            { x:  15, y:  2 },
            { x:  15, y:  1 },
            { x:  15, y:  0 },
            
            // Street lights
            { x:  9, y:  4 },
            { x: 14, y: 17 },
            { x: 19, y:  4 },
            
            // Fountain
            { x: 12, y: 12 },
            { x: 12, y: 11 },
            { x: 12, y: 10 },
            { x: 11, y: 12 },
            { x: 10, y: 11 },
            { x: 10, y: 10 },
            { x: 11, y: 10 },
        ],
        forbiddenMovements: [],
        doors: {
            up: { x: 11, y: 21, direction: "down", target: { roomId: "densha", doorId: "left_middle" } },
            bar_giko: { x: 17, y: 17, direction: "down", target: { roomId: "bar_giko", doorId: "stairs" } },
            yoshinoya: { x: 4, y: 15, direction: "right", target: { roomId: "yoshinoya", doorId: "door" } },
            left: { x: 0, y: 12, direction: "right", target: { roomId: "monachat", doorId: "door" } },
            right: { x: 23, y: 11, direction: "left", target: { roomId: "konbini", doorId: "door" } },
            office: { x: 5, y: 17, direction: "down", target: { roomId: "nerd_office", doorId: "door"} },
            very_left: { x: 9, y: 0, direction: "right", target: { roomId: "kyougijou", doorId: "door"} },
        },
        streamSlotCount: 3,
        games: ["janken"],
    },
    bar_giko2: {
        id: "bar_giko2",
        group: "bar_giko",
        scale: 1,
        size: { x: 16, y: 16 },
        originCoordinates: { x: 1, y: 443 },
        spawnPoint: "stairs",
        backgroundImageUrl: "rooms/bar_giko2/background.svg",
        backgroundColor: "#222",
        objects: [
            // walls
            { x:  0, y:  8, offset: { x:  281, y:  141 }, url: "wall_left.svg" },
            { x:  7, y: 15, offset: { x:  881, y:  141 }, url: "wall_right.svg" },
            { x:  7, y:  7, offset: { x:  560, y:  280 }, url: "pillar.svg" },
        
            // bar
            { x:  0, y: 14, offset: { x:  560, y:   90 }, url: "counter_cube.svg" },
            { x:  1, y: 14, offset: { x:  600, y:  110 }, url: "counter_top_right.svg" },
            { x:  1, y: 13, offset: { x:  560, y:  130 }, url: "counter_right.svg" },
            { x:  1, y: 12, offset: { x:  520, y:  150 }, url: "counter_right.svg" },
            { x:  1, y: 11, offset: { x:  480, y:  170 }, url: "counter_right.svg" },
            { x:  1, y: 10, offset: { x:  440, y:  190 }, url: "counter_right.svg" },
            
            { x:  5, y: 14, offset: { x:  760, y:  190 }, url: "table_hori.svg" },
            { x:  5, y: 13, offset: { x:  720, y:  210 }, url: "table_hori.svg" },
            { x:  5, y: 11, offset: { x:  640, y:  250 }, url: "table_hori.svg" },
            { x:  5, y: 10, offset: { x:  600, y:  270 }, url: "table_hori.svg" },
        
            // tables left
            { x:  1, y:  2, offset: { x:  120, y:  350 }, url: "table_vert.svg" },
            { x:  2, y:  2, offset: { x:  160, y:  370 }, url: "table_vert.svg" },
            { x:  3, y:  2, offset: { x:  200, y:  390 }, url: "table_vert.svg" },
            { x:  5, y:  2, offset: { x:  280, y:  430 }, url: "table_vert.svg" },
            
            { x:  1, y:  6, offset: { x:  280, y:  270 }, url: "table_vert.svg" },
            { x:  3, y:  6, offset: { x:  360, y:  310 }, url: "table_vert.svg" },
            { x:  4, y:  6, offset: { x:  400, y:  330 }, url: "table_vert.svg" },
            { x:  5, y:  6, offset: { x:  440, y:  350 }, url: "table_vert.svg" },
            
            // tables right
            { x: 10, y:  9, offset: { x:  760, y:  390 }, url: "table_vert.svg" },
            { x: 11, y:  9, offset: { x:  800, y:  410 }, url: "table_vert.svg" },
            { x: 13, y:  9, offset: { x:  880, y:  450 }, url: "table_vert.svg" },
            { x: 14, y:  9, offset: { x:  920, y:  470 }, url: "table_vert.svg" },
            
            { x: 10, y: 13, offset: { x:  920, y:  310 }, url: "table_vert.svg" },
            { x: 12, y: 13, offset: { x: 1000, y:  350 }, url: "table_vert.svg" },
            { x: 14, y: 13, offset: { x: 1080, y:  390 }, url: "table_vert.svg" },
            
            // counter circle
            { x: 10, y:  2, offset: { x:  480, y:  530 }, url: "counter_bottom_left.svg" },
            { x: 11, y:  2, offset: { x:  520, y:  550 }, url: "counter_bottom.svg" },
            { x: 12, y:  2, offset: { x:  560, y:  570 }, url: "counter_bottom.svg" },
            { x: 13, y:  2, offset: { x:  600, y:  590 }, url: "counter_bottom_right.svg" },
            { x: 13, y:  3, offset: { x:  640, y:  570 }, url: "counter_right.svg" },
            { x: 13, y:  4, offset: { x:  680, y:  550 }, url: "counter_right.svg" },
            { x: 13, y:  5, offset: { x:  720, y:  530 }, url: "counter_top_right.svg" },
            { x: 12, y:  5, offset: { x:  680, y:  510 }, url: "counter_cube.svg" },
            { x: 11, y:  5, offset: { x:  640, y:  490 }, url: "counter_cube.svg" },
            { x: 10, y:  5, offset: { x:  600, y:  479 }, url: "counter_top_left.svg" },
            { x: 10, y:  4, offset: { x:  560, y:  490 }, url: "counter_cube.svg" },
            { x: 10, y:  3, offset: { x:  520, y:  510 }, url: "counter_cube.svg" },
        ],
        sit: [
            // bar
            { x:  2, y: 13 },
            { x:  2, y: 12 },
            { x:  2, y: 11 },
            { x:  2, y: 10 },
            
            { x:  4, y: 14 },
            { x:  4, y: 13 },
            { x:  4, y: 11 },
            { x:  4, y: 10 },
            { x:  6, y: 14 },
            { x:  6, y: 13 },
            { x:  6, y: 11 },
            { x:  6, y: 10 },
            
            // stools left
            { x:  1, y:  1 },
            { x:  2, y:  1 },
            { x:  3, y:  1 },
            { x:  5, y:  1 },
            { x:  1, y:  3 },
            { x:  2, y:  3 },
            { x:  3, y:  3 },
            { x:  5, y:  3 },
            
            { x:  1, y:  5 },
            { x:  3, y:  5 },
            { x:  4, y:  5 },
            { x:  5, y:  5 },
            { x:  1, y:  7 },
            { x:  3, y:  7 },
            { x:  4, y:  7 },
            { x:  5, y:  7 },
            
            // stools right
            { x: 10, y:  8 },
            { x: 11, y:  8 },
            { x: 13, y:  8 },
            { x: 14, y:  8 },
            { x: 10, y: 10 },
            { x: 11, y: 10 },
            { x: 13, y: 10 },
            { x: 14, y: 10 },
            
            { x: 10, y: 12 },
            { x: 12, y: 12 },
            { x: 14, y: 12 },
            { x: 10, y: 14 },
            { x: 12, y: 14 },
            { x: 14, y: 14 },
            
            // stool circle
            { x: 10, y:  1 },
            { x: 11, y:  1 },
            { x: 12, y:  1 },
            { x: 13, y:  1 },
            { x: 14, y:  2 },
            { x: 14, y:  3 },
            { x: 14, y:  4 },
            { x: 14, y:  5 },
            { x: 10, y:  6 },
            { x: 11, y:  6 },
            { x: 12, y:  6 },
            { x: 13, y:  6 },
            { x:  9, y:  2 },
            { x:  9, y:  3 },
            { x:  9, y:  4 },
            { x:  9, y:  5 },
        ],
        blocked: [
            // walls
            { x:  0, y:  8 },
            { x:  0, y:  7 },
            { x: 15, y:  8 },
            { x: 15, y:  7 },
            { x:  7, y: 15 },
            { x:  8, y: 15 },
            { x:  7, y: 0 },
            { x:  8, y: 0 },
            
            { x:  7, y:  7 },
            { x:  8, y:  7 },
            { x:  7, y:  8 },
            { x:  8, y:  8 },
        
            // bar
            { x:  0, y: 14 },
            { x:  1, y: 14 },
            { x:  1, y: 13 },
            { x:  1, y: 12 },
            { x:  1, y: 11 },
            { x:  1, y: 10 },
            
            { x:  5, y: 14 },
            { x:  5, y: 13 },
            { x:  5, y: 11 },
            { x:  5, y: 10 },
        
            // tables left
            { x:  1, y:  2 },
            { x:  2, y:  2 },
            { x:  3, y:  2 },
            { x:  5, y:  2 },
            
            { x:  1, y:  6 },
            { x:  3, y:  6 },
            { x:  4, y:  6 },
            { x:  5, y:  6 },
            
            // tables right
            { x: 10, y:  9 },
            { x: 11, y:  9 },
            { x: 13, y:  9 },
            { x: 14, y:  9 },
            
            { x: 10, y: 13 },
            { x: 12, y: 13 },
            { x: 14, y: 13 },
            
            // counter circle
            { x: 10, y:  2 },
            { x: 11, y:  2 },
            { x: 12, y:  2 },
            { x: 13, y:  2 },
            { x: 13, y:  3 },
            { x: 13, y:  4 },
            { x: 13, y:  5 },
            { x: 12, y:  5 },
            { x: 11, y:  5 },
            { x: 10, y:  5 },
            { x: 10, y:  4 },
            { x: 10, y:  3 },
        ],
        forbiddenMovements: [],
        doors: {
            stairs: { x: 0, y: 15, direction: "right", target: { roomId: "bar_giko", doorId: "right" } },
        },
        streamSlotCount: 1,
    },
    radio_room1: {
        id: "radio_room1",
        group: "gikopoi",
        scale: 1,
        size: { x: 7, y: 8 },
        originCoordinates: { x: 2, y: 332 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/radio_room1/background.svg",
        objects: [
            { x:  6, y:  3, offset: { x:  381, y:  338 }, url: "table.svg" },
        ],
        sit: [
            { x:  0, y:  0 },
            { x:  0, y:  1 },
            { x:  0, y:  2 },
            { x:  0, y:  3 },
            { x:  0, y:  4 },
            { x:  0, y:  5 },
            { x:  0, y:  6 },
            { x:  0, y:  7 },
            
            { x:  2, y:  0 },
            { x:  2, y:  1 },
            { x:  2, y:  2 },
            { x:  2, y:  3 },
            { x:  2, y:  4 },
            { x:  2, y:  5 },
            { x:  2, y:  6 },
            { x:  2, y:  7 },
            
            { x:  4, y:  0 },
            { x:  4, y:  1 },
            { x:  4, y:  2 },
            { x:  4, y:  3 },
            { x:  4, y:  4 },
            { x:  4, y:  5 },
            { x:  4, y:  6 },
            { x:  4, y:  7 },
            
            { x:  6, y:  2 },
            { x:  6, y:  4 },
        ],
        blocked: [
            { x:  6, y:  3 },
        ],
        forbiddenMovements: [],
        doors: {
            right: { x: 6, y: 6, direction: "left", target: { roomId: "radio", doorId: "door1" } },
        },
        streamSlotCount: 2,
    },
    radio_room2: {
        id: "radio_room2",
        group: "gikopoi",
        scale: 1,
        size: { x: 11, y: 9 },
        originCoordinates: { x: 1, y: 452 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/radio_room2/background.svg",
        objects: [
            { x:  1, y:  0, offset: { x:   82, y:  348 }, url: "light.svg" },
            { x:  2, y:  0, offset: { x:  118, y:  366 }, url: "light.svg" },
            { x:  3, y:  0, offset: { x:  153, y:  384 }, url: "light.svg" },
            
            { x:  1, y:  1, offset: { x:  118, y:  330 }, url: "light.svg" },
            { x:  2, y:  1, offset: { x:  153, y:  348 }, url: "light.svg" },
            { x:  3, y:  1, offset: { x:  189, y:  366 }, url: "light.svg" },
            
            { x:  1, y:  2, offset: { x:  153, y:  312 }, url: "light.svg" },
            { x:  2, y:  2, offset: { x:  189, y:  330 }, url: "light.svg" },
            { x:  3, y:  2, offset: { x:  225, y:  348 }, url: "light.svg" },
            
            { x:  2, y:  4, offset: { x:  227, y:  339 }, url: "turntable.svg" },
            
            { x:  1, y:  5, offset: { x:  283, y:  248 }, url: "light.svg" },
            { x:  2, y:  5, offset: { x:  319, y:  266 }, url: "light.svg" },
            { x:  3, y:  5, offset: { x:  354, y:  284 }, url: "light.svg" },
            
            { x:  1, y:  6, offset: { x:  318, y:  230 }, url: "light.svg" },
            { x:  2, y:  6, offset: { x:  353, y:  248 }, url: "light.svg" },
            { x:  3, y:  6, offset: { x:  387, y:  266 }, url: "light.svg" },
            
            { x:  1, y:  7, offset: { x:  353, y:  212 }, url: "light.svg" },
            { x:  2, y:  7, offset: { x:  388, y:  230 }, url: "light.svg" },
            { x:  3, y:  7, offset: { x:  422, y:  248 }, url: "light.svg" },
            
            { x:  5, y:  8, offset: { x:  536, y:  324 }, url: "counter_side.svg" },
            { x:  5, y:  7, offset: { x:  518, y:  345 }, url: "counter_corner.svg" },
            { x:  6, y:  7, offset: { x:  523, y:  365 }, url: "counter_strike.svg" },
            { x:  7, y:  7, offset: { x:  563, y:  385 }, url: "counter_strike.svg" },
            { x:  8, y:  7, offset: { x:  603, y:  405 }, url: "counter_strike.svg" },
            { x:  9, y:  7, offset: { x:  643, y:  425 }, url: "counter_strike.svg" },
            
            { x:  7, y:  0, offset: { x:  300, y:  538 }, url: "table.svg" },
            { x: 10, y:  2, offset: { x:  501, y:  558 }, url: "table.svg" },
            
        ],
        sit: [
            { x:  6, y:  6 },
            { x:  7, y:  6 },
            { x:  8, y:  6 },
            { x:  9, y:  6 },
            
            { x:  6, y:  0 },
            { x:  8, y:  0 },
            
            { x:  10, y:  1 },
            { x:  10, y:  3 },
        ],
        blocked: [
            // stage edge
            { x:  4, y:  0 },
            { x:  4, y:  1 },
            { x:  4, y:  2 },
            { x:  4, y:  3 },
            { x:  4, y:  4 },
            { x:  4, y:  5 },
            { x:  4, y:  6 },
            { x:  4, y:  7 },
            { x:  4, y:  8 },
            
            // counters
            { x:  5, y:  8 },
            { x:  5, y:  7 },
            { x:  6, y:  7 },
            { x:  7, y:  7 },
            { x:  8, y:  7 },
            { x:  9, y:  7 },
            
            // tables
            { x:  7, y:  0 },
            { x: 10, y:  2 },
            
        ],
        forbiddenMovements: [
            { xFrom:  1, yFrom:  4, xTo:  2, yTo:  4 }, { xFrom:  2, yFrom:  4, xTo:  1, yTo:  4 },
        ],
        doors: {
            stage_door: { x: 0, y: 1, direction: "right", target: { roomId: "radio_backstage", doorId: "center" } },
            right: { x: 10, y: 4, direction: "left", target: { roomId: "radio", doorId: "door2" } },
        },
        streamSlotCount: 1,
    },
    radio_room3: {
        id: "radio_room3",
        group: "gikopoi",
        scale: 1,
        size: { x: 12, y: 9 },
        originCoordinates: { x: -1, y: 439 },
        spawnPoint: "down",
        backgroundImageUrl: "rooms/radio_room3/background.svg",
        objects: [
            { x:  1, y:  4, offset: { x:  204, y:  289 }, url: "drumset.svg" },
            { x:  2, y:  8, offset: { x:  344, y:  243 }, url: "piano.svg" },
            
            { x:  3, y:  2, offset: { x:  187, y:  371 }, url: "mic.svg" },
            { x:  4, y:  4, offset: { x:  307, y:  352 }, url: "mic.svg" },
            { x:  3, y:  6, offset: { x:  347, y:  292 }, url: "mic.svg" },
            
            { x:  4, y:  0, offset: { x:  172, y:  406 }, url: "speaker.svg" },
            { x:  4, y:  7, offset: { x:  456, y:  264 }, url: "speaker.svg" },
        
            { x:  7, y:  0, offset: { x:  290, y:  518 }, url: "table.svg" },
            { x: 11, y:  2, offset: { x:  530, y:  558 }, url: "table.svg" },
            { x: 11, y:  6, offset: { x:  690, y:  478 }, url: "table.svg" },
            
            { x:  9, y:  8, offset: { x:  690, y:  369 }, url: "table_with_drinks.svg" },
            { x:  8, y:  8, offset: { x:  650, y:  350 }, url: "table_with_drinks.svg" },
            { x:  7, y:  8, offset: { x:  610, y:  358 }, url: "table_with_ika.svg" },
        ],
        sit: [
            { x:  0, y:  4 },
            { x:  1, y:  8 },
            
            { x:  7, y:  2 },
            { x:  7, y:  3 },
            { x:  7, y:  4 },
            { x:  7, y:  5 },
            { x:  7, y:  6 },
            
            { x:  9, y:  2 },
            { x:  9, y:  3 },
            { x:  9, y:  4 },
            { x:  9, y:  5 },
            { x:  9, y:  6 },
            
            { x:  6, y:  0 },
            { x:  8, y:  0 },
            
            { x: 11, y:  1 },
            { x: 11, y:  3 },
            
            { x: 11, y:  5 },
            { x: 11, y:  7 },
        ],
        blocked: [
            // stage
            { x:  1, y:  4 },
            { x:  2, y:  8 },
            
            { x:  3, y:  2 },
            { x:  4, y:  4 },
            { x:  3, y:  6 },
            
            { x:  4, y:  0 },
            { x:  4, y:  7 },
            
            // tables
            { x:  7, y:  0 },
            { x: 11, y:  2 },
            { x: 11, y:  6 },
            
            { x:  9, y:  8 },
            { x:  8, y:  8 },
            { x:  7, y:  8 },
        ],
        forbiddenMovements: [
            { xFrom:  4, yFrom:  1, xTo:  5, yTo:  1 }, { xFrom:  5, yFrom:  1, xTo:  4, yTo:  1 },
            { xFrom:  4, yFrom:  2, xTo:  5, yTo:  2 }, { xFrom:  5, yFrom:  2, xTo:  4, yTo:  2 },
            { xFrom:  4, yFrom:  3, xTo:  5, yTo:  3 }, { xFrom:  5, yFrom:  3, xTo:  4, yTo:  3 },
            { xFrom:  4, yFrom:  5, xTo:  5, yTo:  5 }, { xFrom:  5, yFrom:  5, xTo:  4, yTo:  5 },
            { xFrom:  4, yFrom:  6, xTo:  5, yTo:  6 }, { xFrom:  5, yFrom:  6, xTo:  4, yTo:  6 },
        ],
        doors: {
            down: { x: 10, y: 0, direction: "up", target: { roomId: "radio", doorId: "door3" } },
            stage_door: { x: 0, y: 1, direction: "right", target: { roomId: "radio_backstage", doorId: "top" } },
        },
        streamSlotCount: 3,
    },
    radio: {
        id: "radio",
        group: "gikopoi",
        scale: 1,
        size: { x: 7, y: 10 },
        originCoordinates: { x: 0, y: 371 },
        spawnPoint: "down",
        backgroundImageUrl: "rooms/radio/background.svg",
        objects: [
            { x:  5, y:  1, offset: { x:  254, y:  389 }, url: "hopes_and_dreams.svg" },
            { x:  5, y:  8, offset: { x:  534, y:  249 }, url: "hopes_and_dreams.svg" },
        ],
        sit: [
            { x:  4, y:  0 },
            { x:  4, y:  1 },
            { x:  4, y:  2 },
            
            { x:  6, y:  0 },
            { x:  6, y:  1 },
            { x:  6, y:  2 },
            
            { x:  4, y:  7 },
            { x:  4, y:  8 },
            { x:  4, y:  9 },
            
            { x:  6, y:  7 },
            { x:  6, y:  8 },
            { x:  6, y:  9 },
        ],
        blocked: [
            { x:  5, y:  1 },
            { x:  5, y:  8 },
        ],
        forbiddenMovements: [],
        doors: {
            down: { x: 1, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "barrier" } },
            door1: { x: 0, y: 2, direction: "right", target: { roomId: "radio_room1", doorId: "right" } },
            single_door: { x: 0, y: 6, direction: "right", target: { roomId: "radio_gakuya", doorId: "right" } },
            door2: { x: 0, y: 8, direction: "right", target: { roomId: "radio_room2", doorId: "right" } },
            door3: { x: 2, y: 9, direction: "down", target: { roomId: "radio_room3", doorId: "down" } },
        },
        streamSlotCount: 0,
    },
    radio_gakuya: {
        id: "radio_gakuya",
        group: "gikopoi",
        scale: 1,
        size: { x: 9, y: 8 },
        originCoordinates: { x: 0, y: 358 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/radio_gakuya/background.svg",
        objects: [
            { x:  2, y:  1, offset: { x:  139, y:  305 }, url: "tabletop.svg" },
            
            { x:  2, y:  7, offset: { x:  369, y:  146 }, url: "mirror.svg" },
            { x:  3, y:  7, offset: { x:  409, y:  166 }, url: "mirror.svg" },
            { x:  4, y:  7, offset: { x:  449, y:  186 }, url: "mirror.svg" },
            { x:  5, y:  7, offset: { x:  489, y:  206 }, url: "mirror.svg" },
            { x:  6, y:  7, offset: { x:  529, y:  226 }, url: "mirror.svg" },
        ],
        sit: [
            // zubon
            { x:  2, y:  0 },
            { x:  3, y:  0 },
            { x:  4, y:  0 },
            { x:  5, y:  0 },
            { x:  6, y:  0 },
            
            { x:  2, y:  3 },
            { x:  3, y:  3 },
            { x:  4, y:  3 },
            { x:  5, y:  3 },
            { x:  6, y:  3 },
            
            // stools
            { x:  2, y:  6 },
            { x:  3, y:  6 },
            { x:  4, y:  6 },
            { x:  5, y:  6 },
            { x:  6, y:  6 },
        ],
        blocked: [
            // table
            { x:  2, y:  1 },
            { x:  3, y:  1 },
            { x:  4, y:  1 },
            { x:  5, y:  1 },
            { x:  6, y:  1 },
            
            { x:  2, y:  2 },
            { x:  3, y:  2 },
            { x:  4, y:  2 },
            { x:  5, y:  2 },
            { x:  6, y:  2 },
            
            // mirrors
            { x:  2, y:  7 },
            { x:  3, y:  7 },
            { x:  4, y:  7 },
            { x:  5, y:  7 },
            { x:  6, y:  7 },
        ],
        forbiddenMovements: [],
        doors: {
            door: { x: 0, y: 5, direction: "right", target: { roomId: "radio_backstage", doorId: "bottom" } },
            right: { x: 8, y: 5, direction: "left", target: { roomId: "radio", doorId: "single_door" } },
        },
        streamSlotCount: 0,
        games: ["janken"],
    },
    jinja_st: {
        id: "jinja_st",
        group: "gikopoi",
        scale: 1,
        size: { x: 9, y: 5 },
        originCoordinates: { x: 41, y: 268 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/jinja_st/background.svg",
        objects: [
            { x:  1, y:  3, offset: { x:   90, y:   48 }, url: "torii.svg" },
            { x:  4, y:  0, offset: { x:   73, y:  118 }, url: "take.svg" },
        ],
        sit: [
            { x:  8, y:  4 },
            { x:  8, y:  0 },
            { x:  5, y:  4 },
            { x:  5, y:  0 },
        ],
        blocked: [
            { x:  4, y:  4 },
            { x:  2, y:  4 },
            { x:  0, y:  3 },
            { x:  0, y:  1 },
            { x:  3, y:  0 },
            { x:  4, y:  0 },
        ],
        forbiddenMovements: [
            { xFrom:  1, yFrom:  0, xTo:  1, yTo:  1 }, { xFrom:  1, yFrom:  1, xTo:  1, yTo:  0 },
        ],
        doors: {
            torii: { x: 0, y: 2, direction: "right", target: { roomId: "jinja", doorId: "steps" } },
            right: { x: 8, y: 2, direction: "left", target: { roomId: "long_st", doorId: "left" } },
        },
        streamSlotCount: 0,
    },
    enkai: {
        id: "enkai",
        group: "gikopoi",
        scale: 1,
        size: { x: 21, y: 19 },
        originCoordinates: { x: 0, y: 575 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/enkai/background.svg",
        objects: [
            { x: 20, y:  0, offset: { x:    1, y:   53 }, url: "terawarosuw.svg" },
            
            { x:  4, y:  3, offset: { x:  279, y:  344 }, url: "speaker_left.svg" },
            { x:  4, y: 12, offset: { x:  640, y:  164 }, url: "speaker_right.svg" },
        
            { x:  8, y: 14, offset: { x:  895, y:  270 }, url: "sao.svg" },
            { x: 16, y: 14, offset: { x: 1215, y:  431 }, url: "sao.svg" },
            
            { x:  0, y: 13, offset: { x:  544, y:  254 }, url: "stage_part.svg" },
            { x:  0, y: 13, offset: { x:   70, y:  254 }, url: "stage.svg" }, // TODO fix layering to make this work eventually
            
            { x:  1, y:  1, offset: { x:   76, y:  512 }, url: "studio.svg" },
            
        
            { x:  6, y: 12, offset: { x:  688, y:  391 }, url: "table_and_zabuton.svg" },
            { x:  7, y: 12, offset: { x:  728, y:  411 }, url: "table_and_zabuton.svg" },
            { x:  8, y: 12, offset: { x:  768, y:  431 }, url: "table_and_zabuton.svg" },
            { x:  9, y: 12, offset: { x:  808, y:  451 }, url: "table_and_zabuton.svg" },
            
            { x: 11, y: 12, offset: { x:  888, y:  491 }, url: "table_and_zabuton.svg" },
            { x: 12, y: 12, offset: { x:  928, y:  511 }, url: "table_and_zabuton.svg" },
            { x: 13, y: 12, offset: { x:  968, y:  531 }, url: "table_and_zabuton.svg" },
            { x: 14, y: 12, offset: { x: 1008, y:  551 }, url: "table_and_zabuton.svg" },
            
            { x: 16, y: 12, offset: { x: 1088, y:  591 }, url: "table_and_zabuton.svg" },
            { x: 17, y: 12, offset: { x: 1128, y:  611 }, url: "table_and_zabuton.svg" },
            
            
            { x:  6, y:  9, offset: { x:  568, y:  451 }, url: "table_and_zabuton.svg" },
            { x:  7, y:  9, offset: { x:  608, y:  471 }, url: "table_and_zabuton.svg" },
            { x:  8, y:  9, offset: { x:  648, y:  491 }, url: "table_and_zabuton.svg" },
            { x:  9, y:  9, offset: { x:  688, y:  511 }, url: "table_and_zabuton.svg" },
            
            { x: 11, y:  9, offset: { x:  768, y:  551 }, url: "table_and_zabuton.svg" },
            { x: 12, y:  9, offset: { x:  808, y:  571 }, url: "table_and_zabuton.svg" },
            { x: 13, y:  9, offset: { x:  848, y:  591 }, url: "table_and_zabuton.svg" },
            { x: 14, y:  9, offset: { x:  888, y:  611 }, url: "table_and_zabuton.svg" },
            
            { x: 16, y:  9, offset: { x:  968, y:  651 }, url: "table_and_zabuton.svg" },
            { x: 17, y:  9, offset: { x: 1008, y:  671 }, url: "table_and_zabuton.svg" },
            
            
            { x:  6, y:  6, offset: { x:  448, y:  511 }, url: "table_and_zabuton.svg" },
            { x:  7, y:  6, offset: { x:  488, y:  531 }, url: "table_and_zabuton.svg" },
            { x:  8, y:  6, offset: { x:  528, y:  551 }, url: "table_and_zabuton.svg" },
            { x:  9, y:  6, offset: { x:  568, y:  571 }, url: "table_and_zabuton.svg" },
            
            { x: 11, y:  6, offset: { x:  648, y:  611 }, url: "table_and_zabuton.svg" },
            { x: 12, y:  6, offset: { x:  688, y:  631 }, url: "table_and_zabuton.svg" },
            { x: 13, y:  6, offset: { x:  728, y:  651 }, url: "table_and_zabuton.svg" },
            { x: 14, y:  6, offset: { x:  768, y:  671 }, url: "table_and_zabuton.svg" },
            
            { x: 16, y:  6, offset: { x:  848, y:  711 }, url: "table_and_zabuton.svg" },
            { x: 17, y:  6, offset: { x:  888, y:  731 }, url: "table_and_zabuton.svg" },
            
            
            { x:  6, y:  3, offset: { x:  328, y:  571 }, url: "table_and_zabuton.svg" },
            { x:  7, y:  3, offset: { x:  368, y:  591 }, url: "table_and_zabuton.svg" },
            { x:  8, y:  3, offset: { x:  408, y:  611 }, url: "table_and_zabuton.svg" },
            { x:  9, y:  3, offset: { x:  448, y:  631 }, url: "table_and_zabuton.svg" },
            
            { x: 11, y:  3, offset: { x:  528, y:  671 }, url: "table_and_zabuton.svg" },
            { x: 12, y:  3, offset: { x:  568, y:  691 }, url: "table_and_zabuton.svg" },
            { x: 13, y:  3, offset: { x:  608, y:  711 }, url: "table_and_zabuton.svg" },
            { x: 14, y:  3, offset: { x:  648, y:  731 }, url: "table_and_zabuton.svg" },
            
            { x: 16, y:  3, offset: { x:  728, y:  771 }, url: "table_and_zabuton.svg" },
            { x: 17, y:  3, offset: { x:  768, y:  791 }, url: "table_and_zabuton.svg" },
        ],
        sit: [
            // lower cushions
            { x:  6, y: 13 },
            { x:  7, y: 13 },
            { x:  8, y: 13 },
            { x:  9, y: 13 },
            
            { x: 11, y: 13 },
            { x: 12, y: 13 },
            { x: 13, y: 13 },
            { x: 14, y: 13 },
            
            { x: 16, y: 13 },
            { x: 17, y: 13 },
            
            
            { x:  6, y: 11 },
            { x:  7, y: 11 },
            { x:  8, y: 11 },
            { x:  9, y: 11 },
            
            { x: 11, y: 11 },
            { x: 12, y: 11 },
            { x: 13, y: 11 },
            { x: 14, y: 11 },
            
            { x: 16, y: 11 },
            { x: 17, y: 11 },
            
            
            { x:  6, y: 10 },
            { x:  7, y: 10 },
            { x:  8, y: 10 },
            { x:  9, y: 10 },
            
            { x: 11, y: 10 },
            { x: 12, y: 10 },
            { x: 13, y: 10 },
            { x: 14, y: 10 },
            
            { x: 16, y: 10 },
            { x: 17, y: 10 },
            
            
            { x:  6, y:  8 },
            { x:  7, y:  8 },
            { x:  8, y:  8 },
            { x:  9, y:  8 },
            
            { x: 11, y:  8 },
            { x: 12, y:  8 },
            { x: 13, y:  8 },
            { x: 14, y:  8 },
            
            { x: 16, y:  8 },
            { x: 17, y:  8 },
            
            
            { x:  6, y:  7 },
            { x:  7, y:  7 },
            { x:  8, y:  7 },
            { x:  9, y:  7 },
            
            { x: 11, y:  7 },
            { x: 12, y:  7 },
            { x: 13, y:  7 },
            { x: 14, y:  7 },
            
            { x: 16, y:  7 },
            { x: 17, y:  7 },
            
            
            { x:  6, y:  5 },
            { x:  7, y:  5 },
            { x:  8, y:  5 },
            { x:  9, y:  5 },
            
            { x: 11, y:  5 },
            { x: 12, y:  5 },
            { x: 13, y:  5 },
            { x: 14, y:  5 },
            
            { x: 16, y:  5 },
            { x: 17, y:  5 },
            
            
            { x:  6, y:  4 },
            { x:  7, y:  4 },
            { x:  8, y:  4 },
            { x:  9, y:  4 },
            
            { x: 11, y:  4 },
            { x: 12, y:  4 },
            { x: 13, y:  4 },
            { x: 14, y:  4 },
            
            { x: 16, y:  4 },
            { x: 17, y:  4 },
            
            
            { x:  6, y:  2 },
            { x:  7, y:  2 },
            { x:  8, y:  2 },
            { x:  9, y:  2 },
            
            { x: 11, y:  2 },
            { x: 12, y:  2 },
            { x: 13, y:  2 },
            { x: 14, y:  2 },
            
            { x: 16, y:  2 },
            { x: 17, y:  2 },
            
            // upper cushions
            { x:  4, y: 18 },
            { x:  5, y: 18 },
            
            { x:  7, y: 18 },
            { x:  8, y: 18 },
            { x:  9, y: 18 },
            
            { x: 11, y: 18 },
            { x: 12, y: 18 },
            { x: 13, y: 18 },
            
            // bottles
            { x:  6, y:  1 },
            { x: 10, y:  7 },
        ],
        blocked: ([
            // studio
            { x:  1, y:  1 },
            
            // speaker left
            { x:  4, y:  3 },
            
            // speaker right
            { x:  4, y: 12 },
            
            
            // ends of upper floor
            { x: 19, y: 16 },
            { x: 20, y: 16 },
            
            // entrance to upper floor
            { x:  1, y: 18 },
            { x: 15, y: 18 },
        
            // tables
            { x:  6, y: 12 },
            { x:  7, y: 12 },
            { x:  8, y: 12 },
            { x:  9, y: 12 },
            
            { x: 11, y: 12 },
            { x: 12, y: 12 },
            { x: 13, y: 12 },
            { x: 14, y: 12 },
            
            { x: 16, y: 12 },
            { x: 17, y: 12 },
            
            
            { x:  6, y:  9 },
            { x:  7, y:  9 },
            { x:  8, y:  9 },
            { x:  9, y:  9 },
            
            { x: 11, y:  9 },
            { x: 12, y:  9 },
            { x: 13, y:  9 },
            { x: 14, y:  9 },
            
            { x: 16, y:  9 },
            { x: 17, y:  9 },
            
            
            { x:  6, y:  6 },
            { x:  7, y:  6 },
            { x:  8, y:  6 },
            { x:  9, y:  6 },
            
            { x: 11, y:  6 },
            { x: 12, y:  6 },
            { x: 13, y:  6 },
            { x: 14, y:  6 },
            
            { x: 16, y:  6 },
            { x: 17, y:  6 },
            
            
            { x:  6, y:  3 },
            { x:  7, y:  3 },
            { x:  8, y:  3 },
            { x:  9, y:  3 },
            
            { x: 11, y:  3 },
            { x: 12, y:  3 },
            { x: 13, y:  3 },
            { x: 14, y:  3 },
            
            { x: 16, y:  3 },
            { x: 17, y:  3 },
        ] as Coordinates[])
            // lower wall
            .concat(coordRange({ x:  0, y: 15 }, { x: 18, y: 15 }))
            // upper wall
            .concat(coordRange({ x:  2, y: 17 }, { x: 14, y: 17 })),
        forbiddenMovements: [
            // stage front
            { xFrom:  4, yFrom:  4, xTo:  5, yTo:  4 }, { xFrom:  5, yFrom:  4, xTo:  4, yTo:  4 },
            { xFrom:  4, yFrom:  5, xTo:  5, yTo:  5 }, { xFrom:  5, yFrom:  5, xTo:  4, yTo:  5 },
            { xFrom:  4, yFrom:  6, xTo:  5, yTo:  6 }, { xFrom:  5, yFrom:  6, xTo:  4, yTo:  6 },
            { xFrom:  4, yFrom:  7, xTo:  5, yTo:  7 }, { xFrom:  5, yFrom:  7, xTo:  4, yTo:  7 },
            { xFrom:  4, yFrom:  6, xTo:  5, yTo:  8 }, { xFrom:  5, yFrom:  8, xTo:  4, yTo:  8 },
            { xFrom:  4, yFrom:  9, xTo:  5, yTo:  9 }, { xFrom:  5, yFrom:  9, xTo:  4, yTo:  9 },
            { xFrom:  4, yFrom: 10, xTo:  5, yTo: 10 }, { xFrom:  5, yFrom: 10, xTo:  4, yTo: 10 },
            { xFrom:  4, yFrom: 11, xTo:  5, yTo: 11 }, { xFrom:  5, yFrom: 11, xTo:  4, yTo: 11 },
            
            // stage left
            { xFrom:  0, yFrom:  1, xTo:  0, yTo:  2 }, { xFrom:  0, yFrom:  2, xTo:  0, yTo:  1 },
            { xFrom:  2, yFrom:  1, xTo:  2, yTo:  2 }, { xFrom:  2, yFrom:  2, xTo:  2, yTo:  1 },
            { xFrom:  3, yFrom:  1, xTo:  3, yTo:  2 }, { xFrom:  3, yFrom:  2, xTo:  3, yTo:  1 },
            { xFrom:  4, yFrom:  1, xTo:  4, yTo:  2 }, { xFrom:  4, yFrom:  2, xTo:  4, yTo:  1 },
            
            // stage right
            { xFrom:  0, yFrom: 13, xTo:  0, yTo: 14 }, { xFrom:  0, yFrom: 14, xTo:  0, yTo: 13 },
            { xFrom:  1, yFrom: 13, xTo:  1, yTo: 14 }, { xFrom:  1, yFrom: 14, xTo:  1, yTo: 13 },
            { xFrom:  2, yFrom: 13, xTo:  2, yTo: 14 }, { xFrom:  2, yFrom: 14, xTo:  2, yTo: 13 },
            { xFrom:  3, yFrom: 13, xTo:  3, yTo: 14 }, { xFrom:  3, yFrom: 14, xTo:  3, yTo: 13 },
        ],
        doors: {
            right: { x: 20, y: 8, direction: "left", target: { roomId: "cafe_st", doorId: "cafe" } },
            left_warp_bottom: { x: 0, y: 14, direction: "right", target: { roomId: "enkai", doorId: "left_warp_top" } },
            left_warp_top: { x: 2, y: 18, direction: "right", target: { roomId: "enkai", doorId: "left_warp_bottom" } },
            right_warp_bottom: { x: 19, y: 15, direction: "down", target: { roomId: "enkai", doorId: "right_warp_top" } },
            right_warp_top: { x: 14, y: 18, direction: "left", target: { roomId: "enkai", doorId: "right_warp_bottom" } },
        },
        streamSlotCount: 3,
    },
    idoA: {
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
    },
    idoB: {
        id: "idoB",
        group: "gikopoi",
        scale: 1,
        size: { x: 8, y: 8 },
        originCoordinates: { x: 18, y: 264 },
        spawnPoint: "left",
        backgroundImageUrl: "rooms/idoB/background.svg",
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
        ],
        forbiddenMovements: [],
        doors: {
            left: { x: 0, y: 7, direction: "right", target: { roomId: "cafe_st", doorId: "bottom_right" } },
        },
        streamSlotCount: 0,
    },
    admin_bar: {
        id: "admin_bar",
        group: "gikopoi",
        scale: 1,
        size: { x: 12, y: 10 },
        originCoordinates: { x: 0, y: 371 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/admin_bar/background.svg",
        objects: [
            { x:  0, y:  7, offset: { x:   1, y: 106 }, url: "shelves.svg" },
            
            { x:  8, y:  1, offset: { x: 391, y: 417 }, url: "table.svg" },
            { x:  8, y:  6, offset: { x: 591, y: 318 }, url: "table.svg" },
            
            { x:  3, y:  0, offset: { x: 122, y: 365 }, url: "counter_right.svg" },
            { x:  3, y:  1, offset: { x: 162, y: 345 }, url: "counter_right.svg" },
            { x:  3, y:  2, offset: { x: 202, y: 325 }, url: "counter_right.svg" },
            { x:  3, y:  3, offset: { x: 242, y: 305 }, url: "counter_right.svg" },
            { x:  3, y:  4, offset: { x: 282, y: 285 }, url: "counter_right.svg" },
            { x:  3, y:  5, offset: { x: 322, y: 265 }, url: "counter_right.svg" },
            { x:  3, y:  6, offset: { x: 362, y: 245 }, url: "counter_right.svg" },
            { x:  3, y:  7, offset: { x: 402, y: 225 }, url: "counter_top_right.svg" },
            { x:  2, y:  7, offset: { x: 362, y: 205 }, url: "counter_top.svg" },
        ],
        sit: [
            // bar stools
            { x:  4, y:  0 },
            { x:  4, y:  1 },
            { x:  4, y:  2 },
            { x:  4, y:  3 },
            { x:  4, y:  4 },
            { x:  4, y:  5 },
            { x:  4, y:  6 },
            { x:  4, y:  7 },
            
            // table stools
            { x:  8, y:  0 },
            { x:  9, y:  0 },
            { x:  8, y:  3 },
            { x:  9, y:  3 },
            { x:  7, y:  1 },
            { x:  7, y:  2 },
            { x: 10, y:  1 },
            { x: 10, y:  2 },
            
            { x:  8, y:  5 },
            { x:  9, y:  5 },
            { x:  8, y:  8 },
            { x:  9, y:  8 },
            { x:  7, y:  6 },
            { x:  7, y:  7 },
            { x: 10, y:  6 },
            { x: 10, y:  7 },
        ],
        blocked: [
            // shelves
            { x:  0, y:  0 },
            { x:  0, y:  1 },
            { x:  0, y:  2 },
            { x:  0, y:  3 },
            { x:  0, y:  4 },
            { x:  0, y:  5 },
            { x:  0, y:  6 },
            { x:  0, y:  7 },
            
            // counters
            { x:  3, y:  0 },
            { x:  3, y:  1 },
            { x:  3, y:  2 },
            { x:  3, y:  3 },
            { x:  3, y:  4 },
            { x:  3, y:  5 },
            { x:  3, y:  6 },
            { x:  3, y:  7 },
            { x:  2, y:  7 },
            
            // tables
            { x:  8, y:  1 },
            { x:  9, y:  1 },
            { x:  8, y:  2 },
            { x:  9, y:  2 },
            
            { x:  8, y:  6 },
            { x:  9, y:  6 },
            { x:  8, y:  7 },
            { x:  9, y:  7 },            
        ],
        forbiddenMovements: [],
        doors: {
            spawn: { x: 6, y: 0, direction: "up", target: null },
            down: { x: 11, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "admin" } },
        },
        streamSlotCount: 2,
    },
    bar774: {
        id: "bar774",
        group: "gikopoi",
        scale: 1,
        size: { x: 6, y: 8 },
        originCoordinates: { x: -1, y: 298 },
        spawnPoint: "down",
        backgroundImageUrl: "rooms/bar774/background.svg",
        objects: [
            { x:  5, y:  2, offset: { x: 289, y: 295 }, url: "table.svg" },
            { x:  5, y:  6, offset: { x: 449, y: 215 }, url: "table.svg" },
            
            { x:  2, y:  7, offset: { x: 360, y: 129 }, url: "counter_right.svg" },
            { x:  2, y:  6, offset: { x: 320, y: 149 }, url: "counter_right.svg" },
            { x:  2, y:  5, offset: { x: 280, y: 169 }, url: "counter_right.svg" },
            { x:  2, y:  4, offset: { x: 240, y: 189 }, url: "counter_right.svg" },
            { x:  2, y:  3, offset: { x: 200, y: 209 }, url: "counter_right.svg" },
            { x:  2, y:  2, offset: { x: 160, y: 229 }, url: "counter_right.svg" },
            { x:  2, y:  1, offset: { x: 136, y: 244 }, url: "counter_bottom_right.svg" },
            { x:  1, y:  1, offset: { x:  96, y: 224 }, url: "counter_bottom.svg" },
            
            { x:  0, y:  1, offset: { x:  83, y: 107 }, url: "light.svg" },
            { x:  0, y:  5, offset: { x: 243, y:  27 }, url: "light.svg" },
        ],
        sit: [
            // crate
            { x:  0, y:  7 },
            
            // bar stools
            { x:  3, y:  7 },
            { x:  3, y:  6 },
            { x:  3, y:  5 },
            { x:  3, y:  4 },
            { x:  3, y:  3 },
            { x:  3, y:  2 },
            
            // table stools
            { x:  5, y:  1 },
            { x:  5, y:  3 },
            { x:  5, y:  5 },
            { x:  5, y:  7 },
            
        ],
        blocked: [
            // tables
            { x:  5, y:  2 },
            { x:  5, y:  6 },
            
            // counters
            { x:  2, y:  7 },
            { x:  2, y:  6 },
            { x:  2, y:  5 },
            { x:  2, y:  4 },
            { x:  2, y:  3 },
            { x:  2, y:  2 },
            { x:  2, y:  1 },
            { x:  1, y:  1 },
        ],
        forbiddenMovements: [],
        doors: {
            down: { x: 4, y: 0, direction: "up", target: { roomId: "basement", doorId: "bar774" } },
        },
        streamSlotCount: 0,
        forcedAnonymous: true,
    },
    yatai: {
        id: "yatai",
        group: "gikopoi",
        scale: 1,
        size: { x: 8, y: 8 },
        originCoordinates: { x: -1, y: 417 },
        spawnPoint: "down",
        backgroundImageUrl: "rooms/yatai/background.svg",
        objectRenderSortMethod: "diagonal_scan",
        objects: [
            { x:  7, y:  0, offset: { x:   64, y:  106 }, url: 'roof.svg' },
            { x:  1, y:  5, offset: { x:  264, y:  120 }, url: 'pole.svg' },
            { x:  1, y:  3, offset: { x:  151, y:  194 }, url: 'bucket_squid.svg' },
            { x:  6, y:  5, offset: { x:  460, y:  218 }, url: 'pole.svg' },
            { x:  6, y:  3, offset: { x:  348, y:  225 }, url: 'panel.svg' },
            { x:  1, y:  2, width: 5, offset: { x:  133, y:  310 }, url: 'vendor_counter.svg' },
            { x:  1, y:  0, offset: { x:   49, y:  201 }, url: 'sign.svg' },
            { x:  7, y:  3, offset: { x:  413, y:  444 }, url: 'seat_with_bottle.svg' },
        ],
        sit: [
            { x:  1, y:  1 },
            { x:  2, y:  1 },
            { x:  3, y:  1 },
            { x:  4, y:  1 },
            { x:  5, y:  1 },
            
            { x:  7, y:  3 },
        ],
        blocked: [
            { x:  1, y:  3 },
            { x:  1, y:  2 },
            { x:  2, y:  2 },
            { x:  3, y:  2 },
            { x:  4, y:  2 },
            { x:  5, y:  2 },
            
            { x:  7, y:  7 },
        ],
        forbiddenMovements: [
            { xFrom:  5, yFrom:  3, xTo:  6, yTo:  3 }, { xFrom:  6, yFrom:  3, xTo:  5, yTo:  3 },
        ],
        doors: {
            down: { x: 7, y: 0, direction: "up", target: { roomId: "bar_st", doorId: "up_right" } },
        },
        streamSlotCount: 0,
    },
    school_rouka: {
        id: "school_rouka",
        group: "gikopoi",
        scale: 1,
        size: { x: 5, y: 8 },
        originCoordinates: { x: 0, y: 335 },
        spawnPoint: "right_top",
        backgroundImageUrl: "rooms/school_rouka/background.svg",
        objects: [
            { x:  2, y:  6, offset: { x:  359, y:  149 }, url: 'wall_part.svg' },
            { x:  4, y:  6, offset: { x:  361, y:  40 }, url: 'wall.svg' },
        ],
        sit: [
        ],
        blocked: [
            { x:  0, y:  7 },
            { x:  1, y:  7 },
        ],
        forbiddenMovements: [
            { xFrom:  2, yFrom:  6, xTo:  2, yTo:  7 }, { xFrom:  2, yFrom:  7, xTo:  2, yTo:  6 },
            { xFrom:  4, yFrom:  6, xTo:  4, yTo:  7 }, { xFrom:  4, yFrom:  7, xTo:  4, yTo:  6 },
        ],
        doors: {
            door_left: { x: 0, y: 2, direction: "right", target: { roomId: "school_international", doorId: "right" } },
            door_right: { x: 0, y: 5, direction: "right", target: { roomId: "school", doorId: "right" } },
            down: { x: 1, y: 0, direction: "up", target: { roomId: "school_ground", doorId: "up" } },
            right_top: { x: 4, y: 4, direction: "left", target: { roomId: "school_st", doorId: "school" } },
            right_bottom: { x: 4, y: 1, direction: "left", target: { roomId: "school_pc", doorId: "door" } },
        },
        streamSlotCount: 0,
    },
    school: {
        id: "school",
        group: "gikopoi",
        scale: 1,
        size: { x: 8, y: 7 },
        originCoordinates: { x: 0, y: 312 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/school/background.svg",
        objects: [
            { x:  1, y:  1, offset: { x:   89, y:  242 }, url: 'desk.svg' },
            { x:  2, y:  1, offset: { x:  137, y:  283 }, url: 'seat_base.svg' },
            { x:  3, y:  1, offset: { x:  156, y:  262 }, url: 'seat_back.svg' },
            { x:  3, y:  1, offset: { x:  169, y:  282 }, url: 'desk.svg' },
            { x:  4, y:  1, offset: { x:  217, y:  323 }, url: 'seat_base.svg' },
            { x:  5, y:  1, offset: { x:  236, y:  302 }, url: 'seat_back.svg' },
            { x:  5, y:  1, offset: { x:  249, y:  322 }, url: 'desk.svg' },
            { x:  6, y:  1, offset: { x:  297, y:  363 }, url: 'seat_base.svg' },
            { x:  7, y:  1, offset: { x:  316, y:  342 }, url: 'seat_back.svg' },
            { x:  1, y:  3, offset: { x:  169, y:  202 }, url: 'desk.svg' },
            { x:  2, y:  3, offset: { x:  217, y:  243 }, url: 'seat_base.svg' },
            { x:  3, y:  3, offset: { x:  236, y:  222 }, url: 'seat_back.svg' },
            { x:  3, y:  3, offset: { x:  249, y:  242 }, url: 'desk.svg' },
            { x:  4, y:  3, offset: { x:  297, y:  283 }, url: 'seat_base.svg' },
            { x:  5, y:  3, offset: { x:  316, y:  262 }, url: 'seat_back.svg' },
            { x:  5, y:  3, offset: { x:  329, y:  282 }, url: 'desk.svg' },
            { x:  6, y:  3, offset: { x:  377, y:  323 }, url: 'seat_base.svg' },
            { x:  7, y:  3, offset: { x:  396, y:  302 }, url: 'seat_back.svg' },
            { x:  1, y:  5, offset: { x:  249, y:  162 }, url: 'desk.svg' },
            { x:  2, y:  5, offset: { x:  297, y:  203 }, url: 'seat_base.svg' },
            { x:  3, y:  5, offset: { x:  316, y:  182 }, url: 'seat_back.svg' },
            { x:  3, y:  5, offset: { x:  329, y:  202 }, url: 'desk.svg' },
            { x:  4, y:  5, offset: { x:  376, y:  243 }, url: 'seat_base.svg' },
            { x:  5, y:  5, offset: { x:  396, y:  222 }, url: 'seat_back.svg' },
            { x:  5, y:  5, offset: { x:  409, y:  242 }, url: 'desk_with_ika.svg' },
            { x:  6, y:  5, offset: { x:  457, y:  283 }, url: 'seat_base.svg' },
            { x:  7, y:  5, offset: { x:  476, y:  262 }, url: 'seat_back.svg' },
        ],
        sit: [
            { x:  2, y:  1 },
            { x:  2, y:  3 },
            { x:  2, y:  5 },
            { x:  4, y:  1 },
            { x:  4, y:  3 },
            { x:  4, y:  5 },
            { x:  6, y:  1 },
            { x:  6, y:  3 },
            { x:  6, y:  5 },
        ],
        blocked: [
            { x:  1, y:  1 },
            { x:  1, y:  3 },
            { x:  1, y:  5 },
            { x:  3, y:  1 },
            { x:  3, y:  3 },
            { x:  3, y:  5 },
            { x:  5, y:  1 },
            { x:  5, y:  3 },
            { x:  5, y:  5 },
        ],
        forbiddenMovements: [
            { xFrom:  6, yFrom:  1, xTo:  7, yTo:  1 }, { xFrom:  7, yFrom:  1, xTo:  6, yTo:  1 },
            { xFrom:  6, yFrom:  3, xTo:  7, yTo:  3 }, { xFrom:  7, yFrom:  3, xTo:  6, yTo:  3 },
            { xFrom:  6, yFrom:  5, xTo:  7, yTo:  5 }, { xFrom:  7, yFrom:  5, xTo:  6, yTo:  5 },
        ],
        doors: {
            right: { x: 7, y: 2, direction: "left", target: { roomId: "school_rouka", doorId: "door_right" } },
        },
        streamSlotCount: 0,
    },
    school_international: {
        id: "school_international",
        group: "gikopoi",
        scale: 1,
        size: { x: 9, y: 12 },
        originCoordinates: { x: 0, y: 412 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/school_international/background.svg",
        objects: [
            { x:  1, y:  1, offset: { x:  134, y:  321 }, url: 'chair_back.svg' },
            { x:  1, y:  2, offset: { x:  136, y:  343 }, url: 'chair_base.svg' },
            { x:  1, y:  3, offset: { x:  161, y:  306 }, url: 'desk.svg' },
            { x:  1, y:  4, offset: { x:  254, y:  261 }, url: 'chair_back.svg' },
            { x:  1, y:  5, offset: { x:  256, y:  283 }, url: 'chair_base.svg' },
            { x:  1, y:  6, offset: { x:  281, y:  246 }, url: 'desk.svg' },
            { x:  1, y:  7, offset: { x:  374, y:  201 }, url: 'chair_back.svg' },
            { x:  1, y:  8, offset: { x:  376, y:  223 }, url: 'chair_base.svg' },
            { x:  1, y:  9, offset: { x:  401, y:  186 }, url: 'desk.svg' },
            { x:  3, y:  1, offset: { x:  214, y:  361 }, url: 'chair_back.svg' },
            { x:  3, y:  2, offset: { x:  216, y:  383 }, url: 'chair_base.svg' },
            { x:  3, y:  3, offset: { x:  241, y:  346 }, url: 'desk.svg' },
            { x:  3, y:  4, offset: { x:  334, y:  301 }, url: 'chair_back.svg' },
            { x:  3, y:  5, offset: { x:  336, y:  323 }, url: 'chair_base.svg' },
            { x:  3, y:  6, offset: { x:  361, y:  286 }, url: 'desk.svg' },
            { x:  3, y:  7, offset: { x:  454, y:  241 }, url: 'chair_back.svg' },
            { x:  3, y:  8, offset: { x:  456, y:  263 }, url: 'chair_base.svg' },
            { x:  3, y:  9, offset: { x:  481, y:  226 }, url: 'desk.svg' },
            { x:  5, y:  1, offset: { x:  294, y:  401 }, url: 'chair_back.svg' },
            { x:  5, y:  2, offset: { x:  296, y:  423 }, url: 'chair_base.svg' },
            { x:  5, y:  3, offset: { x:  321, y:  386 }, url: 'desk.svg' },
            { x:  5, y:  4, offset: { x:  414, y:  341 }, url: 'chair_back.svg' },
            { x:  5, y:  5, offset: { x:  416, y:  363 }, url: 'chair_base.svg' },
            { x:  5, y:  6, offset: { x:  441, y:  326 }, url: 'desk.svg' },
            { x:  5, y:  7, offset: { x:  534, y:  281 }, url: 'chair_back.svg' },
            { x:  5, y:  8, offset: { x:  536, y:  303 }, url: 'chair_base.svg' },
            { x:  5, y:  9, offset: { x:  561, y:  266 }, url: 'desk.svg' },
            { x:  7, y:  1, offset: { x:  374, y:  441 }, url: 'chair_back.svg' },
            { x:  7, y:  2, offset: { x:  376, y:  463 }, url: 'chair_base.svg' },
            { x:  7, y:  3, offset: { x:  401, y:  426 }, url: 'desk.svg' },
            { x:  7, y:  4, offset: { x:  494, y:  381 }, url: 'chair_back.svg' },
            { x:  7, y:  5, offset: { x:  496, y:  403 }, url: 'chair_base.svg' },
            { x:  7, y:  6, offset: { x:  521, y:  366 }, url: 'desk.svg' },
            { x:  7, y:  7, offset: { x:  614, y:  321 }, url: 'chair_back.svg' },
            { x:  7, y:  8, offset: { x:  616, y:  343 }, url: 'chair_base.svg' },
            { x:  7, y:  9, offset: { x:  641, y:  306 }, url: 'desk.svg' },
        ],
        sit: [
            { x:  1, y:  2 },
            { x:  3, y:  2 },
            { x:  5, y:  2 },
            { x:  7, y:  2 },
            { x:  1, y:  5 },
            { x:  3, y:  5 },
            { x:  5, y:  5 },
            { x:  7, y:  5 },
            { x:  1, y:  8 },
            { x:  3, y:  8 },
            { x:  5, y:  8 },
            { x:  7, y:  8 },
        ],
        blocked: [
            { x:  1, y:  3 },
            { x:  3, y:  3 },
            { x:  5, y:  3 },
            { x:  7, y:  3 },
            { x:  1, y:  6 },
            { x:  3, y:  6 },
            { x:  5, y:  6 },
            { x:  7, y:  6 },
            { x:  1, y:  9 },
            { x:  3, y:  9 },
            { x:  5, y:  9 },
            { x:  7, y:  9 },
        
            { x:  0, y: 11 },
        ],
        forbiddenMovements: [
            { xFrom:  1, yFrom:  2, xTo:  1, yTo:  1 }, { xFrom:  1, yFrom:  1, xTo:  1, yTo:  2 },
            { xFrom:  3, yFrom:  2, xTo:  3, yTo:  1 }, { xFrom:  3, yFrom:  1, xTo:  3, yTo:  2 },
            { xFrom:  5, yFrom:  2, xTo:  5, yTo:  1 }, { xFrom:  5, yFrom:  1, xTo:  5, yTo:  2 },
            { xFrom:  7, yFrom:  2, xTo:  7, yTo:  1 }, { xFrom:  7, yFrom:  1, xTo:  7, yTo:  2 },
            
            { xFrom:  1, yFrom:  5, xTo:  1, yTo:  4 }, { xFrom:  1, yFrom:  4, xTo:  1, yTo:  5 },
            { xFrom:  3, yFrom:  5, xTo:  3, yTo:  4 }, { xFrom:  3, yFrom:  4, xTo:  3, yTo:  5 },
            { xFrom:  5, yFrom:  5, xTo:  5, yTo:  4 }, { xFrom:  5, yFrom:  4, xTo:  5, yTo:  5 },
            { xFrom:  7, yFrom:  5, xTo:  7, yTo:  4 }, { xFrom:  7, yFrom:  4, xTo:  7, yTo:  5 },
            
            { xFrom:  1, yFrom:  8, xTo:  1, yTo:  7 }, { xFrom:  1, yFrom:  7, xTo:  1, yTo:  8 },
            { xFrom:  3, yFrom:  8, xTo:  3, yTo:  7 }, { xFrom:  3, yFrom:  7, xTo:  3, yTo:  8 },
            { xFrom:  5, yFrom:  8, xTo:  5, yTo:  7 }, { xFrom:  5, yFrom:  7, xTo:  5, yTo:  8 },
            { xFrom:  7, yFrom:  8, xTo:  7, yTo:  7 }, { xFrom:  7, yFrom:  7, xTo:  7, yTo:  8 },
        ],
        doors: {
            right: { x: 8, y: 1, direction: "left", target: { roomId: "school_rouka", doorId: "door_left" } },
        },
        streamSlotCount: 3,
    },
    school_pc: {
        id: "school_pc",
        group: "gikopoi",
        scale: 1,
        size: { x: 9, y: 12 },
        originCoordinates: { x: 1, y: 412 },
        spawnPoint: "door",
        backgroundImageUrl: "rooms/school_pc/background.svg",
        objects: [
            { x:  1, y:  2, offset: { x:  149, y:  352 }, url: 'stool.svg' },
            { x:  1, y:  3, offset: { x:  161, y:  286 }, url: 'desk.svg' },
            { x:  1, y:  5, offset: { x:  269, y:  292 }, url: 'stool.svg' },
            { x:  1, y:  6, offset: { x:  281, y:  226 }, url: 'desk.svg' },
            { x:  1, y:  8, offset: { x:  389, y:  232 }, url: 'stool.svg' },
            { x:  1, y:  9, offset: { x:  401, y:  167 }, url: 'desk.svg' },
            { x:  3, y:  2, offset: { x:  229, y:  392 }, url: 'stool.svg' },
            { x:  3, y:  3, offset: { x:  241, y:  326 }, url: 'desk.svg' },
            { x:  3, y:  5, offset: { x:  348, y:  332 }, url: 'stool.svg' },
            { x:  3, y:  6, offset: { x:  361, y:  267 }, url: 'desk.svg' },
            { x:  3, y:  8, offset: { x:  469, y:  272 }, url: 'stool.svg' },
            { x:  3, y:  9, offset: { x:  481, y:  207 }, url: 'desk.svg' },
            { x:  5, y:  2, offset: { x:  309, y:  432 }, url: 'stool.svg' },
            { x:  5, y:  3, offset: { x:  321, y:  366 }, url: 'desk.svg' },
            { x:  5, y:  5, offset: { x:  428, y:  372 }, url: 'stool.svg' },
            { x:  5, y:  6, offset: { x:  441, y:  306 }, url: 'desk.svg' },
            { x:  5, y:  8, offset: { x:  548, y:  312 }, url: 'stool.svg' },
            { x:  5, y:  9, offset: { x:  561, y:  247 }, url: 'desk.svg' },
            { x:  7, y:  2, offset: { x:  388, y:  472 }, url: 'stool.svg' },
            { x:  7, y:  3, offset: { x:  401, y:  406 }, url: 'desk.svg' },
            { x:  7, y:  5, offset: { x:  508, y:  412 }, url: 'stool.svg' },
            { x:  7, y:  6, offset: { x:  521, y:  347 }, url: 'desk.svg' },
            { x:  7, y:  8, offset: { x:  628, y:  352 }, url: 'stool.svg' },
            { x:  7, y:  9, offset: { x:  641, y:  287 }, url: 'desk.svg' },
        ],
        sit: [
            { x:  1, y:  2 },
            { x:  1, y:  5 },
            { x:  1, y:  8 },
            { x:  3, y:  2 },
            { x:  3, y:  5 },
            { x:  3, y:  8 },
            { x:  5, y:  2 },
            { x:  5, y:  5 },
            { x:  5, y:  8 },
            { x:  7, y:  2 },
            { x:  7, y:  5 },
            { x:  7, y:  8 },
        ],
        blocked: [
            { x:  1, y:  3 },
            { x:  1, y:  6 },
            { x:  1, y:  9 },
            { x:  3, y:  3 },
            { x:  3, y:  6 },
            { x:  3, y:  9 },
            { x:  5, y:  3 },
            { x:  5, y:  6 },
            { x:  5, y:  9 },
            { x:  7, y:  3 },
            { x:  7, y:  6 },
            { x:  7, y:  9 },
        ],
        forbiddenMovements: [],
        doors: {
            door: { x: 0, y: 1, direction: "right", target: { roomId: "school_rouka", doorId: "right_bottom" } },
        },
        streamSlotCount: 1,
    },
    school_ground: {
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
    },
    kaidan: {
        id: "kaidan",
        group: "gikopoi",
        scale: 1,
        size: { x: 6, y: 11 },
        originCoordinates: { x: 725, y: 1153 },
        blockWidth: 40,
        blockHeight: 60,
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/kaidan/background.svg",
        objects: [],
        sit: [],
        blocked: [
            { x:  2, y: 10 },
            { x:  2, y:  9 },
            { x:  2, y:  8 },
            { x:  2, y:  7 },
            { x:  2, y:  6 },
            { x:  2, y:  5 },
            { x:  2, y:  4 },
            { x:  2, y:  3 },
            { x:  2, y:  2 },
            { x:  2, y:  1 },
            
            { x:  3, y: 10 },
            { x:  3, y:  9 },
            { x:  3, y:  8 },
            { x:  3, y:  7 },
            { x:  3, y:  6 },
            { x:  3, y:  5 },
            { x:  3, y:  4 },
            { x:  3, y:  3 },
            { x:  3, y:  2 },
            { x:  3, y:  1 },
        ],
        forbiddenMovements: [],
        doors: {
            spawn: { x: 0, y: 0, direction: "up", target: null },
            bottom_left: { x: 0, y: 0, direction: "right", target: { roomId: "admin_st", doorId: "right" } },
            bottom_right: { x: 4, y: 0, direction: "right", target: { roomId: "cafe_st", doorId: "top_right" } },
            top_left: { x: 0, y: 10, direction: "down", target: { roomId: "takadai", doorId: "left" } },
            top_right: { x: 4, y: 10, direction: "down", target: { roomId: "takadai", doorId: "right" } },
        },
        streamSlotCount: 0,
    },
    seashore: {
        id: "seashore",
        group: "gikopoi",
        scale: 1,
        size: { x: 9, y: 14 },
        originCoordinates: { x: 507, y: 556 },
        blockWidth: 80,
        blockHeight: 15,
        spawnPoint: "right",
        backgroundImageUrl: "rooms/seashore/background.svg",
        onlyDrawOverBackgroundImage: true,
        objects: [
            { x:  2, y:  6, offset: { x:  851, y:  486 }, url: 'seat.svg' },
            { x:  2, y:  7, offset: { x:  890, y:  479 }, url: 'seat.svg' },
            { x:  2, y:  8, offset: { x:  931, y:  471 }, url: 'seat.svg' },
            { x:  2, y:  9, offset: { x:  971, y:  464 }, url: 'seat.svg' },
            { x:  2, y: 10, offset: { x: 1011, y:  456 }, url: 'seat.svg' },
            { x:  2, y: 11, offset: { x: 1051, y:  449 }, url: 'seat.svg' },
            
            { x:  6, y:  6, offset: { x: 1011, y:  516 }, url: 'seat.svg' },
            { x:  6, y:  7, offset: { x: 1051, y:  509 }, url: 'seat.svg' },
            { x:  6, y:  8, offset: { x: 1091, y:  501 }, url: 'seat.svg' },
            { x:  6, y:  9, offset: { x: 1131, y:  494 }, url: 'seat.svg' },
            { x:  6, y: 10, offset: { x: 1171, y:  486 }, url: 'seat.svg' },
            { x:  6, y: 11, offset: { x: 1211, y:  479 }, url: 'seat.svg' },
        ],
        sit: [
            { x:  2, y:  6 },
            { x:  2, y:  7 },
            { x:  2, y:  8 },
            { x:  2, y:  9 },
            { x:  2, y: 10 },
            { x:  2, y: 11 },
            
            { x:  6, y:  6 },
            { x:  6, y:  7 },
            { x:  6, y:  8 },
            { x:  6, y:  9 },
            { x:  6, y: 10 },
            { x:  6, y: 11 },
        ],
        blocked: [],
        forbiddenMovements: [],
        doors: {
            right: { x: 8, y: 9, direction: "left", target: { roomId: "busstop", doorId: "left" } },
        },
        streamSlotCount: 0,
    },
    densha: {
        id: "densha",
        group: "gikopoipoi",
        scale: 1,
        size: { x: 3, y: 15 },
        originCoordinates: { x: 3, y: 451 },
        blockWidth: 80,
        blockHeight: 40,
        spawnPoint: "left_top",
        backgroundImageUrl: "rooms/densha/background.svg",
        backgroundColor: "#414141",
        objects: [
            { x:  0, y: -1, offset: { x:    0, y:  390 }, url: 'bench_cover.svg' },
            
            { x:  0, y:  2, offset: { x:    1, y:  296 }, url: 'bench_left_1.svg' },
            { x:  0, y:  2, offset: { x:  130, y:  277 }, url: 'bench_left_2_panel.svg' },
            { x:  0, y:  7, offset: { x:  132, y:  196 }, url: 'bench_left_2.svg' },
            { x:  0, y:  7, offset: { x:  330, y:  177 }, url: 'bench_left_3_panel.svg' },
            { x:  0, y: 12, offset: { x:  331, y:   96 }, url: 'bench_left_3.svg' },
            { x:  0, y: 12, offset: { x:  529, y:   77 }, url: 'bench_left_4_panel.svg' },
            
            { x:  2, y: -1, offset: { x:   90, y:  414 }, url: 'bench_right_1_over.svg' },
            { x:  2, y:  2, offset: { x:   94, y:  411 }, url: 'bench_right_1_under.svg' },
            { x:  2, y:  2, offset: { x:  220, y:  314 }, url: 'bench_right_2_over.svg' },
            { x:  2, y:  7, offset: { x:  225, y:  311 }, url: 'bench_right_2_under.svg' },
            { x:  2, y:  7, offset: { x:  420, y:  214 }, url: 'bench_right_3_over.svg' },
            { x:  2, y: 12, offset: { x:  425, y:  211 }, url: 'bench_right_3_under.svg' },
            { x:  2, y: 12, offset: { x:  620, y:  150 }, url: 'bench_right_4_over.svg' },
            
            { x:  2, y:  0, offset: { x:    0, y:    0 }, url: 'rings.svg' },
        ],
        sit: [
            { x:  0, y:  0 },
            { x:  0, y:  1 },
            
            { x:  0, y:  3 },
            { x:  0, y:  4 },
            { x:  0, y:  5 },
            { x:  0, y:  6 },
            
            { x:  0, y:  8 },
            { x:  0, y:  9 },
            { x:  0, y: 10 },
            { x:  0, y: 11 },
            
            { x:  0, y: 13 },
            { x:  0, y: 14 },
            
            { x:  2, y:  0 },
            { x:  2, y:  1 },
            
            { x:  2, y:  3 },
            { x:  2, y:  4 },
            { x:  2, y:  5 },
            { x:  2, y:  6 },
            
            { x:  2, y:  8 },
            { x:  2, y:  9 },
            { x:  2, y: 10 },
            { x:  2, y: 11 },
            
            { x:  2, y: 13 },
            { x:  2, y: 14 },
        ],
        blocked: [],
        forbiddenMovements: [
            { xFrom:  0, yFrom:  1, xTo:  0, yTo:  2 }, { xFrom:  0, yFrom:  2, xTo:  0, yTo:  1 },
            { xFrom:  0, yFrom:  2, xTo:  0, yTo:  3 }, { xFrom:  0, yFrom:  3, xTo:  0, yTo:  2 },
            
            { xFrom:  0, yFrom:  6, xTo:  0, yTo:  7 }, { xFrom:  0, yFrom:  7, xTo:  0, yTo:  6 },
            { xFrom:  0, yFrom:  7, xTo:  0, yTo:  8 }, { xFrom:  0, yFrom:  8, xTo:  0, yTo:  7 },
            
            { xFrom:  0, yFrom: 11, xTo:  0, yTo: 12 }, { xFrom:  0, yFrom: 12, xTo:  0, yTo: 11 },
            { xFrom:  0, yFrom: 12, xTo:  0, yTo: 13 }, { xFrom:  0, yFrom: 13, xTo:  0, yTo: 12 },
            
            { xFrom:  2, yFrom:  1, xTo:  2, yTo:  2 }, { xFrom:  2, yFrom:  2, xTo:  2, yTo:  1 },
            { xFrom:  2, yFrom:  2, xTo:  2, yTo:  3 }, { xFrom:  2, yFrom:  3, xTo:  2, yTo:  2 },
            
            { xFrom:  2, yFrom:  6, xTo:  2, yTo:  7 }, { xFrom:  2, yFrom:  7, xTo:  2, yTo:  6 },
            { xFrom:  2, yFrom:  7, xTo:  2, yTo:  8 }, { xFrom:  2, yFrom:  8, xTo:  2, yTo:  7 },
            
            { xFrom:  2, yFrom: 11, xTo:  2, yTo: 12 }, { xFrom:  2, yFrom: 12, xTo:  2, yTo: 11 },
            { xFrom:  2, yFrom: 12, xTo:  2, yTo: 13 }, { xFrom:  2, yFrom: 13, xTo:  2, yTo: 12 },
        ],
        doors: {
            left_top: { x: 0, y: 12, direction: "right", target: { roomId: "busstop", doorId: "down" } },
            left_middle: { x: 0, y: 7, direction: "right", target: { roomId: "bar_giko_square", doorId: "up" } },
            top: { x: 1, y: 14, direction: "down", target: { roomId: "densha", doorId: "bottom" } },
            bottom: { x: 1, y: 0, direction: "up", target: { roomId: "densha", doorId: "top" } },
            left_bottom: { x: 0, y: 2, direction: "right", target: { roomId: "river", doorId: "right"} },
        },
        streamSlotCount: 1,
    },
    labyrinth: {
        id: "labyrinth",
        group: "gikopoipoi",
        scale: 1,
        size: { x: 27, y: 27 },
        originCoordinates: { x: 0, y: 352 },
        spawnPoint: "in",
        secret: true, //comment when room is ready
        backgroundImageUrl: "rooms/badend/badend.jpg",
        backgroundColor: "#000000",
        streamSlotCount: 0,
        objects: [
        ],
        sit: [
            { x: 13, y: 13 },
        ],
        blocked: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 },
            { x: 0, y: 5 },
            { x: 0, y: 6 },
            { x: 0, y: 7 },
            { x: 0, y: 8 },
            { x: 0, y: 9 },
            { x: 0, y: 10 },
            { x: 0, y: 11 },
            { x: 0, y: 12 },
            { x: 0, y: 14 },
            { x: 0, y: 15 },
            { x: 0, y: 16 },
            { x: 0, y: 17 },
            { x: 0, y: 18 },
            { x: 0, y: 19 },
            { x: 0, y: 20 },
            { x: 0, y: 21 },
            { x: 0, y: 22 },
            { x: 0, y: 23 },
            { x: 0, y: 24 },
            { x: 0, y: 25 },
            { x: 0, y: 26 },
    
            { x: 1, y: 0 },
            { x: 1, y: 4 },
            { x: 1, y: 8 },
            { x: 1, y: 12 },
            { x: 1, y: 26 },
    
            { x: 2, y: 0 },
            { x: 2, y: 2 },
            { x: 2, y: 4 },
            { x: 2, y: 6 },
            { x: 2, y: 8 },
            { x: 2, y: 10 },
            { x: 2, y: 12 },
            { x: 2, y: 13 },
            { x: 2, y: 14 },
            { x: 2, y: 15 },
            { x: 2, y: 16 },
            { x: 2, y: 17 },
            { x: 2, y: 18 },
            { x: 2, y: 19 },
            { x: 2, y: 20 },
            { x: 2, y: 21 },
            { x: 2, y: 22 },
            { x: 2, y: 23 },
            { x: 2, y: 24 },
            { x: 2, y: 26 },
    
            { x: 3, y: 0 },
            { x: 3, y: 2 },
            { x: 3, y: 4 },
            { x: 3, y: 6 },
            { x: 3, y: 8 },
            { x: 3, y: 10 },
            { x: 3, y: 12 },
            { x: 3, y: 16 },
            { x: 3, y: 20 },
            { x: 3, y: 24 },
            { x: 3, y: 26 },
    
            { x: 4, y: 0 },
            { x: 4, y: 2 },
            { x: 4, y: 4 },
            { x: 4, y: 6 },
            { x: 4, y: 8 },
            { x: 4, y: 10 },
            { x: 4, y: 12 },
            { x: 4, y: 16 },
            { x: 4, y: 18 },
            { x: 4, y: 20 },
            { x: 4, y: 22 },
            { x: 4, y: 24 },
            { x: 4, y: 26 },
    
            { x: 5, y: 0 },
            { x: 5, y: 2 },
            { x: 5, y: 4 },
            { x: 5, y: 6 },
            { x: 5, y: 8 },
            { x: 5, y: 10 },
            { x: 5, y: 12 },
            { x: 5, y: 14 },
            { x: 5, y: 16 },
            { x: 5, y: 18 },
            { x: 5, y: 20 },
            { x: 5, y: 22 },
            { x: 5, y: 24 },
            { x: 5, y: 26 },
    
            { x: 6, y: 0 },
            { x: 6, y: 2 },
            { x: 6, y: 4 },
            { x: 6, y: 6 },
            { x: 6, y: 8 },
            { x: 6, y: 10 },
            { x: 6, y: 12 },
            { x: 6, y: 14 }, 
            { x: 6, y: 16 },
            { x: 6, y: 18 },
            { x: 6, y: 20 },
            { x: 6, y: 22 },
            { x: 6, y: 24 },
            { x: 6, y: 26 },
    
            { x: 7, y: 0 },
            { x: 7, y: 2 },
            { x: 7, y: 4 },
            { x: 7, y: 6 },
            { x: 7, y: 8 },
            { x: 7, y: 10 },
            { x: 7, y: 12 },
            { x: 7, y: 16 },
            { x: 7, y: 14 },
            { x: 7, y: 18 },
            { x: 7, y: 20 },
            { x: 7, y: 22 },
            { x: 7, y: 24 },
            { x: 7, y: 26 },
    
            { x: 8, y: 0 },
            { x: 8, y: 2 },
            { x: 8, y: 4 },
            { x: 8, y: 6 },
            { x: 8, y: 8 },
            { x: 8, y: 10 },
            { x: 8, y: 12 },
            { x: 8, y: 14 },
            { x: 8, y: 16 },
            { x: 8, y: 18 },
            { x: 8, y: 20 },
            { x: 8, y: 22 },
            { x: 8, y: 24 },
            { x: 8, y: 26 },
    
            { x: 9, y: 0 },
            { x: 9, y: 2 },
            { x: 9, y: 4 },
            { x: 9, y: 6 },
            { x: 9, y: 8 },
            { x: 9, y: 10 },
            { x: 9, y: 12 },
            { x: 9, y: 16 },
            { x: 9, y: 14 }, 
            { x: 9, y: 18 },
            { x: 9, y: 20 },
            { x: 9, y: 22 },
            { x: 9, y: 24 },
            { x: 9, y: 26 },
    
            { x: 10, y: 0 },
            { x: 10, y: 2 },
            { x: 10, y: 4 },
            { x: 10, y: 6 },
            { x: 10, y: 8 },
            { x: 10, y: 10 },
            { x: 10, y: 12 },
            { x: 10, y: 14 },
            { x: 10, y: 16 },
            { x: 10, y: 18 },
            { x: 10, y: 20 },
            { x: 10, y: 22 },
            { x: 10, y: 24 },
            { x: 10, y: 26 },
    
            { x: 11, y: 0 },
            { x: 11, y: 2 },
            { x: 11, y: 4 },
            { x: 11, y: 6 },
            { x: 11, y: 8 },
            { x: 11, y: 10 },
            { x: 11, y: 12 },
            { x: 11, y: 14 }, 
            { x: 11, y: 16 },
            { x: 11, y: 18 },
            { x: 11, y: 20 },
            { x: 11, y: 22 },
            { x: 11, y: 24 },
            { x: 11, y: 26 },
    
            { x: 12, y: 0 },
            { x: 12, y: 2 },
            { x: 12, y: 4 },
            { x: 12, y: 6 },
            { x: 12, y: 8 },
            { x: 12, y: 10 },
            { x: 12, y: 12 },
            { x: 12, y: 14 },
            { x: 12, y: 16 },
            { x: 12, y: 18 },
            { x: 12, y: 20 },
            { x: 12, y: 22 },
            { x: 12, y: 24 },
            { x: 12, y: 26 },
    
            { x: 13, y: 0 },
            { x: 13, y: 2 },
            { x: 13, y: 4 },
            { x: 13, y: 6 },
            { x: 13, y: 8 },
            { x: 13, y: 10 },
            { x: 13, y: 12 },
            { x: 13, y: 14 }, 
            { x: 13, y: 16 },
            { x: 13, y: 18 },
            { x: 13, y: 20 },
            { x: 13, y: 22 },
            { x: 13, y: 24 },
            { x: 13, y: 26 },
    
            { x: 14, y: 0 },
            { x: 14, y: 2 },
            { x: 14, y: 4 },
            { x: 14, y: 6 },
            { x: 14, y: 8 },
            { x: 14, y: 10 },
            { x: 14, y: 12 },
            { x: 14, y: 13 },
            { x: 14, y: 14 },
            { x: 14, y: 16 },
            { x: 14, y: 18 },
            { x: 14, y: 20 },
            { x: 14, y: 22 },
            { x: 14, y: 24 },
            { x: 14, y: 26 },
    
            { x: 15, y: 0 },
            { x: 15, y: 2 },
            { x: 15, y: 4 },
            { x: 15, y: 6 },
            { x: 15, y: 8 },
            { x: 15, y: 10 },
            { x: 15, y: 16 },
            { x: 15, y: 18 },
            { x: 15, y: 20 },
            { x: 15, y: 22 },
            { x: 15, y: 24 },
            { x: 15, y: 26 },
    
            { x: 16, y: 0 },
            { x: 16, y: 2 },
            { x: 16, y: 4 },
            { x: 16, y: 6 },
            { x: 16, y: 8 },
            { x: 16, y: 10 },
            { x: 16, y: 11 },
            { x: 16, y: 12 },
            { x: 16, y: 13 },
            { x: 16, y: 14 },
            { x: 16, y: 15 },
            { x: 16, y: 16 },
            { x: 16, y: 18 },
            { x: 16, y: 20 },
            { x: 16, y: 22 },
            { x: 16, y: 24 },
            { x: 16, y: 26 },
    
            { x: 17, y: 0 },
            { x: 17, y: 2 },
            { x: 17, y: 4 },
            { x: 17, y: 6 },
            { x: 17, y: 8 },
            { x: 17, y: 18 },
            { x: 17, y: 20 },
            { x: 17, y: 22 },
            { x: 17, y: 24 },
            { x: 17, y: 26 },
    
            { x: 18, y: 0 },
            { x: 18, y: 2 },
            { x: 18, y: 4 },
            { x: 18, y: 6 },
            { x: 18, y: 8 },
            { x: 18, y: 9 },
            { x: 18, y: 10 },
            { x: 18, y: 11 },
            { x: 18, y: 12 },
            { x: 18, y: 13 },
            { x: 18, y: 14 },
            { x: 18, y: 15 },
            { x: 18, y: 16 },
            { x: 18, y: 17 },
            { x: 18, y: 18 },
            { x: 18, y: 20 },
            { x: 18, y: 22 },
            { x: 18, y: 24 },
            { x: 18, y: 26 },
    
            { x: 19, y: 0 },
            { x: 19, y: 2 },
            { x: 19, y: 4 },
            { x: 19, y: 6 },
            { x: 19, y: 20 },
            { x: 19, y: 22 },
            { x: 19, y: 24 },
            { x: 19, y: 26 },
    
            { x: 20, y: 0 },
            { x: 20, y: 2 },
            { x: 20, y: 4 },
            { x: 20, y: 6 },
            { x: 20, y: 7 },
            { x: 20, y: 8 },
            { x: 20, y: 9 },
            { x: 20, y: 10 },
            { x: 20, y: 11 },
            { x: 20, y: 12 },
            { x: 20, y: 13 },
            { x: 20, y: 14 },
            { x: 20, y: 15 },
            { x: 20, y: 16 },
            { x: 20, y: 17 },
            { x: 20, y: 18 },
            { x: 20, y: 19 }, 
            { x: 20, y: 20 },
            { x: 20, y: 22 },
            { x: 20, y: 24 },
            { x: 20, y: 26 },
    
            { x: 21, y: 0 },
            { x: 21, y: 2 },
            { x: 21, y: 4 },
            { x: 21, y: 22 },
            { x: 21, y: 24 },
            { x: 21, y: 26 },
    
            { x: 22, y: 0 },
            { x: 22, y: 2 },
            { x: 22, y: 4 },
            { x: 22, y: 5 },
            { x: 22, y: 6 },
            { x: 22, y: 7 },
            { x: 22, y: 8 },
            { x: 22, y: 9 },
            { x: 22, y: 10 },
            { x: 22, y: 11 },
            { x: 22, y: 12 },
            { x: 22, y: 13 },
            { x: 22, y: 14 },
            { x: 22, y: 15 },
            { x: 22, y: 16 },
            { x: 22, y: 17 },
            { x: 22, y: 18 },
            { x: 22, y: 19 },
            { x: 22, y: 20 },
            { x: 22, y: 21 },
            { x: 22, y: 22 },
            { x: 22, y: 24 },
            { x: 22, y: 26 },
    
            { x: 23, y: 0 },
            { x: 23, y: 2 },
            { x: 23, y: 24 },
            { x: 23, y: 26 },
    
            { x: 24, y: 0 },
            { x: 24, y: 2 },
            { x: 26, y: 3 },
            { x: 24, y: 4 },
            { x: 24, y: 5 },
            { x: 24, y: 6 },
            { x: 24, y: 7 },
            { x: 24, y: 8 },
            { x: 24, y: 9 },
            { x: 24, y: 10 },
            { x: 24, y: 11 },
            { x: 24, y: 12 },
            { x: 24, y: 13 },
            { x: 24, y: 14 },
            { x: 24, y: 15 },
            { x: 24, y: 16 },
            { x: 24, y: 17 },
            { x: 24, y: 18 },
            { x: 24, y: 19 },
            { x: 24, y: 20 },
            { x: 24, y: 21 },
            { x: 24, y: 22 },
            { x: 26, y: 23 },
            { x: 24, y: 24 },
            { x: 24, y: 26 },
    
            { x: 25, y: 0 },
            { x: 25, y: 2 },
            { x: 25, y: 24 },
            { x: 25, y: 26 },
    
            { x: 26, y: 0 },
            { x: 26, y: 1 },
            { x: 26, y: 2 },
            { x: 26, y: 3 },
            { x: 26, y: 4 },
            { x: 26, y: 5 },
            { x: 26, y: 6 },
            { x: 26, y: 7 },
            { x: 26, y: 8 },
            { x: 26, y: 9 },
            { x: 26, y: 10 },
            { x: 26, y: 11 },
            { x: 26, y: 12 },
            { x: 26, y: 13 },
            { x: 26, y: 14 },
            { x: 26, y: 15 },
            { x: 26, y: 16 },
            { x: 26, y: 17 },
            { x: 26, y: 18 },
            { x: 26, y: 19 },
            { x: 26, y: 20 },
            { x: 26, y: 21 },
            { x: 26, y: 22 },
            { x: 26, y: 23 },
            { x: 26, y: 24 },
            { x: 26, y: 25 },
            { x: 26, y: 26 },
    
        ],
        forbiddenMovements: [],
        doors: {
            in: { x: 25, y: 13, direction: "up", target: { roomId: "labyrinth", doorId: "in" } },
            out: { x: 13, y: 13, direction: "up", target: { roomId: "labyrinth", doorId: "in" } },
        },
    },
    nerd_office: {
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
    },
    taiikukan: {
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
    },
    kyougijou: {
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
    },
};


export const dynamicRooms: DynamicRoom[] = []

dynamicRooms.push({
    roomId: "cafe_st",
    subscribedAnnualEvents: ["sakura"],
    build: (currentAnnualEvents: string[]) =>
    {
        return {
            id: "cafe_st",
            group: "gikopoi",
            scale: 1,
            size: { x: 11, y: 12 },
            originCoordinates: { x: 0, y: 267 },
            spawnPoint: "water",
            backgroundImageUrl: (currentAnnualEvents.includes("sakura")
                ? "rooms/cafe_st/background.sakura.svg"
                : "rooms/cafe_st/background.svg"),
            objects: [
                { x:  3, y:  4, offset: { x:  25, y: -19 }, url: "cafe.svg" },
                { x:  4, y:  1, offset: { x: 198, y:  92 }, url: "sunroof.svg" },
                
                { x:  0, y:  0, offset: { x:  18, y:  217 }, url: "chair_down.svg" },
                { x:  0, y:  1, offset: { x:  44, y:  192 }, url: "chair_down_back.svg" },
                { x:  1, y:  0, offset: { x:  58, y:  237 }, url: "chair_down.svg" },
                { x:  1, y:  1, offset: { x:  84, y:  212 }, url: "chair_down_back.svg" },
                { x:  2, y:  0, offset: { x:  98, y:  257 }, url: "chair_down.svg" },
                { x:  2, y:  1, offset: { x: 124, y:  232 }, url: "chair_down_back.svg" },
                
                { x:  5, y:  3, offset: { x: 326, y:  233 }, url: "table.svg" },
                { x:  5, y:  2, offset: { x: 294, y:  274 }, url: "chair_up.svg" },
                { x:  5, y:  1, offset: { x: 293, y:  258 }, url: "chair_up_back.svg" },
                { x:  6, y:  3, offset: { x: 376, y:  276 }, url: "chair_left.svg" },
                { x:  7, y:  3, offset: { x: 396, y:  260 }, url: "chair_left_back.svg" },
                { x:  5, y:  4, offset: { x: 378, y:  237 }, url: "chair_down.svg" },
                { x:  5, y:  4, offset: { x: 404, y:  212 }, url: "chair_down_back.svg" },
                
                { x:  8, y:  2, offset: { x: 407, y:  313 }, url: "table.svg" },
                { x:  8, y:  1, offset: { x: 374, y:  354 }, url: "chair_up.svg" },
                { x:  8, y:  0, offset: { x: 373, y:  338 }, url: "chair_up_back.svg" },
                { x:  8, y:  3, offset: { x: 458, y:  317 }, url: "chair_down.svg" },
                { x:  8, y:  3, offset: { x: 484, y:  292 }, url: "chair_down_back.svg" },
                
                { x:  6, y:  9, offset: { x: 607, y:  133 }, url: "table.svg" },
                { x:  6, y:  8, offset: { x: 575, y:  174 }, url: "chair_up.svg" },
                { x:  6, y:  7, offset: { x: 574, y:  158 }, url: "chair_up_back.svg" },
                { x:  7, y:  9, offset: { x: 656, y:  176 }, url: "chair_left.svg" },
                { x:  8, y:  9, offset: { x: 676, y:  160 }, url: "chair_left_back.svg" },
                { x:  6, y: 10, offset: { x: 658, y:  137 }, url: "chair_down.svg" },
                { x:  6, y: 10, offset: { x: 684, y:  112 }, url: "chair_down_back.svg" },
                { x:  5, y:  9, offset: { x: 578, y:  137 }, url: "chair_right.svg" },
                { x:  5, y:  9, offset: { x: 570, y:  112 }, url: "chair_right_back.svg" },
                
                { x:  1, y: 11, offset: { x: 498, y:   17 }, url: "chair_down.svg" },
                { x:  1, y: 12, offset: { x: 524, y:   -8 }, url: "chair_down_back.svg" },
                { x:  2, y: 11, offset: { x: 538, y:   37 }, url: "chair_down.svg" },
                { x:  2, y: 12, offset: { x: 564, y:   12 }, url: "chair_down_back.svg" },
                { x:  3, y: 11, offset: { x: 578, y:   57 }, url: "chair_down.svg" },
                { x:  3, y: 12, offset: { x: 604, y:   32 }, url: "chair_down_back.svg" },
                
                { x: 10, y:  6, offset: { x: 517, y:  314 }, url: "bench.svg" },
                { x: 11, y:  2, offset: { x: 558, y:  296 }, url: "bench_back.svg" },
                
                { x: 10, y: 10, offset: { x: 677, y:  234 }, url: "bench.svg" },
                { x: 11, y:  7, offset: { x: 718, y:  216 }, url: "bench_back.svg" },
                
                { x:  2, y:  7, offset: { x: 366, y:   93 }, url: "polish.svg" },
                { x:  2, y:  9, offset: { x: 446, y:   53 }, url: "polish.svg" },
                
                { x:  7, y:  6, offset: { x: 531, y:  219 }, url: "hunsui/1.svg",
                    animation: { type: "cycle", scenes: { "main": { framesUrlPattern: { "prefix": "hunsui/", amount: 2, suffix: ".svg" } } }, frameDelay: 80 } },
                { x:  6, y:  7, offset: { x: 514, y:  225 }, url: "water/1.svg",
                    animation: { type: "cycle", scenes: { "main": { framesUrlPattern: { "prefix": "water/", amount: 5, suffix: ".svg" } } }, frameDelay: 80 } },
            ],
            sit: [
                { x:  0, y:  0 },
                { x:  1, y:  0 },
                { x:  2, y:  0 },
                
                { x:  5, y:  2 },
                { x:  6, y:  3 },
                { x:  5, y:  4 },
                
                { x:  8, y:  1 },
                { x:  8, y:  3 },
                
                { x:  6, y:  8 },
                { x:  7, y:  9 },
                { x:  6, y: 10 },
                { x:  5, y:  9 },
                
                { x:  1, y: 11 },
                { x:  2, y: 11 },
                { x:  3, y: 11 },
                
                { x: 10, y:  3 },
                { x: 10, y:  4 },
                { x: 10, y:  5 },
                
                { x: 10, y:  7 },
                { x: 10, y:  8 },
                { x: 10, y:  9 },
            ],
            blocked: [
                // cafe
                { x:  0, y:  1 },
                { x:  1, y:  1 },
                { x:  2, y:  1 },
                { x:  3, y:  1 },
                { x:  3, y:  2 },
                { x:  3, y:  3 },
                { x:  3, y:  4 },
                { x:  2, y:  5 },
                { x:  1, y:  6 },
                { x:  0, y:  6 },
                
                // sign
                { x:  4, y:  1 },
                
                // tables
                { x:  5, y:  3 },
                { x:  8, y:  2 },
                { x:  6, y:  9 },
                
                // poles
                { x:  2, y:  7 },
                { x:  2, y:  9 },
                
                // fountain
                { x:  7, y:  6 },
            ],
            forbiddenMovements: [
                { xFrom:  5, yFrom:  1, xTo:  5, yTo:  2 }, { xFrom:  5, yFrom:  2, xTo:  5, yTo:  1 },
                { xFrom:  6, yFrom:  3, xTo:  7, yTo:  3 }, { xFrom:  7, yFrom:  3, xTo:  6, yTo:  3 },
                { xFrom:  5, yFrom:  4, xTo:  5, yTo:  5 }, { xFrom:  5, yFrom:  5, xTo:  5, yTo:  4 },
                
                { xFrom:  8, yFrom:  1, xTo:  8, yTo:  0 }, { xFrom:  8, yFrom:  0, xTo:  8, yTo:  1 },
                { xFrom:  8, yFrom:  3, xTo:  8, yTo:  4 }, { xFrom:  8, yFrom:  4, xTo:  8, yTo:  3 },
                
                { xFrom:  6, yFrom:  7, xTo:  6, yTo:  8 }, { xFrom:  6, yFrom:  8, xTo:  6, yTo:  7 },
                { xFrom:  7, yFrom:  9, xTo:  8, yTo:  9 }, { xFrom:  8, yFrom:  9, xTo:  7, yTo:  9 },
                { xFrom:  6, yFrom: 10, xTo:  6, yTo: 11 }, { xFrom:  6, yFrom: 11, xTo:  6, yTo: 10 },
                { xFrom:  4, yFrom:  9, xTo:  5, yTo:  9 }, { xFrom:  5, yFrom:  9, xTo:  4, yTo:  9 },
            ],
            doors: {
                water: { x: 10, y: 6, direction: "left", target: { roomId: "idoA", doorId: "left" } },
                bottom_right: { x: 10, y: 1, direction: "left", target: { roomId: "idoB", doorId: "left" } },
                top_right: { x: 10, y: 10, direction: "left", target: { roomId: "kaidan", doorId: "bottom_right" } },
                up: { x: 8, y: 11, direction: "down", target: { roomId: "admin_st", doorId: "down" } },
                left: { x: 0, y: 8, direction: "right", target: { roomId: "school_st", doorId: "right" } },
                cafe: { x: 4, y: 2, direction: "right", target: { roomId: "enkai", doorId: "right" } },
                manhole: { x: 3, y: 5, direction: "down", target: { roomId: "basement", doorId: "down_right" } },
            },
            streamSlotCount: 0,
        }
    }
});

dynamicRooms.push({
    roomId: "konbini",
    subscribedAnnualEvents: ["summer", "christmasTime"],
    build: (currentAnnualEvents: string[]) =>
    {
        const room: Room = {
            id: "konbini",
            group: "gikopoipoi",
            variant:
                currentAnnualEvents.includes("summer") ? "summer" :
                currentAnnualEvents.includes("christmasTime") ? "christmas" :
                "normal",
            scale: 1,
            size: { x: 9, y: 8 },
            originCoordinates: { x: 4, y: 332 },
            spawnPoint: "door",
            backgroundImageUrl: 
                currentAnnualEvents.includes("summer") ? "rooms/konbini/background.summer.svg" :
                currentAnnualEvents.includes("christmasTime") ? "rooms/konbini/background.christmas.svg":
                "rooms/konbini/background.svg",
            objects: [],
            objectRenderSortMethod: "diagonal_scan",
            sit: !currentAnnualEvents.includes("summer") ? [{ x:  0, y:  0 },] : [],
            blocked: [
                // register
                { x:  4, y:  6 },
                { x:  5, y:  6 },
                { x:  6, y:  6 },
                { x:  7, y:  6 },
                { x:  8, y:  6 },
                // coffee machine
                { x:  0, y:  7 },
                { x:  1, y:  7 },
                { x:  2, y:  7 },
            ],
            forbiddenMovements: [
                { xFrom: 0, yFrom: 2, xTo: 1, yTo: 2 },
                { xFrom: 1, yFrom: 2, xTo: 0, yTo: 2 },
            ],
            doors: {
                door: { x: 0, y: 6, direction: "right", target: { roomId: "bar_giko_square", doorId: "right" } },
            },
            streamSlotCount: 1,
        }
        
        if (currentAnnualEvents.includes("summer"))
        {
            room.objects = room.objects.concat([
                { x:  4, y:  6, width: 5, offset: { x: 400, y: 156 }, url: "register.summer.svg"},
                { x:  1, y:  2, height: 2, offset: { x: 40 + 40, y: 184 - 20 }, url: "refrigerator.summer.svg", scale: 1 }, // drinks
                { x:  1, y:  4, height: 2, offset: { x: 40 * 4, y: 184 - 60 }, url: "bento.summer.svg", scale: 1 }, // drinks
                { x:  6, y:  2, width: 2, height: 3, offset: { x: 160 + 120, y: 203 + 60 }, url: "foods.summer.svg" }, // snacks
                { x:  3, y:  3, width: 2, height: 2, offset: { x: 280 - 80, y: 340 - 80 }, url: "freezer.svg" },
            ])
            room.blocked = room.blocked.concat([
                // bathroom
                { x:  0, y:  4 },
                { x:  0, y:  1 },
                // refrigerator
                { x:  1, y:  1 },
                { x:  1, y:  2 },
                { x:  1, y:  3 },
                { x:  1, y:  4 },
                // freezer
                // { x:  3, y:  1 }, { x:  4, y:  1 },
                { x:  3, y:  2 }, { x:  4, y:  2 },
                { x:  3, y:  3 }, { x:  4, y:  3 },
                // foods
                { x:  6, y:  1 }, { x:  7, y:  1 },
                { x:  6, y:  2 }, { x:  7, y:  2 },
                { x:  6, y:  3 }, { x:  7, y:  3 },
            ])
        }
        else
        {
            room.objects = room.objects.concat([
                { x:  1, y: 2, offset: { x: 40, y: 124 }, url: "toilet-wall-left.svg" },
                { x:  1, y: 4, offset: { x: 166, y: 109 }, url: "toilet-wall-right.svg" },
                { x:  4, y:  6, width: 5, offset: { x: 400, y: 156 },
                    url: currentAnnualEvents.includes("christmasTime") ? "register.christmas.svg" : "register.svg"},
                { x:  6, y:  2, width: 2, height: 2, offset: { x: 280, y: 340 }, url: "freezer.svg" },
                { x:  1, y:  1, height: 2, offset: { x: 40, y: 184 }, url: "refrigerator.svg", scale: 1 }, // drinks
                { x:  3, y:  3, width: 2, height: 3, offset: { x: 160, y: 203 }, url: "foods.svg" }, // snacks
            ])
            room.blocked = room.blocked.concat([
                // bathroom
                // { x:  0, y:  0 },
                // { x:  0, y:  1 },
                { x:  0, y:  4 },
                // refrigerator
                { x:  1, y:  0 },
                { x:  1, y:  1 },
                // foods
                { x:  3, y:  1 }, { x:  4, y:  1 },
                { x:  3, y:  2 }, { x:  4, y:  2 },
                { x:  3, y:  3 }, { x:  4, y:  3 },
                // freezer
                { x:  6, y:  1 }, { x:  7, y:  1 },
                { x:  6, y:  2 }, { x:  7, y:  2 },
            ])
        }
        return room
    }
});

dynamicRooms.push({
    roomId: "irori",
    subscribedAnnualEvents: ["summer", "autumn"],
    build: (currentAnnualEvents: string[]) =>
    {
        return {
            id: "irori",
            group: "gikopoipoi",
            variant: currentAnnualEvents.includes("summer") ? "summer"
                : currentAnnualEvents.includes("autumn") ? "autumn"
                : "winter",
            scale: 1,
            backgroundColor: "#000000",
            size: { x: 7, y: 11 },
            originCoordinates: { x: 0, y: 361 },
            spawnPoint: "door",
            backgroundImageUrl: currentAnnualEvents.includes("summer") ? "rooms/irori/background.summer.svg"
                                : currentAnnualEvents.includes("autumn") ? "rooms/irori/background.autumn.svg"
                                : "rooms/irori/background.winter.svg",
            objects: [
                { x: -1, y: 11, scale: 1, offset: { x: 148 , y: 387 }, url: "arrow_light_up_left.svg" },
                // { x:  100, y:  100, width: 1, offset: { x: 0, y: 0 }, url: "top.winter.svg"},
                { x:  7, y: -1, width: 100, offset: { x: 0, y: 0 },
                    url: currentAnnualEvents.includes("summer") ? "top.summer.svg"
                         : currentAnnualEvents.includes("autumn") ? "top.autumn.svg"
                         : "top.winter.svg"},
            ],
            sit: [
                { x: 1, y: 4 }, { x: 1, y: 5 }, { x: 1, y: 6 },
                { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
                { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 },
                { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
            ],
            blocked: [
                { x: 0, y: 6 },
                { x: 0, y: 4 },
                { x: 0, y: 3 },
                { x: 0, y: 2 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 2, y: 0 },
                { x: 1, y: 2 },
                // fireplace
                { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 2, y: 6 },
                { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
                { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 },
            ],
            forbiddenMovements: [
                // { xFrom: 0, yFrom: 2, xTo: 1, yTo: 2 },
                // { xFrom: 1, yFrom: 2, xTo: 0, yTo: 2 },
            ],
            doors: {
                door: { x: 0, y: 10, direction: "down", target: { roomId: "river", doorId: "left" } },
                stairs: { x: 3, y: 0, direction: "right", target: { roomId: "yaneura", doorId: "left_corner" } },
            },
            streamSlotCount: 1,
        }
    }
});

// annual events can overlap, so we first check if we're in a short, "specific" event and if not, we
// check which of the four seasons we're in.
const annualEventPriority = ["sakura", "rainy", "fireflies", "akizakura", "spring", "summer", "autumn", "winter"]
const riverAnnualEventToTypeOrder = ["sakura", "spring", "rainy", "fireflies", "summer", "akizakura", "autumn", "winter"]
//1 =  3月21日～4月30日  sakura
//2 =  5月1日～5月31日   spring
//3 =  6月1日～6月30日   rainy
//4 =  7月1日～7月9日    fireflies
//5 =  7月10日～8月31日  summer
//6 =  9月1日～9月30日   akizakura
//7 = 10月1日～11月30日  autumn
//8 = 12月1日～3月20日   winter
dynamicRooms.push({
    roomId: "river",
    subscribedAnnualEvents: riverAnnualEventToTypeOrder,
    build: (currentAnnualEvents: string[]) =>
    {
        const eventName = annualEventPriority.find((eventName: string) => currentAnnualEvents.includes(eventName)) || "summer"
        const type = riverAnnualEventToTypeOrder.indexOf(eventName) + 1
        
        const scale = (10.5 * 80)/1202
        
        const room: Room = {
            id: "river",
            group: "gikopoipoi",
            variant: eventName,
            scale: scale,
            size: { x: 9, y: 12 },
            originCoordinates: { x: 0, y: 501 },
            spawnPoint: "right",
            backgroundImageUrl: `rooms/river/background.${type}.svg`,
            objectRenderSortMethod: "diagonal_scan",
            objects: [
                {
                    x: 1,
                    y: 7,
                    width: 1,
                    height: 3,
                    scale: scale,
                    offset: { x: 343, y: 454 },
                    url: `bench.${type}.svg`
                },
                {
                    x: 9,
                    y: 0,
                    scale: scale,
                    offset: { x: 0, y: 0 },
                    url: `top.${type}.svg`
                },
                {
                    x: 1,
                    y: 11,
                    scale: scale,
                    offset: { x: 0, y: 0 },
                    url: `backtree.${type}.svg`
                },
                { 
                    x: 0,
                    y: 11,
                    scale: 1,
                    offset: { x: 300 , y: 605 },
                    url: "arrow-down.svg"
                },
                {
                    x: 0,
                    y: 11,
                    scale: 1,
                    offset: { x: 532 , y: 526 },
                    url: "arrow-right.svg"
                },
            ],
            sit: [{ x: 1, y: 5 }, { x: 1, y: 6 }, { x: 1, y: 7 }, { x: 4, y: 9 }],
            blocked: [
                // river left
                { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 },
                { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 },
                // river right
                { x: 3, y: 6 }, { x: 3, y: 7 }, { x: 3, y: 8 }, { x: 3, y: 10 }, { x: 3, y: 9 }, { x: 3, y: 11 },
                { x: 4, y: 6 }, { x: 4, y: 7 }, { x: 4, y: 8 }, { x: 4, y: 10 }, { x: 4, y: 11 },
                { x: 1, y: 11 },
                // tree right
                { x: 8, y: 9 },
            ],
            forbiddenMovements: [],
            doors: {
                right: { x: 8, y: 5, direction: "left", target: { roomId: "densha", doorId: "left_bottom" } },
                left: { x: 7, y: 0, direction: "up", target: { roomId: "irori", doorId: "door" } },
            },
            streamSlotCount: 0,
        }

        if (type == 5 || type == 6)
        {
            // cosmos
            room.blocked = room.blocked.concat([
                { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
                { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 },
            ]);
            for (let i = 0; i < 2; i++)
            {
                room.objects.push({
                    x: 1,
                    y: 3,
                    scale: scale,
                    offset: { x: 0 + i * 60, y: 580 + i * 30},
                    url: `cosmos.${type}.svg`
                })
                room.objects.push({
                    x: 1,
                    y: 3,
                    scale: scale,
                    offset: { x: 113 + i * 60, y: 520 + i * 30},
                    url: `cosmos.${type}.svg`
                })
            }
        }

        if (type >= 4 && type <= 7)
        {
            // grass
            room.blocked = room.blocked.concat([
                { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 },
                { x: 8, y: 0 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 },
            ]);
            for (let i = 0; i < 2; i++)
            {
                room.objects.push({
                    x: 8,
                    y: 0,
                    scale: scale,
                    offset: { x: 210 + i * 225, y: 580 + i * 105 },
                    url: `grass.${type}.svg`
                })
                room.objects.push({
                    x: 8,
                    y: 2,
                    scale: scale,
                    offset: { x: 210 + 105 + i * 225, y: 530 + i * 105 },
                    url: `grass.${type}.svg`
                })
            }
        }
        
        return room
    }
})

dynamicRooms.push({
    roomId: "monachat",
    subscribedAnnualEvents: ["christmasTime"],
    build: (currentAnnualEvents: string[]) =>
    {
        const variant = currentAnnualEvents.includes("christmasTime") ? "christmas" : "normal"
        return {
            id: "monachat",
            group: "gikopoipoi",
            variant: variant,
            scale: 1,
            size: { x: 7, y: 8 },
            originCoordinates: { x: 4, y: 332 },
            spawnPoint: "door",
            backgroundImageUrl: `rooms/monachat/background.${variant}.svg`,
            objects: [
                { x:  1, y:  0, offset: { x: 40, y: 250 }, url: "torikomi.svg" },
                { x:  2, y:  5, offset: { x: 290, y: 150 }, url: "matari.svg" },
            ],
            sit: [
                { x:  4, y:  1 },
                { x:  4, y:  2 },
                { x:  4, y:  3 },
                { x:  4, y:  4 },
                { x:  4, y:  5 },
                { x:  4, y:  6 },
            ],
            blocked: [
                { x:  1, y:  0 },
                { x:  2, y:  5 },
                { x:  3, y:  1 },
                { x:  3, y:  2 },
                { x:  3, y:  3 },
                { x:  3, y:  4 },
                { x:  3, y:  5 },
                { x:  3, y:  6 },
                { x:  4, y:  0 },
                { x:  5, y:  0 },
                { x:  6, y:  0 },
                { x:  6, y:  1 },
            ],
            forbiddenMovements: [],
            doors: {
                door: { x: 6, y: 6, direction: "left", target: { roomId: "bar_giko_square", doorId: "left" } },
            },
            streamSlotCount: 3,
        }
    }
});
dynamicRooms.push({
    roomId: "yaneura",
    subscribedAnnualEvents: ["spring", "summer", "autumn", "winter"],
    build: (currentAnnualEvents: string[]) =>
    {
        const variant = currentAnnualEvents.includes("spring") ? "spring"
            : currentAnnualEvents.includes("autumn") ? "autumn"
            : currentAnnualEvents.includes("winter") ? "winter"
            : "summer";

        const scale = ((10.5 * 80)/1202)/2
        return {
            id: "yaneura",
            group: "gikopoipoi",
            variant: variant,
            scale: scale,
            backgroundColor: "#000000",
            size: { x: 5, y: 7 },
            originCoordinates: { x: -40, y: 620*scale },
            spawnPoint: "left_corner",
            backgroundImageUrl: `rooms/yaneura/background.${variant}.svg`,
            objects: [
                { x: -1, y: 9, scale: 1, offset: { x: 102 , y: 695*scale }, url: "arrow_light_down_left.svg" },
                { x: 5, y: -1, scale: scale, offset: { x: 0 , y: 0 }, url: `overlay.${variant}.svg` }
            ],
            sit: [
                // floor mats
                { x: 2, y: 1 },
                { x: 3, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 2 },

                // hammock
                { x: 0, y: 6 },
                { x: 1, y: 6 },
            ],
            blocked: [
                // light
                { x: 4, y: 0 },

                // table
                { x: 1, y: 4 },
                { x: 2, y: 4 },
                { x: 3, y: 4 },

                // left wall
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 2 },
                { x: 0, y: 3 },

                // right wall
                { x: 0, y: 5 },
                { x: 1, y: 5 },
                { x: 2, y: 5 },
                { x: 4, y: 5 },

                { x: 3, y: 6 },
            ],
            forbiddenMovements: [],
            doors: {
                left_corner: { x: 3, y: 0, direction: "up", target: { roomId: "irori", doorId: "stairs" } },
                steps_bottom: { x: 4, y: 4, direction: "down", target: { roomId: "yaneura", doorId: "steps_top" } },
                steps_top: { x: 2, y: 6, direction: "left", target: { roomId: "yaneura", doorId: "steps_bottom" } },
            },
            streamSlotCount: 2,
        }
    }
});

const currentAnnualEvents = getCurrentAnnualEvents()
dynamicRooms.forEach((dynamicRoom: DynamicRoom) => rooms[dynamicRoom.roomId] = dynamicRoom.build(currentAnnualEvents, currentAnnualEvents, []))

