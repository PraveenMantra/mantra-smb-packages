const DatabaseError = require("../exceptions/databaseError");
const logger = require("./logger/logger");

let db = null;
const WEBSITE = {
  init(database) {
    db = database;
  },
  async getWebsites(filter = {}) {
    if (db === null) {
      throw DatabaseError("No database connection for fetching websites");
    }
    logger.info(`Fetching websites with filter: ${JSON.stringify(filter)}`);
    const websites = await db.collection("websites").find(filter).toArray();
    logger.info(`Fetched ${websites.length} websites`);
    return websites;
  },
};
module.exports = WEBSITE;
