const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/5 bg-[#050b16]/60 py-8 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-slate-200">Let&apos;s build something resilient.</p>
          <p className="text-xs text-slate-500">
            Powered by React, Tailwind, Supabase, and AWS S3.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a
            className="rounded-full border border-white/10 px-3 py-2 text-slate-200 transition hover:border-sky-500/60 hover:text-white"
            href="mailto:mohamedsalem11041@gmail.com"
          >
            Email
          </a>
          <a
            className="rounded-full border border-white/10 px-3 py-2 text-slate-200 transition hover:border-sky-500/60 hover:text-white"
            href="https://github.com/mohamedsalem11041-gif"
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
          </a>
          <a
            className="rounded-full border border-white/10 px-3 py-2 text-slate-200 transition hover:border-sky-500/60 hover:text-white"
            href="https://www.linkedin.com/in/REPLACE_WITH_YOUR_LINKEDIN_USERNAME"
            target="_blank"
            rel="noreferrer noopener"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
