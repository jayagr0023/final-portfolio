import { type Project, type InsertProject, projects } from "@shared/schema";
import { type InsertContact } from "@shared/schema";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { connectMongo } from "./mongodb";
import { randomUUID } from "crypto";

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

export interface IStorage {
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;

  createProject(project: InsertProject): Promise<Project>;
  getProjects(technology?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
}

// In-memory fallback for contacts when MongoDB is unavailable
const memContacts = new Map<string, Contact>();

export class AppStorage implements IStorage {
  // ── Contacts → MongoDB (falls back to in-memory) ─────────────────────────

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

  // ── Projects → PostgreSQL ────────────────────────────────────────────────

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async getProjects(technology?: string): Promise<Project[]> {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    if (technology) {
      return allProjects.filter((p) => p.technologies.includes(technology));
    }
    return allProjects;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new AppStorage();
