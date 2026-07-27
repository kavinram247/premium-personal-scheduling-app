import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  eventsCollection,
  isDbConfigured,
  toEvent,
  type NewEvent,
} from "@/db";
import type { EventInput, PlannerEvent, Priority, Recurring } from "@/lib/types";

export const dynamic = "force-dynamic";

const SETUP_HINT =
  "Database not configured. Create a .env file with MONGODB_URI (your MongoDB Atlas connection string, e.g. mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority), then restart the dev server. Run `npx drizzle-kit push` is NOT used with MongoDB — the collection is created automatically.";

function unavailable() {
  return NextResponse.json({ error: SETUP_HINT }, { status: 503 });
}

function sanitize(input: Partial<EventInput>): NewEvent {
  const title = (input.title ?? "").toString().trim();
  const startMinutes = Number(input.startMinutes);
  const endMinutes = Number(input.endMinutes);
  const reminderRaw = input.reminderMinutes;
  return {
    title: title || "Untitled event",
    notes: input.notes ? String(input.notes).slice(0, 4000) : null,
    location: input.location ? String(input.location).slice(0, 300) : null,
    category: (input.category ?? "work").toString(),
    date: (input.date ?? "").toString(),
    startMinutes: Number.isFinite(startMinutes) ? startMinutes : 540,
    endMinutes: Number.isFinite(endMinutes) ? endMinutes : 600,
    priority: (input.priority ?? "none") as Priority,
    recurring: (input.recurring ?? "none") as Recurring,
    reminderMinutes:
      reminderRaw == null || !Number.isFinite(Number(reminderRaw))
        ? null
        : Number(reminderRaw),
    completed: Boolean(input.completed),
  };
}

export async function GET() {
  if (!isDbConfigured) return unavailable();
  try {
    const docs = await eventsCollection
      .find()
      .sort({ startMinutes: 1 })
      .toArray();
    const events: PlannerEvent[] = docs.map(toEvent);
    return NextResponse.json(events);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `${message}. ${SETUP_HINT}` }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isDbConfigured) return unavailable();
  try {
    const body = (await req.json()) as Partial<EventInput>;
    const doc = {
      _id: randomUUID(),
      ...sanitize(body),
      createdAt: new Date(),
    };
    await eventsCollection.insertOne(doc);
    return NextResponse.json(toEvent(doc));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
