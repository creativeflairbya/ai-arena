"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Wallet,
  Image as ImageIcon,
  Video as VideoIcon,
  Crown,
  CalendarClock,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
} from "lucide-react";

interface AccountData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    plan: string;
    credits: number;
    isUnlimited: boolean;
    avatarColor: string;
    createdAt: string;
  };
  recent: Array<{
    id: string;
    type: string;
    model: string;
    prompt: string;
    outputUrl: string | null;
    createdAt: string;
    creditsUsed: number;
  }>;
  transactions: Array<{
    id: string;
    plan: string;
    method: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: string;
  }>;
  subscriptions: Array<{
    id: string;
    plan: string;
    status: string;
    startedAt: string;
    expiresAt: string | null;
  }>;
  stats: { images: number; videos: number; creditsSpent: number };
}

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setError(d.error ?? "Failed to load");
          return;
        }
        setData(d);
      })
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Sign in required</h1>
        <p className="mt-2 text-white/60">{error}</p>
        <Link href="/login" className="btn-primary mt-6">Sign in</Link>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const u = data.user;
  const statusColor: Record<string, string> = {
    completed: "text-emerald-300",
    pending: "text-amber-300",
    failed: "text-red-300",
    refunded: "text-cyan-300",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl text-xl font-bold text-white"
            style={{ backgroundColor: u.avatarColor }}
          >
            {u.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{u.name}</h1>
              {u.role !== "user" && (
                <span className="tag-pink tag">
                  <Crown className="h-3 w-3" /> {u.role}
                </span>
              )}
            </div>
            <p className="text-sm text-white/60">{u.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/studio" className="btn-primary text-sm">
            <Sparkles className="h-4 w-4" /> Open studio
          </Link>
          {(u.role === "master" || u.role === "admin") && (
            <Link href="/admin" className="btn-ghost text-sm">
              Admin panel
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Sparkles className="h-4 w-4" />}
          label="Plan"
          value={
            <span className="capitalize">
              {u.plan} {u.isUnlimited && <span className="ml-1 text-fuchsia-300">∞</span>}
            </span>
          }
        />
        <Stat
          icon={<Wallet className="h-4 w-4" />}
          label="Credits"
          value={u.isUnlimited ? "∞ unlimited" : u.credits.toString()}
        />
        <Stat
          icon={<ImageIcon className="h-4 w-4" />}
          label="Images generated"
          value={data.stats.images.toString()}
        />
        <Stat
          icon={<VideoIcon className="h-4 w-4" />}
          label="Videos generated"
          value={data.stats.videos.toString()}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Recent generations</h2>
          {data.recent.length === 0 ? (
            <p className="mt-4 text-sm text-white/50">
              You haven't created anything yet.{" "}
              <Link href="/studio" className="text-fuchsia-300 hover:underline">
                Open the studio
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.recent.map((r) => (
                <div
                  key={r.id}
                  className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]"
                >
                  <div className="aspect-video w-full bg-black">
                    {r.type === "text_to_image" && r.outputUrl ? (
                      <img src={r.outputUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-700/30 to-fuchsia-700/30">
                        <VideoIcon className="h-6 w-6 text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-xs">
                    <p className="line-clamp-2 text-white/80">{r.prompt}</p>
                    <p className="mt-1 text-white/40">
                      {r.model} · −{r.creditsUsed}c
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Receipt className="h-4 w-4" /> Billing
            </h2>
            {data.transactions.length === 0 ? (
              <p className="mt-3 text-sm text-white/50">
                No transactions yet.{" "}
                <Link href="/pricing" className="text-fuchsia-300 hover:underline">
                  See pricing
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {data.transactions.slice(0, 6).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
                  >
                    <div>
                      <p className="font-medium capitalize text-white">{t.plan}</p>
                      <p className="text-xs text-white/40">
                        {t.method} · {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-white">
                        {t.currency} {(t.amount / 100).toLocaleString()}
                      </p>
                      <p className={`text-xs ${statusColor[t.status] ?? "text-white/40"}`}>
                        {t.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarClock className="h-4 w-4" /> Subscriptions
            </h2>
            {data.subscriptions.length === 0 ? (
              <p className="mt-3 text-sm text-white/50">No subscriptions yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {data.subscriptions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
                  >
                    <span className="capitalize">{s.plan}</span>
                    <span className="text-xs text-white/50">
                      {s.expiresAt ? `until ${new Date(s.expiresAt).toLocaleDateString()}` : "active"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs text-white/50">
        {icon} {label}
      </div>
      <div className="mt-1.5 text-lg font-semibold">{value}</div>
    </div>
  );
}
