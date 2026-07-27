"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PlannerEvent } from "@/lib/types";
import { getCategory } from "@/lib/categories";
import {
  WEEKDAY_SHORT,
  MINUTES_IN_DAY,
  clamp,
  eventsForDay,
  formatYMD,
  isToday,
  layoutDay,
  minutesToLabel,
  nowMinutes,
} from "@/lib/dateUtils";
import { EventBlock } from "./EventBlock";

const MIN_DURATION = 15;

type DragState =
  | {
      kind: "move";
      ev: PlannerEvent;
      originCol: number;
      originStart: number;
      originEnd: number;
      grabMin: number;
      previewStart: number;
      previewEnd: number;
      previewCol: number;
      startX: number;
      startY: number;
    }
  | {
      kind: "resize";
      ev: PlannerEvent;
      edge: "start" | "end";
      col: number;
      originStart: number;
      originEnd: number;
      previewStart: number;
      previewEnd: number;
      startX: number;
      startY: number;
    }
  | {
      kind: "create";
      dayIndex: number;
      grabMin: number;
      start: number;
      end: number;
      startX: number;
      startY: number;
    }
  | null;

interface TimeGridProps {
  days: Date[];
  events: PlannerEvent[];
  pixelsPerHour?: number;
  startHour?: number;
  endHour?: number;
  snapMinutes?: number;
  colMinWidth?: number;
  showNow?: boolean;
  compact?: boolean;
  scrollHint?: number;
  onEventClick: (ev: PlannerEvent) => void;
  onEventChange: (
    id: string,
    patch: Partial<Pick<PlannerEvent, "startMinutes" | "endMinutes" | "date">>
  ) => void;
  onCreate: (day: Date, startMinutes: number, endMinutes: number) => void;
  onComplete: (id: string, completed: boolean) => void;
}

function hourLabel(h: number, compact?: boolean) {
  const ampm = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return compact ? `${hh}${ampm[0].toLowerCase()}` : `${hh} ${ampm}`;
}

