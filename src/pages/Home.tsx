import { Link } from "react-router-dom";
import ContactCta from "../components/ui/ContactCta";
import TiltCard from "../components/ui/TiltCard";
import { useDocumentMeta, SEO_CONFIG } from "../hooks/useDocumentMeta";

export default function Home() {
  useDocumentMeta(SEO_CONFIG.home);
  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-hero-grid p-6 shadow-2xl shadow-black/30 sm:p-10">
        <div className="pointer-events-none absolute -left-24 top-4 h-60 w-60 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex w-fit items-center gap-2 self-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 lg:self-start">
              Cloud & DevOps Engineer
              <span className="rounded-full bg-sky-500/20 px-2 py-1 text-[10px] font-semibold text-sky-100">
                Available
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl lg:text-[44px]">
                Building resilient cloud infrastructure that deploys as smoothly as it scales.
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-slate-300 lg:mx-0">
                I design highly available AWS architectures, automate deployments with CI/CD pipelines, and keep
                systems observable, secure, and ready to grow.
              </p>
            </div>
           
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
              <Link
                aria-label="View build gallery"
                to="/projects"
                className="w-full rounded-full bg-sky-500 px-5 py-3 text-center text-sm font-semibold text-[#050b16] shadow-glow-sky transition hover:-translate-y-[1px] sm:w-auto"
              >
                View Build Gallery
              </Link>
              <ContactCta className="w-full sm:w-auto">
                Let&apos;s talk about your project
              </ContactCta>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">About</p>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">My story & journey</h2>
          <p className="mt-4 text-slate-300">
            I&apos;m a senior Computer Science student at Cairo University (Class of 2026), majoring in Information
            Technology. I build scalable, secure systems across cloud infrastructure, automation, and networking—using
            AWS, Docker, Kubernetes, Ansible, Jenkins, and CI/CD pipelines. I recently completed a Cloud &amp; DevOps
            Engineer internship at Registfy, an AWS Premier Partner, where I designed Well-Architected AWS solutions and
            automated deployment workflows end to end.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 -mx-2 px-2 py-2">
            {[
              { title: "Reliability first", copy: "Designs fault-tolerant, highly available AWS architectures that hold up under real load." },
              { title: "Automate everything", copy: "Builds CI/CD pipelines and Infrastructure as Code so deployments are repeatable, not risky." },
              { title: "Always learning", copy: "Constantly leveling up across cloud, networking, and security—one cert and one build at a time." },
            ].map((value) => (
              <TiltCard key={value.title} className="p-4">
                <div className="text-sm font-semibold text-white">{value.title}</div>
                <p className="mt-2 text-sm text-slate-300">{value.copy}</p>
              </TiltCard>
            ))}
          </div>
        </div>
{/* 
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">What I love</p>
          <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">Craft, security, and delivery</h3>
          <div className="mt-5 space-y-4">
            {[
              { title: "Frontend", items: ["React", "TypeScript", "Tailwind", "UI/UX"] },
              { title: "Cybersecurity", items: ["Linux", "OSINT", "OWASP", "Scripting", "Network", "SysAdmin"] },
              { title: "DevOps", items: ["CI/CD", "Kubernetes", "Docker", "AWS", "Terraform", "Jenkins"] },
            ].map((group) => (
              <div key={group.title} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white">{group.title}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </section>

      <section className="py-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Explore the Studio</h2>
          <p className="mt-2 text-slate-400">Dive into my latest work and experiments.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 -mx-2 px-2 py-2">
          <Link to="/projects">
            <TiltCard className="group flex h-full min-h-[280px] flex-col justify-between p-8">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-sky-300">Build Gallery</h3>
                <p className="mt-2 h-20 text-slate-400">Full-stack applications, cloud architectures, and open-source tools.</p>
              </div>
              <div className="mt-4 flex items-center text-sm font-medium text-sky-500 opacity-60 transition-opacity group-hover:opacity-100">
                View Projects <span aria-hidden="true" className="ml-1">&rarr;</span>
              </div>
            </TiltCard>
          </Link>

          <Link to="/blog">
            <TiltCard className="group flex h-full min-h-[280px] flex-col justify-between p-8">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-purple-300">Blog</h3>
                <p className="mt-2 h-20 text-slate-400">Thoughts, tutorials, and behind-the-scenes notes from recent builds.</p>
              </div>
              <div className="mt-4 flex items-center text-sm font-medium text-purple-500 opacity-60 transition-opacity group-hover:opacity-100">
                Read Posts <span aria-hidden="true" className="ml-1">&rarr;</span>
              </div>
            </TiltCard>
          </Link>

          <Link to="/skills" className="sm:col-span-2 lg:col-span-1">
            <TiltCard className="group flex h-full min-h-[280px] flex-col justify-between p-8">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-emerald-300">Skills & Certifications</h3>
                <p className="mt-2 h-20 text-slate-400">Technical timeline, certifications, and digital badges.</p>
              </div>
              <div className="mt-4 flex items-center text-sm font-medium text-emerald-500 opacity-60 transition-opacity group-hover:opacity-100">
                Explore Timeline <span aria-hidden="true" className="ml-1">&rarr;</span>
              </div>
            </TiltCard>
          </Link>
        </div>
      </section>
    </div>
  );
}
