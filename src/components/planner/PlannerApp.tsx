"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventInput, PlannerEvent, ViewMode } from "@/lib/types";
import {
  WEEKDAY_LONG,
  MONTH_LONG,
  WEEKDAY_SHORT,
  addDays,
  formatYMD,
  getWeekDays,
  getWeekendDays,
  isToday,
} from "@/lib/dateUtils";
import {
  createEvent,
  deleteEvent,
  fetchEvents,
  updateEvent,
} from "@/lib/api";
import { TimeGrid } from "./TimeGrid";
import { EventModal, type ModalDefaults } from "./EventModal";
import { DaySidebar, WeekSidebar, WeekendSidebar } from "./Sidebar";
import {
  IconMark,
  IconSun,
  IconCalendar,
  IconLeaf,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
} from "./icons";

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "weekend", label: "Weekend" },
];

const VIEW_ICON: Record<ViewMode, (p: { size?: number; className?: string }) => React.ReactElement> = {
  day: IconSun,
  week: IconCalendar,
  weekend: IconLeaf,
};

export default function PlannerApp() {
  const [view, setView] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    open: boolean;
    event: PlannerEvent | null;
    defaults: ModalDefaults | null;
  }>({ open: false, event: null, defaults: null });

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchEvents();
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const days = useMemo(
    () =>
      view === "day"
        ? [selectedDate]
        : view === "week"
        ? getWeekDays(selectedDate)
        : getWeekendDays(selectedDate),
    [view, selectedDate]
  );

  const openCreate = useCallback(
    (day: Date, startMinutes: number, endMinutes: number, category?: string) => {
      setModal({
        open: true,
        event: null,
        defaults: { date: formatYMD(day), startMinutes, endMinutes, category },
      });
    },
    []
  );

  const openEdit = useCallback((ev: PlannerEvent) => {
    setModal({ open: true, event: ev, defaults: null });
  }, []);

  const handleNewButton = useCallback(() => {
    const start = (((new Date().getHours() + 1) % 24) * 60);
    openCreate(new Date(), start, Math.min(start + 60, 1440));
  }, [openCreate]);

  const handleChange = useCallback(
    (
      id: string,
      patch: Partial<Pick<PlannerEvent, "startMinutes" | "endMinutes" | "date">>
    ) => {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      updateEvent(id, patch).catch(() => refresh());
    },
    [refresh]
  );

  const handleComplete = useCallback(
    (id: string, completed: boolean) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, completed } : e))
      );
      updateEvent(id, { completed }).catch(() => refresh());
    },
    [refresh]
  );

  const handleSave = useCallback(
    async (input: EventInput) => {
      if (input.id) {
        const { id, ...patch } = input;
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
        const updated = await updateEvent(id, patch);
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        const created = await createEvent(input);
        setEvents((prev) => [...prev, created]);
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await deleteEvent(id);
  }, []);

  const step = view === "day" ? 1 : 7;
  const goPrev = () => setSelectedDate((d) => addDays(d, -step));
  const goNext = () => setSelectedDate((d) => addDays(d, step));
  const goToday = () => setSelectedDate(new Date());

  const rangeLabel = useMemo(() => {
    if (view === "day") {
      const d = selectedDate;
      return `${WEEKDAY_LONG[d.getDay()]}, ${MONTH_LONG[d.getMonth()]} ${d.getDate()}`;
    }
    if (view === "week") {
      const ws = getWeekDays(selectedDate);
      return `${MONTH_LONG[ws[0].getMonth()].slice(0, 3)} ${ws[0].getDate()} – ${MONTH_LONG[ws[6].getMonth()].slice(0, 3)} ${ws[6].getDate()}`;
    }
    const we = getWeekendDays(selectedDate);
    return `${WEEKDAY_SHORT[we[0].getDay()]} ${we[0].getDate()} – ${WEEKDAY_SHORT[we[1].getDay()]} ${we[1].getDate()}`;
  }, [view, selectedDate]);

  const gridProps = {
    events,
    onEventClick: openEdit,
    onEventChange: handleChange,
    onCreate: (day: Date, s: number, e: number) => openCreate(day, s, e),
    onComplete: handleComplete,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-md">
              <IconMark size={18} />
            </div>
            <div className="leading-none">
              <h1 className="text-[17px] font-extrabold tracking-tight text-slate-900">
                Life Management
              </h1>
              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Your day, week &amp; weekend — in focus
              </p>
            </div>
          </div>

          {/* View tabs */}
          <div className="order-3 flex w-full items-center gap-1 rounded-2xl bg-slate-100 p-1 sm:order-2 sm:w-auto">
            {VIEWS.map((v) => {
              const Icon = VIEW_ICON[v.key];
              return (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                    view === v.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon size={15} />
                  {v.label}
                </button>
              );
            })}
          </div>

          <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
            <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5">
              <button
                onClick={goPrev}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Previous"
              >
                <IconChevronLeft size={17} />
              </button>
              <button
                onClick={goToday}
                className="px-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition hover:text-slate-900"
              >
                Today
              </button>
              <button
                onClick={goNext}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Next"
              >
                <IconChevronRight size={17} />
              </button>
            </div>
            <button
              onClick={handleNewButton}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:px-4"
            >
              <IconPlus size={16} />
              <span className="hidden sm:inline">New event</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 sm:py-6">
        {/* Range label */}
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
            {rangeLabel}
            {view === "day" && isToday(selectedDate) && (
              <span className="ml-2 align-middle text-xs font-bold uppercase tracking-wide text-rose-500">
                · Today
              </span>
            )}
          </h2>
          <p className="text-sm font-medium text-slate-400">
            {events.length} events · drag to reschedule, edges to resize
          </p>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            {error}{" "}
            <button onClick={refresh} className="underline">
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_336px]">
          <section className="min-w-0">
            {loading ? (
              <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="text-sm font-medium text-slate-400">Loading your schedule…</div>
              </div>
            ) : (
              <TimeGrid
                key={view}
                days={days}
                pixelsPerHour={view === "day" ? 62 : view === "week" ? 46 : 56}
                compact={view === "week"}
                colMinWidth={view === "day" ? 0 : view === "week" ? 118 : 220}
                {...gridProps}
              />
            )}
          </section>

          <aside className="min-w-0">
            {view === "day" && (
              <DaySidebar date={selectedDate} events={events} onEventClick={openEdit} />
            )}
            {view === "week" && (
              <WeekSidebar anchor={selectedDate} events={events} onEventClick={openEdit} />
            )}
            {view === "weekend" && (
              <WeekendSidebar
                weekendDays={getWeekendDays(selectedDate)}
                events={events}
                onQuickAdd={(category, day) => {
                  openCreate(day, 600, 660, category);
                }}
              />
            )}
          </aside>
        </div>
      </main>

      <EventModal
        open={modal.open}
        event={modal.event}
        defaults={modal.defaults}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
