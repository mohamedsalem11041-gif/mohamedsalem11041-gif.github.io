import { Link } from "react-router-dom";
import ContactCta from "../components/ui/ContactCta";
import { useDocumentMeta, SEO_CONFIG } from "../hooks/useDocumentMeta";

export default function NotFound() {
  useDocumentMeta(SEO_CONFIG.notFound);
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <section className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-hero-grid p-6 text-center shadow-2xl shadow-black/30 sm:p-10">
        <div className="pointer-events-none absolute -left-24 top-6 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-8 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            404
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
              Hmm... I guess you&apos;re lost
            </h1>
            <p className="text-base text-slate-300">
              This route ghosted us. Let&apos;s get you back on track.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-[#050b16] shadow-glow-sky transition hover:-translate-y-[1px]"
            >
              Back to Home
            </Link>
            <ContactCta className="w-full sm:w-auto">
              Let&apos;s Collaborate
            </ContactCta>
          </div>
        </div>
      </section>
    </div>
  );
}
