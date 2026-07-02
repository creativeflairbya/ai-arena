"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Wand2,
  Sparkles,
  Loader2,
  Download,
  Save,
  Upload,
  X,
  Copy,
  Check,
  Crown,
  History,
  Settings2,
  Maximize2,
} from "lucide-react";

type GenerationKind = "text_to_image" | "text_to_video" | "image_to_video";
type Aspect = "16:9" | "9:16" | "1:1" | "4:3";
type Style = "cinematic" | "neon" | "anime" | "realistic" | "abstract" | "vintage";

const MODELS = [
  { key: "veo-2-pro", name: "Veo 2", vendor: "Google" },
  { key: "seedance-pro", name: "Seedance Pro", vendor: "ByteDance" },
  { key: "kling-1.6", name: "Kling 1.6", vendor: "Kuaishou" },
  { key: "arena-pro", name: "Arena Pro", vendor: "In-house" },
] as const;

const STYLES: Style[] = ["cinematic", "neon", "anime", "realistic", "abstract", "vintage"];
const ASPECTS: Aspect[] = ["16:9", "9:16", "1:1", "4:3"];

const COSTS: Record<GenerationKind, number> = {
  text_to_image: 1,
  text_to_video: 5,
  image_to_video: 6,
};

const TABS: { key: GenerationKind; label: string; icon: typeof ImageIcon; desc: string }[] = [
  { key: "text_to_image", label: "Image", icon: ImageIcon, desc: "Generate a stunning image from text." },
  { key: "text_to_video", label: "Text → Video", icon: VideoIcon, desc: "Bring a prompt to life as a video." },
  { key: "image_to_video", label: "Image → Video", icon: Wand2, desc: "Animate a single image into a clip." },
];

interface HistoryItem {
  id: string;
  type: GenerationKind;
  model: string;
  prompt: string;
  status: string;
  outputUrl: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  creditsUsed: number;
}

interface Props {
  user: {
    id: string;
    email: string;
    name: string;
    role: "master" | "admin" | "user";
    credits: number;
    isUnlimited: boolean;
    plan: "free" | "pro" | "studio" | "enterprise";
    avatarColor: string;
  };
}

