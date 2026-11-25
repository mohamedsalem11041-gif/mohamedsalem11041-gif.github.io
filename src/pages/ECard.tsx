import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSettings } from "../services/settings";
import type { Settings } from "../services/settings";

export default function ECard() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const whatsappMessage = "I just got the number from the e-card!";
  const whatsapp = `https://wa.me/201121937626?text=${encodeURIComponent(whatsappMessage)}`;
  const linkedin = settings?.socials?.linkedin || "";
  const github = settings?.socials?.github || "";

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-10">
      <section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b1224]/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl spotlight-slow-a" />
        <div className="pointer-events-none absolute -bottom-12 right-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl spotlight-slow-b" />

        <div className="relative space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-white">
              <img
                src="/android-chrome-192x192.png"
                alt="Mohamed Salem"
                className="h-12 w-12"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Digital Card
              </p>
              <h1 className="text-xl font-semibold text-slate-100">
                Mohamed Salem
              </h1>
              <p className="text-sm text-slate-300">
                Cloud & DevOps Engineer
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
            Thanks for stopping by—here is the fastest way to connect and collaborate.
          
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 font-medium text-emerald-200 transition hover:border-emerald-400/60 hover:bg-emerald-500/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.92 11.92 0 0012.01 0C5.39 0 .02 5.37.02 11.98c0 2.11.55 4.17 1.6 6L0 24l6.2-1.62a11.94 11.94 0 005.8 1.48h.01c6.62 0 11.99-5.37 12-11.98 0-3.2-1.25-6.2-3.49-8.4zm-8.5 18.38a9.9 9.9 0 01-5.05-1.39l-.36-.22-3.68.96.98-3.58-.24-.37a9.93 9.93 0 01-1.52-5.29c0-5.48 4.47-9.94 9.97-9.94 2.66 0 5.16 1.04 7.03 2.91a9.88 9.88 0 012.91 7.02c0 5.48-4.47 9.94-9.96 9.94zm5.45-7.42c-.3-.15-1.76-.87-2.03-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.24-.24-.58-.49-.5-.68-.5h-.58c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.25 5.14 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 font-medium text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              LinkedIn
            </a>
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>

          <Link
            to="/"
            className="block w-full rounded-full bg-sky-500 px-5 py-3 text-center text-sm font-semibold text-[#050b16] shadow-glow-sky transition hover:-translate-y-[1px]"
          >
            Visit Full Portfolio
          </Link>
          <Link
            to="/contact"
            className="block w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-sky-400/60 hover:bg-white/10"
          >
            Send a DM
          </Link>
        </div>
      </section>
    </div>
  );
}
