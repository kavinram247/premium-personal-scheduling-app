export interface CategoryDef {
  key: string;
  label: string;
  accent: string; // strong accent (borders, dots)
  bg: string; // soft block background
  strong: string; // slightly stronger tint
  text: string; // readable text color
}

export const CATEGORIES: Record<string, CategoryDef> = {
  work: { key: "work", label: "Work", accent: "#3b82f6", bg: "#eff6ff", strong: "#dbeafe", text: "#1d4ed8" },
  meeting: { key: "meeting", label: "Meeting", accent: "#8b5cf6", bg: "#f5f3ff", strong: "#ede9fe", text: "#6d28d9" },
  exercise: { key: "exercise", label: "Exercise", accent: "#10b981", bg: "#ecfdf5", strong: "#d1fae5", text: "#047857" },
  meal: { key: "meal", label: "Meal", accent: "#f59e0b", bg: "#fffbeb", strong: "#fef3c7", text: "#b45309" },
  travel: { key: "travel", label: "Travel", accent: "#06b6d4", bg: "#ecfeff", strong: "#cffafe", text: "#0e7490" },
  personal: { key: "personal", label: "Personal", accent: "#f43f5e", bg: "#fff1f2", strong: "#ffe4e6", text: "#be123c" },
  break: { key: "break", label: "Break", accent: "#14b8a6", bg: "#f0fdfa", strong: "#ccfbf1", text: "#0f766e" },
  evening: { key: "evening", label: "Evening Routine", accent: "#6366f1", bg: "#eef2ff", strong: "#e0e7ff", text: "#4338ca" },
  sleep: { key: "sleep", label: "Sleep", accent: "#64748b", bg: "#f8fafc", strong: "#f1f5f9", text: "#334155" },
  errands: { key: "errands", label: "Errands", accent: "#f97316", bg: "#fff7ed", strong: "#ffedd5", text: "#c2410c" },
  family: { key: "family", label: "Family Time", accent: "#d946ef", bg: "#fdf4ff", strong: "#fae8ff", text: "#a21caf" },
  social: { key: "social", label: "Social", accent: "#ec4899", bg: "#fdf2f8", strong: "#fce7f3", text: "#be185d" },
  entertainment: { key: "entertainment", label: "Entertainment", accent: "#a855f7", bg: "#faf5ff", strong: "#f3e8ff", text: "#9333ea" },
  rest: { key: "rest", label: "Rest", accent: "#0ea5e9", bg: "#f0f9ff", strong: "#e0f2fe", text: "#0369a1" },
  outing: { key: "outing", label: "Outing", accent: "#84cc16", bg: "#f7fee7", strong: "#ecfccb", text: "#4d7c0f" },
  prep: { key: "prep", label: "Prep Next Week", accent: "#22c55e", bg: "#f0fdf4", strong: "#dcfce7", text: "#15803d" },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export function getCategory(key: string | null | undefined): CategoryDef {
  if (key && CATEGORIES[key]) return CATEGORIES[key];
  return CATEGORIES.work;
}

import type { Priority } from "./types";

export interface PriorityDef {
  key: Priority;
  label: string;
  color: string;
}

export const PRIORITIES: Record<Priority, PriorityDef> = {
  high: { key: "high", label: "High", color: "#ef4444" },
  medium: { key: "medium", label: "Medium", color: "#f59e0b" },
  low: { key: "low", label: "Low", color: "#3b82f6" },
  none: { key: "none", label: "None", color: "#94a3b8" },
};

export const PRIORITY_LIST = [
  PRIORITIES.high,
  PRIORITIES.medium,
  PRIORITIES.low,
  PRIORITIES.none,
];

export const RECURRING_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays (Mon–Fri)" },
  { value: "weekly", label: "Weekly" },
];

export const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "No reminder" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
];
