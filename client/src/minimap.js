// The office minimap: a small canvas showing the room zones and where everyone is.
//
// The scale maths is separated out because it is the only part worth testing —
// getting the offset wrong puts players outside the box, which looks like a
// rendering bug but is arithmetic.

export const MINIMAP_WIDTH = 180;
export const MINIMAP_HEIGHT = 108;

// Fit the world into the box without distorting it, then centre the result.
export function minimapTransform(worldWidth, worldHeight, width, height) {
  if (
    !Number.isFinite(worldWidth) ||
    !Number.isFinite(worldHeight) ||
    worldWidth <= 0 ||
    worldHeight <= 0 ||
    width <= 0 ||
    height <= 0
  ) {
    return { scale: 0, offsetX: 0, offsetY: 0 };
  }

  const scale = Math.min(width / worldWidth, height / worldHeight);
  return {
    scale,
    offsetX: (width - worldWidth * scale) / 2,
    offsetY: (height - worldHeight * scale) / 2,
  };
}

export function toMinimap(x, y, worldWidth, worldHeight, width, height) {
  const { scale, offsetX, offsetY } = minimapTransform(
    worldWidth,
    worldHeight,
    width,
    height
  );

  return {
    x: offsetX + (Number.isFinite(x) ? x : 0) * scale,
    y: offsetY + (Number.isFinite(y) ? y : 0) * scale,
  };
}

export function drawMinimap(
  ctx,
  { zones, players, selfId, worldWidth, worldHeight, width, height }
) {
  if (!ctx) return;

  const { scale, offsetX, offsetY } = minimapTransform(
    worldWidth,
    worldHeight,
    width,
    height
  );
  if (!scale) return;

  ctx.clearRect(0, 0, width, height);

  // The floor.
  ctx.fillStyle = "#0f1622";
  ctx.fillRect(offsetX, offsetY, worldWidth * scale, worldHeight * scale);

  // Each zone as a tinted block, so the map reads like a floor plan.
  for (const zone of zones || []) {
    ctx.fillStyle = zone.tint || "#16263c";
    ctx.fillRect(
      offsetX + zone.x * scale,
      offsetY + zone.y * scale,
      zone.w * scale,
      zone.h * scale
    );
    ctx.strokeStyle = zone.accent || "#38bdf8";
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.strokeRect(
      offsetX + zone.x * scale + 0.5,
      offsetY + zone.y * scale + 0.5,
      zone.w * scale - 1,
      zone.h * scale - 1
    );
    ctx.globalAlpha = 1;
  }

  // Players, self last so it is never hidden behind someone else.
  const ordered = Array.from(players || []).sort((a, b) =>
    a.id === selfId ? 1 : b.id === selfId ? -1 : 0
  );

  for (const player of ordered) {
    if (!Number.isFinite(player.x) || !Number.isFinite(player.y)) continue;

    const isMe = player.id === selfId;
    ctx.beginPath();
    ctx.arc(
      offsetX + player.x * scale,
      offsetY + player.y * scale,
      isMe ? 4 : 3,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = isMe ? "#f8fafc" : player.avatarColor || "#6ee7b7";
    ctx.fill();
    ctx.strokeStyle = isMe ? "#38bdf8" : "rgba(15, 23, 42, 0.8)";
    ctx.lineWidth = isMe ? 2 : 1;
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  // A hairline border to sit the map on the panel.
  ctx.strokeStyle = "#1e293b";
  ctx.strokeRect(
    offsetX + 0.5,
    offsetY + 0.5,
    worldWidth * scale - 1,
    worldHeight * scale - 1
  );
}
