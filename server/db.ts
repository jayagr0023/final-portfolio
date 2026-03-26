import { MongoClient, type Db } from "mongodb";
import { config } from "dotenv";

config();

let db: Db | null = null;
let connectionAttempted = false;

export async function connectMongo(): Promise<Db | null> {
  if (connectionAttempted) return db;
  connectionAttempted = true;

  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
    console.warn("[mongodb] No valid MONGODB_URI set - using in-memory storage for contacts.");
    return null;
  }

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    db = client.db("portfolio");
    console.log("[mongodb] Connected successfully.");
    return db;
  } catch (err: any) {
    console.warn(`[mongodb] Connection failed (${err.message}) - using in-memory storage for contacts.`);
    return null;
  }
}
