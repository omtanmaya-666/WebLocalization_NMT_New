// src/utils/database.js

const { MongoClient } = require('mongodb');
const { MONGODB_URI, DATABASE_NAME, COLLECTION_NAME } = require('../config/database');

async function connectToMongoDB() {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to MongoDB');
  return client.db(DATABASE_NAME).collection(COLLECTION_NAME);
}

module.exports = { connectToMongoDB };
