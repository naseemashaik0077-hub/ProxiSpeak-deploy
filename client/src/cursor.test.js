import { test } from "node:test";
import assert from "node:assert/strict";
import { pointerToWorld, clampToWorld, stepToward } from "./cursor.js";

const W = 1000;
const H = 600;

test("a click maps 1:1 when the canvas is shown at world size", () => {
  const rect = { left: 0, top: 0, width: W, height: H };
  assert.deepEqual(pointerToWorld(250, 150, rect, W, H), { x: 250, y: 150 });
});

test("a click is scaled when the canvas is displayed smaller", () => {
  // Half size, so a click at 250 screen pixels is 500 world pixels.
  const rect = { left: 0, top: 0, width: W / 2, height: H / 2 };
  assert.deepEqual(pointerToWorld(250, 150, rect, W, H), { x: 500, y: 300 });
});

test("the element's offset is subtracted before scaling", () => {
  const rect = { left: 100, top: 50, width: W / 2, height: H / 2 };
  // 100px right of the element's left edge, at half scale, is 200 world pixels.
  assert.deepEqual(pointerToWorld(200, 100, rect, W, H), { x: 200, y: 100 });
});

test("the bottom-right corner maps to the world corner", () => {
  const rect = { left: 10, top: 20, width: 500, height: 300 };
  assert.deepEqual(pointerToWorld(510, 320, rect, W, H), { x: 1000, y: 600 });
});

test("a zero-size rect is refused rather than producing Infinity", () => {
  assert.equal(pointerToWorld(10, 10, { left: 0, top: 0, width: 0, height: 0 }, W, H), null);
});

test("non-finite input is refused", () => {
  const rect = { left: 0, top: 0, width: 500, height: 300 };
  assert.equal(pointerToWorld(NaN, 10, rect, W, H), null);
  assert.equal(pointerToWorld(10, 10, null, W, H), null);
});

test("a destination is clamped inside the world", () => {
  assert.deepEqual(clampToWorld({ x: -50, y: 700 }, 20, W, H), { x: 20, y: 580 });
});

test("a destination inside the world is untouched", () => {
  assert.deepEqual(clampToWorld({ x: 300, y: 200 }, 20, W, H), { x: 300, y: 200 });
});

test("clamping rejects nonsense", () => {
  assert.equal(clampToWorld({ x: NaN, y: 0 }, 20, W, H), null);
  assert.equal(clampToWorld(null, 20, W, H), null);
});

test("a step is a unit direction toward the target", () => {
  const step = stepToward({ x: 0, y: 0 }, { x: 100, y: 0 }, 240, 0.1);
  assert.equal(step.dx, 1);
  assert.equal(step.dy, 0);
  assert.equal(step.travel, 24);
});

test("a step never overshoots a nearby target", () => {
  // 5 pixels away but a full step would be 24, so it must travel only 5.
  const step = stepToward({ x: 0, y: 0 }, { x: 5, y: 0 }, 240, 0.1);
  assert.equal(step.travel, 5);
});

test("a zero-length step is refused instead of dividing by zero", () => {
  assert.equal(stepToward({ x: 10, y: 10 }, { x: 10, y: 10 }, 240, 0.1), null);
});

test("a diagonal direction is normalised", () => {
  const step = stepToward({ x: 0, y: 0 }, { x: 100, y: 100 }, 240, 0.1);
  assert.ok(Math.abs(Math.hypot(step.dx, step.dy) - 1) < 1e-9);
});
