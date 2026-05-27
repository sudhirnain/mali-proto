"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Gift,
  Heart,
  Notepad,
  Ticket,
  DotsThree,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

type Tab = {
  href: string;
  label: string;
  icon: PhosphorIcon;
  disabled?: boolean;
};

const TABS: Tab[] = [
  { href: "/feed",        label: "Feed",     icon: House    },
  { href: "/shop",        label: "Shop",     icon: Gift,    disabled: true },
  { href: "/care-center", label: "Care",     icon: Heart,   disabled: true },
  { href: "/journal",     label: "Journal",  icon: Notepad  },
  { href: "/deals",       label: "Deals",    icon: Ticket,  disabled: true },
  { href: "/more",        label: "More",     icon: DotsThree, disabled: true },
];

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 inset-x-0 bg-white border-t border-neutral-200 pb-[env(safe-area-inset-bottom)] z-30">
      <ul className="flex items-stretch justify-between px-4 pt-2 pb-2">
        {TABS.map((t) => {
          const active = !t.disabled && (pathname === t.href || pathname.startsWith(t.href + "/"));
          const Icon = t.icon;

          // All tabs render at identical size + treatment; out-of-scope tabs
          // simply don't navigate (rendered as <span>) so we don't introduce a
          // visible "this is a stub" affordance. Only the active tab gets the
          // primary-color highlight; everyone else reads as neutral chrome.
          const className = `flex flex-col items-center gap-1 py-1 text-xs select-none ${
            active
              ? "text-[var(--color-primary)] font-semibold"
              : "text-neutral-400 font-normal"
          }`;
          const iconNode = <Icon size={24} weight={active ? "fill" : "regular"} />;
          const content = (
            <>
              {iconNode}
              <span>{t.label}</span>
            </>
          );

          return (
            <li key={t.href} className="flex-1">
              {t.disabled ? (
                <span className={`${className} cursor-default`}>{content}</span>
              ) : (
                <Link href={t.href} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
