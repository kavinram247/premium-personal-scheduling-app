"use client";

import { useEffect, useState } from "react";
import type { EventInput, PlannerEvent, Priority, Recurring } from "@/lib/types";
import {
  CATEGORY_LIST,
  getCategory,
  PRIORITY_LIST,
  RECURRING_OPTIONS,
  REMINDER_OPTIONS,
} from "@/lib/categories";
import {
  MINUTES_IN_DAY,
  clamp,
  minutesToTimeInput,
  timeInputToMinutes,
} from "@/lib/dateUtils";
import { IconX } from "./icons";

export interface ModalDefaults {
  date: string;
  startMinutes: number;
  endMinutes: number;
  category?: string;
}

interface EventModalProps {
  open: boolean;
  event: PlannerEvent | null;
  defaults: ModalDefaults | null;
  onClose: () => void;
  onSave: (input: EventInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function minutesOrDefault(v: number, fallback: number) {
  return Number.isFinite(v) ? clamp(Math.round(v), 0, MINUTES_IN_DAY) : fallback;
}

export function EventModal({
  open,
  event,
  defaults,
  onClose,
  onSave,
  onDelete,
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("work");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [priority, setPriority] = useState<Priority>("none");
  const [recurring, setRecurring] = useState<Recurring>("none");
  const [reminder, setReminder] = useState<number | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (event) {
      setTitle(event.title);
      setCategory(event.category);
      setDate(event.date);
      setStart(minutesToTimeInput(event.startMinutes));
      setEnd(minutesToTimeInput(event.endMinutes));
      setPriority(event.priority);
      setRecurring(event.recurring);
      setReminder(event.reminderMinutes);
      setLocation(event.location ?? "");
      setNotes(event.notes ?? "");
      setCompleted(event.completed);
    } else if (defaults) {
      setTitle("");
      setCategory(defaults.category ?? "work");
      setDate(defaults.date);
      const s = minutesOrDefault(defaults.startMinutes, 540);
      const e = minutesOrDefault(defaults.endMinutes, 600);
      setStart(minutesToTimeInput(s));
      setEnd(minutesToTimeInput(e));
      setPriority("none");
      setRecurring("none");
      setReminder(null);
      setLocation("");
      setNotes("");
      setCompleted(false);
    }
  }, [open, event, defaults]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const cat = getCategory(category);

  async function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Please give this a title.");
      return;
    }
    const startM = timeInputToMinutes(start);
    let endM = timeInputToMinutes(end);
    if (endM <= startM) endM = startM + 30;
    if (!date) {
      setError("Please choose a date.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        id: event?.id,
        title: trimmed,
        category,
        date,
        startMinutes: startM,
        endMinutes: endM,
        priority,
        recurring,
        reminderMinutes: reminder,
        location: location.trim() || null,
        notes: notes.trim() || null,
        completed,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    setSaving(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete event.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200 sm:rounded-3xl">
        {/* header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: cat.bg }}>
          <span
            className="h-10 w-10 shrink-0 rounded-xl shadow-sm"
            style={{
              backgroundColor: cat.accent,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.4)",
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: cat.text }}>
              {event ? "Edit event" : "New event"} · {cat.label}
            </p>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/60"
            aria-label="Close"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* category */}
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </label>
          <div className="mb-4 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {CATEGORY_LIST.map((c) => {
              const active = c.key === category;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`flex items-center gap-1.5 rounded-xl border px-2 py-2 text-left text-[11px] font-medium transition ${
                    active
                      ? "border-transparent text-slate-900 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                  style={
                    active
                      ? { backgroundColor: c.bg, boxShadow: `inset 0 0 0 2px ${c.accent}` }
                      : undefined
                  }
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.accent }}
                  />
                  <span className="truncate">{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* date + time */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Starts">
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Ends">
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          {/* priority */}
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Priority
          </label>
          <div className="mb-4 grid grid-cols-4 gap-1.5">
            {PRIORITY_LIST.map((p) => {
              const active = p.key === priority;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPriority(p.key)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-transparent text-white shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                  style={active ? { backgroundColor: p.color } : undefined}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: active ? "rgba(255,255,255,0.9)" : p.color }}
                  />
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* recurring + reminder */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Field label="Repeat">
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as Recurring)}
                className="input"
              >
                {RECURRING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reminder">
              <select
                value={reminder == null ? "" : String(reminder)}
                onChange={(e) =>
                  setReminder(e.target.value === "" ? null : Number(e.target.value))
                }
                className="input"
              >
                {REMINDER_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value == null ? "" : String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Location (optional)">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Office, Gym, Home"
              className="input"
            />
          </Field>

          <div className="mt-3">
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add details, agenda, or a checklist…"
                rows={3}
                className="input resize-none"
              />
            </Field>
          </div>

          {event && (
            <button
              type="button"
              onClick={() => setCompleted((c) => !c)}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              <span>{completed ? "Completed" : "Mark as completed"}</span>
              <span
                className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                  completed ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    completed ? "translate-x-4" : ""
                  }`}
                />
              </span>
            </button>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
          {event && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: cat.accent }}
          >
            {saving ? "Saving…" : event ? "Save changes" : "Add event"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
