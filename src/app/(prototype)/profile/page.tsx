"use client";

import Link from "next/link";
import { usePhase } from "@/lib/phase";
import { useBaby } from "@/lib/cold-mode";
import { Illustration } from "@/components/Illustration";

const SETTINGS_ROWS: { icon: string; label: string; href?: string }[] = [
  { icon: "settings",          label: "App settings"        },
  { icon: "due-date",          label: "Due date & milestones", href: "/journal/category/milestone" },
  { icon: "birth-certificate", label: "Birth certificate"   },
  { icon: "guide",             label: "Parenting guide"     },
  { icon: "care-team",         label: "Care team"           },
  { icon: "todo",              label: "To-do lists"         },
];

export default function ProfilePage() {
  const { phase } = usePhase();
  const baby = useBaby();

  return (
    <div className="pb-24 md:pt-11">
      <header className="px-5 pt-7 pb-6">
        <h1 className="serif text-[28px] font-semibold text-neutral-900 leading-none">Profile</h1>
      </header>

      {/* Baby / phase card */}
      <div className="mx-4 rounded-3xl p-5 flex items-center gap-4"
        style={{ backgroundColor: "var(--color-primary-softer)" }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          <Illustration name={phase === "pregnancy" ? "fetus" : "newborn"} className="w-8 h-8" />
        </div>
        <div>
          <div className="serif text-lg font-semibold text-neutral-900 leading-tight">{baby.name}</div>
          <div className="text-sm text-neutral-600 mt-0.5">{baby.ageLabel}</div>
          <div
            className="text-xs font-semibold mt-1"
            style={{ color: "var(--color-primary)" }}
          >
            {phase === "pregnancy" ? "Pregnancy" : "Parenting"}
          </div>
        </div>
      </div>

      {/* Settings rows — "Due date & milestones" navigates to the milestones
       *  browser; the rest are decorative for the prototype. */}
      <div className="mx-4 mt-4 bg-white rounded-3xl divide-y divide-neutral-100 shadow-sm">
        {SETTINGS_ROWS.map((row) => {
          const inner = (
            <>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--color-primary-softer)",
                  color: "var(--color-primary)",
                }}
              >
                <Illustration name={row.icon} className="w-5 h-5" />
              </div>
              <span className="flex-1 text-sm font-medium text-neutral-800 text-left">{row.label}</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </>
          );
          const rowClass =
            "w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-50 transition first:rounded-t-3xl last:rounded-b-3xl";
          return row.href ? (
            <Link key={row.label} href={row.href} className={rowClass}>
              {inner}
            </Link>
          ) : (
            <div key={row.label} className={rowClass} aria-disabled="true">
              {inner}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-neutral-400 mt-8">Mali v2.9.4</p>
    </div>
  );
}
