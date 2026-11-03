// Listening radius: each listener has their own earshot, clamped so it can be
// neither set to nothing nor widened until the mesh collapses.
const {
  clampListeningRadius,
  leaveRadiusFor,
  MIN_LISTENING_RADIUS,
  MAX_LISTENING_RADIUS,
  DEFAULT_PROXIMITY_RADIUS,
} = require("../lib/proximity");

let failures = 0;

function check(label, condition) {
  if (condition) {
    console.log(`ok   - ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL - ${label}`);
  }
}

check(
  "the default is unchanged when nothing is set",
  clampListeningRadius(undefined) === DEFAULT_PROXIMITY_RADIUS
);

check(
  "a valid radius is kept",
  clampListeningRadius(150) === 150
);

check(
  "values are rounded",
  clampListeningRadius(123.6) === 124
);

check(
  "below the floor clamps up",
  clampListeningRadius(10) === MIN_LISTENING_RADIUS
);

check(
  "above the ceiling clamps down",
  clampListeningRadius(5000) === MAX_LISTENING_RADIUS
);

check(
  "a numeric string is accepted",
  clampListeningRadius("120") === 120
);

check(
  "nonsense falls back to the default",
  clampListeningRadius("wide") === DEFAULT_PROXIMITY_RADIUS &&
    clampListeningRadius(null) === DEFAULT_PROXIMITY_RADIUS &&
    clampListeningRadius(NaN) === DEFAULT_PROXIMITY_RADIUS
);

check(
  "a custom fallback is respected",
  clampListeningRadius("wide", 0) === 0
);

// --- hysteresis ---------------------------------------------------------

check(
  "the leave radius at the default is 115, exactly as before",
  leaveRadiusFor(DEFAULT_PROXIMITY_RADIUS) === 115
);

check(
  "the leave radius stays wider than the enter radius at the floor",
  leaveRadiusFor(MIN_LISTENING_RADIUS) > MIN_LISTENING_RADIUS
);

check(
  "the leave radius stays wider at the ceiling",
  leaveRadiusFor(MAX_LISTENING_RADIUS) > MAX_LISTENING_RADIUS
);

check(
  "the hysteresis gap scales with the radius",
  leaveRadiusFor(200) > leaveRadiusFor(100) &&
    leaveRadiusFor(100) > leaveRadiusFor(50)
);

check(
  "leaveRadiusFor clamps its input too",
  leaveRadiusFor(99999) === leaveRadiusFor(MAX_LISTENING_RADIUS)
);

console.log(
  failures === 0
    ? "All listening radius tests passed"
    : `${failures} listening radius test(s) failed`
);
process.exitCode = failures === 0 ? 0 : 1;
