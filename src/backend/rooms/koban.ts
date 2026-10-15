import { coordRange } from "../rooms.js";
import { Coordinates, Room } from "../types.js";

const scale = 0.695;

export const kobanRoom: Room = {
  id: "koban",
  group: "bar_giko",
  scale,
  size: { x: 6, y: 5 },
  originCoordinates: { x: 0, y: 219 },
  spawnPoint: "door",
  backgroundImageUrl: "rooms/koban/background.svg",
  objects: [
    { x: 6, y: 0, offset: { x: 0, y: 0 }, url: "backrests.svg", scale },
    {
      x: 2,
      y: 1,
      width: 4,
      offset: { x: 146, y: 183 },
      url: "counter.svg",
      scale: 0.9,
    },
    // arrow right
    { x: 0, y: 0, offset: { x: 291, y: 243 }, url: "../arrow-right.svg" },
  ],
  objectRenderSortMethod: "diagonal_scan",
  sit: [
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 3 },
    { x: 5, y: 4 },
  ],
  blocked: ([] as Coordinates[])
    .concat(coordRange({ x: 0, y: 4 }, { x: 4, y: 4 })) // Counter
    .concat(coordRange({ x: 2, y: 1 }, { x: 5, y: 1 })), // Desk and furniture,
  forbiddenMovements: [
    { xFrom: 4, yFrom: 3, xTo: 3, yTo: 3 },
  ],
  doors: {
    door: {
      x: 5,
      y: 2,
      direction: "left",
      target: { roomId: "bar_giko_square", doorId: "koban" },
    },
  },
  streamSlotCount: 1,
};
