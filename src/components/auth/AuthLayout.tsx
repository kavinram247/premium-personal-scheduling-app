"use client";

import Link from "next/link";

/*
 * AuthLayout — inspired by Linear / Vercel / Raycast auth screens.
 * Stripped of gradient orbs and fake mockups. Typography-driven,
 * restrained palette, one accent color, generous whitespace.
 */

export function AuthLayout({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "sign-in" | "sign-up";
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20">
      {/* Subtle top-edge light — one single design move */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* ─── LEFT: Brand + Copy ─── */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between px-16 py-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/90"
            >
              <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
              <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
            </svg>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-white/90">
              LifePlanner
            </span>
          </Link>

          {/* Central copy */}
          <div className="max-w-sm">
            <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.025em] text-white">
              Plan with
              <br />
              intention.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/40">
              A personal schedule built around your priorities —
              not the other way around.
            </p>

            {/* Minimal social proof / feature list */}
            <div className="mt-10 flex flex-col gap-3">
              {[
                "Day, week, and weekend views",
                "Private per-user data isolation",
                "Drag-to-schedule in seconds",
              ].map((line) => (
                <div key={line} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/50"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white/40">{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-[12px] text-white/20">
            &copy; {new Date().getFullYear()} LifePlanner
          </p>
        </div>

        {/* ─── RIGHT: Auth form ─── */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 lg:border-l lg:border-white/[0.06]">
          {/* Mobile logo */}
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/90"
            >
              <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
              <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
            </svg>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-white/90">
              LifePlanner
            </span>
          </Link>

          <div className="w-full max-w-[380px]">
            {/* Tabs */}
            <div className="mb-8 flex gap-1 rounded-lg bg-white/[0.04] p-1">
              <Link
                href="/sign-in"
                className={`flex-1 rounded-md py-2 text-center text-[13px] font-medium transition-all duration-150 ${
                  mode === "sign-in"
                    ? "bg-white/[0.09] text-white shadow-sm"
                    : "text-white/35 hover:text-white/55"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={`flex-1 rounded-md py-2 text-center text-[13px] font-medium transition-all duration-150 ${
                  mode === "sign-up"
                    ? "bg-white/[0.09] text-white shadow-sm"
                    : "text-white/35 hover:text-white/55"
                }`}
              >
                Create account
              </Link>
            </div>

            {/* Clerk form slot */}
            <div className="flex justify-center">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * Clerk appearance — dark, minimal, no gradients.
 * Inputs and buttons feel native to the page, not a Clerk embed.
 */
export const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "shadow-none w-full",
    card: "bg-transparent shadow-none border-none p-0 w-full gap-6",

    // Header
    headerTitle: "text-[20px] font-semibold text-white tracking-[-0.02em]",
    headerSubtitle: "text-[13px] text-white/35 mt-1 font-normal",

    // Social / OAuth buttons
    socialButtonsBlockButton:
      "bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 rounded-lg transition-colors duration-150 text-[13px] font-medium py-2.5",
    socialButtonsBlockButtonText: "text-white/80 text-[13px] font-medium",
    socialButtonsBlockButtonArrow: "text-white/30",

    // Divider
    dividerLine: "bg-white/[0.06]",
    dividerText: "text-white/25 text-[11px] uppercase tracking-[0.1em] font-medium",

    // Form fields
    formFieldLabel: "text-white/50 text-[12px] font-medium mb-1.5",
    formFieldInput:
      "bg-white/[0.04] border border-white/[0.08] focus:border-white/20 focus:ring-1 focus:ring-white/10 text-white rounded-lg text-[14px] px-3.5 py-2.5 transition-colors duration-150 font-normal placeholder:text-white/20",
    formFieldInputShowPasswordButton: "text-white/30 hover:text-white/50",

    // Primary button
    formButtonPrimary:
      "bg-white text-[#0a0a0b] hover:bg-white/90 font-semibold text-[13px] py-2.5 rounded-lg shadow-none transition-colors duration-150 w-full mt-1",

    // Links
    footerActionLink: "text-white/50 hover:text-white/70 font-medium text-[13px] transition-colors duration-150",

    // Identity preview
    identityPreviewText: "text-white/60 font-medium text-[13px]",
    identityPreviewEditButton: "text-white/40 hover:text-white/60",

    // Internal form header (verification step etc.)
    formHeaderTitle: "text-white font-semibold text-[17px] tracking-[-0.01em]",
    formHeaderSubtitle: "text-white/35 text-[13px] font-normal",

    // Alert
    alert: "bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[13px]",

    // Footer
    footer: "hidden",
  },
};
