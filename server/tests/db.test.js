// Connection module checks that need no database.
//
// The parts worth testing here are the guards: what happens before a connection
// exists, what happens with no URI, and that closing a connection that was never
// opened is harmless. Opening a real connection needs a MongoDB server, so the
// happy path is exercised by the boot check instead.
const {
  connectDB,
  getDB,
  closeDB,
  DB_NAME,
  CONNECTION_OPTIONS,
} = require("../lib/db");

let failures = 0;

function check(label, condition) {
  if (condition) {
    console.log(`ok   - ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL - ${label}`);
  }
}

async function run() {
  check("the database is named proxispeak", DB_NAME === "proxispeak");

  check(
    "the pool is sized rather than left at the driver default",
    CONNECTION_OPTIONS.maxPoolSize > 0 &&
      Number.isFinite(CONNECTION_OPTIONS.maxPoolSize)
  );

  check(
    "there is a bounded wait for an unreachable server",
    CONNECTION_OPTIONS.serverSelectionTimeoutMS > 0 &&
      CONNECTION_OPTIONS.connectTimeoutMS > 0
  );

  let threwBeforeConnect = false;
  try {
    getDB();
  } catch (error) {
    threwBeforeConnect = /not connected/i.test(error.message);
  }
  check("getDB before connecting throws a clear error", threwBeforeConnect);

  let missingUriError = null;
  try {
    await connectDB("");
  } catch (error) {
    missingUriError = error.message;
  }
  check(
    "an empty URI is refused rather than attempted",
    /MONGODB_URI is missing/i.test(missingUriError || "")
  );

  let closeThrew = false;
  try {
    await closeDB();
  } catch (error) {
    closeThrew = true;
  }
  check("closing a connection that was never opened is harmless", !closeThrew);

  console.log(
    failures === 0
      ? "All database tests passed"
      : `${failures} database test(s) failed`
  );
  process.exitCode = failures === 0 ? 0 : 1;
}

run();
