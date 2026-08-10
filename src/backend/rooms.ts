import { Room, DynamicRoom, Coordinates } from "./types.js";
import { getCurrentAnnualEvents } from "../common/annualevents.js";
import { barRoom } from "./rooms/bar.js";
import { adminStRoom } from "./rooms/admin_st.js";
import { basementRoom } from "./rooms/basement.js";
import { adminRoom } from "./rooms/admin.js";
import { adminOldroom } from "./rooms/admin_old.js";
import { radioBackstageRoom } from "./rooms/radio_backstage.js";
import { schoolStRoom } from "./rooms/school_st.js";
import { barStRoom } from "./rooms/bar_st.js";
import { takadaiRoom } from "./rooms/takadai.js";
import { siloRoom } from "./rooms/silo.js";
import { badendRoom } from "./rooms/badend.js";
import { yoshinoyaRoom } from "./rooms/yoshinoya.js";
import { longStRoom } from "./rooms/long_st.js";
import { barGikoRoom } from "./rooms/bar_giko.js";
import { jinjaRoom } from "./rooms/jinja.js";
import { busStopRoom } from "./rooms/busstop.js";
import { radioRoom1 } from "./rooms/radio_room1.js";
import { barGiko2Room } from "./rooms/bar_giko2.js";
import { barGikoSquareRoom } from "./rooms/bar_giko_square.js";
import { izakaya774Room } from "./rooms/izakaya774.js";
import { radioRoom2 } from "./rooms/radio_room2.js";
import { radioRoom3 } from "./rooms/radio_room3.js";
import { radioRoom } from "./rooms/radio.js";
import { radioGakuyaRoom } from "./rooms/radio_gakuya.js";
import { jinjaStRoom } from "./rooms/jinja_st.js";
import { enkaiRoom } from "./rooms/enkai.js";
import { idoARoom } from "./rooms/idoA.js";
import { idoBRoom } from "./rooms/idoB.js";
import { adminBarRoom } from "./rooms/admin_bar.js";
import { bar774Room } from "./rooms/bar774.js";
import { yataiRoom } from "./rooms/yatai.js";
import { schoolRoukaRoom } from "./rooms/school_rouka.js";
import { schoolRoom } from "./rooms/school.js";
import { schoolInternationalRoom } from "./rooms/school_international.js";
import { schoolPcRoom } from "./rooms/school_pc.js";
import { schoolGroundRoom } from "./rooms/school_ground.js";
import { kaidanRoom } from "./rooms/kaidan.js";
import { seashoreRoom } from "./rooms/seashore.js";
import { denshaRoom } from "./rooms/densha.js";
import { nerdOfficeRoom } from "./rooms/nerd_office.js";
import { meganeyaRoom } from "./rooms/meganeya.js";
import { taiikukanRoom } from "./rooms/taiikukan.js";
import { kyougijouRoom } from "./rooms/kyougijou.js";
import { karaokeBoxRoom } from "./rooms/karaoke_box.js";

