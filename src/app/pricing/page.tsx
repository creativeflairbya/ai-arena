"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Shield, Sparkles, Wallet, Building2, CreditCard, ChevronRight } from "lucide-react";
import { PLANS, PAKISTAN_METHODS, INTERNATIONAL_METHODS, type PlanKey } from "@/lib/plans";

interface Me {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "studio" | "enterprise";
  role: "master" | "admin" | "user";
}

type MethodKey = "stripe" | "jazzcash" | "easypaisa" | "bank_transfer" | "manual";

export default function PricingPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [selected, setSelected] = useState<PlanKey>("pro");
  const [method, setMethod] = useState<MethodKey>("stripe");
  const [reference, setReference] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message?: string; instructions?: { title: string; details: string[] } | null; transaction?: { id: string; status: string } } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user));
  }, []);

  const plan = PLANS.find((p) => p.key === selected) ?? PLANS[0];
  const isLocal = method === "jazzcash" || method === "easypaisa" || method === "bank_transfer";

  function checkout() {
    setResult(null);
    if (!me) {
      router.push("/login?next=/pricing");
      return;
    }
    if (me.role === "master" || me.role === "admin") {
      setResult({ ok: false, message: "Master accounts already have unlimited access." });
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected, method, reference, proofNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? "Checkout failed" });
        return;
      }
      setResult({ ok: true, instructions: data.instructions, transaction: data.transaction });
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="tag mx-auto w-fit">
          <Sparkles className="h-3 w-3" /> Pricing
        </div>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          Start free, <span className="gradient-text">scale when ready</span>
        </h1>
        <p className="mt-3 text-white/70">
          Pay in PKR with JazzCash, EasyPaisa, or bank transfer — or use an international card via Stripe.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const current = me?.plan === p.key;
          return (
            <div
              key={p.key}
              className={`relative glass rounded-2xl p-6 ${p.highlight ? "ring-2 ring-violet-400/60" : ""}`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold">
                  {p.badge}
                </span>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-white/60">{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-bold">Rs. {p.pkrPrice.toLocaleString()}</span>
                <span className="text-sm text-white/50">/mo</span>
              </div>
              <div className="text-xs text-white/50">
                ${p.usdPrice} USD / mo · {p.monthlyCredits.toLocaleString()} credits
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-white/80">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelected(p.key)}
                className={`mt-6 w-full ${
                  p.highlight ? "btn-primary" : "btn-ghost"
                }`}
              >
                {current ? "Current plan" : p.pkrPrice === 0 ? "Stay on Free" : "Choose " + p.name}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="glass rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5" /> Checkout
          </h3>
          <p className="mt-1 text-sm text-white/60">
            You're subscribing to{" "}
            <span className="font-semibold text-white">{plan.name}</span> for{" "}
            <span className="font-mono">Rs. {plan.pkrPrice.toLocaleString()}</span> / month.
          </p>

          <div className="mt-5">
            <label className="label">Payment method</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {INTERNATIONAL_METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key === "stripe_paypal" ? "stripe" : (m.key as MethodKey))}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${
                    method === "stripe"
                      ? "border-violet-400/60 bg-violet-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-white/50">{m.description}</div>
                  </div>
                </button>
              ))}
              {PAKISTAN_METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key as MethodKey)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${
                    method === m.key
                      ? "border-violet-400/60 bg-violet-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300 font-bold">
                    {m.icon}
                  </span>
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-white/50">{m.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isLocal && (
            <div className="mt-5 space-y-3">
              <div>
                <label className="label">Transaction reference / TID</label>
                <input
                  className="input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. 8XY1234ABC"
                />
              </div>
              <div>
                <label className="label">Note (optional)</label>
                <textarea
                  className="textarea"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="Your account number, screenshot reference..."
                />
              </div>
            </div>
          )}

          {result && (
            <div
              className={`mt-5 rounded-xl border p-4 text-sm ${
                result.ok
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                  : "border-red-500/30 bg-red-500/10 text-red-100"
              }`}
            >
              {result.ok ? (
                <>
                  <p className="font-semibold">Order placed! Transaction: {result.transaction?.id}</p>
                  {result.instructions && (
                    <div className="mt-2">
                      <p className="font-medium text-white">{result.instructions.title}</p>
                      <ul className="mt-1 list-disc pl-5 text-white/80">
                        {result.instructions.details.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p>{result.message}</p>
              )}
            </div>
          )}

          <button
            onClick={checkout}
            disabled={pending || plan.pkrPrice === 0}
            className="btn-primary mt-6 w-full"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                Continue with{" "}
                {isLocal
                  ? PAKISTAN_METHODS.find((m) => m.key === method)?.name ?? "Local"
                  : "Card / PayPal"}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
          {!me && (
            <p className="mt-3 text-center text-xs text-white/50">
              You'll be asked to sign in first.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Wallet className="h-5 w-5" /> Pakistan local payments
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Pay in PKR with the methods you already use. Submit your reference
              and our team will confirm within minutes (often instantly).
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>• JazzCash — mobile wallet transfer</li>
              <li>• EasyPaisa — mobile wallet transfer</li>
              <li>• Bank transfer — HBL, Meezan, UBL, MCB & more</li>
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" /> International billing
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Pay with Visa, Mastercard, Amex or PayPal via Stripe. Your
              subscription activates instantly and credits are added in real-time.
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CreditCard className="h-5 w-5" /> Need an invoice?
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Every payment generates a tax invoice (FBR compliant for
              Pakistani customers). Manage all your receipts from your{" "}
              <Link href="/account" className="text-fuchsia-300 hover:underline">
                account page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
