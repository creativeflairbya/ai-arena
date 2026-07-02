"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Image as ImageIcon, Sparkles } from "lucide-react";

interface ExploreItem {
  id: string;
  type: string;
  model: string;
  prompt: string;
  outputUrl: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export default function ExplorePage() {
  const [items, setItems] = useState<ExploreItem[] | null>(null);

  useEffect(() => {
    fetch("/api/explore")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="tag w-fit">
          <Sparkles className="h-3 w-3" /> Community
        </div>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Explore the <span className="gradient-text">community feed</span>
        </h1>
        <p className="mt-2 text-white/60">
          Fresh generations from Arena.ai creators. Get inspired, remix a prompt, ship faster.
        </p>
      </div>

      {!items ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="shimmer aspect-video rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-white/60">No public generations yet. Be the first!</p>
          <Link href="/studio" className="btn-primary mt-4">
            Open the studio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="group glass relative overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-video w-full bg-black">
                {it.type === "text_to_image" ? (
                  <img src={it.outputUrl} alt={it.prompt} className="h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-900/30 via-black to-cyan-900/20">
                      <Play className="h-12 w-12 text-white/80" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </>
                )}
                <div className="absolute left-3 top-3">
                  {it.type === "text_to_image" ? (
                    <span className="tag-cyan tag"><ImageIcon className="h-3 w-3" /> Image</span>
                  ) : (
                    <span className="tag-pink tag"><Play className="h-3 w-3" /> Video</span>
                  )}
                </div>
                <div className="absolute right-3 top-3">
                  <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] text-white/80">{it.model}</span>
                </div>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-sm text-white/80">{it.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
