import { Room } from "../types";

export const adminStRoom: Room = {
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
}