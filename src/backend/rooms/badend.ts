import { Room } from "../types";

export const badendRoom: Room = {
  id: "badend",
  group: "gikopoipoi",
  scale: 0.59,
  size: { x: 50, y: 50 },
  originCoordinates: { x: 0, y: 0 },
  spawnPoint: "spawn",
  backgroundImageUrl: "rooms/badend/badend.jpg",
  backgroundColor: "#000000",
  backgroundOffset: { x: 0, y: -320 },
  needsFixedCamera: true,
  objects: [],
  sit: [],
  blocked: [],
  forbiddenMovements: [],
  doors: {
    spawn: { x: 6, y: 7, direction: "left", target: null },
    rip: { x: -100, y: -100, direction: "left", target: null },
  },
  streamSlotCount: 0,
  secret: true,
};
