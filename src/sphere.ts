import { type BlockShape, type Coords3d, minecraftBlocks } from "./counter.ts";

export type BlockType = "full" | "stair" | "slab" | "empty";
export type AllowedStairType = "straight" | "corner" | "debug";

type BlockTopView = {
  values: number[][]; // 2x2 matrix
  name: string;
  type: BlockType;
  id: number;
};

const blocks: BlockTopView[] = [
  {
    values: [
      [1, 1],
      [1, 1],
    ],
    name: "Full",
    type: "full",
    id: 0,
  },
  {
    values: [
      [0, 0],
      [0, 0],
    ],
    name: "Empty",
    type: "empty",
    id: -1,
  },
  {
    values: [
      [0.5, 0.5],
      [0.5, 0.5],
    ],
    name: "Slab",
    type: "slab",
    id: 1,
  },
  {
    values: [
      [0.5, 0.5],
      [1, 1],
    ],
    name: "Stair1",
    type: "stair",
    id: 6,
  },
  {
    values: [
      [0.5, 1],
      [0.5, 1],
    ],
    name: "Stair2",
    type: "stair",
    id: 5,
  },
  {
    values: [
      [1, 1],
      [0.5, 0.5],
    ],
    name: "Stair3",
    type: "stair",
    id: 4,
  },
  {
    values: [
      [1, 0.5],
      [1, 0.5],
    ],
    name: "Stair4",
    type: "stair",
    id: 3,
  },
  {
    values: [
      [0.5, 0.5],
      [0.5, 1],
    ],
    name: "OuterCornerStair1",
    type: "stair",
    id: 13,
  },
  {
    values: [
      [0.5, 0.5],
      [1, 0.5],
    ],
    name: "OuterCornerStair2",
    type: "stair",
    id: 14,
  },
  {
    values: [
      [1, 0.5],
      [0.5, 0.5],
    ],
    name: "OuterCornerStair3",
    type: "stair",
    id: 11,
  },
  {
    values: [
      [0.5, 1],
      [0.5, 0.5],
    ],
    name: "OuterCornerStair4",
    type: "stair",
    id: 12,
  },
  {
    values: [
      [0.5, 1],
      [1, 1],
    ],
    name: "InnerCornerStair1",
    type: "stair",
    id: 19,
  },
  {
    values: [
      [1, 1],
      [0.5, 1],
    ],
    name: "InnerCornerStair2",
    type: "stair",
    id: 20,
  },
  {
    values: [
      [1, 1],
      [1, 0.5],
    ],
    name: "InnerCornerStair3",
    type: "stair",
    id: 22, //down
  },
  {
    values: [
      [1, 0.5],
      [1, 1],
    ],
    name: "InnerCornerStair4",
    type: "stair",
    id: 21, // left
  },
];
const blocks_no_corner: BlockTopView[] = blocks.slice(0, 7);

function assignBlock(
  vals: number[][],
  use_corner: boolean,
): { lift: number; selectedId: number; type: BlockType } {
  // Flatten the 2x2 input matrix
  const flatVals = vals.flat().map((v) => v / 2);

  // Compute lift
  const lift = Math.floor(Math.min(...flatVals));

  if (flatVals.filter((x) => x === 0).length >= 2) {
    return {
      lift: 0,
      selectedId: -1,
      type: "empty",
    };
  }

  // Adjust values by subtracting lift
  const adjustedVals = flatVals.map((v) => v - lift);

  let minError = Infinity;
  let selectedId = -1;
  const blocks_to_use = use_corner ? blocks : blocks_no_corner;
  for (const block of blocks_to_use) {
    const blockVals = block.values.flat(); // Flatten block's 2x2 matrix
    let error = 0;

    for (let i = 0; i < 4; i++) {
      const diff = blockVals[i] - adjustedVals[i];
      error += diff * diff;
    }

    if (error < minError) {
      minError = error;
      selectedId = block.id;
    }
  }

  return {
    lift: lift,
    selectedId: selectedId,
    type: blocks.find((b) => b.id === selectedId)?.type || "empty",
  };
}

function get2x2Submatrix(data: number[][], i: number, j: number): number[][] {
  const rowStart = 2 * i;
  const colStart = 2 * j;

  return [
    [data[rowStart][colStart], data[rowStart][colStart + 1]],
    [data[rowStart + 1][colStart], data[rowStart + 1][colStart + 1]],
  ];
}

export function get_sphere(
  radius: number,
  allowedStairType: AllowedStairType,
): Array<[BlockShape, Coords3d, BlockType]> {
  const use_corner =
    allowedStairType === "corner" || allowedStairType === "debug";
  const size = 2 * radius;
  const data: number[][] = [];
  // Generate height data
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      const x = i + 0.5 - radius;
      const y = j + 0.5 - radius;
      const value = Math.sqrt(Math.max(radius * radius - (x * x + y * y), 0));
      row.push(value);
    }
    data.push(row);
  }
  var blocks_output: Map<string, [BlockShape, Coords3d, BlockType]> = new Map();
  for (let i = 0; i < radius; i++) {
    for (let j = 0; j < radius; j++) {
      const { lift, selectedId, type } = assignBlock(
        get2x2Submatrix(data, i, j),
        use_corner,
      );
      for (let k = 0; k < lift; k++) {
        blocks_output.set(`${i}, ${j}, ${k}`, [
          minecraftBlocks[0],
          [i, j, k],
          "full",
        ]);
      }
      if (selectedId >= 0) {
        blocks_output.set(`${i}, ${j}, ${lift}`, [
          minecraftBlocks[selectedId],
          [i, j, lift],
          type,
        ]);
      }
    }
  }

  if (use_corner && allowedStairType !== "debug") {
    for (const block of blocks_output.values()) {
      if (block[2] === "stair") {
        const pos = block[1];
        if (
          blocks_output.get(`${pos[0] - 1}, ${pos[1]}, ${pos[2]}`)?.[2] ===
            "stair" ||
          blocks_output.get(`${pos[0]}, ${pos[1] - 1}, ${pos[2]}`)?.[2] ===
            "stair" ||
          blocks_output.get(`${pos[0] + 1}, ${pos[1]}, ${pos[2]}`)?.[2] ===
            "stair" ||
          blocks_output.get(`${pos[0]}, ${pos[1] + 1}, ${pos[2]}`)?.[2] ===
            "stair"
        ) {
          continue;
        }

        const { lift, selectedId, type } = assignBlock(
          get2x2Submatrix(data, pos[0], pos[1]),
          false,
        );
        if (selectedId >= 0) {
          blocks_output.set(`${pos[0]}, ${pos[1]}, ${lift}`, [
            minecraftBlocks[selectedId],
            [pos[0], pos[1], lift],
            type,
          ]);
        }
      }
    }
  }

  return [...blocks_output.values()];
}
