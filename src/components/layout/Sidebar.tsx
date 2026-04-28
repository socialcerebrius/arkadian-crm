"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArkLogo } from "@/components/shared/ArkLogo";

type NavItem = {
  href: string;
  label: string;
};

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[280px] shrink-0 bg-white relative border-r border-light-grey">
      <div className="w-full flex flex-col h-full">
        <div className="h-20 px-6 flex items-center border-b border-light-grey">
          <div className="flex items-center gap-3">
            <ArkLogo className="h-8 w-auto" />
            <div className="leading-tight">
              <div className="font-(--font-display) tracking-wide text-navy text-base">
                The Arkadians
              </div>
              <div className="text-xs text-medium-grey tracking-wider">
                Private Registry
              </div>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "h-12 px-4 rounded-lg flex items-center text-sm tracking-wide transition-colors border border-transparent",
                  isActive
                    ? "bg-cream text-navy border-light-grey border-l-[3px] border-l-gold pl-[13px]"
                    : "text-medium-grey hover:bg-cream hover:text-navy",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-light-grey p-4">
          <div className="rounded-xl bg-cream/60 border border-light-grey p-4">
            <div className="text-sm text-navy font-medium">Ahmad Raza</div>
            <div className="text-xs text-medium-grey mt-0.5">Sales Manager</div>
            <button
              type="button"
              className="mt-3 text-xs text-gold hover:text-gold-dark transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