export function TimeGrid({
  days,
  events,
  pixelsPerHour = 60,
  startHour = 0,
  endHour = 24,
  snapMinutes = 15,
  colMinWidth = 120,
  showNow = true,
  compact = false,
  onEventClick,
  onEventChange,
  onCreate,
  onComplete,
}: TimeGridProps) {
  const columnsRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [now, setNow] = useState<Date>(new Date());

  const dragRef = useRef<DragState>(null);
  useEffect(() => {
    dragRef.current = dragState;
  }, [dragState]);

  const cfg = useRef({
    days,
    startHour,
    pixelsPerHour,
    snapMinutes,
    onEventChange,
    onCreate,
    onEventClick,
  });
  useEffect(() => {
    cfg.current = {
      days,
      startHour,
      pixelsPerHour,
      snapMinutes,
      onEventChange,
      onCreate,
      onEventClick,
    };
  }, [days, startHour, pixelsPerHour, snapMinutes, onEventChange, onCreate, onEventClick]);

  const hours = endHour - startHour;
  const totalHeight = hours * pixelsPerHour;
  const gutterWidth = compact ? 44 : 58;

  // Live clock for the now indicator.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Scroll to a sensible starting position (around "now", min 6 AM).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = Math.max(6 * 60, nowMinutes()) - 60;
    el.scrollTop = clamp((target / 60) * pixelsPerHour, 0, totalHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global pointer listeners (registered once; they read refs).
  useEffect(() => {
    const snap = (m: number) => {
      const s = cfg.current.snapMinutes;
      return Math.round(m / s) * s;
    };
    const pointMin = (clientY: number) => {
      const rect = columnsRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      const y = clientY - rect.top;
      return cfg.current.startHour * 60 + (y / cfg.current.pixelsPerHour) * 60;
    };
    const colFromX = (clientX: number) => {
      const rect = columnsRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      const x = clientX - rect.left;
      const n = cfg.current.days.length;
      return clamp(Math.floor(x / (rect.width / n)), 0, n - 1);
    };

    const onMove = (e: PointerEvent) => {
      const st = dragRef.current;
      if (!st) return;
      const totalMin = pointMin(e.clientY);
      setDragState((prev) => {
        if (!prev) return prev;
        if (prev.kind === "move") {
          const delta = snap(totalMin) - snap(prev.grabMin);
          const duration = prev.originEnd - prev.originStart;
          const ns = clamp(
            prev.originStart + delta,
            0,
            MINUTES_IN_DAY - duration
          );
          return {
            ...prev,
            previewStart: ns,
            previewEnd: ns + duration,
            previewCol: colFromX(e.clientX),
          };
        }
        if (prev.kind === "resize") {
          const target = clamp(snap(totalMin), 0, MINUTES_IN_DAY);
          if (prev.edge === "end") {
            return {
              ...prev,
              previewEnd: clamp(target, prev.originStart + MIN_DURATION, MINUTES_IN_DAY),
            };
          }
          return {
            ...prev,
            previewStart: clamp(target, 0, prev.originEnd - MIN_DURATION),
          };
        }
        if (prev.kind === "create") {
          const cur = clamp(snap(totalMin), 0, MINUTES_IN_DAY);
          const start = Math.min(prev.grabMin, cur);
          let end = Math.max(prev.grabMin, cur);
          if (end - start < MIN_DURATION) end = start + MIN_DURATION;
          return { ...prev, start, end };
        }
        return prev;
      });
    };

    const onUp = (e: PointerEvent) => {
      const st = dragRef.current;
      if (!st) return;
      const moved = Math.hypot(e.clientX - st.startX, e.clientY - st.startY);
      const { onCreate: create, onEventChange: change, onEventClick: click, days: ds } =
        cfg.current;
      if (moved < 6) {
        if (st.kind === "move") click(st.ev);
        else if (st.kind === "create")
          create(ds[st.dayIndex], st.grabMin, Math.min(st.grabMin + 60, MINUTES_IN_DAY));
      } else if (st.kind === "move") {
        change(st.ev.id, {
          startMinutes: st.previewStart,
          endMinutes: st.previewEnd,
          date: formatYMD(ds[st.previewCol]),
        });
      } else if (st.kind === "resize") {
        change(st.ev.id, {
          startMinutes: st.previewStart,
          endMinutes: st.previewEnd,
        });
      } else if (st.kind === "create") {
        create(ds[st.dayIndex], st.start, st.end);
      }
      setDragState(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const startCreate = useCallback(
    (dayIndex: number) => (e: React.PointerEvent) => {
      const rect = columnsRef.current?.getBoundingClientRect();
      if (!rect) return;
      const y = e.clientY - rect.top;
      const totalMin = startHour * 60 + (y / pixelsPerHour) * 60;
      const grab = clamp(
        Math.round(totalMin / snapMinutes) * snapMinutes,
        0,
        MINUTES_IN_DAY - MIN_DURATION
      );
      setDragState({
        kind: "create",
        dayIndex,
        grabMin: grab,
        start: grab,
        end: grab + MIN_DURATION,
        startX: e.clientX,
        startY: e.clientY,
      });
    },
    [startHour, pixelsPerHour, snapMinutes]
  );

  const startMove = useCallback(
    (ev: PlannerEvent, dayIndex: number) => (e: React.PointerEvent) => {
      e.stopPropagation();
      const rect = columnsRef.current?.getBoundingClientRect();
      if (!rect) return;
      const y = e.clientY - rect.top;
      const totalMin = startHour * 60 + (y / pixelsPerHour) * 60;
      setDragState({
        kind: "move",
        ev,
        originCol: dayIndex,
        originStart: ev.startMinutes,
        originEnd: ev.endMinutes,
        grabMin: Math.round(totalMin / snapMinutes) * snapMinutes,
        previewStart: ev.startMinutes,
        previewEnd: ev.endMinutes,
        previewCol: dayIndex,
        startX: e.clientX,
        startY: e.clientY,
      });
    },
    [startHour, pixelsPerHour, snapMinutes]
  );

  const startResize = useCallback(
    (ev: PlannerEvent, edge: "start" | "end", dayIndex: number) =>
      (e: React.PointerEvent) => {
        e.stopPropagation();
        setDragState({
          kind: "resize",
          ev,
          edge,
          col: dayIndex,
          originStart: ev.startMinutes,
          originEnd: ev.endMinutes,
          previewStart: ev.startMinutes,
          previewEnd: ev.endMinutes,
          startX: e.clientX,
          startY: e.clientY,
        });
      },
    []
  );

  const nowMin = nowMinutes(now);
  const draggingId =
    dragState && dragState.kind !== "create" ? dragState.ev.id : null;
  const previewIsCreate = dragState?.kind === "create";
  const previewCat =
    dragState && dragState.kind !== "create"
      ? getCategory(dragState.ev.category)
      : getCategory("work");

  const isPreviewCol = (idx: number) => {
    if (!dragState) return false;
    if (dragState.kind === "create") return dragState.dayIndex === idx;
    if (dragState.kind === "move") return dragState.previewCol === idx;
    if (dragState.kind === "resize") return dragState.col === idx;
    return false;
  };

  const previewBlock = useMemo(() => {
    if (!dragState) return null;
    if (dragState.kind === "create") {
      const top = (dragState.start / 60 - startHour) * pixelsPerHour;
      const height = Math.max(
        ((dragState.end - dragState.start) / 60) * pixelsPerHour,
        16
      );
      return { top, height, start: dragState.start, end: dragState.end, label: "New event" };
    }
    if (dragState.kind === "move") {
      const top = (dragState.previewStart / 60 - startHour) * pixelsPerHour;
      const height = Math.max(
        ((dragState.previewEnd - dragState.previewStart) / 60) * pixelsPerHour,
        16
      );
      return { top, height, start: dragState.previewStart, end: dragState.previewEnd, label: dragState.ev.title };
    }
    if (dragState.kind === "resize") {
      const top = (dragState.previewStart / 60 - startHour) * pixelsPerHour;
      const height = Math.max(
        ((dragState.previewEnd - dragState.previewStart) / 60) * pixelsPerHour,
        16
      );
      return { top, height, start: dragState.previewStart, end: dragState.previewEnd, label: dragState.ev.title };
    }
    return null;
  }, [dragState, startHour, pixelsPerHour]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Day header row */}
      <div className="flex border-b border-slate-200 bg-white">
        <div style={{ width: gutterWidth, minWidth: gutterWidth }} className="shrink-0" />
        <div
          className="grid min-w-0 flex-1"
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(${colMinWidth}px, 1fr))` }}
        >
          {days.map((d, i) => {
            const today = isToday(d);
            return (
              <div
                key={i}
                className={`border-l border-slate-100 px-2 py-2 text-center first:border-l-0 ${
                  today ? "bg-slate-50" : ""
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {WEEKDAY_SHORT[d.getDay()]}
                </div>
                <div
                  className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    today ? "text-white" : "text-slate-700"
                  }`}
                  style={today ? { backgroundColor: "#0f172a" } : undefined}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable body */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 232px)" }}
      >
        <div className={`flex ${dragState ? "select-none" : ""}`}>
          {/* hour gutter */}
          <div
            className="relative shrink-0"
            style={{ width: gutterWidth, minWidth: gutterWidth, height: totalHeight }}
          >
            {Array.from({ length: hours }).map((_, i) => {
              const h = startHour + i;
              return (
                <div
                  key={i}
                  className="absolute right-1 -translate-y-1/2 text-right text-[10px] font-medium text-slate-400"
                  style={{ top: i * pixelsPerHour }}
                >
                  {i === 0 ? "" : hourLabel(h, compact)}
                </div>
              );
            })}
          </div>

          {/* columns */}
          <div
            ref={columnsRef}
            className="grid min-w-0 flex-1"
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(${colMinWidth}px, 1fr))`,
              height: totalHeight,
            }}
          >
            {days.map((day, idx) => {
              const today = isToday(day);
              const dayEvents = eventsForDay(events, day);
              const laid = layoutDay(dayEvents);
              const showNowLine = showNow && today && nowMin >= 0 && nowMin <= MINUTES_IN_DAY;
              const nowTop = ((nowMin / 60) - startHour) * pixelsPerHour;
              return (
                <div
                  key={idx}
                  onPointerDown={startCreate(idx)}
                  className={`relative border-l border-slate-100 first:border-l-0 ${
                    today ? "bg-slate-50/40" : ""
                  }`}
                  style={{ height: totalHeight, touchAction: "none" }}
                >
                  {/* hour grid lines */}
                  {Array.from({ length: hours + 1 }).map((_, i) => (
                    <div
                      key={`h${i}`}
                      className="pointer-events-none absolute inset-x-0 border-t border-slate-100"
                      style={{ top: i * pixelsPerHour }}
                    />
                  ))}
                  {Array.from({ length: hours }).map((_, i) => (
                    <div
                      key={`half${i}`}
                      className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-100/70"
                      style={{ top: i * pixelsPerHour + pixelsPerHour / 2 }}
                    />
                  ))}

                  {/* events */}
                  {laid.map(({ event, col, cols }) => {
                    if (event.id === draggingId) return null;
                    const top = (event.startMinutes / 60 - startHour) * pixelsPerHour;
                    const height = Math.max(
                      ((event.endMinutes - event.startMinutes) / 60) * pixelsPerHour,
                      18
                    );
                    return (
                      <EventBlock
                        key={event.id}
                        ev={event}
                        top={top}
                        height={height}
                        col={col}
                        cols={cols}
                        compact={compact}
                        onPointerDownBody={startMove(event, idx)}
                        onResizeStart={(edge) => startResize(event, edge, idx)}
                        onComplete={(e) => {
                          e.stopPropagation();
                          onComplete(event.id, !event.completed);
                        }}
                      />
                    );
                  })}

                  {/* drag preview */}
                  {isPreviewCol(idx) && previewBlock && (
                    <div
                      className="pointer-events-none absolute inset-x-1 overflow-hidden rounded-[10px] border-2 border-dashed px-2 py-1 text-[11px] font-semibold shadow-lg"
                      style={{
                        top: previewBlock.top,
                        height: previewBlock.height,
                        backgroundColor: previewIsCreate ? "#f8fafc" : previewCat.bg,
                        borderColor: previewIsCreate ? "#94a3b8" : previewCat.accent,
                        color: previewIsCreate ? "#475569" : previewCat.text,
                      }}
                    >
                      <div className="truncate">{previewBlock.label}</div>
                      <div className="opacity-70">
                        {minutesToLabel(previewBlock.start)} – {minutesToLabel(previewBlock.end)}
                      </div>
                    </div>
                  )}

                  {/* now indicator */}
                  {showNowLine && nowTop >= 0 && nowTop <= totalHeight && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-20"
                      style={{ top: nowTop }}
                    >
                      <div className="relative">
                        <span className="absolute -left-1 -top-[5px] h-2.5 w-2.5 rounded-full bg-rose-500 shadow" />
                        <div className="h-[2px] w-full bg-rose-500" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
