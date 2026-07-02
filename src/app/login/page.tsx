"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("master@arena.ai");
  const [password, setPassword] = useState("Master@2024!");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Login failed");
          return;
        }
        // Successful login: redirect to studio
        router.push("/studio");
        router.refresh();
      } catch (err) {
        setError("Network error — please try again.");
      }
    });
  }

  function fillMaster() {
    setEmail("master@arena.ai");
    setPassword("Master@2024!");
    setError(null);
  }

  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-10">
      <div className="hero-grid absolute inset-0 -z-10" />
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2">
        <div className="hidden flex-col justify-center lg:flex">
          <div className="tag mb-4 w-fit">
            <Sparkles className="h-3 w-3" /> Welcome back
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Sign in to <span className="gradient-text">Arena.ai</span>
          </h1>
          <p className="mt-3 max-w-md text-white/60">
            Pick up where you left off. Generate cinematic videos, 4K images and
            motion graphics with Veo, Seedance, Kling — no API key required.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/70">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5">🎬</div>
              <div>
                <p className="font-semibold text-white">Unlimited free tier</p>
                <p className="text-white/50">50 credits every month, forever.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5">⚡</div>
              <div>
                <p className="font-semibold text-white">One-click checkout</p>
                <p className="text-white/50">Stripe, JazzCash, EasyPaisa, bank transfer.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5">🔒</div>
              <div>
                <p className="font-semibold text-white">Private by default</p>
                <p className="text-white/50">Your prompts, your media, your data.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass w-full rounded-2xl p-6 sm:p-8">
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-bold">
              Sign in to <span className="gradient-text">Arena.ai</span>
            </h1>
          </div>
          <h2 className="hidden text-xl font-semibold lg:block">Sign in</h2>
          <p className="mt-1 text-sm text-white/60">
            New here?{" "}
            <Link href="/register" className="text-fuchsia-300 hover:underline">
              Create an account
            </Link>
            .
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>Sign in</>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-violet-200">
              <Shield className="h-4 w-4" />
              Master account pre-filled
            </div>
            <p className="mt-1 text-white/60">
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">master@arena.ai</code>
              {" / "}
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">Master@2024!</code>
              {" "}— unlimited credits.
            </p>
            <button
              type="button"
              onClick={fillMaster}
              className="mt-2 text-xs text-fuchsia-300 hover:underline"
            >
              Reset to master credentials →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
