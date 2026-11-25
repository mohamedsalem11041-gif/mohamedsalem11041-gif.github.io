import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import ContactCta from "./ui/ContactCta";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Build Gallery" },
  // { to: "/studio", label: "Creative Studio" }, // Hidden for now
  { to: "/skills", label: "Skills" },
  { to: "/blog", label: "Blog" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-4 z-20 mb-6 rounded-2xl border border-white/10 bg-[#0b1224]/70 px-4 py-2 shadow-glow-sky backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="flex min-h-[40px] items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-white">
            <img
              src="/android-chrome-192x192.png"
              alt="Mohamed Salem"
              className="h-9 w-9"
            />
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
      
            </p>
            <p className="text-base font-semibold text-slate-100">
              Mohamed <span className="hidden sm:inline">Salem</span>
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "rounded-full px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ContactCta className="text-sm">
            <span className="block md:hidden">Contact</span>
            <span className="hidden md:block">Let&apos;s Collaborate</span>
          </ContactCta>
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 md:hidden"
          >
            <span className="sr-only">Toggle navigation menu</span>
            <span className="relative block h-4 w-5">
              <span
                className={[
                  "absolute left-0 top-0 h-[2px] w-full rounded-full bg-current transition",
                  isOpen ? "translate-y-[7px] rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute left-0 top-[7px] h-[2px] w-full rounded-full bg-current transition",
                  isOpen ? "opacity-0" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute left-0 bottom-0 h-[2px] w-full rounded-full bg-current transition",
                  isOpen ? "-translate-y-[7px] -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={[
          "overflow-hidden rounded-xl border border-white/10 bg-[#0a1222]/90 text-sm shadow-glow-sky backdrop-blur transition-all duration-200 ease-out will-change-transform md:hidden",
          isOpen
            ? "mt-3 max-h-80 translate-y-0 scale-100 opacity-100"
            : "max-h-0 -translate-y-2 scale-95 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="flex flex-col gap-2 p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                [
                  "rounded-lg px-3 py-2 font-medium transition",
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
