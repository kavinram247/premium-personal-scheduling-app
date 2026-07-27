import type { PlannerEvent } from "./types";

export const MINUTES_IN_DAY = 1440;

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun .. 6 = Sat
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return formatYMD(a) === formatYMD(b);
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getWeekendDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return [addDays(start, 5), addDays(start, 6)];
}

export function minutesToLabel(min: number): string {
  const clamped = ((min % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const h = Math.floor(clamped / 60);
  const m = Math.floor(clamped % 60);
  const ampm = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function minutesToTimeInput(min: number): string {
  const clamped = ((min % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const h = Math.floor(clamped / 60);
  const m = Math.floor(clamped % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeInputToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function nowMinutes(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function formatDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h && mm) return `${h}h ${mm}m`;
  if (h) return `${h}h`;
  return `${mm}m`;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function eventOccursOn(ev: PlannerEvent, day: Date): boolean {
  if (ev.recurring === "none") return ev.date === formatYMD(day);
  if (ev.recurring === "daily") return true;
  const dow = day.getDay();
  if (ev.recurring === "weekdays") return dow >= 1 && dow <= 5;
  if (ev.recurring === "weekly") return parseYMD(ev.date).getDay() === dow;
  return false;
}

export function eventsForDay(events: PlannerEvent[], day: Date): PlannerEvent[] {
  return events
    .filter((ev) => eventOccursOn(ev, day))
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

/** Overlap-aware column layout so simultaneous blocks sit side by side. */
export function layoutDay(
  events: PlannerEvent[]
): Array<{ event: PlannerEvent; col: number; cols: number }> {
  const items = [...events].sort((a, b) => a.startMinutes - b.startMinutes);
  const clusters: PlannerEvent[][] = [];
  let current: PlannerEvent[] = [];
  let clusterEnd = -1;
  for (const ev of items) {
    if (current.length === 0 || ev.startMinutes < clusterEnd) {
      current.push(ev);
      clusterEnd = Math.max(clusterEnd, ev.endMinutes);
    } else {
      clusters.push(current);
      current = [ev];
      clusterEnd = ev.endMinutes;
    }
  }
  if (current.length) clusters.push(current);

  const result: Array<{ event: PlannerEvent; col: number; cols: number }> = [];
  for (const cluster of clusters) {
    const cols: (PlannerEvent | null)[] = [];
    const placement = new Map<string, number>();
    for (const ev of cluster) {
      let placed = false;
      for (let c = 0; c < cols.length; c++) {
        const last = cols[c];
        if (!last || last.endMinutes <= ev.startMinutes) {
          cols[c] = ev;
          placement.set(ev.id, c);
          placed = true;
          break;
        }
      }
      if (!placed) {
        cols.push(ev);
        placement.set(ev.id, cols.length - 1);
      }
    }
    const total = cols.length;
    for (const ev of cluster) {
      result.push({ event: ev, col: placement.get(ev.id)!, cols: total });
    }
  }
  return result;
}

/** Total uncovered minutes between [dayStart, dayEnd] (defaults to 6:00-23:00). */
export function freeMinutes(
  events: PlannerEvent[],
  dayStart = 360,
  dayEnd = 1380
): number {
  if (events.length === 0) return dayEnd - dayStart;
  const busy: Array<[number, number]> = events
    .map((e) => [Math.max(e.startMinutes, dayStart), Math.min(e.endMinutes, dayEnd)] as [number, number])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [s, e] of busy) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
    void 0;
  }
  let covered = 0;
  let cursor = dayStart;
  for (const [s, e] of merged) {
    if (s > cursor) covered += 0; // gap (free)
    cursor = Math.max(cursor, e);
  }
  void covered;
  // free = total span - covered busy minutes
  let totalBusy = 0;
  for (const [s, e] of merged) totalBusy += e - s;
  return Math.max(0, dayEnd - dayStart - totalBusy);
}
