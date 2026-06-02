import type { SVGProps } from "react";
import { MALI_ICON_SVG } from "@/lib/mali-icons";
import {
  // Activity / sleep / food (no Mali APK equivalents)
  Bed,
  Bathtub,
  BowlFood,
  BabyCarriage,
  BeerBottle,
  Flask,
  HandHeart,
  Cloud,
  // Growth — Ruler stays for length category (height key now = ic_growth_height)
  Scales,
  Ruler as PhRuler,
  // Health
  FirstAidKit,
  Syringe as PhSyringe,
  Thermometer as PhThermometer,
  Heartbeat,
  Pill as PhPill,
  // Mood
  Smiley,
  SmileyWink,
  SmileyMeh,
  SmileySad,
  SmileyXEyes,
  // Pregnancy
  Egg,
  Avocado,
  // Memories / utility
  NotePencil,
  ImageSquare,
  Baby,
  // Mascots (milestone tiles) — Phosphor fallback when no Mali sketch available
  PersonArmsSpread,
  PersonSimple,
  HandPalm,
  HandGrabbing,
  Hand,
  HandPointing,
  Eyes,
  Eye,
  ChatCircleText,
  ChatsCircle,
  HandWaving,
  ArrowsClockwise,
  Microphone,
  Question,
  type Icon as PhosphorIconComponent,
} from "@phosphor-icons/react";

/**
 * Icon registry — pure Phosphor at `weight="fill"` for impact at small sizes.
 *
 * Naming is Mali-domain (the value), the icon component is whatever Phosphor
 * provides that closest matches the concept. A few are deliberate stand-ins
 * because Phosphor doesn't ship a "nursing" or "diaper" glyph:
 *   nursing  → HandHeart  (the hand-cradle metaphor)
 *   diaper   → Cloud      (puff/clean — single-purpose glyph)
 *   pump     → Flask      (vessel)
 *   contraction → WaveSine (clinical labor-curve)
 *   head     → Person     (head-circumference proxy)
 */

type IconProps = SVGProps<SVGSVGElement> & { name: string };

/**
 * Phosphor fallbacks — only for icons NOT in MALI_ICON_SVG.
 * Mali APK now covers: contraction, kick, moms-club, community, chart,
 * settings, flag, quote, milestone, heart, camera, head, height, scale,
 * due-date, newborn, fetus, crawling, discussion, profile, guide, todo, more.
 */
const PHOSPHOR_MAP: Record<string, PhosphorIconComponent> = {
  // Activity / food (CDN-served in production — no APK equivalent)
  crib: Bed,
  bath: Bathtub,
  bowl: BowlFood,
  stroller: BabyCarriage,
  nursing: HandHeart,
  bottle: BeerBottle,
  pump: Flask,
  diaper: Cloud,

  // Growth — ruler stays for length category (scale/head/height now use Mali SVG).
  // "scale-outline" exposes the Phosphor scales glyph for places (like the
  // StatStrip side buttons) that need an outline style matching `ruler`.
  ruler: PhRuler,
  "scale-outline": Scales,

  // Health
  // FirstAidKit (not Stethoscope): at weight="fill" the stethoscope renders as a
  // thin line glyph next to chunky fills (smiley/bath/foot) — it made the
  // Right-now row read as two different icon languages.
  doctor: FirstAidKit,
  syringe: PhSyringe,
  thermometer: PhThermometer,
  "heart-pulse": Heartbeat,
  pill: PhPill,

  // Mood (no Mali SVGs for mood states)
  "mood-cheerful": SmileyWink,
  "mood-fine": SmileyMeh,
  "mood-sad": SmileySad,
  "mood-crying": SmileyXEyes,

  // Pregnancy decorative
  peapod: Egg,
  watermelon: Avocado,

  // Memories — note/picture stay Phosphor; camera/quote/flag now have Mali SVGs
  note: NotePencil,
  picture: ImageSquare,

  // Milestone mascots — Phosphor until Jonas exports per-milestone sketch set.
  // Each key is used by exactly one milestone where possible so tiles in a
  // bucket read as distinct glyphs at a glance.
  "baby-face": Baby,
  "mascot-arms-up": Smiley,         // smiles spontaneously
  "mascot-hands": HandPalm,         // sucks on hands
  "mascot-mirror": Eyes,            // pays attention to faces
  "mascot-tummy": PersonSimple,     // holds head up — full-body silhouette reads as "lifting"
  "mascot-coo": ChatCircleText,     // coos / gurgles
  "mascot-sit": PersonArmsSpread,   // sits without support
  "mascot-wave": HandWaving,        // waves bye-bye
  // Newly differentiated to avoid same-icon duplication across the 17 tiles
  "mascot-reach": HandGrabbing,     // reaches for toys
  "mascot-roll": ArrowsClockwise,   // rolls over
  "mascot-babble": ChatsCircle,     // babbles (multiple bubbles vs single)
  "mascot-mirror-self": Eye,        // recognizes themselves in mirror
  "mascot-name": Microphone,        // responds to name
  "mascot-stranger": Question,      // stranger anxiety
  "mascot-pincer": HandPointing,    // pincer grasp
  "mascot-laugh": Smiley,           // laughs out loud — let SmileyWink default carry
};

export function Illustration({ name, className, style }: IconProps) {
  // Prefer Mali production icons when available — they use currentColor fill.
  const mali = MALI_ICON_SVG[name];
  if (mali) {
    return (
      <svg
        viewBox={mali.viewBox}
        className={className}
        style={style}
        fill="currentColor"
        dangerouslySetInnerHTML={{ __html: mali.inner }}
      />
    );
  }

  const Ph = PHOSPHOR_MAP[name];
  if (!Ph) {
    // Last-resort placeholder — should never fire in practice.
    return (
      <svg viewBox="0 0 64 64" className={className} style={style} fill="currentColor">
        <circle cx="32" cy="32" r="14" />
      </svg>
    );
  }
  return <Ph className={className} style={style} weight="fill" />;
}
