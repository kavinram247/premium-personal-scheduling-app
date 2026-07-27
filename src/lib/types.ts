export type Priority = "none" | "low" | "medium" | "high";
export type Recurring = "none" | "daily" | "weekdays" | "weekly";
export type ViewMode = "day" | "week" | "weekend";

export interface PlannerEvent {
  id: string;
  title: string;
  notes: string | null;
  location: string | null;
  category: string;
  date: string; // YYYY-MM-DD anchor day
  startMinutes: number;
  endMinutes: number;
  priority: Priority;
  recurring: Recurring;
  reminderMinutes: number | null;
  completed: boolean;
  createdAt: string;
}

export type EventInput = Omit<
  PlannerEvent,
  "id" | "createdAt"
> & { id?: string };
