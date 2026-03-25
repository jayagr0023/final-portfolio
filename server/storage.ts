import { type InsertContact, type Contact } from "@shared/schema";
import { connectMongo } from "./index";
import { randomUUID } from "crypto";

export interface IStorage {
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
}

const memContacts = new Map<string, Contact>();

export class AppStorage implements IStorage {
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = {
      id: randomUUID(),
      name: insertContact.name,
      email: insertContact.email,
      message: insertContact.message,
      createdAt: new Date(),
    };

    const mongoDb = await connectMongo();
    if (mongoDb) {
      await mongoDb.collection("contacts").insertOne({ ...contact, _id: contact.id as any });
    } else {
      memContacts.set(contact.id, contact);
    }

    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    const mongoDb = await connectMongo();
    if (mongoDb) {
      const docs = await mongoDb.collection<Contact>("contacts").find().sort({ createdAt: -1 }).toArray();
      return docs.map(({ _id, ...rest }: any) => rest as Contact);
    }
    return Array.from(memContacts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const mongoDb = await connectMongo();
    if (mongoDb) {
      const doc = await mongoDb.collection<Contact>("contacts").findOne({ id } as any);
      if (!doc) return undefined;
      const { _id, ...rest } = doc as any;
      return rest as Contact;
    }
    return memContacts.get(id);
  }
}

export const storage = new AppStorage();
