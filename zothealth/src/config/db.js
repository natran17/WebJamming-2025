const mongoose = require('mongoose');
let memoryServer = null;
async function connectDB() {
  if (process.env.USE_MEMORY_DB === '1') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    const uri = memoryServer.getUri();
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    return mongoose.connection;
  }
  const uri = process.env.NODE_ENV === 'test'
    ? process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/zothealth_test'
    : process.env.MONGODB_URI || 'mongodb://localhost:27017/zothealth';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}
module.exports = connectDB;
