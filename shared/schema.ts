import { z } from "zod";

export const insertContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type InsertContact = z.infer<typeof insertContactSchema>;

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string | null;
  technologies: string[];
  imageUrl?: string | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  featured: boolean;
  createdAt: Date;
}
