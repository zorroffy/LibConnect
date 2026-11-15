const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }
  await mongoose.connect(uri);
  console.log(`[db] Connected to MongoDB: ${mongoose.connection.name}`);
};
