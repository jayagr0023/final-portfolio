import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
};

let mongoClient: MongoClient | null = null;

function parseContact(body: unknown): ContactPayload | null {
  let value = body;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object") return null;

  const { name, email, message } = value as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    name.length < 2 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof message !== "string" ||
    message.length < 6
  ) {
    return null;
  }

  return { name, email, message };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contactData = parseContact(req.body);
  if (!contactData) {
    return res.status(400).json({ error: "Please provide a valid name, email, and message." });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
    console.error("[contacts] MONGODB_URI is not configured for this deployment.");
    return res.status(503).json({ error: "Messages are temporarily unavailable. Please email me directly." });
  }

  try {
    mongoClient ??= new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await mongoClient.connect();
    await mongoClient.db("portfolio").collection("contacts").insertOne({
      ...contactData,
      id: randomUUID(),
      createdAt: new Date(),
    });
    return res.status(201).json({ message: "Contact message saved successfully." });
  } catch (error) {
    console.error("[contacts] Failed to save contact message:", error);
    return res.status(500).json({ error: "Unable to save your message. Please try again later." });
  }
}
