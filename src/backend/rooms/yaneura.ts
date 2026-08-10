import { DynamicRoom } from "../types";

export const yaneuraRoom: DynamicRoom = {
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
                left_corner: { x: 3, y: 0, direction: "up", target: { roomId: "yane", doorId: "yaneura" } },
                steps_bottom: { x: 4, y: 4, direction: "down", target: { roomId: "yaneura", doorId: "steps_top" } },
                steps_top: { x: 2, y: 6, direction: "left", target: { roomId: "yaneura", doorId: "steps_bottom" } },
            },
            streamSlotCount: 2,
        }
    }
}