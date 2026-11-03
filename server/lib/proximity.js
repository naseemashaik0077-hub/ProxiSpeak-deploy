const DEFAULT_PROXIMITY_RADIUS = 100;
const PROXIMITY_RADIUS = DEFAULT_PROXIMITY_RADIUS;

// A listener can widen or narrow their earshot, within limits. The ceiling exists
// because a huge radius means a huge mesh; the floor so it cannot be set to nothing.
const MIN_LISTENING_RADIUS = 50;
const MAX_LISTENING_RADIUS = 200;
const LEAVE_RADIUS_FACTOR = 1.15;

function clampListeningRadius(value, fallback = DEFAULT_PROXIMITY_RADIUS) {
  // null, undefined and "" mean "not set" — Number(null) is 0, which would
  // otherwise clamp an unset radius to the floor instead of the default.
  if (value === null || value === undefined || value === "") return fallback;

  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(
    MAX_LISTENING_RADIUS,
    Math.max(MIN_LISTENING_RADIUS, Math.round(numeric))
  );
}

// Hysteresis scales with the radius, so the gap between connect and disconnect
// stays proportional instead of vanishing at the floor or ballooning at the ceiling.
function leaveRadiusFor(radius) {
  return Math.round(clampListeningRadius(radius) * LEAVE_RADIUS_FACTOR);
}

function getDistance(playerA, playerB) {
  return Math.hypot(playerA.x - playerB.x, playerA.y - playerB.y);
}

function getNearbyPlayers(players, targetPlayer, radius = DEFAULT_PROXIMITY_RADIUS) {
  if (!Array.isArray(players)) {
    if (targetPlayer instanceof Map) {
      const currentPlayer = players;
      players = Array.from(targetPlayer.values());
      targetPlayer = currentPlayer;
    } else {
      throw new TypeError("players must be an array or a legacy player map");
    }
  }

  return players
    .filter((player) => player.id !== targetPlayer.id)
    .map((player) => ({
      ...player,
      distance: getDistance(player, targetPlayer),
    }))
    .filter((player) => player.distance <= radius)
    .map((player) => ({
      ...player,
      distance: Number(player.distance.toFixed(2)),
    }));
}

module.exports = {
  getDistance,
  getNearbyPlayers,
  clampListeningRadius,
  leaveRadiusFor,
  MIN_LISTENING_RADIUS,
  MAX_LISTENING_RADIUS,
  LEAVE_RADIUS_FACTOR,
  DEFAULT_PROXIMITY_RADIUS,
  PROXIMITY_RADIUS,
};
