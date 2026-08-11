import { coordRange } from "../rooms.js";
import { Coordinates, DynamicRoom } from "../types.js";

export const matsuriRoom: DynamicRoom = {
  roomId: "matsuri",
  subscribedAnnualEvents: ["matsuriNight", "matsuriDay"],
  build: (currentAnnualEvents: string[]) => {
    const scale = 0.7;

    const variation = currentAnnualEvents.includes("matsuriNight") ? "night" : "day";

    return {
      id: "matsuri",
      group: "gikopoipoi",
      scale: scale,
      backgroundColor: variation == "night" ? "#000000" : undefined,
      size: { x: 18, y: 7 },
      originCoordinates: { x: -159, y: 181 },
      spawnPoint: "spawn",
      objectRenderSortMethod: "diagonal_scan",
      backgroundImageUrl: `rooms/matsuri/background_${variation}.svg`,
      objects: [
        {
          x: 18,
          y: 0,
          scale: scale,
          offset: { x: 0, y: 0 },
          url: `chouchin_${variation}.svg`,
        },
        {
          x: 5,
          y: 5,
          scale: scale,
          offset: variation == "day" ? { x: 0, y: 0 } : { x: 386, y: 47 },
          width: 13,
          heigth: 1,
          url: `yatai_${variation}.svg`,
        },
        { x: 0, y: 0, offset: { x: 540, y: 485 }, url: `../arrow-down.svg` },
      ],
      doors: {
        spawn: {
          x: 17,
          y: 0,
          direction: "up",
          target: { roomId: "jinja", doorId: "toMatsuri" },
        },
        behindYatai: {
          x: 6,
          y: 6,
          direction: "right",
          target: { roomId: "matsuri", doorId: "inFrontOfYatai" },
        },
        inFrontOfYatai: {
          x: 6,
          y: 4,
          direction: "down",
          target: { roomId: "matsuri", doorId: "behindYatai" },
        },
      },
      sit: [],
      blocked: ([
        // left portion of the map
        { x: 3, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 2}, { x: 0, y: 3 }
      ] as Coordinates[])
      // shooting game
      .concat(coordRange({ x: 0, y: 6 }, { x: 5, y: 6 }))
      // yatais
      .concat(coordRange({ x: 0, y: 5 }, { x: 17, y: 5 }))
      ,
      forbiddenMovements: [],
      streamSlotCount: 2,
    };
  },
};
