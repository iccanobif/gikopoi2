import { Room } from "./types";

export const rooms: { [roomId: string]: Room } = {
    bar: {
        id: "bar",
        scale: 0.5,
        size: { x: 9, y: 9 },
        originCoordinates: { x: 0, y: 352 },
        spawnPoint: "right",
        backgroundImageUrl: "rooms/bar/background.png",
        backgroundColor: "#c0c0c0",
        objects: [
            { x: 2, y: 1, url: "table.png", scale: 0.5, offset: { x: 241, y: 620 } },
            { x: 2, y: 2, url: "table.png", scale: 0.5, offset: { x: 321, y: 580 } },
            { x: 6, y: 1, url: "table.png", scale: 0.5, offset: { x: 561, y: 780 } },
            { x: 6, y: 2, url: "table.png", scale: 0.5, offset: { x: 640, y: 740 } },
            { x: 2, y: 7, url: "counter_left.png", scale: 0.5, offset: { x: 721, y: 361 } },
            { x: 2, y: 6, url: "counter_left.png", scale: 0.5, offset: { x: 642, y: 400 } },
            { x: 2, y: 5, url: "counter_bottom_left.png", scale: 0.5, offset: { x: 559, y: 449 } },
            { x: 3, y: 5, url: "counter_bottom.png", scale: 0.5, offset: { x: 639, y: 481 } },
            { x: 4, y: 5, url: "counter_bottom.png", scale: 0.5, offset: { x: 718, y: 521 } },
            { x: 5, y: 5, url: "counter_bottom.png", scale: 0.5, offset: { x: 798, y: 561 } },
            { x: 6, y: 7, url: "counter_right.png", scale: 0.5, offset: { x: 1033, y: 513 } },
            { x: 6, y: 6, url: "counter_right.png", scale: 0.5, offset: { x: 953, y: 553 } },
            { x: 6, y: 5, url: "counter_bottom_right.png", scale: 0.5, offset: { x: 879, y: 591 } },
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
        secret: false
    },
    admin_st: {
        id: "admin_st",
        scale: 1,
        size: { x: 10, y: 9 },
        originCoordinates: { x: 0, y: 235 },
        spawnPoint: "admin",
        backgroundImageUrl: "rooms/admin_st/background.svg",
        backgroundColor: "#c0c0c0",
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
        ],
        blocked: [
            // { x: 0, y: 5 },
            { x: 1, y: 5 },
            { x: 1, y: 6 },
            { x: 1, y: 8 },
            { x: 2, y: 5 },
            { x: 3, y: 5 },
            { x: 4, y: 5 },
            { x: 4, y: 6 },
            // { x: 4, y: 8 },
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

        ],
        doors: {
            world_spawn: { x: 5, y: 2, direction: "right", target: null },
            left: { x: 0, y: 2, direction: "right", target: { roomId: "bar_st", doorId: "right" } },
            admin: { x: 2, y: 4, direction: "down", target: { roomId: "admin", doorId: "down" } },
            barrier: { x: 7, y: 4, direction: "down", target: { roomId: "radio_backstage", doorId: "right_center" } }, // Temp
            down: { x: 7, y: 0, direction: "up", target: { roomId: "yoshinoya", doorId: "door" } },
            right: { x: 9, y: 2, direction: "left", target: { roomId: "takadai", doorId: "down_left" } },
            up_left: { x: 0, y: 8, direction: "down", target: { roomId: "bar_giko", doorId: "stairs" } },
            manhole_left: { x: 2, y: 0, direction: "up", target: { roomId: "basement", doorId: "up_right_1" } },
            manhole_right: { x: 9, y: 7, direction: "up", target: { roomId: "basement", doorId: "up_right_2" } },
            warp: { x: 9, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "trash" } },
            trash: { x: 5, y: 4, direction: "down", target: null },
        },
        streamSlotCount: 0,
        secret: false
    },
    basement: {
        id: "basement",
        scale: 0.4,
        size: { x: 10, y: 4 },
        originCoordinates: { x: 1, y: 277 },
        spawnPoint: "secret_bar",
        backgroundImageUrl: "rooms/basement/basement.png",
        backgroundColor: "#c0c0c0",
        objects: [
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
            secret_bar: { x: 3, y: 3, direction: "down", target: "NOT_READY_YET" },
            bar777: { x: 6, y: 3, direction: "down", target: "NOT_READY_YET" },
            up_right_1: { x: 8, y: 3, direction: "down", target: { roomId: "admin_st", doorId: "manhole_left" } },
            up_right_2: { x: 9, y: 3, direction: "down", target: { roomId: "admin_st", doorId: "manhole_right" } },
            down_left: { x: 1, y: 0, direction: "up", target: "NOT_READY_YET" },
            down_right: { x: 8, y: 0, direction: "up", target: "NOT_READY_YET" },
        },
        streamSlotCount: 0,
        secret: false
    },
    admin: {
        id: "admin",
        scale: 1,
        size: { x: 12, y: 6 },
        originCoordinates: { x: 43, y: 268 },
        spawnPoint: "down",
        backgroundImageUrl: "rooms/admin/background.svg",
        backgroundColor: "#c0c0c0",
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
        streamSlotCount: 2,
        secret: false
    },
    radio_backstage: {
        id: "radio_backstage",
        scale: 0.4,
        size: { x: 3, y: 9 },
        originCoordinates: { x: 0, y: 432 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/radio_backstage/radio_backstage.png",
        backgroundColor: "#333333",
        objects: [],
        sit: [],
        blocked: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 7 },
            { x: 0, y: 8 },
        ],
        forbiddenMovements: [],
        doors: {
            right_up: { x: 2, y: 1, direction: "left", target: { roomId: "bar", doorId: "right" } }, // Temp
            right_center: { x: 2, y: 4, direction: "left", target: { roomId: "admin", doorId: "down" } }, // Temp
            right_down: { x: 2, y: 7, direction: "left", target: { roomId: "admin_st", doorId: "admin" } }, // Temp
            spawn: { x: 2, y: 2, direction: "left", target: null }
        },
        streamSlotCount: 0,
        secret: false
    },
    school_st: {
        id: "school_st",
        scale: 0.4,
        size: { x: 6, y: 8 },
        originCoordinates: { x: 23, y: 305 },
        spawnPoint: "school",
        backgroundImageUrl: "rooms/school_st/giko-hell.png",
        // backgroundColor: "#c0c0c0",
        backgroundColor: "#990600",
        objects: [],
        sit: [
            { x: 0, y: 2 },
            { x: 0, y: 4 },
            { x: 0, y: 6 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 4, y: 2 },
            { x: 5, y: 5 },
            { x: 0, y: 2 },
            { x: 3, y: 4 },
            { x: 3, y: 2 },
            { x: 5, y: 5 },
            { x: 0, y: 3 },

            { x: 0, y: 2 },
            { x: 0, y: 5 },
            { x: 3, y: 7 },
            { x: 5, y: 2 },
            { x: 4, y: 1 },

        ],
        blocked: [
            // correct blocks:
            // { x: 0, y: 3 },
            // { x: 0, y: 4 },
            // { x: 0, y: 4 },
            // { x: 0, y: 6 },
            // { x: 0, y: 7 },


            { x: 2, y: 7 },
            { x: 5, y: 6 },
            { x: 0, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 2, y: 5 },
            { x: 6, y: 7 },
            { x: 3, y: 4 },
            { x: 4, y: 6 },
            { x: 6, y: 2 },
        ],
        forbiddenMovements: [],
        doors: {
            world_spawn: { x: 3, y: 4, direction: "down", target: null },
            left: { x: 0, y: 2, direction: "right", target: "NOT_READY_YET" },
            school: { x: 0, y: 5, direction: "right", target: "NOT_READY_YET" },
            up: { x: 3, y: 7, direction: "down", target: "NOT_READY_YET" },
            right: { x: 5, y: 2, direction: "left", target: "NOT_READY_YET" },
            manhole: { x: 4, y: 1, direction: "down", target: "NOT_READY_YET" }
        },
        streamSlotCount: 0,
        secret: true
    },
    bar_st: {
        id: "bar_st",
        scale: 0.4,
        size: { x: 10, y: 9 },
        originCoordinates: { x: 2, y: 324 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/bar_st/bar_st.png",
        backgroundColor: "#c0c0c0",
        objects: [
            { x: 4, y: 5, url: "door.svg", offset: { x: 362, y: 187 } },
            { x: 4, y: 5, url: "arrow.svg", offset: { x: 385, y: 265 } },
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
            up_right: { x: 9, y: 8, direction: "down", target: "NOT_READY_YET" },
            right: { x: 9, y: 2, direction: "left", target: { roomId: "admin_st", doorId: "left" } },
            manhole: { x: 8, y: 4, direction: "up", target: { roomId: "basement", doorId: "up_left" } }
        },
        streamSlotCount: 0,
        secret: false
    },
    takadai: {
        id: "takadai",
        scale: 1,
        size: { x: 9, y: 14 },
        originCoordinates: { x: 870, y: 1165 },
        spawnPoint: "down_left",
        backgroundImageUrl: "rooms/takadai/background.svg",
        backgroundColor: "#c0c0c0",
        needsFixedCamera: false,
        objects: [
            { x: 9, y: 0, url: "fences_and_thicket.svg", offset: { x: 176, y: 849 } },

            { x: 1, y: 1, url: "house.svg", offset: { x: 923, y: 911 } },
            { x: 0, y: 5, url: "house_under.svg", offset: { x: 927, y: 939 } },
            { x: 2, y: 6, url: "hanging_thing.svg", offset: { x: 1178, y: 978 } },
            { x: 1, y: 6, url: "seat.svg", offset: { x: 1150, y: 1035 } },
            { x: 0, y: 6, url: "seat.svg", offset: { x: 1110, y: 1015 } },
            { x: 2, y: 1, url: "a_frame_sign.svg", offset: { x: 1007, y: 1103 } },
            { x: 1, y: 7, url: "radio.svg", offset: { x: 1205, y: 936 } },
            { x: 0, y: 10, url: "telescope.svg", offset: { x: 1272, y: 887 } },
            { x: 0, y: 12, url: "telescope.svg", offset: { x: 1352, y: 847 } },
            { x: 5, y: 5, url: "fire.svg", offset: { x: 1290, y: 1076 } },
            { x: 8, y: 0, url: "denwa_box.svg", offset: { x: 1178, y: 1124 } },
            { x: 8, y: 2, url: "jizou_mini.svg", offset: { x: 1285, y: 1218 } },
            { x: 8, y: 3, url: "jizou.svg", offset: { x: 1317, y: 1171 } },
            { x: 8, y: 4, url: "jizou.svg", offset: { x: 1357, y: 1151 } },
            { x: 8, y: 5, url: "jizou.svg", offset: { x: 1397, y: 1131 } },

            { x: 9, y: 7, url: "wall_front_with_bush.svg", offset: { x: 1509, y: 1098 } },
            { x: 8, y: 7, url: "wall_front_with_bush_and_hole.svg", offset: { x: 1469, y: 1078 } },
            { x: 7, y: 7, url: "wall_front_with_bush.svg", offset: { x: 1429, y: 1058 } },
            { x: 6, y: 7, url: "wall_front_with_bush_lamp.svg", offset: { x: 1388, y: 1029 } },

            { x: 6, y: 6, url: "bush_cover.svg", offset: { x: 1388, y: 1082 } },
            { x: 7, y: 6, url: "bush_cover.svg", offset: { x: 1429, y: 1102 } },
            { x: 8, y: 6, url: "bush_cover.svg", offset: { x: 1469, y: 1122 } },

            { x: 6, y: 8, url: "wall_back_with_bush_and_sign.svg", offset: { x: 1385, y: 1010 } },
            { x: 6, y: 9, url: "wall_back.svg", offset: { x: 1452, y: 990 } },
            { x: 6, y: 10, url: "wall_back_with_hole.svg", offset: { x: 1492, y: 970 } },
            { x: 6, y: 11, url: "wall_back.svg", offset: { x: 1532, y: 950 } },
            { x: 4, y: 11, url: "wall_front.svg", offset: { x: 1504, y: 918 } },

            { x: 7, y: 12, url: "tree.svg", offset: { x: 1549, y: 863 } },
            { x: 8, y: 13, url: "mp_sign.svg", offset: { x: 1719, y: 979 } },
            { x: 9, y: 9, url: "tub_front.svg", offset: { x: 1524, y: 1006 } },
            { x: 7, y: 10, url: "tub_back.svg", offset: { x: 1526, y: 1040 } },
            { x: 8, y: 9, url: "water_surface.svg", offset: { x: 1569, y: 1053 } },
        ],
        sit: [
            { x: 2, y: 5 },
            { x: 2, y: 6 },
            { x: 1, y: 6 },

            { x: 6, y: 9 },
            { x: 6, y: 10 },
        ],
        blocked: [
            // dango flag
            { x: 0, y: 0 },
            // naito shop
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 7 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 5 },

            { x: 0, y: 10 },
            { x: 0, y: 12 },
            { x: 5, y: 8 },
            { x: 5, y: 9 },

            { x: 6, y: 8 },
            { x: 7, y: 8 },
            { x: 8, y: 8 },

            { x: 2, y: 1 },

            { x: 5, y: 5 },

            { x: 7, y: 0 },
            { x: 7, y: 1 },

            { x: 8, y: 2 },
            { x: 8, y: 3 },
            { x: 8, y: 4 },
            { x: 8, y: 5 },

            { x: 6, y: 12 },
            { x: 8, y: 13 },
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
        ],
        doors: {
            down_left: { x: 1, y: 0, direction: "up", target: { roomId: "admin_st", doorId: "right" } },
            down_right: { x: 5, y: 0, direction: "up", target: { roomId: "silo", doorId: "right" } },
        },
        streamSlotCount: 2,
        secret: false
    },
    silo: {
        id: "silo",
        scale: 0.6,
        size: { x: 12, y: 12 },
        originCoordinates: { x: 740, y: 1310 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/silo/silo.svg",
        backgroundColor: "#c0c0c0",
        backgroundOffset: { x: 868, y: 995 },
        needsFixedCamera: true,
        objects: [
            { x: 4, y: 6, url: "piano.svg", scale: 1, offset: { x: 1092, y: 1192 } },
        ],
        sit: [],
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
            right: { x: 11, y: 5, direction: "left", target: { roomId: "takadai", doorId: "down_right" } }
        },
        streamSlotCount: 2,
        secret: false
    },
    badend: {
        id: "badend",
        scale: 0.59,
        size: { x: 0, y: 0 },
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
        scale: 1,
        size: { x: 12, y: 14 },
        originCoordinates: { x: 13, y: 355 },
        spawnPoint: "spawn",
        backgroundImageUrl: "rooms/yoshinoya/yoshinoya.svg",
        backgroundColor: "#222",
        objects: [
            { x: 3, y: 11, url: "wall-with-squid.svg", scale: 1, xOffset: 3, yOffset: -4, offset: { x: 570, y: 39 } },

            // left table
            { x: 0 + 4, y: 3, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 294, y: 304 } },
            { x: 1 + 4, y: 3, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 294 + 1 * 40, y: 304 + 1 * 20 } },
            { x: 2 + 4, y: 3, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 294 + 2 * 40, y: 304 + 2 * 20 } },
            { x: 3 + 4, y: 3, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 294 + 3 * 40, y: 304 + 3 * 20 } },
            { x: 4 + 4, y: 3, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 294 + 4 * 40, y: 304 + 4 * 20 } },

            { x: 0 + 4, y: 5, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 373, y: 265 } },
            { x: 1 + 4, y: 5, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 373 + 1 * 40, y: 265 + 1 * 20 } },
            { x: 2 + 4, y: 5, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 373 + 2 * 40, y: 265 + 2 * 20 } },
            { x: 3 + 4, y: 5, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 373 + 3 * 40, y: 265 + 3 * 20 } },
            { x: 4 + 4, y: 5, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 373 + 4 * 40, y: 265 + 4 * 20 } },

            { x: 5 + 4, y: 4, url: "counter-middle.svg", scale: 1, xOffset: 1, yOffset: -1, offset: { x: 531, y: 383 } },
            { x: 5 + 4, y: 3, url: "counter-left-corner.svg", scale: 1, xOffset: 1, yOffset: -1, offset: { x: 492, y: 403 } },
            { x: 5 + 4, y: 5, url: "counter-right-corner.svg", scale: 1, xOffset: 2, yOffset: -1, offset: { x: 570, y: 363 } },

            // right table
            { x: 5 + 4, y: 3 + 6, url: "counter-left-corner.svg", scale: 1, xOffset: 1, yOffset: -1, offset: { x: 728, y: 285 } },
            { x: 5 + 4, y: 4 + 6, url: "counter-middle.svg", scale: 1, xOffset: 1, yOffset: -1, offset: { x: 768, y: 265 } },
            { x: 5 + 4, y: 5 + 6, url: "counter-right-corner.svg", scale: 1, xOffset: 2, yOffset: -1, offset: { x: 807, y: 245 } },
            { x: 0 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 531, y: 186 } },
            { x: 1 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 531 + 1 * 40, y: 186 + 1 * 20 } },
            { x: 2 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 531 + 2 * 40, y: 186 + 2 * 20 } },
            { x: 3 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 531 + 3 * 40, y: 186 + 3 * 20 } },
            { x: 4 + 4, y: 3 + 6, url: "counter-left.svg", scale: 1, xOffset: 0, yOffset: -2, offset: { x: 531 + 4 * 40, y: 186 + 4 * 20 } },
            { x: 0 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 610, y: 146 } },
            { x: 1 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 610 + 1 * 40, y: 146 + 1 * 20 } },
            { x: 2 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 610 + 2 * 40, y: 146 + 2 * 20 } },
            { x: 3 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 610 + 3 * 40, y: 146 + 3 * 20 } },
            { x: 4 + 4, y: 5 + 6, url: "counter-right.svg", scale: 1, xOffset: 0, yOffset: -1, offset: { x: 610 + 4 * 40, y: 146 + 4 * 20 } },

            // cooking table
            { x: 3, y: 5, url: "small-wallish-thing.svg", scale: 1, xOffset: 3, yOffset: -4, offset: { x: 334 + 0 * 40, y: 241 - 0 * 20 } },
            { x: 3, y: 6, url: "small-wallish-thing.svg", scale: 1, xOffset: 3, yOffset: -4, offset: { x: 334 + 1 * 40, y: 241 - 1 * 20 } },
            { x: 3, y: 7, url: "small-wallish-thing.svg", scale: 1, xOffset: 3, yOffset: -4, offset: { x: 334 + 2 * 40, y: 241 - 2 * 20 } },
            { x: 3, y: 8, url: "small-wallish-thing.svg", scale: 1, xOffset: 3, yOffset: -4, offset: { x: 334 + 3 * 40, y: 241 - 3 * 20 } },
            { x: 3, y: 9, url: "small-wallish-thing.svg", scale: 1, xOffset: 3, yOffset: -4, offset: { x: 334 + 4 * 40, y: 241 - 4 * 20 } },

            { x: 0, y: 0, url: "left-wall.svg", scale: 1, xOffset: 2, yOffset: -3, offset: { x: 176, y: 197 } },
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
            door: { x: 11, y: 7, direction: "left", target: { roomId: "admin_st", doorId: "down" } }
        },
        streamSlotCount: 1,
        secret: false
    },
    long_st: {
        id: "long_st",
        scale: 1,
        size: { x: 3, y: 33 },
        originCoordinates: { x: 14, y: 864 },
        spawnPoint: "down",
        backgroundImageUrl: "rooms/long_st/long_st.svg",
        backgroundColor: "#c0c0c0",
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
            left: { x: 0, y: 30, direction: "up", target: "NOT_READY_YET" }
        },
        streamSlotCount: 0,
        secret: false
    },
    bar_giko: {
        id: "bar_giko",
        scale: 1,
        size: { x: 14, y: 20 },
        originCoordinates: { x: 0, y: 380 },
        spawnPoint: "stairs",
        backgroundImageUrl: "rooms/bar_giko/background.svg",
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
            
            { x:  2, y:  0, offset: { x:  109, y:  383 }, url: "chair.svg" },
            { x:  3, y:  0, offset: { x:  120, y:  370 }, url: "table_hori.svg" },
            { x:  4, y:  0, offset: { x:  189, y:  423 }, url: "chair.svg" },
            
            { x:  7, y:  0, offset: { x:  309, y:  483 }, url: "chair.svg" },
            { x:  8, y:  0, offset: { x:  320, y:  470 }, url: "table_hori.svg" },
            { x:  9, y:  0, offset: { x:  389, y:  523 }, url: "chair.svg" },
            
            { x: 12, y:  1, offset: { x:  549, y:  563 }, url: "chair.svg" },
            { x: 13, y:  1, offset: { x:  589, y:  583 }, url: "chair.svg" },
            { x: 12, y:  2, offset: { x:  560, y:  510 }, url: "table_vert.svg" },
            { x: 13, y:  2, offset: { x:  600, y:  530 }, url: "table_vert.svg" },
            { x: 12, y:  3, offset: { x:  629, y:  523 }, url: "chair.svg" },
            { x: 13, y:  3, offset: { x:  669, y:  543 }, url: "chair.svg" },
            
            { x: 12, y:  5, offset: { x:  709, y:  483 }, url: "chair.svg" },
            { x: 13, y:  5, offset: { x:  749, y:  503 }, url: "chair.svg" },
            { x: 12, y:  6, offset: { x:  720, y:  430 }, url: "table_vert.svg" },
            { x: 13, y:  6, offset: { x:  760, y:  450 }, url: "table_vert.svg" },
            { x: 12, y:  7, offset: { x:  789, y:  443 }, url: "chair.svg" },
            { x: 13, y:  7, offset: { x:  829, y:  463 }, url: "chair.svg" },
            
            { x: 12, y: 12, offset: { x:  989, y:  343 }, url: "chair.svg" },
            { x: 13, y: 12, offset: { x: 1029, y:  363 }, url: "chair.svg" },
            { x: 12, y: 13, offset: { x: 1000, y:  290 }, url: "table_vert.svg" },
            { x: 13, y: 13, offset: { x: 1040, y:  310 }, url: "table_vert.svg" },
            { x: 12, y: 14, offset: { x: 1069, y:  303 }, url: "chair.svg" },
            { x: 13, y: 14, offset: { x: 1109, y:  323 }, url: "chair.svg" },
            
            { x: 12, y: 16, offset: { x: 1149, y:  263 }, url: "chair.svg" },
            { x: 13, y: 16, offset: { x: 1189, y:  283 }, url: "chair.svg" },
            { x: 12, y: 17, offset: { x: 1160, y:  210 }, url: "table_vert.svg" },
            { x: 13, y: 17, offset: { x: 1200, y:  230 }, url: "table_vert.svg" },
            { x: 12, y: 18, offset: { x: 1229, y:  223 }, url: "chair.svg" },
            { x: 13, y: 18, offset: { x: 1269, y:  243 }, url: "chair.svg" },
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
            stairs: { x: 7, y: 19, direction: "right", target: { roomId: "admin_st", doorId: "up_left" } },
        },
        streamSlotCount: 2,
        secret: false
    }
};

export const defaultRoom = rooms.admin_st
