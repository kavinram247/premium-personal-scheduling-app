"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import type { PlannerEvent } from "@/lib/types";
import { getCategory, PRIORITIES } from "@/lib/categories";
import {
  WEEKDAY_SHORT,
  MONTH_LONG,
  eventsForDay,
  formatDuration,
  formatYMD,
  freeMinutes,
  getWeekDays,
  isToday,
  minutesToLabel,
  nowMinutes,
} from "@/lib/dateUtils";
import { IconBell, IconCheck, IconClock } from "./icons";

/* ---------- shared bits ---------- */

export function UserProfileCard() {
  const { isSignedIn, user } = useUser();
  return (
    <Card className="mb-1">
      {isSignedIn ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {user?.fullName || user?.firstName || "My Account"}
              </p>
              <p className="truncate text-[11px] font-medium text-slate-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Guest User</span>
          <Link
            href="/sign-in"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
          >
            Sign In
          </Link>
        </div>
      )}
    </Card>
  );
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  color = "#0f172a",
  track = "#e2e8f0",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {title && (
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function EventRow({
  ev,
  onEventClick,
}: {
  ev: PlannerEvent;
  onEventClick?: (ev: PlannerEvent) => void;
}) {
  const cat = getCategory(ev.category);
  const p = PRIORITIES[ev.priority];
  return (
    <button
      onClick={() => onEventClick?.(ev)}
      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
    >
      <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: cat.accent }} />
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold text-slate-800 ${ev.completed ? "line-through opacity-50" : ""}`}>
          {ev.title}
        </span>
        <span className="block text-[11px] font-medium text-slate-400">
          {minutesToLabel(ev.startMinutes)} · {formatDuration(ev.endMinutes - ev.startMinutes)}
          {p && ev.priority !== "none" ? ` · ${p.label}` : ""}
        </span>
      </span>
      {ev.completed && (
        <span className="text-emerald-500">
          <IconCheck size={15} strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
}

function Legend({ events }: { events: PlannerEvent[] }) {
  const counts = new Map<string, number>();
  for (const e of events) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  const used = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!used.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {used.map(([key, n]) => {
        const c = getCategory(key);
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
            {c.label} {n}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- Day sidebar ---------- */

export function DaySidebar({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: PlannerEvent[];
  onEventClick: (ev: PlannerEvent) => void;
}) {
  const dayEvents = eventsForDay(events, date);
  const done = dayEvents.filter((e) => e.completed);
  const today = isToday(date);
  const nowM = nowMinutes();
  const upcoming = dayEvents.find((e) => !e.completed && e.endMinutes > nowM) ?? null;
  const priorities = dayEvents.filter((e) => e.priority !== "none" && !e.completed);
  const reminders = dayEvents.filter((e) => e.reminderMinutes != null);
  const free = freeMinutes(dayEvents);

  return (
    <div className="flex flex-col gap-3">
      <UserProfileCard />
      <Card>
        <div className="flex items-center gap-4">
          <ProgressRing value={dayEvents.length ? done.length / dayEvents.length : 0} color="#0f172a">
            <div className="text-center">
              <div className="text-base font-extrabold leading-none text-slate-900">{done.length}</div>
              <div className="text-[9px] font-semibold uppercase text-slate-400">of {dayEvents.length}</div>
            </div>
          </ProgressRing>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {today ? "Today" : WEEKDAY_SHORT[date.getDay()]}
            </p>
            <p className="truncate text-lg font-bold text-slate-900">
              {date.getDate()} {MONTH_LONG[date.getMonth()]}
            </p>
            <p className="mt-0.5 text-xs font-medium text-emerald-600">
              {formatDuration(free)} free time
            </p>
          </div>
        </div>
      </Card>

      {upcoming && (
        <Card title="Up next">
          <button
            onClick={() => onEventClick(upcoming)}
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:opacity-90"
            style={{ backgroundColor: getCategory(upcoming.category).bg }}
          >
            <span
              className="h-11 w-11 shrink-0 rounded-xl shadow-sm"
              style={{
                backgroundColor: getCategory(upcoming.category).accent,
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.4)",
              }}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold" style={{ color: getCategory(upcoming.category).text }}>
                {upcoming.title}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium opacity-70">
                <IconClock size={11} />
                {minutesToLabel(upcoming.startMinutes)} – {minutesToLabel(upcoming.endMinutes)}
              </span>
            </span>
          </button>
        </Card>
      )}

      {priorities.length > 0 && (
        <Card title={`Priorities · ${priorities.length}`}>
          <div className="flex flex-col gap-0.5">
            {priorities.slice(0, 6).map((ev) => (
              <EventRow key={ev.id} ev={ev} onEventClick={onEventClick} />
            ))}
          </div>
        </Card>
      )}

      {reminders.length > 0 && (
        <Card title={`Reminders · ${reminders.length}`}>
          <div className="flex flex-col gap-0.5">
            {reminders.slice(0, 5).map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 px-2 py-1 text-sm text-slate-600">
                <span className="text-slate-400">
                  <IconBell size={13} />
                </span>
                <span className="min-w-0 flex-1 truncate">{ev.title}</span>
                <span className="shrink-0 text-[11px] font-medium text-slate-400">
                  {minutesToLabel(ev.startMinutes)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Categories today">
        <Legend events={dayEvents} />
      </Card>
    </div>
  );
}

/* ---------- Week sidebar ---------- */

export function WeekSidebar({
  anchor,
  events,
  onEventClick,
}: {
  anchor: Date;
  events: PlannerEvent[];
  onEventClick: (ev: PlannerEvent) => void;
}) {
  const days = getWeekDays(anchor);
  const all = days.flatMap((d) => eventsForDay(events, d));
  const done = all.filter((e) => e.completed).length;
  const pending = all.length - done;
  const priorities = all.filter((e) => e.priority === "high" && !e.completed);
  const deadlines = all.filter((e) => e.priority === "high");
  const appointments = all.filter((e) => e.category === "meeting");

  return (
    <div className="flex flex-col gap-3">
      <UserProfileCard />
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {MONTH_LONG[anchor.getMonth()]} week
            </p>
            <p className="text-lg font-bold text-slate-900">
              {days[0].getDate()}–{days[6].getDate()}
            </p>
          </div>
          <ProgressRing value={all.length ? done / all.length : 0} color="#0f172a">
            <div className="text-center">
              <div className="text-sm font-extrabold text-slate-900">{Math.round((all.length ? done / all.length : 0) * 100)}%</div>
            </div>
          </ProgressRing>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="Done" value={done} color="#10b981" />
          <Stat label="Pending" value={pending} color="#f59e0b" />
          <Stat label="Meets" value={appointments.length} color="#8b5cf6" />
        </div>
      </Card>

      <Card title={`Weekly priorities · ${priorities.length}`}>
        {priorities.length ? (
          <div className="flex flex-col gap-0.5">
            {priorities.slice(0, 6).map((ev) => (
              <EventRow key={`${ev.id}-${ev.date}`} ev={ev} onEventClick={onEventClick} />
            ))}
          </div>
        ) : (
          <p className="px-2 py-2 text-sm text-slate-400">No high-priority items. Nice work.</p>
        )}
      </Card>

      <Card title="Free time by day">
        <div className="flex flex-col gap-1.5">
          {days.map((d, i) => {
            const free = freeMinutes(eventsForDay(events, d));
            const max = 17 * 60;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-7 text-[11px] font-semibold text-slate-400">{WEEKDAY_SHORT[d.getDay()]}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(4, (free / max) * 100)}%`,
                      backgroundColor: isToday(d) ? "#0ea5e9" : "#cbd5e1",
                    }}
                  />
                </div>
                <span className="w-9 text-right text-[11px] font-semibold text-slate-500">
                  {Math.round(free / 60)}h
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {deadlines.length > 0 && (
        <Card title={`Deadlines · ${deadlines.length}`}>
          <div className="flex flex-col gap-0.5">
            {deadlines.slice(0, 5).map((ev) => (
              <EventRow key={`dl-${ev.id}-${ev.date}`} ev={ev} onEventClick={onEventClick} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2">
      <div className="text-lg font-extrabold" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

/* ---------- Weekend sidebar ---------- */

const WEEKEND_CATEGORIES = ["errands", "family", "social", "exercise", "entertainment", "rest", "outing", "prep"];

export function WeekendSidebar({
  weekendDays,
  events,
  onQuickAdd,
}: {
  weekendDays: Date[];
  events: PlannerEvent[];
  onQuickAdd: (category: string, day: Date) => void;
}) {
  const all = weekendDays.flatMap((d) => eventsForDay(events, d));
  const done = all.filter((e) => e.completed).length;
  const free = weekendDays.reduce((sum, d) => sum + freeMinutes(eventsForDay(events, d), 420, 1380), 0);
  const prep = all.filter((e) => e.category === "prep");
  const nextMonday = getWeekDays(weekendDays[0])[0];

  return (
    <div className="flex flex-col gap-3">
      <UserProfileCard />
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Weekend</p>
            <p className="text-lg font-bold text-slate-900">Sat {weekendDays[0].getDate()} – Sun {weekendDays[1].getDate()}</p>
          </div>
          <ProgressRing value={all.length ? done / all.length : 0} color="#8b5cf6">
            <div className="text-center">
              <div className="text-sm font-extrabold text-slate-900">{done}/{all.length}</div>
            </div>
          </ProgressRing>
        </div>
        <p className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-center text-sm font-semibold text-violet-700">
          {formatDuration(free)} of free time to enjoy
        </p>
      </Card>

      <Card title="Plan something">
        <div className="grid grid-cols-2 gap-1.5">
          {WEEKEND_CATEGORIES.map((key) => {
            const c = getCategory(key);
            return (
              <button
                key={key}
                onClick={() => onQuickAdd(key, weekendDays[0])}
                className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-left text-[11px] font-semibold transition hover:scale-[1.02]"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.accent }} />
                <span className="truncate">{c.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Tap to add to Saturday.</p>
      </Card>

      {prep.length > 0 && (
        <Card title="Prep for next week">
          <div className="flex flex-col gap-1">
            {prep.map((ev) => {
              const c = getCategory(ev.category);
              return (
                <div key={ev.id} className="flex items-center gap-2 px-2 py-1 text-sm text-slate-700">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />
                  <span className="min-w-0 flex-1 truncate">{ev.title}</span>
                  <span className="text-[11px] text-slate-400">{minutesToLabel(ev.startMinutes)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card title="Next week starts Monday">
        <p className="text-sm text-slate-600">
          {formatYMD(nextMonday) === formatYMD(weekendDays[0])
            ? "Set yourself up with meal prep and a weekly plan."
            : "You have a head start. Keep it going."}
        </p>
      </Card>
    </div>
  );
}
