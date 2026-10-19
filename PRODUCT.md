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

**Preciso · tangible · seguro.** Owner decision, 2026-10-18: the name stays
Atelier Belli, but the workshop concept is retired (no "taller", no colophon,
no crafted-with-intention voice). The world is **objects**: a warm grey
ground, raised surfaces with tinted shadows, real device posters as things you
can pick up, amber reserved for interaction. Light is the default theme; dark
keeps the same type and layout. Archivo for display, Atkinson Hyperlegible for
text, Martian Mono for facts. Still bilingual EN/es-MX and still bold with
craft (Iván's 2026-07-04 direction), but the boldness now lives in type, scale
and a few authored moments (the Pull, house lights), not in ornament.

## Anti-references

- Template dev portfolios: uniform project-card grids, hero-metric blocks,
  "Hi, I'm X 👋" hero, skills-as-progress-bars.
- AI-slop landing grammar: gradient text, glassmorphism-by-default, tiny
  uppercase tracked eyebrows above every section, purple/blue gradients.
  (The rebrand removed our own eyebrows too.)
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
5. **Identity over trend.** The "objects" system (warm grey, raised surfaces,
   amber for interaction only, Archivo + Atkinson + Martian Mono, light by
   default) is the committed brand identity as of 2026-10-18. Evolve it, never
   swap it for the aesthetic of the month, and do not bring back the retired
   workshop language.

## Accessibility & Inclusion

- WCAG AA: contrast ≥4.5:1 body text, visible focus states, keyboard path.
- `prefers-reduced-motion` alternative for every animation (repo rule).
- Explicit width/height on all imagery (CLS discipline, repo gotcha).
- Both themes (light/dark) and both locales must be equally polished.
