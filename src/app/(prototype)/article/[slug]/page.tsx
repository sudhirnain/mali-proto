"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

/**
 * Article reader — the target of every "Read more" link (Jonas round-2 "Show
 * how we display an article"). Mirrors the production article screen: hero
 * illustration bleeding to the top of the phone, white sheet with serif title
 * and short sections. Tinted-top page: bleeds to top:0, hero owns the
 * status-bar clearance.
 */
export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const article = ARTICLES[params.slug];

  if (!article) {
    return (
      <div className="p-6 md:pt-16">
        <h1 className="text-xl font-semibold">Article not found</h1>
        <Link href="/feed" className="text-[var(--color-primary)] underline text-sm mt-2 inline-block">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white pb-16">
      {/* Hero — soft tinted block, illustration contained (cartoons crop badly) */}
      <div
        className="relative h-60 md:h-64 flex items-end justify-center"
        style={{ background: article.heroBg }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="absolute left-3 top-3 md:top-[52px] w-9 h-9 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-neutral-800 active:scale-95 transition"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <Image
          src={article.hero}
          alt=""
          width={200}
          height={200}
          className="object-contain max-h-[70%] w-auto mb-4"
          priority
        />
      </div>

      {/* Content sheet overlapping the hero */}
      <div className="relative -mt-5 bg-white rounded-t-3xl px-5 pt-6">
        <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[var(--color-primary-dark)]">
          {article.eyebrow}
        </div>
        <h1 className="serif text-[26px] font-semibold text-neutral-900 leading-tight tracking-tight mt-1.5">
          {article.title}
        </h1>
        <div className="text-xs text-neutral-500 mt-2">{article.minutes} min read · Mali</div>

        <div className="mt-5 space-y-4">
          {article.body.map((para, i) => (
            <p key={i} className="text-[15px] text-neutral-700 leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {article.source && (
          <p className="text-xs text-neutral-400 mt-6 pb-2 border-t border-neutral-100 pt-4">
            Source: {article.source}
          </p>
        )}
      </div>
    </div>
  );
}
