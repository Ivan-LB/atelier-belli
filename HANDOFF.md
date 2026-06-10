# HANDOFF — atelier-belli-portfolio
> Updated 2026-06-10 (sesión de imágenes reales de previews).
> Lee `CLAUDE.md` para el contexto estable; este archivo es el estado vivo.

## Estado: cases + previews reales en PR #27, listo para merge

Rama `feat/add-blip-briefmark-pass-cases`, PR #27 abierto hacia `develop`
(8 commits, `c6961db..f698919`). Incluye los 3 case studies nuevos
(BLIP 04, Briefmark 05, Pass 06) **y** la primera ola de screenshots
reales. Todo verificado: `tsc` limpio, `pnpm build` verde, smoke en
light/dark, EN/ES, 1440px y 414px.

### Qué cerró esta sesión (2026-06-10, local macOS)
- ✅ **`public/cases/` nuevo** — carpeta canónica para screenshots de
  proyectos: `blip-hero.webp`, `mezcal-hero.webp`, `mezcal-mobile.webp`
  (capturados corriendo BLIP en Vite y el export estático de
  destileria-lorenzana con Playwright + Chrome del sistema).
- ✅ **Modal previews reales** para blip y mezcal: img `.ab-browser-shot`
  dentro de `ab-browser-frame.has-shot` (16:10, width/height explícitos).
- ✅ **Vitrine**: la pieza de la destilería es ahora un combo responsive
  (`.ab-vit-web-combo`): browser 400×260 con el hero desktop + mini phone
  (102px) encimado con la captura móvil. Tilt/hover en el wrapper.
- ✅ **Fix Savely invisible**: los img de fingo/savely no declaraban
  dimensiones; el slot colapsaba a 0 de alto hasta que el PNG lazy
  pintaba. width/height explícitos en vitrine + modal (`5f8e600`).
- ✅ Gotcha nuevo `next-build-clobbers-dev-cache`: NUNCA `pnpm build` con
  un dev server vivo — comparten `.next` y el build corrompe los vendor
  chunks del dev. Recovery: kill dev → `rm -rf .next` → `pnpm dev`.
- ✅ `.claude/launch.json` con `autoPort: true` (el preview de Claude ya
  no choca con el dev server del usuario en :3000).
- (Sesión previa, mismo PR) Pass action disabled "Code coming soon"
  porque `loyalty-cards` es privado; falsa alarma del "chip flotante"
  corregida en docs (era el indicador dev de Next).

## Próximos pasos (en orden)
1. **Merge humano del PR #27 a `develop`**, luego release PR
   `develop` → `main` — idealmente revisar el deploy preview de Amplify
   antes (regla del repo). Amplify despliega solo en push a `main`.
2. **Imágenes pendientes que pone Iván en `public/cases/`** (Claude las
   cablea cuando estén):
   - `briefmark-hero.png` — screenshot iOS (simulador o device, vertical)
     → phone frame `ab-phone-img` como fingo/savely.
   - `pass-hero.png` — screenshot del pase abierto en Apple Wallet
     (cortadito-cafe o gymfit) → phone frame.
3. **PR de limpieza de CSS muerto**: el mock viejo de la vitrine quedó
   huérfano en `globals.css` (`.ab-vit-browser .scr`, `.nav-strip`,
   `.txt`, `.bottle-col`, `.ab-vit-bottle`); `.ab-mez-site` SIGUE viva
   (placeholders de briefmark/pass) — solo muere cuando lleguen sus
   imágenes reales. PR aparte, patrón `dead-deps-removal-dedicated-pr`.
4. (Opcional) Si `loyalty-cards` se hace público: restaurar en el case
   `pass` el href + `kind: "primary"` + `ext: true` + icono `external`,
   y el copy "View on GitHub" / "Ver en GitHub" en ambos JSON.
5. (Opcional) Decidir si BLIP entra a la vitrine del hero (hoy: Fingo,
   Savely, Destilería).
6. (Opcional) Cuando Briefmark salga al App Store: support page como las
   de fingo/savely (`SupportShell` + `support.briefmark` en messages).

## Notas de proceso (para la próxima sesión)
- Capturas de proyectos: `/tmp/shotkit/` tiene scripts Playwright
  (`playwright-core` + `channel: 'chrome'`, sin descargar browsers) —
  regenerable si /tmp se limpió. El sitio de la destilería necesita
  nudge de scroll para disparar sus reveals de IntersectionObserver;
  el preview MCP de Claude no rendea bien este homepage al scrollear
  (parallax/reveals) — verificar visuales con Playwright en viewport
  alto (1440×2400) y clip.
- Worktree vieja `affectionate-moore-aae644` (mayo, solo-merges) sigue
  borrable con `git worktree remove` cuando quieras.

## Contexto externo
- CV en `~/Projects/CV/ivanCV.yaml` lista estos 3 proyectos — mantener
  consistencia si cambias copy.
- Gotchas cross-proyecto: `~/.claude/knowledge/global-gotchas.md`.
- Website en CV: `https://atelierbelli.com`.
