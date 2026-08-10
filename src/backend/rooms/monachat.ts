import { DynamicRoom } from "../types"

export const monachatRoom: DynamicRoom = {
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
}