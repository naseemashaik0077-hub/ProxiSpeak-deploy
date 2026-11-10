// One MongoDB connection for the process.
//
// The pool is sized here rather than left at the driver's defaults, connecting is
// guarded so two concurrent callers cannot open two clients, and a failed attempt
// closes its own socket instead of leaking one.
const { MongoClient } = require("mongodb");

const DB_NAME = "proxispeak";

const CONNECTION_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  // A pooled connection handles a room of clients without opening a socket each.
  maxPoolSize: 50,
  minPoolSize: 0,
};

let client = null;
let database = null;
let connecting = null;

async function connectDB(uri = process.env.MONGODB_URI) {
  if (database) return database;
  // A second caller while the first is still connecting waits for the same attempt
  // rather than opening a competing client.
  if (connecting) return connecting;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from server/.env");
  }

  connecting = (async () => {
    const nextClient = new MongoClient(uri, CONNECTION_OPTIONS);

    try {
      await nextClient.connect();
      const nextDatabase = nextClient.db(DB_NAME);

      // connect() can resolve before the server is actually usable, so prove it.
      await nextDatabase.command({ ping: 1 });

      client = nextClient;
      database = nextDatabase;
      console.log("MongoDB connected successfully");
      return database;
    } catch (error) {
      await nextClient.close().catch(() => {});
      throw error;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

function getDB() {
  if (!database) {
    throw new Error("MongoDB is not connected yet");
  }

  return database;
}

async function closeDB() {
  // Let an in-flight attempt settle first, or its client is never closed.
  if (connecting) await connecting.catch(() => {});
  if (!client) return;

  const closing = client;
  client = null;
  database = null;

  await closing.close();
  console.log("MongoDB connection closed.");
}

module.exports = {
  connectDB,
  getDB,
  closeDB,
  DB_NAME,
  CONNECTION_OPTIONS,
};
