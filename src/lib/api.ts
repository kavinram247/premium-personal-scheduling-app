import type { EventInput, PlannerEvent } from "./types";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchEvents(): Promise<PlannerEvent[]> {
  const res = await fetch("/api/events", { cache: "no-store" });
  return jsonOrThrow<PlannerEvent[]>(res);
}

export async function createEvent(input: EventInput): Promise<PlannerEvent> {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return jsonOrThrow<PlannerEvent>(res);
}

export async function updateEvent(
  id: string,
  patch: Partial<EventInput>
): Promise<PlannerEvent> {
  const res = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return jsonOrThrow<PlannerEvent>(res);
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
}
