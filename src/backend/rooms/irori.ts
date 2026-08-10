import { DynamicRoom } from "../types"

export const iroriRoom: DynamicRoom = {
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
                stairs: { x: 3, y: 0, direction: "right", target: { roomId: "yane", doorId: "staircase" } },
            },
            streamSlotCount: 1,
        }
    }
}