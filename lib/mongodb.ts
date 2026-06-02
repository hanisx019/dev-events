import mongoose, { ConnectOptions } from "mongoose"

// Utility function to get MongoDB URI from environment variables with error handling.
const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.")
  }

  return uri
}
const MONGODB_URI = getMongoUri()

// Mongoose connection caching to prevent multiple connections in development.
// This pattern ensures that we reuse the same connection across hot reloads in development,
// while still allowing for proper connection management in production.
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend the global namespace to include our mongoose cache for TypeScript type safety.
declare global {
  var mongooseCache: MongooseCache | undefined
}

// Persist cache across module reloads to prevent duplicate connections in dev.
const cache: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
}

// Assign the cache to the global object to ensure it's shared across module reloads.
if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cache
}

// Mongoose connection options to optimize performance and reliability.
const connectionOptions: ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: process.env.NODE_ENV !== "production",
}

// Main function to connect to MongoDB using Mongoose with caching and error handling.
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return the existing connection if it's already established and ready.
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn
  }
  // If the connection is not ready, reset the cache to allow for a new connection attempt.
  if (mongoose.connection.readyState !== 1) {
    cache.conn = null
    cache.promise = null
  }

  // Share one in-flight promise so concurrent requests do not create a connect storm.
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, connectionOptions)
  }

  // Await the connection promise and handle any errors that may occur during connection.
  try {
    cache.conn = await cache.promise
  } catch (error) {
    cache.promise = null
    throw error
  }

  // Return the established connection for use in the application.
  return cache.conn
}
