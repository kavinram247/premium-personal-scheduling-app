"use client";

import { memo } from "react";
import type { PlannerEvent } from "@/lib/types";
import { getCategory, PRIORITIES } from "@/lib/categories";
import { minutesToLabel } from "@/lib/dateUtils";
import { IconBell, IconRefresh, IconMapPin, IconCheck } from "./icons";

interface EventBlockProps {
  ev: PlannerEvent;
  top: number;
  height: number;
  col: number;
  cols: number;
  compact?: boolean;
  isPreview?: boolean;
  onPointerDownBody: (e: React.PointerEvent) => void;
  onResizeStart: (edge: "start" | "end") => (e: React.PointerEvent) => void;
  onComplete: (e: React.MouseEvent) => void;
}

function EventBlockImpl({
  ev,
  top,
  height,
  col,
  cols,
  compact,
  isPreview,
  onPointerDownBody,
  onResizeStart,
  onComplete,
}: EventBlockProps) {
  const cat = getCategory(ev.category);
  const priority = PRIORITIES[ev.priority] ?? PRIORITIES.none;
  const showDetails = height > 46;
  const showTime = height > 34;
  const showResize = height > 28 && !compact;

  const left = `calc(${(col / cols) * 100}% + 2px)`;
  const width = `calc(${100 / cols}% - 4px)`;

  return (
    <div
      className={`absolute group ${isPreview ? "pointer-events-none" : ""}`}
      style={{ top, height, left, width }}
    >
      <div
        onPointerDown={onPointerDownBody}
        className={`absolute inset-0 cursor-grab overflow-hidden rounded-[10px] border-l-[3px] px-2 py-1 shadow-sm transition-shadow active:cursor-grabbing group-hover:shadow-md ${
          ev.completed ? "opacity-55" : ""
        }`}
        style={{
          backgroundColor: cat.bg,
          borderLeftColor: cat.accent,
          color: cat.text,
          boxShadow: isPreview ? `0 8px 24px ${cat.accent}40` : undefined,
        }}
      >
        {ev.priority !== "none" && (
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: priority.color }}
            title={`${priority.label} priority`}
          />
        )}

        <div className="flex items-start gap-1.5">
          <button
            type="button"
            aria-label={ev.completed ? "Mark incomplete" : "Mark complete"}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onComplete}
            className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition"
            style={{
              borderColor: ev.completed ? cat.accent : cat.text + "66",
              backgroundColor: ev.completed ? cat.accent : "transparent",
              color: "#fff",
            }}
          >
            {ev.completed && <IconCheck size={9} strokeWidth={2.5} />}
          </button>

          <div className="min-w-0 flex-1">
            <div
              className={`truncate text-[12px] font-semibold leading-tight ${
                ev.completed ? "line-through" : ""
              }`}
            >
              {ev.title}
            </div>
            {showTime && (
              <div className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] font-medium opacity-80">
                <span>
                  {minutesToLabel(ev.startMinutes)} – {minutesToLabel(ev.endMinutes)}
                </span>
                {(ev.reminderMinutes != null || ev.recurring !== "none") && showDetails && (
                  <span className="flex items-center gap-1">
                    {ev.reminderMinutes != null && <IconBell size={10} />}
                    {ev.recurring !== "none" && <IconRefresh size={10} />}
                  </span>
                )}
              </div>
            )}
            {showDetails && ev.location && (
              <div className="mt-0.5 flex items-center gap-1 truncate text-[10px] opacity-70">
                <IconMapPin size={10} />
                <span className="truncate">{ev.location}</span>
              </div>
            )}
          </div>
        </div>

        {showResize && !ev.completed && (
          <>
            <div
              onPointerDown={onResizeStart("start")}
              className="absolute inset-x-0 -top-0.5 z-10 h-2 cursor-ns-resize opacity-0 transition group-hover:opacity-100"
            />
            <div
              onPointerDown={onResizeStart("end")}
              className="absolute inset-x-0 -bottom-0.5 z-10 h-2 cursor-ns-resize opacity-0 transition group-hover:opacity-100"
            />
          </>
        )}
      </div>
    </div>
  );
}

export const EventBlock = memo(EventBlockImpl);
