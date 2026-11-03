# ProxiSpeak — Plan to 5 November

Mid-review completion · Vivek's branch · the build roadmap

## Q1 — Can we merge Vivek's branch and fix everything?

**A raw merge: no.** A test merge of `feature/vivek-frontend` into `main` (in a
scratch clone) failed with **6 conflicted files / 46 hunks** — `client/src/useVoiceChat.js`
alone has 19. The conflicts are structural: `main` uses `server/lib/` + `server/tests/`,
Vivek uses the `server/` root, so every require and file path clashes, and the merged
tree does not parse. Resolving by "keep both" would re-introduce the
duplicate-declaration crash and ship two signaling protocols (`webrtc:*` and `voice:*`)
at once.

**Porting his useful work: yes.** Same approach as his avatar colour — re-implement
the idea on `main`, cleanly. His only remaining worthwhile bits are small: a master
speaker-volume control and an "audio paused → Resume" prompt.

**Fixing bugs: yes.** A full sweep — parse every file, run both test suites, bundle
the client, hunt duplicate declarations — is straightforward.

**His room catalog: not a merge, a build.** It is a picker with no room separation:
the server has no `roomId` on players and does no room filtering. Real rooms are a
genuine feature (room-scoped worlds), listed as deferred below.

## Q2 — What to do today (25 Oct)

Two of the four mid-review deliverables are already complete and evidenced
(Proximity Calculations, WebRTC Integration). The other two are built but need a
machine with MongoDB and two browsers — the sandbox can't run either. So today's
actions are:

- Run the Spatial Audit and capture the log: `cd server && npm install && npm run audit`
  → expect `RESULT: PASS`. Paste the output into `docs/MID-REVIEW.md`.
- Run the Audio Check in two browser windows (see the run-book) and capture a short
  screen recording showing both peers connected.
- Sign off the checklist in `docs/MID-REVIEW.md`.
- Decide Vivek's branch: do **not** merge; port the two small UX bits if wanted.

Everything else is already in the repo: the evidence pack (`Mid-Review-Evidence.docx`),
the captured results in `docs/MID-REVIEW.md`, and the fallback benchmark
(`server/spatial-benchmark.js`).

## Q3 — The roadmap to 5 November

The mockup is a full product; the project today is its technical core (proximity,
spatial voice, presence, avatar colour). The plan reaches the "looks like the mockup"
tier by 5 Nov and defers the three large items.

| Phase | Focus | Days | Outcome |
|---|---|---|---|
| 1 | Mid-review + Vivek port + full bug sweep | 25–27 Oct | Review ready; main clean; bugs fixed |
| 2 | Landing page + office-map restyle + proximity rings | 28–30 Oct | It looks like the product |
| 3 | People list & presence + profile/avatar + audio settings | 31 Oct–2 Nov | The core panels work |
| 4 | Integration, polish, demo + final review | 3–5 Nov | Submission ready |

### Mockup coverage by phase

| Mockup panel | Where it lands | Status today |
|---|---|---|
| 1 Landing page | Phase 2 | not built |
| 2 Office map + sidebar/zones | Phase 2 | partial (canvas only) |
| 3 Proximity voice rings | Phase 2 | audio works; no rings |
| 6 People list & presence | Phase 3 | partial (nearby list) |
| 8 Audio & settings | Phase 3 | partial (mute) |
| 9 Profile & custom avatar | Phase 3 | partial (name + colour) |
| 5 Chat sidebar | Deferred | not built |
| 7 Rooms / spaces | Deferred | not built |
| 4 Meeting room (video) | Deferred | not built |

## Deferred, and the risks

- **Deferred** (largest items, most risk): Rooms / spaces — needs room-scoped worlds,
  not a picker. Chat sidebar — Vivek's world chat was off-brief. Video — a meeting
  room with video is a big lift.
- **Risk — art assets:** the office map and character sprites are drawn artwork; the
  layout can be built, but the visuals need assets (a designer or a sourced tileset).
- **Risk — deadline:** ~10 days. Phases 2 and 3 are the bulk; if time slips, cut
  Phase 3 extras before Phase 2, since "looks like the product" matters most for the
  review.
- Keep `main` and `revanth` in lockstep: fast-forward `revanth` to `main` after each
  merge so the demo branch never drifts.

## Immediate next step

Port Vivek's volume + resume-audio prompt onto `main`, then run the full bug sweep
(parse, both test suites, client bundle, duplicate check) and report.

---

## Final state (3 Nov)

Everything this plan listed is built and merged, except video and the deploy.

**The brief's four weeks**

- **Week 1** — signaling, keyboard movement, the MongoDB geospatial schema.
- **Week 2** — `$near` proximity gating at 100 px with hysteresis, WebRTC audio.
- **Week 3** — distance attenuation and stereo panning in the spatial mixer; the
  Redis mesh adapter with an eight-peer cap, failing soft without Redis.
- **Week 4** — room layouts persisted in MongoDB; sound occlusion from the same
  furniture, with a gain cut and a low-pass.

**Beyond the brief**

- **Rooms / spaces** — proximity, chat and WebRTC scoped per room, plus a Meeting
  Room call that works regardless of distance.
- **Chat** — room and global scopes with typing indicators and unread counts.
- **Screen sharing** — Meeting Room only.
- **Activity feed** — joins, leaves and people coming into earshot.
- **Office map** — five labelled zones, furniture, graded proximity rings.
- **People list, profile, device pickers** — microphone and speaker selection.
- **Resilience & deploy** — error handling, graceful shutdown, rate limiting,
  configurable CORS, optional TURN, `.env.example`, Dockerfile, a Deploying section.

**Still open**

- **The mesh has not run on two instances.** The adapter, the cap and the fallback
  are tested; proving it needs Redis and two processes.
- **The occlusion has not been heard.** The geometry has 14 tests; the effect needs
  two browsers and a desk.
- **Video** (camera, not screen sharing) — never in the brief.
- **Deploy** — needs HTTPS, TURN credentials and a host.
- **No authentication** — fine for an internal demo, not for public deployment.

**Tests:** 15 server suites, 19 client unit tests, plus the client smoke and
occlusion suites — all passing. The spatial benchmark passes at 200/200 correct,
max 2.60 ms against a 20 ms budget.

See `docs/FINAL-REVIEW.md` for the full account, including what is and is not proven.
