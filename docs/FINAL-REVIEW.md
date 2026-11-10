# Final Review — ProxiSpeak

Proximity-based spatial voice for a virtual office. This document states what was
built, what was proven, what was not, and how to demonstrate it.

Updated 11 November 2026.

---

## The short version

ProxiSpeak is a browser virtual office where you hear the people near you and
nothing else. You move an avatar around a shared 2D office; audio fades with
distance, pans with direction, and muffles when furniture is in the way. Rooms
scope both hearing and chat, a Meeting Room call works regardless of distance, and
screens can be shared into it.

It runs on Node, Socket.IO and MongoDB, with WebRTC for the audio itself and an
optional Redis adapter for running several server instances.

**Built:** all four brief weeks, plus the work that followed. **Proven:** the first
two weeks, the spatial audit, and the audio check. **Not yet proven:** the
multi-instance mesh and the sound occlusion — both need a browser, and for the
mesh a Redis. Neither is code work; both are demonstrations.

---

## Brief coverage

| Week | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Signaling, movement, MongoDB geospatial schema | ✅ | `world:state`, `player:move`, `2d` geospatial index |
| 2 | Proximity (`$near`, 100 px) + WebRTC audio | ✅ | 7 proximity tests; radius adjustable 50–200; peer reached `connected`; audio heard |
| 3 | Mesh scaling (Redis) + dynamic attenuation | 🟡 | Attenuation ✅ in the mixer; mesh **built, not yet run on two instances** |
| 4 | Room persistence + sound-blocking obstacles + polish | 🟡 | Layouts ✅ in MongoDB; obstacles ✅ built, **not yet heard**; stereo pan ✅; 60 FPS unmeasured |

### What each week actually contains

**Week 1 — signaling and movement.** Socket.IO position broadcast with the world
state on connect, keyboard movement at 240 px/s, a 1000×600 world with furniture
collision, and a MongoDB `2d` geospatial index on player positions.

**Week 2 — proximity and audio.** A `$near` query gated at a listening radius,
defaulting to 100 px and adjustable per listener between 50 and 200, with
**hysteresis** (connect at the radius, disconnect at 1.15× it — so 100 and 115 at
the default) so hovering at the edge does not tear down and rebuild the peer
connection. WebRTC audio with offer/answer signaling, ICE buffering, and a spatial
mixer built on the Web Audio API.

**Week 3 — attenuation and mesh.** Distance attenuation and stereo panning run in
a single `requestAnimationFrame` loop over per-peer `GainNode` and
`StereoPannerNode` chains. The mesh is Socket.IO's Redis adapter, attached only
when `REDIS_URL` is set and failing soft when Redis is unreachable. Each client
connects to its **eight nearest** peers — a full mesh does not scale.

**Week 4 — persistence, obstacles, polish.** Each room owns its layout (zones,
furniture, plants) in MongoDB, served by `GET /api/rooms/:id/layout` and validated
strictly, with the built-in layout as a fallback. Sound occlusion raycasts the
line between two players against that same furniture: 35 % gain and an 800 Hz
low-pass when something is in the way. Polish covered stereo panning, the
application shell, device pickers, the minimap, distance labels and an adjustable
listening radius.

### Beyond the brief

- **Click to walk** — clicking anywhere in the office walks the avatar there, with
  the pointer-to-world mapping extracted and tested
- **A rebuilt landing page** with architecture and workflow documentation
- **Activity feed** for joins, leaves and people coming into earshot
- **Room and global chat scopes**, with typing indicators and unread counts
- **Raise hand and emoji reactions** inside the Meeting Room call
- **Screen sharing** into the Meeting Room
- **Pooled MongoDB connection** with a guard against concurrent connects

---

## Evidence

| Claim | How it was shown |
|---|---|
| Spatial queries under 20 ms | `npm run audit` → **PASS**, 200/200 correct, server query max **1.00 ms** (round-trip ~26 ms, printed separately) |
| The benchmark without a database | `npm run audit:local` → **PASS**, 200/200 correct, p95 0.14 ms, max 2.60 ms against the 20 ms budget |
| Two browsers hear each other | Peer reached state `connected`; audio confirmed by ear and by the live level meters |
| Proximity gating works | Live server log: `Nearby players for rev : 1` on approach |
| Reconnect restores state | Log: `Player name: revanth` → `MongoDB matched: 1` |
| Nothing regressed | **21 server suites + 40 client unit tests**, plus 20 smoke checks and 14 occlusion checks |
| Client↔server contracts | Static contract test compares every client destructure against the server's payload, and asserts every client emit has a handler |

