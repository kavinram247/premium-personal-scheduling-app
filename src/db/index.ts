import { MongoClient, type Collection } from "mongodb";
import type { PlannerEvent, Priority, Recurring } from "@/lib/types";

/** Shape of an event document stored in MongoDB. */
export interface EventDoc {
  _id: string;
  userId: string;
  title: string;
  notes: string | null;
  location: string | null;
  category: string;
  date: string; // YYYY-MM-DD anchor day
  startMinutes: number;
  endMinutes: number;
  priority: Priority;
  recurring: Recurring;
  reminderMinutes: number | null;
  completed: boolean;
  createdAt: Date;
}

/** Fields that can be supplied when creating an event (no _id / createdAt). */
export type NewEvent = Omit<EventDoc, "_id" | "createdAt">;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "life_management";

export const isDbConfigured = Boolean(uri);

const globalForDb = globalThis as typeof globalThis & {
  __lifeMgmtMongo?: MongoClient;
};

// Construct lazily-safe: MongoClient does not connect until the first
// operation, so this never throws at import time even without a URI.
export const mongoClient =
  globalForDb.__lifeMgmtMongo ??
  new MongoClient(uri || "mongodb://127.0.0.1:27017", {
    serverSelectionTimeoutMS: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__lifeMgmtMongo = mongoClient;
}

export const mongoDb = mongoClient.db(dbName);
export const eventsCollection: Collection<EventDoc> =
  mongoDb.collection<EventDoc>("events");

/** Convert a stored document into the API-facing PlannerEvent shape. */
export function toEvent(doc: EventDoc): PlannerEvent {
  const created =
    doc.createdAt instanceof Date
      ? doc.createdAt
      : new Date(doc.createdAt);
  return {
    id: doc._id,
    title: doc.title,
    notes: doc.notes ?? null,
    location: doc.location ?? null,
    category: doc.category,
    date: doc.date,
    startMinutes: doc.startMinutes,
    endMinutes: doc.endMinutes,
    priority: doc.priority,
    recurring: doc.recurring,
    reminderMinutes: doc.reminderMinutes ?? null,
    completed: doc.completed,
    createdAt: created.toISOString(),
  };
}
