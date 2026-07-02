"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Play, Image as ImageIcon } from "lucide-react";

interface ExploreItem {
  id: string;
  type: "text_to_image" | "text_to_video" | "image_to_video" | "video_enhance" | "image_enhance";
  model: string;
  prompt: string;
  outputUrl: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export default function ExploreGrid() {
  const [items, setItems] = useState<ExploreItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/explore")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setItems(d.items ?? []);
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-white/60">
        {error}
      </div>
    );
  }
  if (!items) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="shimmer aspect-video rounded-2xl"
          />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <p className="text-white/60">
          No public generations yet.{" "}
          <Link href="/studio" className="text-fuchsia-300 hover:underline">
            Be the first to create →
          </Link>
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 9).map((it) => (
        <div
          key={it.id}
          className="group glass relative overflow-hidden rounded-2xl"
        >
          <div className="relative aspect-video w-full bg-black">
            {it.type === "text_to_image" ? (
              <img
                src={it.outputUrl}
                alt={it.prompt}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-900/30 via-black to-cyan-900/20">
                <div className="text-center">
                  <Play className="mx-auto h-10 w-10 text-white/80" />
                  <p className="mt-2 text-xs text-white/50">Video preview</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className="absolute left-3 top-3">
              {it.type === "text_to_image" ? (
                <span className="tag-cyan tag">
                  <ImageIcon className="h-3 w-3" /> Image
                </span>
              ) : (
                <span className="tag-pink tag">
                  <Play className="h-3 w-3" /> Video
                </span>
              )}
            </div>
            <div className="absolute right-3 top-3">
              <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] text-white/80">
                {it.model}
              </span>
            </div>
          </div>
          <div className="p-4">
            <p className="line-clamp-2 text-sm text-white/80">{it.prompt}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
