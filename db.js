const mongoose = require("mongoose");

let cached = global.__UMISF_MONGOOSE__;
if (!cached) {
  cached = global.__UMISF_MONGOOSE__ = { conn: null, promise: null, initialized: false };
}

function getMongoConfigFromEnv() {
  const databaseUrl = process.env.DATABASE_URL;
  const dbName = process.env.DB_NAME;
  if (databaseUrl) return { uri: databaseUrl, dbName };

  // Backwards compatibility with upstream config names
  const uri = process.env.CONNECTION_STRING;
  const legacyDbName = process.env.DATABASE;
  return { uri, dbName: dbName || legacyDbName };
}

function maskUri(uri) {
  if (!uri || typeof uri !== "string") return "(not set)";
  return uri.replace(/:[^:@/]+@/, ":****@");
}

async function initDb() {
  // Requiring model files registers mongoose models and schemas.
  require("./models/player");
  require("./models/single");
  require("./models/double");
  require("./models/company");
  require("./models/university");
  require("./models/user");
  require("./models/feedback");
  require("./models/photo");
  require("./models/yearlyConfigurations");
  require("./models/ageGroup");
  require("./models/captain");
  require("./models/matchForDraw");
  require("./models/matchResult");
  require("./models/subTournement");
  require("./models/teamRound");
  require("./models/tournement");

  const models = Object.values(mongoose.models);
  await Promise.all(models.map((m) => m.createCollection()));
  await Promise.all(models.map((m) => m.syncIndexes()));
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  const { uri, dbName } = getMongoConfigFromEnv();
  if (!uri) {
    console.error("DATABASE_URL (or CONNECTION_STRING) is not set. Set it in Render Dashboard → Environment.");
    throw new Error("DATABASE_URL (or CONNECTION_STRING) is required");
  }
  console.log("Connecting to MongoDB:", maskUri(uri), dbName ? `dbName=${dbName}` : "");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        ...(dbName ? { dbName } : {}),
        serverSelectionTimeoutMS: 10_000,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  if (!cached.initialized) {
    await initDb();
    cached.initialized = true;
  }

  return cached.conn;
}

module.exports = { connectToDatabase };

