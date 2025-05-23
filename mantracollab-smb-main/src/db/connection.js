const { MongoClient } = require("mongodb");

let client;

async function connectToDatabase(config) {
  const { MONGODB_URI, DB_NAME } = config;

  if (client && client.isConnected && client.isConnected()) {
    console.log("Already connected to MongoDB");
    return client.db(DB_NAME);
  }

  client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  console.log(`Connected to MongoDB [${DB_NAME}]`);
  return client.db(DB_NAME);
}

async function disconnect() {
  if (client) {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

module.exports = {
  connectToDatabase,
  disconnect,
};
