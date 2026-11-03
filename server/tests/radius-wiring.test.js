// Wiring checks for the listening radius.
//
// index.js starts a server on import and needs MongoDB, so its socket handlers
// cannot be driven from a test here. This reads the source instead and asserts the
// things that actually broke before: a handler that exists but does not clamp, a
// resync that never happens, an echo that reports the wrong value.
//
// Static checks are weak — they cannot prove behaviour — but they catch omission,
// which is the failure mode this project has actually had.
const fs = require("fs");
const path = require("path");

const SERVER = path.join(__dirname, "..");
const indexSource = fs.readFileSync(path.join(SERVER, "index.js"), "utf8");
const appSource = fs.readFileSync(
  path.join(SERVER, "..", "client", "src", "App.jsx"),
  "utf8"
);
const proximitySource = fs.readFileSync(
  path.join(SERVER, "lib", "proximity.js"),
  "utf8"
);

let failures = 0;

function check(label, condition) {
  if (condition) {
    console.log(`ok   - ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL - ${label}`);
  }
}

// --- the server handler ------------------------------------------------

const handlerMatch = indexSource.match(
  /socket\.on\("player:setRadius",([\s\S]*?)\n  \}\);/
);

check("the server handles player:setRadius", Boolean(handlerMatch));

const handler = handlerMatch ? handlerMatch[1] : "";

check(
  "the handler clamps the value rather than trusting it",
  handler.includes("clampListeningRadius(")
);

check(
  "the handler rejects a non-numeric radius",
  handler.includes("Number.isFinite(numeric)") &&
    handler.includes("Radius must be a number")
);

check(
  "the handler stores the radius on the player",
  handler.includes("currentPlayer.listeningRadius = radius")
);

check(
  "the handler re-syncs proximity so the change takes effect immediately",
  handler.includes("syncProximity(socket.id, currentPlayer)")
);

check(
  "the handler echoes the accepted radius back to the client",
  handler.includes("respond({ success: true, radius })")
);

check(
  "the handler answers a caller that never registered a player",
  handler.includes("Player not found")
);

// --- proximity uses the per-player radius ------------------------------

check(
  "the query is bounded by the listener's leave radius, not a constant",
  /const leaveRadius = leaveRadiusFor\(listeningRadius\);/.test(indexSource) &&
    indexSource.includes("$maxDistance: leaveRadius")
);

check(
  "the hysteresis filter uses the listener's radius",
  indexSource.includes("enterRadius: listeningRadius") &&
    indexSource.includes("leaveRadius,")
);

check(
  "no module-level radius constant is left to drift",
  !/\bPROXIMITY_RADIUS\b/.test(indexSource) &&
    !/\bPROXIMITY_LEAVE_RADIUS\b/.test(indexSource)
);

check(
  "the leave radius scales with the enter radius",
  proximitySource.includes("LEAVE_RADIUS_FACTOR") &&
    proximitySource.includes("leaveRadiusFor")
);

// --- the client side ---------------------------------------------------

check(
  "the client emits the same event name",
  appSource.includes('"player:setRadius"')
);

check(
  "the client re-applies its radius after a reconnect",
  /connected[\s\S]{0,400}player:setRadius/.test(appSource)
);

check(
  "the client debounces the emit rather than sending every drag step",
  appSource.includes("radiusTimerRef") &&
    appSource.includes("clearTimeout(radiusTimerRef.current)")
);

check(
  "the slider is bounded to the same range the server clamps to",
  appSource.includes('min="50"') && appSource.includes('max="200"')
);

check(
  "the ring bands scale with the radius rather than assuming 100",
  appSource.includes("radius * 0.4") && appSource.includes("radius * 0.75")
);

check(
  "the UI text reads the live radius, not a hardcoded 100",
  appSource.includes("within {listeningRadius}px") &&
    appSource.includes("within {listeningRadius} pixels")
);

console.log(
  failures === 0
    ? "All radius wiring tests passed"
    : `${failures} radius wiring test(s) failed`
);
process.exitCode = failures === 0 ? 0 : 1;
