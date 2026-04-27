import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your environment variables.");
}

const mongoUri: string = MONGODB_URI;

const cache = global.mongooseCache ?? { conn: null, promise: null };

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      dbName: "CMS",
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  global.mongooseCache = cache;

  return cache.conn;
}
