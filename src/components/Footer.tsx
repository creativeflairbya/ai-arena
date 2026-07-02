import Link from "next/link";
import { Sparkles, Send, Globe, Briefcase, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5 bg-black/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Arena<span className="gradient-text">.ai</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              Unlimited AI video, image, and creative tools — powered by Veo,
              Seedance, Kling and our own in-house models. No API keys required.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:text-white"
                aria-label="X / Twitter"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:text-white"
                aria-label="Website"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:text-white"
                aria-label="Careers"
              >
                <Briefcase className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@arena.ai"
                className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><Link href="/studio" className="hover:text-white">Studio</Link></li>
              <li><Link href="/explore" className="hover:text-white">Explore</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/#models" className="hover:text-white">Models</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><Link href="#" className="hover:text-white">About</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
              <li><Link href="#" className="hover:text-white">Blog</Link></li>
              <li><Link href="#" className="hover:text-white">Press kit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Support</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><Link href="#" className="hover:text-white">Help center</Link></li>
              <li><Link href="#" className="hover:text-white">Terms</Link></li>
              <li><Link href="#" className="hover:text-white">Privacy</Link></li>
              <li><Link href="#" className="hover:text-white">Status</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Arena AI. All rights reserved.</p>
          <p>Built with Veo · Seedance · Kling · and a lot of GPU love.</p>
        </div>
      </div>
    </footer>
  );
}
