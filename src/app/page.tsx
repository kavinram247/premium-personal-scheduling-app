"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import PlannerApp from "@/components/planner/PlannerApp";
import { IconCalendar, IconClock, IconLeaf, IconSun } from "@/components/planner/icons";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Loading your planner...</span>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return <PlannerApp />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="relative overflow-hidden min-h-screen flex flex-col justify-between">
        {/* Background Gradient Orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="pointer-events-none absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[140px]" />

        {/* Navigation Bar */}
        <header className="relative z-10 mx-auto max-w-7xl w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
              <IconCalendar size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LifePlanner</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              Get Started Free
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 py-16 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md mb-8">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            Multi-Tenant Personal Scheduler Powered by Clerk & MongoDB
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
            Master your day, week, and weekend effortlessly.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
            A high-precision personal day & week planner built for focus. Track events, priorities, reminders, and free time with absolute data privacy.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 transition transform hover:-translate-y-0.5 text-center"
            >
              Start Planning Now
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto rounded-2xl border border-slate-800 bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-md transition text-center"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Feature Cards Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
                <IconSun size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Day & Week Views</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive time grid scheduling with drag-to-create and instant event previews.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                <IconLeaf size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Tenant Isolation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Powered by Clerk authentication & user-scoped MongoDB database storage.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 mb-4">
                <IconClock size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Free Time Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real-time analytics on available free time, high-priority deadlines, and categories.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500">
          LifePlanner App &copy; {new Date().getFullYear()} — Multi-tenant Scheduling App
        </footer>
      </div>
    </main>
  );
}