export default function StudioClient({ user }: Props) {
  const [tab, setTab] = useState<GenerationKind>("text_to_image");
  const [prompt, setPrompt] = useState("a lone astronaut on a glass beach at sunset, cinematic, 8k");
  const [negative, setNegative] = useState("");
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [style, setStyle] = useState<Style>("cinematic");
  const [model, setModel] = useState<string>("veo-2-pro");
  const [duration, setDuration] = useState<number>(5);
  const [sourceImage, setSourceImage] = useState<string | null>(null);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; type: GenerationKind; meta: Record<string, unknown> | null } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [credits, setCredits] = useState<number>(user.credits);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(user.isUnlimited);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/generations")
      .then((r) => r.json())
      .then((d) => !cancelled && setHistory(d.items ?? []));
    return () => {
      cancelled = true;
    };
  }, [result]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(String(reader.result));
      setTab("image_to_video");
    };
    reader.readAsDataURL(f);
  }

  function generate() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const endpoint = tab === "text_to_image" ? "/api/generate/image" : "/api/generate/video";
        const body =
          tab === "text_to_image"
            ? { prompt, negative, aspect, style, model }
            : { prompt, negative, aspect, style, model, durationSec: duration, sourceImage, kind: tab };
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Generation failed");
          return;
        }
        setResult({ url: data.outputUrl, type: tab, meta: data.meta });
        if (typeof data.remainingCredits === "number" && data.remainingCredits !== -1) {
          setCredits(data.remainingCredits);
        }
        // Re-fetch history
        fetch("/api/generations").then((r) => r.json()).then((d) => setHistory(d.items ?? []));
      } catch {
        setError("Network error — please try again.");
      }
    });
  }

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function loadFromHistory(h: HistoryItem) {
    setPrompt(h.prompt);
    setTab(h.type);
    if (h.outputUrl) setResult({ url: h.outputUrl, type: h.type, meta: h.meta });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold sm:text-3xl">Studio</h1>
            {user.role === "master" && (
              <span className="tag-pink tag">
                <Crown className="h-3 w-3" /> Master
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/60">
            Bring your ideas to life in seconds. Pick a tool, type a prompt, hit generate.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-4 py-2 text-sm">
            <span className="text-white/50">Credits:</span>{" "}
            <span className="font-mono font-semibold text-white">
              {isUnlimited ? "∞ unlimited" : credits}
            </span>
          </div>
          {!isUnlimited && credits < 10 && (
            <Link href="/pricing" className="btn-primary text-sm">
              Top up
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="glass overflow-hidden rounded-2xl p-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    tab === t.key
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow"
                      : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 sm:p-6">
            <div className="grid gap-4">
              {tab === "image_to_video" && (
                <div>
                  <label className="label">Source image</label>
                  {!sourceImage ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-sm text-white/60 transition hover:border-violet-400/40 hover:bg-violet-500/5"
                    >
                      <Upload className="h-6 w-6" />
                      Click to upload an image
                      <span className="text-xs text-white/40">PNG, JPG, WEBP up to 10MB</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <img src={sourceImage} alt="Source" className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-white">Image ready</p>
                        <p className="text-xs text-white/50">Will be animated with your prompt</p>
                      </div>
                      <button
                        onClick={() => setSourceImage(null)}
                        className="rounded-lg p-1.5 text-white/60 hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </div>
              )}

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="label mb-0" htmlFor="prompt">
                    Prompt
                  </label>
                  <button
                    onClick={copyPrompt}
                    className="text-xs text-white/40 hover:text-white"
                    type="button"
                  >
                    {copied ? <Check className="inline h-3 w-3" /> : <Copy className="inline h-3 w-3" />}{" "}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create..."
                  className="textarea"
                />
              </div>

              <details className="rounded-xl border border-white/5 bg-black/20">
                <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-white/70">
                  <Settings2 className="h-4 w-4" /> Advanced settings
                </summary>
                <div className="space-y-4 px-4 pb-4">
                  <div>
                    <label className="label">Negative prompt (optional)</label>
                    <input
                      type="text"
                      value={negative}
                      onChange={(e) => setNegative(e.target.value)}
                      placeholder="blur, low quality, text..."
                      className="input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="label">Aspect</label>
                      <select
                        className="select"
                        value={aspect}
                        onChange={(e) => setAspect(e.target.value as Aspect)}
                      >
                        {ASPECTS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Style</label>
                      <select
                        className="select"
                        value={style}
                        onChange={(e) => setStyle(e.target.value as Style)}
                      >
                        {STYLES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    {tab !== "text_to_image" && (
                      <div>
                        <label className="label">Duration</label>
                        <select
                          className="select"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                        >
                          {[3, 5, 7, 8].map((d) => (
                            <option key={d} value={d}>
                              {d}s
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="col-span-2 sm:col-span-3">
                      <label className="label">Model</label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {MODELS.map((m) => (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => setModel(m.key)}
                            className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                              model === m.key
                                ? "border-violet-400/60 bg-violet-500/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="font-semibold text-white">{m.name}</div>
                            <div className="text-white/40">{m.vendor}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                <div className="text-xs text-white/50">
                  Cost:{" "}
                  <span className="font-mono text-white">{COSTS[tab]}</span>{" "}
                  credit{COSTS[tab] > 1 ? "s" : ""}
                </div>
                <button
                  onClick={generate}
                  disabled={pending || (!sourceImage && tab === "image_to_video") || !prompt.trim()}
                  className="btn-primary"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <h2 className="text-sm font-semibold text-white">Result</h2>
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewOpen(true)}
                    className="btn-ghost text-xs"
                  >
                    <Maximize2 className="h-3.5 w-3.5" /> Expand
                  </button>
                  <a
                    href={result.url}
                    download={`arena-${Date.now()}.${result.type === "text_to_image" ? "svg" : "html"}`}
                    className="btn-ghost text-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </div>
              )}
            </div>
            <div className="relative grid aspect-video place-items-center bg-black/40">
              {pending ? (
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-md" />
                  <p className="mt-3 text-sm text-white/60">
                    {result?.type === "text_to_image" ? "Painting pixels..." : "Rendering frames..."}
                  </p>
                </div>
              ) : result ? (
                result.type === "text_to_image" ? (
                  <img
                    src={result.url}
                    alt="Generated"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={result.url}
                    title="Generated video"
                    className="h-full w-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )
              ) : (
                <div className="text-center text-white/40">
                  <Sparkles className="mx-auto mb-2 h-10 w-10" />
                  <p className="text-sm">Your masterpiece will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <History className="h-4 w-4" /> Recent generations
            </h3>
            <div className="mt-4 space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-white/40">No history yet. Your generations will appear here.</p>
              ) : (
                history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => loadFromHistory(h)}
                    className="group flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2 text-left transition hover:border-violet-400/30 hover:bg-violet-500/5"
                  >
                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-black">
                      {h.type === "text_to_image" && h.outputUrl ? (
                        <img src={h.outputUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-700/30 to-fuchsia-700/30">
                          <VideoIcon className="h-4 w-4 text-white/60" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs text-white/80">{h.prompt}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
                        <span>{h.model}</span>
                        <span>·</span>
                        <span className="font-mono">−{h.creditsUsed}c</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 text-sm text-white/70">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4" /> Pro tips
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>• Be specific: "neon Tokyo street at 3am, rain, 35mm" beats "cool city".</li>
              <li>• Use the negative prompt to avoid blur, text or bad hands.</li>
              <li>• Switch models for different vibes — Veo for realism, Seedance for motion.</li>
              <li>• Tap a recent item to re-load its prompt and result.</li>
            </ul>
          </div>
        </aside>
      </div>

      {previewOpen && result && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
            {result.type === "text_to_image" ? (
              <img src={result.url} alt="Preview" className="max-h-[90vh] w-full object-contain" />
            ) : (
              <iframe
                src={result.url}
                title="Preview"
                className="h-[80vh] w-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
