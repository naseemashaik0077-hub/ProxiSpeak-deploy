// Mapping a pointer position to world coordinates.
//
// The canvas is drawn at world size (1000x600) and displayed at whatever size the
// layout gives it, so a click must be scaled through the element's bounding rect.
// Getting this wrong is invisible until someone clicks and their avatar walks
// somewhere they did not point at, which is why it lives here with tests.

export function pointerToWorld(clientX, clientY, rect, worldWidth, worldHeight) {
  if (
    !rect ||
    !Number.isFinite(rect.left) ||
    !Number.isFinite(rect.top) ||
    !(rect.width > 0) ||
    !(rect.height > 0) ||
    !(worldWidth > 0) ||
    !(worldHeight > 0) ||
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY)
  ) {
    return null;
  }

  return {
    x: ((clientX - rect.left) / rect.width) * worldWidth,
    y: ((clientY - rect.top) / rect.height) * worldHeight,
  };
}

// Keep a destination inside the world, allowing for the avatar's own radius so it
// does not try to walk into the wall.
export function clampToWorld(point, radius, worldWidth, worldHeight) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    return null;
  }

  return {
    x: Math.max(radius, Math.min(worldWidth - radius, point.x)),
    y: Math.max(radius, Math.min(worldHeight - radius, point.y)),
  };
}

// One step toward a destination: unit direction plus how far to travel, capped so
// the avatar never overshoots and has to correct back.
export function stepToward(from, to, speed, deltaSeconds) {
  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const remaining = Math.hypot(dx, dy);
  if (!Number.isFinite(remaining) || remaining === 0) return null;

  const travel = Math.min(Math.max(speed * deltaSeconds, 0), remaining);

  return {
    dx: dx / remaining,
    dy: dy / remaining,
    remaining,
    travel,
  };
}