export function coordRange(from: Coordinates, to: Coordinates): Coordinates[]
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
    bar: barRoom,
    admin_st: adminStRoom,
    basement: basementRoom,
    admin: adminRoom,
    admin_old: adminOldroom,
    radio_backstage: radioBackstageRoom,
    school_st: schoolStRoom,
    bar_st: barStRoom,
    takadai: takadaiRoom,
    silo: siloRoom,
    badend: badendRoom,
    yoshinoya: yoshinoyaRoom,
    long_st: longStRoom,
    bar_giko: barGikoRoom,
    jinja: jinjaRoom,
    busstop: busStopRoom,
    izakaya774: izakaya774Room,
    bar_giko_square: barGikoSquareRoom,
    bar_giko2: barGiko2Room,
    radio_room1: radioRoom1,
    radio_room2: radioRoom2,
    radio_room3: radioRoom3,
    radio: radioRoom,
    radio_gakuya: radioGakuyaRoom,
    jinja_st: jinjaStRoom,
    enkai: enkaiRoom,
    idoA: idoARoom,
    idoB: idoBRoom,
    admin_bar: adminBarRoom,
    bar774: bar774Room,
    yatai: yataiRoom,
    school_rouka: schoolRoukaRoom,
    school: schoolRoom,
    school_international: schoolInternationalRoom,
    school_pc: schoolPcRoom,
    school_ground: schoolGroundRoom,
    kaidan: kaidanRoom,
    seashore: seashoreRoom,
    densha: denshaRoom,
    nerd_office: nerdOfficeRoom,
    meganeya: meganeyaRoom,
    taiikukan: taiikukanRoom,
    kyougijou: kyougijouRoom,
    karaoke_box: karaokeBoxRoom,
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
                stairs: { x: 3, y: 0, direction: "right", target: { roomId: "yane", doorId: "staircase" } },
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
                left_corner: { x: 3, y: 0, direction: "up", target: { roomId: "yane", doorId: "yaneura" } },
                steps_bottom: { x: 4, y: 4, direction: "down", target: { roomId: "yaneura", doorId: "steps_top" } },
                steps_top: { x: 2, y: 6, direction: "left", target: { roomId: "yaneura", doorId: "steps_bottom" } },
            },
            streamSlotCount: 2,
        }
    }
});
dynamicRooms.push({
    roomId: "yojouhan",
    subscribedAnnualEvents: ["noKotatsu", "yesKotatsu"],
    build: (currentAnnualEvents: string[]) =>
    {
        const variant = currentAnnualEvents.includes("noKotatsu") ? "no_kotatsu" : "yes_kotatsu";

        const scale = 0.7
        const room: Room = {
            id: "yojouhan",
            group: "gikopoipoi",
            variant: variant,
            scale: scale,
            backgroundColor: "#000000",
            size: { x: 6, y: 6 },
            originCoordinates: { x: 0, y: 260 },
            spawnPoint: "door",
            backgroundImageUrl: `rooms/yojouhan/background.${variant}.svg`,
            objects: [],
            sit: [],
            blocked: [
                // furniture
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 2 },
                { x: 0, y: 3 },
                { x: 0, y: 4 },
                { x: 0, y: 5 },
                { x: 1, y: 5 },
                { x: 2, y: 5 },
                { x: 3, y: 5 },
                // fan
                { x: 4, y: 5 },
            ],
            forbiddenMovements: [],
            doors: {
                door: { x: 5, y: 5, direction: "down", target: { roomId: "bar_giko_square", doorId: "next_to_light" } },
            },
            streamSlotCount: 2,
        }

        if (variant === "yes_kotatsu")
        {
            room.objects.push({ x: 4, y: 1, scale: 0.7, offset: { x: 190, y: 280 }, url: "kotatsu.svg" })

            // kotatsu
            room.blocked = room.blocked.concat([
                { x: 3, y: 1 },
                { x: 3, y: 2 },
                { x: 4, y: 1 },
                { x: 4, y: 2 },
            ]);

            room.sit = room.sit.concat([
                // around kotatsu
                { x: 5, y: 1 },
                { x: 5, y: 2 },
                { x: 3, y: 0 },
                { x: 4, y: 0 },
                { x: 4, y: 3 },
                { x: 3, y: 3 },
                { x: 2, y: 1 },
                { x: 2, y: 2 },
                { x: 2, y: 3 },
            ])
        }
        else
        {
            room.sit = room.sit.concat([
                // in the middle of the room
                { x: 2, y: 1 },
                { x: 3, y: 1 },
                { x: 4, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 2 },
                { x: 4, y: 2 },
                { x: 2, y: 3 },
                { x: 3, y: 3 },
                { x: 4, y: 3 },
            ])
        }

        return room
    }
});
dynamicRooms.push({
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
});


const currentAnnualEvents = getCurrentAnnualEvents()
dynamicRooms.forEach((dynamicRoom: DynamicRoom) => rooms[dynamicRoom.roomId] = dynamicRoom.build(currentAnnualEvents, currentAnnualEvents, []))

