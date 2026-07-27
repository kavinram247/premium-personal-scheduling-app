"use client";

import Link from "next/link";
import { IconCalendar, IconCheck, IconClock, IconSun } from "@/components/planner/icons";

export function AuthLayout({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "sign-in" | "sign-up";
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col lg:flex-row selection:bg-indigo-500 selection:text-white">
      {/* LEFT PANEL - Hero Branding & Dynamic Planner Showcase */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40">
        {/* Background Ambient Glow Orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/2 -right-24 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/25">
            <IconCalendar size={24} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">LifePlanner</span>
            <span className="ml-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
              Pro
            </span>
          </div>
        </div>

        {/* Interactive Mockup Preview Card */}
        <div className="relative z-10 my-auto py-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-xl shadow-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Multi-Tenant Personal Schedule
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Designed for high performers who value their time.
          </h2>

          {/* Floating UI Mock Cards */}
          <div className="mt-8 flex flex-col gap-3.5 max-w-lg">
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl transition hover:border-indigo-500/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-1.5 rounded-full bg-indigo-500" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Deep Work Sprint & Strategy</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <IconClock size={12} className="text-indigo-400" />
                      09:00 AM – 11:30 AM · Work
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/20">
                  High Priority
                </span>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl transition hover:border-emerald-500/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-1.5 rounded-full bg-emerald-500" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Outdoor Workout & Recovery</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <IconClock size={12} className="text-emerald-400" />
                      05:00 PM – 06:15 PM · Fitness
                    </p>
                  </div>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <IconCheck size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10 border-t border-slate-800/60 pt-6 flex items-center justify-between text-xs text-slate-400 font-medium">
          <p>&copy; {new Date().getFullYear()} LifePlanner — Engineered for Clarity</p>
          <div className="flex items-center gap-2">
            <IconSun size={14} className="text-amber-400" />
            <span>Smart Time Analytics</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Auth Form Container */}
      <div className="relative flex-1 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        {/* Background Ambient Glow */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-violet-600/15 blur-[120px]" />

        {/* Top Header for Mobile */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <IconCalendar size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LifePlanner</span>
        </div>

        {/* Auth Box Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Custom Tab Switcher */}
          <div className="mb-6 flex rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800/80 backdrop-blur-xl shadow-lg">
            <Link
              href="/sign-in"
              className={`flex-1 rounded-xl py-2.5 text-center text-xs font-bold transition duration-200 ${
                mode === "sign-in"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className={`flex-1 rounded-xl py-2.5 text-center text-xs font-bold transition duration-200 ${
                mode === "sign-up"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </Link>
          </div>

          {/* Form Children */}
          <div className="flex justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const clerkAppearance = {
  elements: {
    rootBox: "w-full flex justify-center",
    card: "bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-2xl rounded-3xl p-6 sm:p-8 w-full text-slate-100",
    headerTitle: "text-2xl font-extrabold text-white tracking-tight font-sans text-center",
    headerSubtitle: "text-slate-400 text-xs font-medium text-center mt-1",
    socialButtonsBlockButton:
      "bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl transition duration-200 font-semibold text-xs py-3 shadow-sm",
    socialButtonsBlockButtonText: "font-bold text-slate-200 text-xs",
    dividerLine: "bg-slate-800/80",
    dividerText: "text-slate-500 text-[11px] uppercase tracking-widest font-extrabold",
    formFieldLabel: "text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-1.5",
    formFieldInput:
      "bg-slate-950/80 border border-slate-800/90 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl text-sm px-4 py-3 transition duration-200 font-medium placeholder:text-slate-600",
    formButtonPrimary:
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition duration-200 transform hover:-translate-y-0.5 w-full mt-2",
    footerActionLink: "text-indigo-400 hover:text-indigo-300 font-bold text-xs transition",
    identityPreviewText: "text-slate-300 font-medium text-sm",
    formHeaderTitle: "text-white font-bold text-lg",
    formHeaderSubtitle: "text-slate-400 text-xs",
    footer: "hidden", // Clean look without bottom default footer
  },
};
