import { NextResponse } from "next/server";
import {
  eventsCollection,
  isDbConfigured,
  toEvent,
  type NewEvent,
} from "@/db";
import type { EventInput, Priority, Recurring } from "@/lib/types";

export const dynamic = "force-dynamic";

const SETUP_HINT =
  "Database not configured. Set MONGODB_URI in a .env file (your MongoDB Atlas connection string) and restart the dev server.";

function unavailable() {
  return NextResponse.json({ error: SETUP_HINT }, { status: 503 });
}

function sanitizePatch(input: Partial<EventInput>): Partial<NewEvent> {
  const patch: Partial<NewEvent> = {};
  if (input.title !== undefined)
    patch.title = String(input.title).trim() || "Untitled event";
  if (input.notes !== undefined)
    patch.notes = input.notes ? String(input.notes).slice(0, 4000) : null;
  if (input.location !== undefined)
    patch.location = input.location ? String(input.location).slice(0, 300) : null;
  if (input.category !== undefined) patch.category = String(input.category);
  if (input.date !== undefined) patch.date = String(input.date);
  if (input.startMinutes !== undefined)
    patch.startMinutes = Number(input.startMinutes);
  if (input.endMinutes !== undefined)
    patch.endMinutes = Number(input.endMinutes);
  if (input.priority !== undefined)
    patch.priority = String(input.priority) as Priority;
  if (input.recurring !== undefined)
    patch.recurring = String(input.recurring) as Recurring;
  if (input.reminderMinutes !== undefined)
    patch.reminderMinutes =
      input.reminderMinutes == null || !Number.isFinite(Number(input.reminderMinutes))
        ? null
        : Number(input.reminderMinutes);
  if (input.completed !== undefined) patch.completed = Boolean(input.completed);
  return patch;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDbConfigured) return unavailable();
  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<EventInput>;
    const patch = sanitizePatch(body);
    const updated = await eventsCollection.findOneAndUpdate(
      { _id: id },
      { $set: patch },
      { returnDocument: "after", includeResultMetadata: false }
    );
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(toEvent(updated));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDbConfigured) return unavailable();
  try {
    const { id } = await params;
    await eventsCollection.deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
