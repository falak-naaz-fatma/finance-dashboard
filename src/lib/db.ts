import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = global as typeof globalThis & {
    mongoose?: MongooseCache;
};

const cached = globalForMongoose.mongoose || { conn: null, promise: null };
globalForMongoose.mongoose = cached;

export async function connectDB() {
    if (cached.conn) return cached.conn;

    cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
        dbName: "spendly",
    });
    cached.conn = await cached.promise;
    return cached.conn;
}
