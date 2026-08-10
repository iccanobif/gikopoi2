import { DynamicRoom } from "../types"

export const cafeStRoom: DynamicRoom = {
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
}