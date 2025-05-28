const { MongoClient } = require("mongodb");

let cachedDb = null;

// **Hardcoded MongoDB URI (replace with your actual URI)**
const MONGODB_URI =
  "mongodb+srv://harsh:OQxxQE5qiktwThDZ@cluster0.xfzuarm.mongodb.net/";

async function connectToDatabase(uri) {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  cachedDb = client.db("mantra-smb-analytics"); // Your DB name
  return cachedDb;
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const ipAddress =
    event.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    event.requestContext?.identity?.sourceIp ||
    "unknown";

  let payload;
  try {
    payload =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload" }),
    };
  }

  const {
    event: eventName,
    timestamp,
    sessionId,
    url,
    referrer,
    userAgent,
    data,
  } = payload;

  if (!eventName || !timestamp || !sessionId || !url || !userAgent) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

  // Fetch geo location from IP
  const location = await getGeoLocation(ipAddress);

  try {
    const db = await connectToDatabase(MONGODB_URI);
    const collection = db.collection("events");

    await collection.insertOne({
      event: eventName,
      timestamp: new Date(timestamp),
      receivedAt: new Date(),
      sessionId,
      url,
      referrer: referrer || null,
      userAgent,
      ipaddress: ipAddress,
      location, // Add location info here (may be null)
      data: data || {},
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Event recorded" }),
    };
  } catch (err) {
    console.error("MongoDB insert error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

async function getGeoLocation(ip) {
  if (!ip || ip === "unknown") return null;

  // Dynamically import node-fetch
  const fetch = (await import("node-fetch")).default;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();

    if (data.status === "fail") {
      console.warn(
        `[Analytics] IP Geolocation failed for ${ip}: ${data.message}`
      );
      return null;
    }

    return {
      city: data.city,
      region: data.regionName,
      country: data.country,
      lat: data.lat,
      lon: data.lon,
      isp: data.isp,
    };
  } catch (err) {
    console.warn("[Analytics] Failed to fetch location:", err.message);
    return null;
  }
}
