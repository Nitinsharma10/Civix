const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

let db;
let memoryServer;
let client;

async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGO_URI;
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn(
      'Primary MongoDB connection failed. Falling back to in-memory MongoDB for local development.'
    );
    memoryServer = await MongoMemoryServer.create();
    client = new MongoClient(memoryServer.getUri());
    await client.connect();
    db = client.db();
    console.log('Connected to in-memory MongoDB');
  }

  // Ensure indexes
  await db.collection('users').createIndex({ clerkUserId: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  return db;
}

function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

module.exports = { connectDB, getDB };
