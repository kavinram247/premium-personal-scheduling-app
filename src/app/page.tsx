"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import PlannerApp from "@/components/planner/PlannerApp";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
      </div>
    );
  }

  if (isSignedIn) {
    return <PlannerApp />;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20">
      {/* Top-edge light */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* Nav */}
      <header className="mx-auto flex w-full max-w-[1080px] items-center justify-between px-6 pt-8 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
            <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
            <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
          </svg>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-white/80">
            LifePlanner
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/sign-in"
            className="text-[13px] font-medium text-white/40 hover:text-white/70 transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-[#0a0a0b] hover:bg-white/90 transition-colors duration-150"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1080px] px-6 pt-24 sm:pt-32 pb-20">
        <div className="max-w-2xl">
          <h1 className="text-[clamp(36px,5vw,56px)] font-semibold leading-[1.1] tracking-[-0.035em] text-white">
            Your time,
            <br />
            structured.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-[1.65] text-white/35">
            A personal planner that fits the way you actually work.
            Day view, week view, drag-to-schedule — no friction, no clutter.
          </p>
          <div className="mt-9 flex items-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-lg bg-white px-5 py-2.5 text-[14px] font-semibold text-[#0a0a0b] hover:bg-white/90 transition-colors duration-150"
            >
              Start for free
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white/50 hover:text-white/70 hover:border-white/[0.16] transition-colors duration-150"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="h-px bg-white/[0.06]" />
      </div>

      {/* Features — just text, no cards */}
      <section className="mx-auto max-w-[1080px] px-6 py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-16">
          <div>
            <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white/20">
              01
            </div>
            <h3 className="text-[15px] font-semibold text-white/80 leading-snug">
              Three views, one surface
            </h3>
            <p className="mt-2 text-[13px] leading-[1.65] text-white/30">
              Day, week, and weekend layouts — each with a time grid you can
              click or drag to create events in seconds.
            </p>
          </div>
          <div>
            <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white/20">
              02
            </div>
            <h3 className="text-[15px] font-semibold text-white/80 leading-snug">
              Your data, only yours
            </h3>
            <p className="mt-2 text-[13px] leading-[1.65] text-white/30">
              Every account is isolated at the database level.
              No shared calendars, no leaky permissions — just your schedule.
            </p>
          </div>
          <div>
            <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white/20">
              03
            </div>
            <h3 className="text-[15px] font-semibold text-white/80 leading-snug">
              Built to stay out of your way
            </h3>
            <p className="mt-2 text-[13px] leading-[1.65] text-white/30">
              Priorities, categories, reminders, free-time analytics —
              the tools are there when you need them, invisible when you don&apos;t.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="h-px bg-white/[0.06]" />
      </div>

      {/* CTA */}
      <section className="mx-auto max-w-[1080px] px-6 py-20 flex flex-col items-center text-center">
        <h2 className="text-[clamp(24px,3.5vw,36px)] font-semibold tracking-[-0.03em] text-white">
          Ready to take your time back?
        </h2>
        <p className="mt-3 text-[14px] text-white/30">
          Free to use. No credit card required.
        </p>
        <Link
          href="/sign-up"
          className="mt-8 rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0b] hover:bg-white/90 transition-colors duration-150"
        >
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-[1080px] px-6 pb-10 pt-6">
        <div className="h-px bg-white/[0.06] mb-6" />
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-white/15">
            &copy; {new Date().getFullYear()} LifePlanner
          </p>
          <div className="flex items-center gap-5">
            <Link href="/sign-in" className="text-[12px] text-white/20 hover:text-white/40 transition-colors duration-150">
              Sign in
            </Link>
            <Link href="/sign-up" className="text-[12px] text-white/20 hover:text-white/40 transition-colors duration-150">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
