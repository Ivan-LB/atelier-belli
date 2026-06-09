# HANDOFF — atelier-belli-portfolio
> Updated 2026-06-09 (sesión de verificación + PR desde Claude Code local).
> Lee `CLAUDE.md` para el contexto estable; este archivo es el estado vivo.

## Estado: 3 case studies nuevos — verificados, en PR

BLIP (04), Briefmark (05) y Pass (06) están commiteados en la rama
`feat/add-blip-briefmark-pass-cases` con PR abierto hacia `develop`.
Pendiente: merge humano del PR, luego release PR `develop` → `main`
(Amplify despliega solo en push a `main`).

### Qué cerró esta sesión (2026-06-09, local macOS)
- ✅ `pnpm build` verde (15/15 páginas; mismo shape de rutas: solo el
  catch-all es dinámico). `tsc --noEmit` limpio.
- ✅ Smoke test en navegador: los 3 modals nuevos abren en `/en` y `/es`,
  light y dark. Sin errores de consola.
- ✅ Link de Pass resuelto: `github.com/Ivan-LB/loyalty-cards` es PRIVADO,
  así que la action quedó `primary disabled` + icono `clock` con copy
  "Code coming soon" / "Código próximamente". Si el repo se hace público,
  restaurar el href + `kind: "primary"` + `ext: true` + icono `external`.
- ✅ Pill del preview de BLIP acortado a "Al carrito" (el label largo
  desbordaba el círculo del placeholder).
- `.claude/worktrees/` agregado a `.gitignore` (queda una worktree vieja
  `affectionate-moore-aae644` de mayo, branch solo-merges, sin trabajo
  propio — borrable con `git worktree remove` cuando quieras).

### Hallazgo pre-existente (no tocado)
El chip flotante de marca ("N", abajo-izquierda) se encima al footer de
TODOS los case modals (también fingo/savely originales) — z-index del
float vs. el modal. No es de esta sesión; candidato para
`docs/opportunistic-improvements.md`.

## Próximos pasos (en orden)
1. Mergear el PR del feature a `develop`, luego release PR a `main` —
   idealmente revisar el deploy preview de Amplify antes.
2. Reemplazar los previews placeholder de blip/briefmark/pass:
   hoy reusan `ab-browser-frame` + `ab-mez-site`; meter screenshots reales
   en `public/` siguiendo el patrón `ab-phone-img` de fingo/savely
   (briefmark es iOS, le toca phone frame).
3. (Opcional) La vitrine del hero sigue mostrando solo las 3 piezas
   originales — decidir si BLIP merece entrar.
4. (Opcional) Cuando Briefmark salga al App Store: support page como las
   de fingo/savely (`SupportShell` + `support.briefmark` en messages).
5. (Opcional) Arreglar el overlap del chip flotante sobre los modals.

## Contexto externo
- CV actualizado en `~/Projects/CV/ivanCV.yaml` ya lista estos 3 proyectos —
  mantener consistencia si cambias copy.
- Gotchas cross-proyecto: `~/.claude/knowledge/global-gotchas.md`.
- Website en CV: `https://atelierbelli.com`.
