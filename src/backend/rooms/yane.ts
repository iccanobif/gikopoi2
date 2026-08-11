import { DynamicRoom } from "../types.js";

export const yaneRoom: DynamicRoom = {
    roomId: "yane",
    subscribedAnnualEvents: ["spring", "summer", "autumn", "winter"],
    build: (currentAnnualEvents: string[]) =>
    {
        const variant = currentAnnualEvents.includes("spring") ? "spring"
            : currentAnnualEvents.includes("autumn") ? "autumn"
            : currentAnnualEvents.includes("winter") ? "winter"
            : "summer";

        return {
            id: "yane",
            group: "gikopoipoi",
            variant: variant,
            scale: 0.35,
            size: { x: 7, y: 11 },
            originCoordinates: { x: 0, y: 561 },
            spawnPoint: "staircase",
            backgroundImageUrl: `rooms/yane/background.${variant}.svg`,
            objects: [
                { x: 6, y: -1, scale: 0.35, offset: { x: 0 , y: 0 }, url: `top.${variant}.svg` },
                { x: 5, y: 2, scale: 0.35, offset: { x: 720 , y: 1512 }, url: `wall.${variant}.svg` },
                { x: 0, y: 0, scale: 1, offset: { x: 52 , y: 545 }, url: `../arrow-right.svg` },
                { x: 0, y: 3, scale: 1, offset: { x: 134 , y: 472 }, url: `../arrow-up.svg` },
            ],
            doors: {
                staircase: { x: 1, y: 0, direction: "up", target: { roomId: "irori", doorId: "stairs" } },
                ladder_down: { x: 6, y: 1, direction: "left", target: { roomId: "yane", doorId: "ladder_up" } },
                ladder_up: { x: 0, y: 6, direction: "up", target: { roomId: "yane", doorId: "ladder_down" } },
                yaneura: { x: 0, y: 3, direction: "down", target: { roomId: "yaneura", doorId: "left_corner" } },
            },
            sit: [
                { x: 0, y: 7 },
                { x: 0, y: 8 },
                { x: 0, y: 9 },
                { x: 0, y: 10 },
            ],
            blocked: [
                // drawer
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 2 },
                // staircase
                { x: 2, y: 0 },
                { x: 2, y: 1 },
                { x: 3, y: 0 },
                { x: 3, y: 1 },
                // right border
                { x: 5, y: 2 },
                { x: 6, y: 2 },
                { x: 6, y: 3 },
                { x: 6, y: 4 },
                { x: 6, y: 5 },
                { x: 6, y: 6 },
                { x: 6, y: 7 },
                { x: 6, y: 8 },
                { x: 6, y: 9 },
                { x: 6, y: 10 },
                // other block
                { x: 0, y: 4 },
                { x: 0, y: 5 },
                { x: 1, y: 4 },
                { x: 1, y: 5 },
                { x: 1, y: 6 },
                { x: 2, y: 4 },
                { x: 2, y: 5 },
                { x: 2, y: 6 },
                { x: 3, y: 5 },
                { x: 3, y: 6 },
                { x: 3, y: 7 },
                { x: 3, y: 8 },
                { x: 3, y: 9 },
                { x: 3, y: 10 },
                { x: 4, y: 5 },
                { x: 4, y: 6 },
                { x: 4, y: 7 },
                { x: 4, y: 8 },
                { x: 4, y: 9 },
            ],
            forbiddenMovements: [],
            streamSlotCount: 2,
        }
    }
}