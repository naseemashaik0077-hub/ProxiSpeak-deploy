import { test } from "node:test";
import assert from "node:assert/strict";
import {
  minimapTransform,
  toMinimap,
  MINIMAP_WIDTH,
  MINIMAP_HEIGHT,
} from "./minimap.js";

const W = 1000;
const H = 600;

test("the world fits inside the minimap box", () => {
  const { scale, offsetX, offsetY } = minimapTransform(
    W,
    H,
    MINIMAP_WIDTH,
    MINIMAP_HEIGHT
  );
  assert.ok(offsetX >= 0, "left edge inside the box");
  assert.ok(offsetY >= 0, "top edge inside the box");
  assert.ok(offsetX + W * scale <= MINIMAP_WIDTH + 0.001);
  assert.ok(offsetY + H * scale <= MINIMAP_HEIGHT + 0.001);
});

test("the aspect ratio is preserved", () => {
  const { scale } = minimapTransform(W, H, MINIMAP_WIDTH, MINIMAP_HEIGHT);
  const drawnAspect = (W * scale) / (H * scale);
  assert.ok(Math.abs(drawnAspect - W / H) < 0.0001);
});

test("the world is centred in whichever axis has slack", () => {
  const { scale, offsetX, offsetY } = minimapTransform(
    W,
    H,
    MINIMAP_WIDTH,
    MINIMAP_HEIGHT
  );
  const slackX = MINIMAP_WIDTH - W * scale;
  const slackY = MINIMAP_HEIGHT - H * scale;
  assert.ok(Math.abs(offsetX - slackX / 2) < 0.001);
  assert.ok(Math.abs(offsetY - slackY / 2) < 0.001);
});

test("the world origin maps to the top-left offset", () => {
  const { offsetX, offsetY } = minimapTransform(
    W,
    H,
    MINIMAP_WIDTH,
    MINIMAP_HEIGHT
  );
  const point = toMinimap(0, 0, W, H, MINIMAP_WIDTH, MINIMAP_HEIGHT);
  assert.ok(Math.abs(point.x - offsetX) < 0.001);
  assert.ok(Math.abs(point.y - offsetY) < 0.001);
});

test("the far corner maps inside the box", () => {
  const point = toMinimap(W, H, W, H, MINIMAP_WIDTH, MINIMAP_HEIGHT);
  assert.ok(point.x <= MINIMAP_WIDTH + 0.001);
  assert.ok(point.y <= MINIMAP_HEIGHT + 0.001);
});

test("a player in the middle maps to the middle", () => {
  const point = toMinimap(W / 2, H / 2, W, H, MINIMAP_WIDTH, MINIMAP_HEIGHT);
  assert.ok(Math.abs(point.x - MINIMAP_WIDTH / 2) < 0.001);
  assert.ok(Math.abs(point.y - MINIMAP_HEIGHT / 2) < 0.001);
});

test("a non-finite position falls back to the origin rather than NaN", () => {
  const point = toMinimap(NaN, undefined, W, H, MINIMAP_WIDTH, MINIMAP_HEIGHT);
  assert.ok(Number.isFinite(point.x));
  assert.ok(Number.isFinite(point.y));
});

test("a degenerate world yields no transform", () => {
  assert.equal(minimapTransform(0, 600, 180, 108).scale, 0);
  assert.equal(minimapTransform(1000, 600, 0, 108).scale, 0);
});
