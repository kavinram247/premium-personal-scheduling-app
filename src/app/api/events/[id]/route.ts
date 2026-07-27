import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  eventsCollection,
  isDbConfigured,
  toEvent,
  type EventDoc,
} from "@/db";
import type { EventInput, Priority, Recurring } from "@/lib/types";

export const dynamic = "force-dynamic";

const SETUP_HINT =
  "Database not configured. Set MONGODB_URI in a .env file (your MongoDB Atlas connection string).";

function unavailable() {
  return NextResponse.json({ error: SETUP_HINT }, { status: 503 });
}

function sanitizePatch(input: Partial<EventInput>): Partial<Omit<EventDoc, "_id" | "userId" | "createdAt">> {
  const patch: Partial<Omit<EventDoc, "_id" | "userId" | "createdAt">> = {};
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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<EventInput>;
    const patch = sanitizePatch(body);
    const updated = await eventsCollection.findOneAndUpdate(
      { _id: id, userId },
      { $set: patch },
      { returnDocument: "after", includeResultMetadata: false }
    );
    if (!updated) {
      return NextResponse.json({ error: "Not found or permission denied" }, { status: 404 });
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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await eventsCollection.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found or permission denied" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
