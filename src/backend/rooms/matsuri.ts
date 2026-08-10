import { coordRange } from "../rooms";
import { Coordinates, DynamicRoom } from "../types";

export const matsuriRoom: DynamicRoom = {
  roomId: "matsuri",
  subscribedAnnualEvents: [],
  build: (currentAnnualEvents: string[]) => {
    const scale = 0.7;

    const variation = "day" as "day" | "night";

    return {
      id: "matsuri",
      group: "gikopoipoi",
      scale: scale,
      size: { x: 18, y: 5 },
      originCoordinates: { x: -159, y: 181 },
      spawnPoint: "spawn",
      backgroundImageUrl: `rooms/matsuri/background_${variation}.svg`,
      objects: [
        {
          x: 100,
          y: 0,
          scale: scale,
          offset: { x: 0, y: 0 },
          url: `chouchin_${variation}.svg`,
        },
        {
          x: 0,
          y: 0,
          scale: scale,
          offset: variation == "day" ? { x: 0, y: 0 } : { x: 386, y: 47 },
          url: `yatai_${variation}.svg`,
        },
      ],
      doors: {
        spawn: {
          x: 0,
          y: 0,
          direction: "down",
          target: { roomId: "matsuri", doorId: "spawn" },
        },
      },
      sit: [],
      blocked: (
        [
          // outside of the map
        ] as Coordinates[]
      )
      .concat(coordRange({ x: 0, y: 0 }, { x: 0, y: 3 }))
      .concat(coordRange({ x: 1, y: 0 }, { x: 1, y: 2 }))
      .concat(coordRange({ x: 2, y: 0 }, { x: 2, y: 1 }))
      ,
      forbiddenMovements: [],
      streamSlotCount: 2,
    };
  },
};
