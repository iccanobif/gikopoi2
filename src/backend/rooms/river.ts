import { DynamicRoom, Room } from "../types.js"
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

export const riverRoom: DynamicRoom = {
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
}