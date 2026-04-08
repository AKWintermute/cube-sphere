import "./style.css";
import { IsometricCanvas } from "./render.ts";
import { get_sphere, type AllowedStairType, type BlockType } from "./sphere.ts";
import { type BlockShape, type Coords3d } from "./counter.ts";
let canvas = document.querySelector<HTMLCanvasElement>("#canvas");
if (!canvas) {
  throw new Error("Canvas element not found");
}
const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Cannot build context");
}

const slider_diameter = document.getElementById(
  "slider-diameter",
) as HTMLInputElement;
const label_diameter = document.getElementById(
  "label-diameter",
) as HTMLLabelElement;

const slider_cut = document.getElementById("slider-cut") as HTMLInputElement;
const label_cut = document.getElementById("label-cut") as HTMLLabelElement;

var blocks: Array<[BlockShape, Coords3d, BlockType]> = [];
var diameter: number = 13;
var cut: number = 7;

const colorToggle = document.getElementById("color-toggle") as HTMLInputElement;
const defaultColors = [
  "hsl(269.11, 85.65%, 59.02%)",
  "hsl(269.11, 85.64%, 38.24%)",
  "hsl(269.11, 86.32%, 77.06%)",
] as [string, string, string];

const seperateColors = new Map<BlockType, [string, string, string]>([
  ["full", defaultColors],
  [
    "slab",
    [
      "hsl(239.11, 85.65%, 59.02%)",
      "hsl(239.11, 85.64%, 38.24%)",
      "hsl(239.11, 86.32%, 77.06%)",
    ],
  ],
  [
    "stair",
    [
      "hsl(209.11, 85.65%, 59.02%)",
      "hsl(209.11, 85.64%, 38.24%)",
      "hsl(209.11, 86.32%, 77.06%)",
    ],
  ],
]);

const colors = new Map<BlockType, [string, string, string]>([
  ["full", defaultColors],
  ["slab", defaultColors],
  ["stair", defaultColors],
]);

var isometric_canvas: IsometricCanvas = new IsometricCanvas(
  ctx,
  [0, 0, 0],
  [],
  colorToggle.checked ? seperateColors : colors,
);

function read_slider_and_render() {
  if (!canvas) {
    throw new Error("Canvas element not found");
  }
  if (!ctx) {
    throw new Error("Cannot build context");
  }
  isometric_canvas = new IsometricCanvas(
    ctx,
    [diameter * 2, diameter * 2, diameter],
    blocks,
    colorToggle.checked ? seperateColors : colors,
  );
  isometric_canvas.render(cut);
}

slider_diameter.addEventListener("input", () => {
  diameter = parseInt(slider_diameter.value);
  cut = Math.floor(diameter / 2);
  label_cut.textContent = "Cut: " + cut.toString();
  slider_cut.max = cut.toString();
  slider_cut.value = cut.toString();
  label_diameter.textContent = "Diameter: " + diameter.toString();
  blocks = get_sphere(diameter, getSelectedStairType());
  read_slider_and_render();
});

slider_cut.addEventListener("input", () => {
  cut = parseInt(slider_cut.value);
  label_cut.textContent = "Cut: " + cut.toString();
  isometric_canvas.render((cut = cut));
});

window.addEventListener("load", () => {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height - 100;
  read_slider_and_render();
});
window.addEventListener("resize", () => {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height - 100;
  read_slider_and_render();
});

// Select all radio buttons with the name "stair-type"
const radioButtons = document.querySelectorAll<HTMLInputElement>(
  'input[name="stair-type"]',
);

function getSelectedStairType(): AllowedStairType {
  const selected = document.querySelector(
    'input[name="stair-type"]:checked',
  ) as HTMLInputElement;
  return selected ? (selected.value as AllowedStairType) : "straight";
}

radioButtons.forEach((radio) => {
  radio.addEventListener("change", (event) => {
    if (radio.checked) {
      blocks = get_sphere(diameter, radio.value as AllowedStairType);
      read_slider_and_render();
    }
  });
});

colorToggle.addEventListener("input", () => {
  blocks = get_sphere(diameter, getSelectedStairType());
  read_slider_and_render();
});

blocks = get_sphere(diameter, getSelectedStairType());
read_slider_and_render();
