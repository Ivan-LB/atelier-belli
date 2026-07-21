# Product

## Register

brand

## Users

Two audiences, one hierarchy (confirmed by Iván, 2026-07-04):

1. **Freelance clients** (primary) — local/regional business owners (Tijuana/MX,
   cross-border) evaluating whether to hire the studio for a website or app.
   Context: they arrived from Instagram, a referral, or a proposal link. They
   need to feel craft and trust fast, in Spanish or English.
2. **Tech hiring managers / recruiters** (strong secondary) — scanning for
   proof of real shipped work (iOS apps on the App Store, web platforms,
   AI-assisted systems). They give the Work section ~30 seconds; each case
   must be legible at a glance: what it is, what it's built with, what shipped.

## Product Purpose

The storefront of Atelier Belli — Iván Lorenzana's one-person studio — and the
living proof of his craft. Success = a client asks for a quote, or a hiring
manager opens a case study and the CV. The site itself is a work sample: if
the portfolio looks generic, it contradicts its own pitch.

## Brand Personality

**Editorial · cálido · audaz.** The base identity (Tijuana atelier, serif with
character, cream/turquoise, bilingual EN/es-MX) stays — but the dial moves
toward **bolder and more experimental** (Iván's explicit direction, 2026-07-04):
more visual risk, more expressive motion, more memorable moments. Confidence
of a studio that designs, not a template that hosts projects.

## Anti-references

- Template dev portfolios: uniform project-card grids, hero-metric blocks,
  "Hi, I'm X 👋" hero, skills-as-progress-bars.
- AI-slop landing grammar: gradient text, glassmorphism-by-default, tiny
  uppercase tracked eyebrows above every section, purple/blue gradients.
- Corporate-sober CV-site: stripping the warmth/character to look "serious".
- Anything that makes a visitor say "AI made that" — the site is the proof
  of taste; genericness is self-defeating.

## Design Principles

1. **The site IS the work sample.** Every surface must survive being judged
   as a deliverable by a paying client.
2. **Legible in 30 seconds, rich in 5 minutes.** Hiring managers skim; clients
   linger. Both paths must work — case cards scannable, case studies deep.
3. **Bold with craft.** Turn up motion, scale and risk — but every experiment
   honors reduced-motion, performance budgets, and the editorial base.
4. **Bilingual is first-class.** EN and es-MX ship together, always (dict
   parity is enforced by `pnpm verify:i18n`).
5. **Identity over trend.** The cream/turquoise + Fraunces system is committed
   brand identity — evolve it, never swap it for the aesthetic of the month.

## Accessibility & Inclusion

- WCAG AA: contrast ≥4.5:1 body text, visible focus states, keyboard path.
- `prefers-reduced-motion` alternative for every animation (repo rule).
- Explicit width/height on all imagery (CLS discipline, repo gotcha).
- Both themes (light/dark) and both locales must be equally polished.
