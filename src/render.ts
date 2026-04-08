import {
  sqrt3_2,
  RenderIsometricBlock,
  type BlockShape,
  type Coords3d,
} from "./counter.ts";
import { type BlockType } from "./sphere.ts";

export class IsometricCanvas {
  context: CanvasRenderingContext2D;
  size: [number, number, number];
  ratio: number;
  origin: [number, number];
  blocks: [BlockShape, Coords3d, BlockType][];
  colors: Map<BlockType, [string, string, string]>;
  constructor(
    context: CanvasRenderingContext2D,
    size: [number, number, number],
    blocks: [BlockShape, Coords3d, BlockType][],
    colors: Map<BlockType, [string, string, string]>,
  ) {
    this.context = context;
    this.size = size;
    let height: number = size[2] + (size[0] + size[1]) * 0.5;
    let width: number = (size[0] + size[1]) * sqrt3_2;
    this.ratio =
      2 *
      Math.min(
        this.context.canvas.clientHeight / height,
        this.context.canvas.clientWidth / width,
      );

    this.origin = [
      this.context.canvas.clientWidth / 2,
      this.context.canvas.clientHeight / 4,
    ];
    this.blocks = blocks;
    this.colors = colors;
    blocks.sort(
      (a, b) => a[1][0] + a[1][1] + a[1][2] - b[1][0] - b[1][1] - b[1][2],
    );
  }
  _render_block(
    block_shape: BlockShape,
    block_position: Coords3d,
    block_type: BlockType,
  ) {
    const paths = RenderIsometricBlock(block_shape);
    const count = paths.length;
    for (const path of paths) {
      this.context.beginPath();
      const offset = [
        this.origin[0] +
          (block_position[0] - block_position[1]) * sqrt3_2 * this.ratio,
        this.origin[1] +
          (-2 * block_position[2] + block_position[0] + block_position[1]) *
            0.5 *
            this.ratio,
      ];
      this.context.moveTo(
        path.contour[0][0] * this.ratio + offset[0],
        path.contour[0][1] * this.ratio + offset[1],
      );
      for (let i = 1; i < path.contour.length; i++) {
        this.context.lineTo(
          path.contour[i][0] * this.ratio + offset[0],
          path.contour[i][1] * this.ratio + offset[1],
        );
      }
      this.context.fillStyle =
        this.colors.get(block_type)?.[path.axis] || "#FFFFFF";
      this.context.fill();
      this.context.closePath();
      this.context.stroke();
    }
  }
  _renderGrid(zPosition = 0) {
    const strokeStyle = "#ccc";
    for (let x = 0; x <= this.size[0] / 2; x += 1) {
      const block_position: Coords3d = [x, 0, zPosition];
      const offset = [
        this.origin[0] +
          (block_position[0] - block_position[1]) * sqrt3_2 * this.ratio,
        this.origin[1] +
          (-2 * block_position[2] + block_position[0] + block_position[1]) *
            0.5 *
            this.ratio,
      ];

      const offset2 = [
        this.origin[0] +
          (block_position[0] - this.size[1] / 2) * sqrt3_2 * this.ratio,
        this.origin[1] +
          (-2 * block_position[2] + block_position[0] + this.size[1] / 2) *
            0.5 *
            this.ratio,
      ];
      this.context.beginPath();
      this.context.strokeStyle = strokeStyle;
      this.context.moveTo(offset[0], offset[1]);
      this.context.lineTo(offset2[0], offset2[1]);
      this.context.stroke();
    }

    for (let y = 0; y <= this.size[1] / 2; y += 1) {
      const block_position: Coords3d = [0, y, zPosition];
      const offset = [
        this.origin[0] +
          (block_position[0] - block_position[1]) * sqrt3_2 * this.ratio,
        this.origin[1] +
          (-2 * block_position[2] + block_position[0] + block_position[1]) *
            0.5 *
            this.ratio,
      ];

      const offset2 = [
        this.origin[0] +
          (this.size[0] / 2 - block_position[1]) * sqrt3_2 * this.ratio,
        this.origin[1] +
          (-2 * block_position[2] + this.size[0] / 2 + block_position[1]) *
            0.5 *
            this.ratio,
      ];
      this.context.beginPath();
      this.context.strokeStyle = strokeStyle;
      this.context.moveTo(offset[0], offset[1]);
      this.context.lineTo(offset2[0], offset2[1]);
      this.context.stroke();
    }
  }
  render(cut: number) {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.clientWidth,
      this.context.canvas.clientHeight,
    );
    this._renderGrid();
    this.context.strokeStyle = "#000";
    for (const block of this.blocks) {
      if (block[1][2] < cut) {
        this._render_block(block[0], block[1], block[2]);
      }
    }
  }
}
