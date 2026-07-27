import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your Account</h1>
          <p className="mt-1 text-sm text-slate-400">Start organizing your day, week, and weekend</p>
        </div>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </div>
    </main>
  );
}
