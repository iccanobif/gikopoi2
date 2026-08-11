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
import { cafeStRoom } from "./rooms/cafe_st.js";
import { konbiniRoom } from "./rooms/konbini.js";
import { iroriRoom } from "./rooms/irori.js";
import { riverRoom } from "./rooms/river.js";
import { monachatRoom } from "./rooms/monachat.js";
import { yaneuraRoom } from "./rooms/yaneura.js";
import { yojouhanRoom } from "./rooms/yojouhan.js";
import { yaneRoom } from "./rooms/yane.js";
import { matsuriRoom } from "./rooms/matsuri.js";

export function coordRange(from: Coordinates, to: Coordinates): Coordinates[] {
  const coords = [];
  for (let x = from.x; x < to.x + 1; x += from.x <= to.x ? 1 : -1) {
    for (let y = from.y; y < to.y + 1; y += from.y <= to.y ? 1 : -1) {
      coords.push({ x, y });
    }
  }
  return coords;
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

export const dynamicRooms: DynamicRoom[] = [
  cafeStRoom,
  konbiniRoom,
  iroriRoom,
  riverRoom,
  monachatRoom,
  yaneuraRoom,
  yojouhanRoom,
  yaneRoom,
  matsuriRoom,
];

const currentAnnualEvents = getCurrentAnnualEvents();
dynamicRooms.forEach(
  (dynamicRoom: DynamicRoom) =>
    (rooms[dynamicRoom.roomId] = dynamicRoom.build(
      currentAnnualEvents,
      currentAnnualEvents,
      [],
    )),
);
