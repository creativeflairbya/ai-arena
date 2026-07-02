"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Menu, X, Sparkles, LogOut, LayoutDashboard, ShieldCheck, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface HeaderProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: "master" | "admin" | "user";
    credits: number;
    isUnlimited: boolean;
    avatarColor: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [pending, startTransition] = useTransition();

  const nav = [
    { href: "/#features", label: "Features" },
    { href: "/#models", label: "Models" },
    { href: "/pricing", label: "Pricing" },
    { href: "/explore", label: "Explore" },
  ];

  async function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      setMenu(false);
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07070d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-lg shadow-fuchsia-500/30">
            <Sparkles className="h-5 w-5 text-white" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 opacity-30 blur-md" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Arena<span className="gradient-text">.ai</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "text-sm font-medium text-white/70 transition hover:text-white",
                pathname === n.href && "text-white",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/studio"
                className="btn-ghost text-sm"
                title="Open Studio"
              >
                <LayoutDashboard className="h-4 w-4" />
                Studio
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenu((s) => !s)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 text-sm transition hover:bg-white/10"
                >
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-white/80 sm:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/50" />
                </button>
                {menu && (
                  <div
                    className="glass absolute right-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-xl p-2"
                    onMouseLeave={() => setMenu(false)}
                  >
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="truncate text-xs text-white/50">{user.email}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-white/60">Credits</span>
                        <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-white">
                          {user.isUnlimited ? "∞ unlimited" : user.credits}
                        </span>
                      </div>
                      {user.role !== "user" && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-fuchsia-300">
                          <ShieldCheck className="h-3 w-3" />
                          {user.role}
                        </div>
                      )}
                    </div>
                    <div className="my-1 h-px bg-white/5" />
                    <Link
                      href="/account"
                      onClick={() => setMenu(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Account
                    </Link>
                    {(user.role === "master" || user.role === "admin") && (
                      <Link
                        href="/admin"
                        onClick={() => setMenu(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      disabled={pending}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      {pending ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen((s) => !s)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-[#07070d]/95 md:hidden">
          <div className="space-y-1 px-4 py-4">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-white/5" />
            {user ? (
              <>
                <Link
                  href="/studio"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  Studio
                </Link>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  Account
                </Link>
                {(user.role === "master" || user.role === "admin") && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={pending}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
