import { DynamicRoom, Room } from "../types"

export const konbiniRoom: DynamicRoom = {
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
}