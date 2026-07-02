import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";
import { Sparkles, Video, Image as ImageIcon, Wand2, Zap, ShieldCheck, Globe, Star, ArrowRight, Cpu, Layers } from "lucide-react";
import ExploreGrid from "@/components/ExploreGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Touch the DB so any health check sees a successful query
  await db.execute(sql`select 1`);

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0 -z-10 opacity-70" />
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="tag mx-auto w-fit">
              <Sparkles className="h-3 w-3" />
              New · Veo 2 · Seedance · Kling — all in one studio
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              The <span className="gradient-text">unlimited</span> AI studio for video & image
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
              Generate cinematic videos, 4K images and motion graphics with the
              world's best models — no API keys, no setup. Free tier included,
              with a paid plan when you scale.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn-primary w-full sm:w-auto">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/studio" className="btn-ghost w-full sm:w-auto">
                Open the studio
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> No API key required</span>
              <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Pakistan & global billing</span>
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> Free 50 credits/mo</span>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Video, label: "Text → Video", color: "from-violet-500 to-fuchsia-500" },
              { icon: ImageIcon, label: "Text → Image", color: "from-fuchsia-500 to-pink-500" },
              { icon: Wand2, label: "Image → Video", color: "from-cyan-500 to-blue-500" },
              { icon: Layers, label: "Enhance & Upscale", color: "from-amber-500 to-orange-500" },
            ].map((t) => (
              <div
                key={t.label}
                className="glass rounded-2xl p-4 text-center"
              >
                <div className={`mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${t.color}`}>
                  <t.icon className="h-5 w-5 text-white" />
                </div>
                <p className="mt-2 text-sm font-medium text-white">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need to <span className="gradient-text">create</span>
          </h2>
          <p className="mt-3 text-white/60">
            One studio. Every model. Every workflow. No juggling API keys.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Cpu, title: "Best-in-class models", text: "Veo 2 for cinematic, Seedance for motion, Kling for realism, plus our in-house Arena Pro model." },
            { icon: Zap, title: "Blazing fast queue", text: "Smart GPU routing gives you the fastest path for every request, every time." },
            { icon: Wand2, title: "Image → Video", text: "Upload a single frame and watch it come alive with our 6-credit i2v engine." },
            { icon: ShieldCheck, title: "Private & secure", text: "Your prompts and media are encrypted at rest. You own everything you create." },
            { icon: Globe, title: "Built for Pakistan", text: "Pay in PKR with JazzCash, EasyPaisa, or any Pakistani bank. International cards welcome too." },
            { icon: Layers, title: "Bulk generation", text: "Generate variations in a single click. Pick the best take and ship." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 transition hover:bg-white/[0.06]">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-fuchsia-300">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-white/60">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="models" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Pick the <span className="gradient-text">perfect model</span>
          </h2>
          <p className="mt-3 text-white/60">
            Switch between models in a click. Each model has its own vibe.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Veo 2", tag: "Google DeepMind", desc: "Cinematic realism, 1080p video, top-tier physics." },
            { name: "Seedance", tag: "ByteDance", desc: "Snappy motion, great for ads, reels and dance clips." },
            { name: "Kling 1.6", tag: "Kuaishou", desc: "Photoreal people, complex choreography, multi-shot." },
            { name: "Arena Pro", tag: "In-house", desc: "Our optimized multi-model blend. Free with every plan." },
          ].map((m) => (
            <div key={m.name} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{m.name}</h3>
                <span className="tag-cyan tag">{m.tag}</span>
              </div>
              <p className="mt-2 text-sm text-white/60">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Latest from the <span className="gradient-text">community</span></h2>
            <p className="mt-2 text-white/60">Fresh creations from Arena.ai creators around the world.</p>
          </div>
          <Link href="/explore" className="hidden text-sm text-fuchsia-300 hover:underline sm:block">View all →</Link>
        </div>
        <ExploreGrid />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass overflow-hidden rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to make something <span className="gradient-text">incredible</span>?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Join 12,000+ creators, marketers and studios using Arena.ai to ship
            campaigns in hours, not weeks.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary w-full sm:w-auto">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-ghost w-full sm:w-auto">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
