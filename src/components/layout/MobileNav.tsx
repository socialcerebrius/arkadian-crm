"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
  { href: "/", label: "Command Centre" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/leads", label: "Prospects" },
  { href: "/calls", label: "Calls" },
  { href: "/activities", label: "Activities" },
  { href: "/game", label: "Buyer Game" },
  { href: "/construction", label: "Construction" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="w-9 h-9 rounded-full border border-light-grey/70 text-white/70 hover:text-gold hover:bg-white/5 transition-colors"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm">Menu</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-navy/40"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-navy text-white border-r border-navy-light/50">
            <div className="h-16 px-5 flex items-center justify-between border-b border-navy-light/70">
              <div className="font-(--font-display) text-gold tracking-wide">
                The Arkadians
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <nav className="px-3 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="h-12 px-4 rounded-md flex items-center text-sm tracking-wide text-white/80 hover:bg-navy-light hover:text-white transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}

