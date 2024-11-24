// orbitConfigs.ts
import { OrbitConfig } from "./types";

export const standardOrbitConfig: OrbitConfig = {
  name: "Standard (Both Counter-Clockwise)",
  size: 4,
  paths: [
    // Outer orbit (counterclockwise)
    { position: [0, 0], nextPosition: [1, 0] }, // top-left corner
    { position: [0, 1], nextPosition: [0, 0] }, // top edge
    { position: [0, 2], nextPosition: [0, 1] }, // top edge
    { position: [0, 3], nextPosition: [0, 2] }, // top-right corner
    { position: [1, 0], nextPosition: [2, 0] }, // left edge
    { position: [1, 3], nextPosition: [0, 3] }, // right edge
    { position: [2, 0], nextPosition: [3, 0] }, // left edge
    { position: [2, 3], nextPosition: [1, 3] }, // right edge
    { position: [3, 0], nextPosition: [3, 1] }, // bottom-left corner
    { position: [3, 1], nextPosition: [3, 2] }, // bottom edge
    { position: [3, 2], nextPosition: [3, 3] }, // bottom edge
    { position: [3, 3], nextPosition: [2, 3] }, // bottom-right corner

    // Inner orbit (counterclockwise)
    { position: [1, 1], nextPosition: [2, 1] }, // top-left
    { position: [1, 2], nextPosition: [1, 1] }, // top-right
    { position: [2, 2], nextPosition: [1, 2] }, // bottom-right
    { position: [2, 1], nextPosition: [2, 2] }, // bottom-left
  ],
};

export const mixedOrbitConfig: OrbitConfig = {
  name: "Mixed (Outer CCW, Inner CW)",
  size: 4,
  paths: [
    // Outer orbit (counterclockwise)
    { position: [0, 0], nextPosition: [1, 0] },
    { position: [0, 1], nextPosition: [0, 0] },
    { position: [0, 2], nextPosition: [0, 1] },
    { position: [0, 3], nextPosition: [0, 2] },
    { position: [1, 0], nextPosition: [2, 0] },
    { position: [1, 3], nextPosition: [0, 3] },
    { position: [2, 0], nextPosition: [3, 0] },
    { position: [2, 3], nextPosition: [1, 3] },
    { position: [3, 0], nextPosition: [3, 1] },
    { position: [3, 1], nextPosition: [3, 2] },
    { position: [3, 2], nextPosition: [3, 3] },
    { position: [3, 3], nextPosition: [2, 3] },

    // Inner orbit (clockwise)
    { position: [1, 1], nextPosition: [1, 2] },
    { position: [1, 2], nextPosition: [2, 2] },
    { position: [2, 2], nextPosition: [2, 1] },
    { position: [2, 1], nextPosition: [1, 1] },
  ],
};

export const pacmanConfig: OrbitConfig = {
  name: "Pacman",
  size: 4,
  paths: [
    // Outer orbit (counterclockwise)
    { position: [0, 0], nextPosition: [1, 0] },
    { position: [0, 1], nextPosition: [0, 0] },
    { position: [0, 2], nextPosition: [0, 1] },
    { position: [0, 3], nextPosition: [0, 2] },
    { position: [1, 0], nextPosition: [2, 0] },
    { position: [1, 3], nextPosition: [0, 3] },
    { position: [2, 0], nextPosition: [3, 0] },
    { position: [2, 3], nextPosition: [2, 2] },
    { position: [3, 0], nextPosition: [3, 1] },
    { position: [3, 1], nextPosition: [3, 2] },
    { position: [3, 2], nextPosition: [3, 3] },
    { position: [3, 3], nextPosition: [2, 3] },

    // Inner orbit (clockwise)
    { position: [1, 1], nextPosition: [1, 2] },
    { position: [1, 2], nextPosition: [1, 3] },
    { position: [2, 2], nextPosition: [2, 1] },
    { position: [2, 1], nextPosition: [1, 1] },
  ],
};

export const availableConfigs = [
  standardOrbitConfig,
  mixedOrbitConfig,
  pacmanConfig,
];
