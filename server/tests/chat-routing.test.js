// Chat routing, ported from Naseema's branch. The decision of who receives a
// message is the interesting part, so it is a pure function with tests rather than
// three lines buried in the socket handler.
const { deliverChatMessage } = require("../lib/chat");

let failures = 0;

function check(label, condition) {
  if (condition) {
    console.log(`ok   - ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL - ${label}`);
  }
}

const lounge = [];
const meeting = [];
const world = [];

const emitRoom = (room, payload) => {
  if (room === "Lounge") {
    lounge.push(payload);
    return true;
  }
  if (room === "Meeting Room") {
    meeting.push(payload);
    return true;
  }
  return false;
};

const emitWorld = (payload) => {
  lounge.push(payload);
  meeting.push(payload);
  world.push(payload);
};

const roomMessage = { scope: "room", text: "Room hello" };

check(
  "a room message reaches only that room",
  deliverChatMessage({
    scope: "room",
    message: roomMessage,
    room: "Lounge",
    emitWorld,
    emitRoom,
  }) === true &&
    lounge.includes(roomMessage) &&
    !meeting.includes(roomMessage) &&
    world.length === 0
);

const worldMessage = { scope: "world", text: "Everyone hello" };

check(
  "a world message reaches every room",
  deliverChatMessage({
    scope: "world",
    message: worldMessage,
    room: null,
    emitWorld,
    emitRoom,
  }) === true &&
    lounge.includes(worldMessage) &&
    meeting.includes(worldMessage) &&
    world.includes(worldMessage)
);

check(
  "a room message with no room is not delivered",
  deliverChatMessage({
    scope: "room",
    message: roomMessage,
    room: null,
    emitWorld,
    emitRoom,
  }) === false
);

check(
  "an unknown room is not delivered",
  deliverChatMessage({
    scope: "room",
    message: roomMessage,
    room: "Nowhere",
    emitWorld,
    emitRoom,
  }) === false
);

check(
  "an unknown scope is not delivered",
  deliverChatMessage({
    scope: "shout",
    message: roomMessage,
    room: "Lounge",
    emitWorld,
    emitRoom,
  }) === false
);

console.log(
  failures === 0
    ? "All chat routing tests passed"
    : `${failures} chat routing test(s) failed`
);
process.exitCode = failures === 0 ? 0 : 1;
