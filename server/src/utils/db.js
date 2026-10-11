const mongoose = require('mongoose');

/**
 * Connect to MongoDB with automatic fallback to MongoMemoryServer if local MongoDB is unavailable.
 */
async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smarturo';

  try {
    console.log(`[SmartUro DB] Attempting connection to ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`[SmartUro DB] Successfully connected to MongoDB at ${MONGO_URI}`);
    return MONGO_URI;
  } catch (err) {
    console.warn(`[SmartUro DB Warning] Could not connect to local MongoDB (${err.message}).`);
    console.log(`[SmartUro DB] Starting fallback In-Memory MongoDB Server...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[SmartUro DB] Successfully connected to In-Memory MongoDB at ${uri}`);
      return uri;
    } catch (memErr) {
      console.error(`[SmartUro DB Error] Fallback MongoMemoryServer failed:`, memErr);
      throw err;
    }
  }
}

module.exports = { connectDB };
