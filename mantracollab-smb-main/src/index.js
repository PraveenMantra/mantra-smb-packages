const { SUPPORTED_ENVS, DEFAULT_ENV } = require("./constants/dbConstants");
const { connectToDatabase, disconnect } = require("./db/connection");
const DatabaseError = require("./exceptions/databaseError");
const InitializationError = require("./exceptions/initializationError");
const logger = require("./logger/logger");
const website = require("./methods/websites");

let dbInstance = null;
let dbConfig = null;

function loadConfig(env) {
  const targetEnv = env || DEFAULT_ENV;
  if (!SUPPORTED_ENVS.includes(targetEnv)) {
    throw new InitializationError(
      `Unsupported environment "${targetEnv}". Supported: ${SUPPORTED_ENVS.join(
        ", "
      )}`
    );
  }
  logger.info(`Loading config for environment: ${targetEnv}`);
  return require(`./config/${targetEnv}`);
}

const SMB = {
  async init(env) {
    if (dbInstance) {
      logger.info("Using existing DB connection");
      return dbInstance;
    }

    dbConfig = loadConfig(env);
    dbInstance = await connectToDatabase(dbConfig);
    logger.info("DB initialized");
    // Initialize website object with dbInstance
    website.init(dbInstance);
    return dbInstance;
  },

  async disconnect() {
    if (!dbInstance) {
      logger.warn("No active DB connection to disconnect");
      return;
    }

    await disconnect();
    dbInstance = null;
    dbConfig = null;
    logger.info("Disconnected from DB");
  },

  getDb() {
    if (!dbInstance) {
      throw new DatabaseError(
        "Database not initialized. Call SMB.init(env) first."
      );
    }
    return dbInstance;
  },
  website,
};

module.exports = SMB;
