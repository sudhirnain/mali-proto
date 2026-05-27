import Link from "next/link";
import { Illustration } from "./Illustration";

type Props = {
  icon?: string;
  title: string;
  subtitle?: string;
  cta?: { href: string; label: string };
};

/** Centered empty-state with a soft illustrated icon + message + optional CTA. */
export function EmptyState({ icon = "baby-face", title, subtitle, cta }: Props) {
  return (
    <div className="px-6 py-10 text-center">
      <div
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
        style={{
          backgroundColor: "var(--color-primary-softer)",
          color: "var(--color-primary)",
        }}
      >
        <Illustration name={icon} className="w-12 h-12" />
      </div>
      <div className="serif text-base font-semibold text-neutral-800">{title}</div>
      {subtitle && (
        <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{subtitle}</p>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="inline-block mt-4 text-sm font-semibold text-[var(--color-primary)]"
        >
          {cta.label} →
        </Link>
      )}
    </div>
  );
}
