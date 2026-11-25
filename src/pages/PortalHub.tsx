import { useEffect, useState } from "react";
import ContactForm from "../components/ui/ContactForm";
import TiltCard from "../components/ui/TiltCard";
import { fetchSettings } from "../services/settings";
import { useDocumentMeta, SEO_CONFIG } from "../hooks/useDocumentMeta";
import type { Settings } from "../services/settings";

const PortalHub = () => {
  useDocumentMeta(SEO_CONFIG.contact);
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-hero-grid p-6 shadow-2xl shadow-black/30 sm:p-10">
        <div className="pointer-events-none absolute -left-24 top-4 h-60 w-60 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Portal Hub
            {settings?.availability_status && (
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                {settings.availability_status}
              </span>
            )}
          </div>
          <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Let's Collaborate
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300 lg:mx-0">
            Have a project in mind or just want to discuss cloud architecture? I'm always open to new challenges and conversations.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
        {/* 1. Connect — Email, Resume, LinkedIn, GitHub (same width as Meet me) */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-white sm:mb-6 sm:text-2xl">Connect</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 -m-1 p-1">
              <TiltCard className="flex w-full flex-col justify-center gap-2 p-2 sm:gap-3 sm:p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 sm:h-10 sm:w-10">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white sm:text-lg">Email</h3>
                  <a href={`mailto:${settings?.socials?.email || "mohamedsalem11041@gmail.com"}`} className="block truncate text-sm text-slate-400 hover:text-sky-400 transition-colors sm:text-base">
                    {settings?.socials?.email || "mohamedsalem11041@gmail.com"}
                  </a>
                </div>
              </TiltCard>

              {settings?.cv_url && (
                <TiltCard className="flex w-full flex-col justify-center gap-2 p-2 sm:gap-3 sm:p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400 sm:h-10 sm:w-10">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white sm:text-lg">Resume</h3>
                    <a href={settings.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-pink-400 transition-colors sm:text-base">
                      Download CV
                    </a>
                  </div>
                </TiltCard>
              )}

              {settings?.socials?.linkedin && (
                <a href={settings.socials.linkedin} target="_blank" rel="noopener noreferrer" className="group block">
                  <TiltCard className="flex w-full flex-col justify-center gap-2 p-2 sm:gap-3 sm:p-3 hover:border-blue-500/50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 sm:h-10 sm:w-10">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white sm:text-lg">LinkedIn</h3>
                      <span className="text-sm text-slate-400 group-hover:text-blue-400 sm:text-base">View profile</span>
                    </div>
                  </TiltCard>
                </a>
              )}

              {settings?.socials?.github && (
                <a href={settings.socials.github} target="_blank" rel="noopener noreferrer" className="group block">
                  <TiltCard className="flex w-full flex-col justify-center gap-2 p-2 sm:gap-3 sm:p-3 hover:border-white/50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white sm:h-10 sm:w-10">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white sm:text-lg">GitHub</h3>
                      <span className="text-sm text-slate-400 group-hover:text-white/80 sm:text-base">View profile</span>
                    </div>
                  </TiltCard>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 2. Send a Message */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-white sm:mb-6 sm:text-2xl">Send a Message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default PortalHub;
