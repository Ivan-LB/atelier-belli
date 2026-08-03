# HANDOFF — atelier-belli-portfolio

> Updated **2026-08-03** (sesión larga: audit de UI completo + i18n sin prefijo
> + recapturas de media). Lee `CLAUDE.md` para el contexto estable; este archivo
> es el estado vivo.

## Estado: audit 40/41 cerrado. Queda UNA cosa: el clip de Vitapath (#6 + #30)

Todo lo demás está en `develop` o esperando merge en
[PR #47](https://github.com/Ivan-LB/atelier-belli/pull/47)
(rama `fix/demo-clip-recaptures`).

---

## Lo único pendiente: re-grabar `vitapath-system.mp4`

**El defecto (#6, P1, medido):** el pane del paramédico se queda en negro
**4.71 s a media reproducción** — 27% de cada loop — bajo un caption que afirma
"las tres superficies al mismo tiempo". El pane abre bien (solo 0.17 s de negro
inicial) y el póster está limpio; el hueco está a media reproducción. Causa: la
captura del paramédico en la toma original se cortó a media sesión.

**#30 se arregla dentro de la misma toma:** el clip expone la cuenta semilla
`admin1.fase10@example.com` en el topbar de la consola y un chip de debug
"Simulate movement" en la tarjeta de arribo.

### El entorno (hay que rearmarlo)

```bash
# 1. Backend + infra
cd ~/Projects/vitapath/backend-spring
open -a Docker; until docker info >/dev/null 2>&1; do sleep 2; done
docker compose start                          # postgres + minio + pgweb
docker compose --profile osrm up -d osrm      # rutas viales reales en :5001
ETA_PROVIDER=osrm ./run-local.sh              # API en :8080

# 2. Consola web
npm run dev --prefix ~/Projects/vitapath/web-hospital   # :5173
```

**Simuladores — uno por rol** (esto ya quedó resuelto):

- **iPhone 17 Pro Max** (`E5804F41-1C31-4EE6-B3CA-197C98DDC9FB`) → app
  **paciente** (`com.IvanLB.Vitapath`), sesión de `carlos@example.com`
  (se muestra como "Ana Hernández")
- **Clon "Vitapath Paramedic"** → app **paramédico**
  (`IvanLB.VitapathParamedic`), sesión de `dani@example.com` / Daniela Ríos

El clon se crea con `xcrun simctl clone <pro-max-udid> "Vitapath Paramedic"`
(el origen debe estar apagado). Clonar es lo que **preserva ambas sesiones** sin
teclear contraseñas.

### Gotchas que costaron dos tomas fallidas — no repetirlos

**No cierres emergencias con SQL.** Cerré la #768 con un `UPDATE` directo y eso
saltó la máquina de estados: la paramédica quedó en `BUSY` para siempre, el
dispatch la ignoró y el SOS murió en `TIMED_OUT`. Ciérralas desde la app o la
API. Si ya pasó: `UPDATE paramedic SET availability='AVAILABLE' WHERE id=2`.

**El backend se pudre si lleva horas corriendo.** Tras varias recompilaciones el
proceso viejo tiraba
`NoClassDefFoundError: com/vitapath/realtime/StompAuthChannelInterceptor$1`
al aceptar, y la app mostraba "Couldn't accept. Please try again." No era bug de
código — era el classpath cambiado bajo el proceso. **Reinicia el API antes de
grabar**, y reinicia también **ambas apps**: sus sockets STOMP mueren con él.

**La ventana del clon no se abre sola.** Bootearlo no basta; hay que abrirla
desde la lista de dispositivos de Device Hub (doble clic). Ojo: puede haber una
ventana fantasma de un clon borrado ("Vitapath Patient is unavailable") que
despista.

**Un build en Release pierde la sesión.** Compilé el paramédico en Release para
quitar el chip de debug y salió pidiendo login: al firmar ad-hoc sin
entitlements cambia el grupo de keychain `org.vitapath.paramedic.auth`.
La salida es un **Debug con `CAPTURE_BUILD`**:

```bash
xcodebuild -project ios-paramedic/VitapathParamedic.xcodeproj \
  -scheme VitapathParamedic -configuration Debug \
  -destination 'generic/platform=iOS Simulator' \
  SWIFT_ACTIVE_COMPILATION_CONDITIONS="DEBUG CAPTURE_BUILD" build
```

Eso depende de un cambio **sin commitear** en
`ios-paramedic/.../Views/Home/EmergencyView.swift`: el chip quedó como
`#if DEBUG && !CAPTURE_BUILD`. Los builds normales lo siguen mostrando, así que
es inocuo — pero sigue sin commitear en el repo de Vitapath.

**El movimiento NO necesita el chip de debug.** Usa el GPS simulado, que además
ejercita el flujo real de ubicación:

```bash
xcrun simctl location <clone-udid> start --speed=45 --interval=1.0 \
  32.514868,-117.038169 32.516031,-117.036700 32.517910,-117.034016 \
  32.521360,-117.032553 32.523741,-117.032444 32.525950,-117.030920 \
  32.526362,-117.026384 32.527396,-117.024281 32.528510,-117.022833 \
  32.529368,-117.022421 32.529429,-117.019890 32.528764,-117.019132 \
  32.528519,-117.018727 32.528418,-117.018497
```

Esa ruta (3.2 km, 340 s) sale de:
`localhost:5001/route/v1/driving/-117.0382,32.5149;-117.0186,32.5283?overview=full&geometries=geojson`

### Coordenadas calibradas (con ambas ventanas lado a lado)

Tomarlas **después** de colocar las ventanas — reutilizar coordenadas viejas fue
lo que mandó al paramédico a la pestaña History a media toma.

| Elemento | Coordenada |
|---|---|
| Botón SOS (paciente) | **(221, 543)** — a 12 px de ahí NO registra |
| Pestaña Emergencies (paramédico) | (518, 780) |
| Botón Accept | (688, 713) |

El SOS es `mouse_move` → `left_mouse_down` → esperar 3–4 s → `left_mouse_up`.

### La secuencia

1. Reiniciar API + ambas apps · ubicaciones frescas · paramédica `AVAILABLE`
2. Arrancar 3 grabaciones: `simctl io <udid> recordVideo` ×2 + Playwright
   `recordVideo` de la consola. **La consola se autentica inyectando el token**
   de `localStorage["vitapath.console.token"]` con `addInitScript` — nunca
   tecleando la contraseña en el formulario.
3. Hold del SOS → esperar la oferta → Accept
4. `simctl location start` por la ruta
5. Parar todo, componer con ffmpeg `overlay` + `drawbox`, y verificar con el
   scan de uniformidad por pane que **VOID total = 0.00 s**

---

## Lo que cerró esta sesión

**i18n sin prefijo en la URL** (PR #45, mergeado). `localePrefix: "never"`:
`/`, `/privacy/`, `/terms/` son las únicas URLs públicas y el idioma sale de la
cookie `NEXT_LOCALE` → `Accept-Language` → `en`. El toggle escribe la cookie y
hace `router.refresh()`. Los `/en/...` y `/es/...` viejos **redirigen**, con test
e2e que lo cubre.

> ⚠️ **Trade-off aceptado explícitamente:** el español ya no tiene URL propia, no
> se indexa por separado y un link compartido no lleva el idioma. Los `hreflang`
> se **quitaron** en vez de dejarlos apuntando a rutas que ahora dan 404.
> `localePrefix: "as-needed"` es el punto medio si algún día se revisa.
> **No lo "arregles" de vuelta sin preguntar.**

De paso se corrigió un bug de SEO preexistente: `generateMetadata` del layout
fijaba `canonical: /${locale}/`, y **toda ruta hija hereda el metadata del
layout** — así que `/privacy`, `/terms` y las dos de soporte declaraban la
portada como su canonical, o sea le decían a los crawlers que eran duplicados de
ella. El layout ya no fija canonical.

**El audit de UI: 40 de 41 hallazgos.** Uno resultó **falso** (#28, la copia de
Alisio sobre Karvonen/Tanaka — contrastada contra el código real de Alisio, es
correcta). Lo demás cubrió: trampa de foco del modal, modal cerrado inalcanzable
por teclado, restauración de foco en deep links, acciones deshabilitadas que
navegaban con Enter, control de pausa en los clips (WCAG 2.2.2), Fraunces
self-hosted por `next/font` (era el LCP tras 3 saltos sin preconnect, y el 100%
del CLS), contraste AA, 2.4 MB de assets sin referenciar borrados, jerarquía de
lectura invertida, alineación de media, tokens de tracking y varios de ARIA.

**Media:** clip de Arrhythmia re-grabado (abría con una disculpa de latencia y
tenía 4.33 s congelados al final) y composite de Alisio recortado (69% de fondo
→ 12%). Ambos en PR #47.

**Vitapath:** expediente clínico deduplicado (`Hipertensión` ×3, `Penicilina` ×2,
`Metformina` ×2 — eran corridas de prueba, no el seed) y la still recapturada.
Esa captura destapó un **bug real de layout** en la app: `FlowLayout` medía
contra un ancho y reportaba otro, así que los chips de alergias se dibujaban
encima del encabezado "Medical Surgeries". Arreglado en
[Vitapath PR #14](https://github.com/Ivan-LB/Vitapath/pull/14).

---

## Decisiones abiertas

- **#30, la mitad del correo:** el `sub` del JWT **es el email**, así que
  renombrar `admin1.fase10@example.com` en la BD rompe las sesiones. Para
  quitarlo del frame habría que hacer que la consola muestre un nombre en vez
  del email (`AppShell.tsx:105` imprime `user?.email`). A tamaño de render mide
  ~6 px.
- **El cambio `CAPTURE_BUILD`** en el repo de Vitapath sigue sin commitear.
- **CV:** 4 decisiones pendientes en `~/Projects/CV/HANDOFF.md`, más la
  actualización de "dos apps en la App Store" ahora que Alisio salió.

## Reglas de la casa que se aplicaron aquí

- **Nada de firmas de AI** — ni `Co-Authored-By` ni "Generated with Claude Code",
  ni en commits ni en cuerpos de PR. (Se violó una vez en los PR #45/#46; el
  criterio ya está corregido.)
- **Nunca `pnpm build` con el dev server arriba** — comparten `.next`.
- **Rama nueva desde `develop` recién mergeado** antes de cada tanda. Un commit
  llegó a quedar colgado sobre una rama ya cerrada (PR #45) y hubo que moverlo
  con cherry-pick; verifica con `git log origin/develop..HEAD`.