The audit judges the **20 ms budget on database execution time**, not the network
round-trip — measuring the round-trip would have been a meaningless pass.

---

## The demo — ten minutes

Run the server (`npm run dev` in `server/`) and the client (`npm run dev` in
`client/`), then open **http://localhost:5173 in a standalone Chrome, Edge or
Firefox**. Embedded previews (VS Code's built-in browser, Electron) cannot capture
the screen and will fail the screen-share step.

1. **Landing** — the product story, then **Enter the office**.
2. **Two windows** — set different names in each; both appear in People.
3. **Move** — WASD, the arrow keys, or click anywhere in the office to walk there.
4. **Walk together** — the proximity rings light green under 40 px, blue under 75,
   red up to the radius. Voice is loud, then quiet, then gone.
5. **Enable microphone** in both — the level meters move when the other person
   speaks. *(This is the proof that audio flows, even when echo cancellation makes
   it inaudible on one machine.)*
6. **Occlusion** — put a desk between the two avatars. The voice should go
   noticeably duller. **This is the differentiator.**
7. **Radius** — drag the listening radius in Settings to 200 and watch a peer at
   150 px turn green and become audible.
8. **Rooms** — switch one window to the Meeting Room. Hearing and chat stop
   crossing between you; the room cards show the headcount.
9. **Meeting Room** — Join call, raise a hand, send a reaction, then Share screen
   from one window; the other shows the video tile.
10. **Chat** — send a room message and a Global one; the typing indicator appears
    first, and the unread badge counts what you miss.

---

## Deploying

The code is deployment-ready; the credentials are not included.

**Requirements**

- **A host** — Render, Railway, Fly.io, or a VPS. Node 20+.
- **MongoDB** — Atlas free tier is enough. Set `MONGODB_URI`.
- **HTTPS** — mandatory. Microphone and screen capture refuse to run on plain HTTP
  except on localhost.
- **A TURN server** — **not optional for real use.** Without it, two people behind
  different symmetric NATs connect, exchange offers, and hear nothing. Metered,
  Twilio and a self-hosted coturn all work. Set `VITE_TURN_URL`,
  `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL`.

**Steps**

```bash
# server
cd server && npm ci
MONGODB_URI=... CORS_ORIGIN=https://your-domain npm start

# client
cd client && npm ci
VITE_SERVER_URL=https://api.your-domain VITE_TURN_URL=... npm run build
# serve dist/ behind HTTPS
```

A `Dockerfile` and `.dockerignore` are in `server/`. The `.env.example` files list
every variable. A Render walkthrough is in the README.

**Optional: several instances**

```bash
REDIS_URL=redis://localhost:6379 npm run start
```

---

## Known gaps

Named plainly, because a review that hides them is worth less than one that does
not.

1. **The mesh has never run on two instances.** The adapter, the peer cap and the
   fallback are all tested in isolation. Proving it needs a Redis and two
   processes.
2. **The occlusion has never been heard.** The geometry has 14 tests; the audio
   effect needs two browsers and a desk.
3. **60 FPS was never measured.** The render loop runs on animation frames and the
   world redraws every frame, but no profile was taken and no number recorded.
4. **No camera video.** The Meeting Room shares screens, not faces. Video was never
   in the brief.
5. **The office is top-down, not isometric.** The design mockup's art is a
   hand-drawn isometric tileset. Reproducing it needs art assets, not code.
6. **`server/index.js` has no handler tests.** The pure logic is extracted and
   tested; the wiring is checked by static tests. Three separate bugs reached the
   branch through this gap — all caught, none by a unit test.
7. **No authentication.** Anyone who can reach the server can join as any name.
   Acceptable for an internal demo, not for a public deployment.

---

## Honest assessment

The engineering is finished and defensible: proximity gating with hysteresis, a
spatial mixer, sound occlusion that no competing product does, room-scoped presence
and chat, persisted room layouts, an optional multi-instance mesh, and twenty-one
server suites that run in seconds.

What is missing is **evidence for two claims**, not code. Those two demonstrations
are a couple of hours of work, and they convert "we built it" into "we showed it".
Do them before the review, not during it.
