import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Management — Personal Day & Week Planner",
  description:
    "A premium personal planner for your day, week and weekend. Drag-and-drop scheduling, recurring events, reminders, priorities and a live schedule.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
