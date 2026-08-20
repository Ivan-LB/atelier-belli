# HANDOFF — atelier-belli-portfolio

> Updated **2026-08-20** (ola 2 de planes: 007 a 012, seis PRs). Lee
> `CLAUDE.md` para el contexto estable y `plans/README.md` para el registro
> plan por plan; este archivo es el estado vivo.
>
> Todo lo que está debajo de "Estado: audit 41/41 cerrado" es de la sesión del
> **2026-08-03** y sigue siendo válido como historia. La sección de aquí arriba
> es lo actual.

## Estado: ola 2 cerrada (007 a 012), con un pendiente humano

Los seis planes están en `develop`. Lo que quedó **abierto** y le toca a una
persona, no a un agente:

1. **El smoke de Amplify que debe el PR #60** (metadata por ruta, iconos,
   sitemap), antes de que `develop` se mergee a `main`. Es el único gate técnico
   pendiente de la ola. Ningún plan posterior lo tocó: 011 y 012 no entran a la
   región sensible a Amplify.
2. **La checklist humana** en `plans/README.md` sigue viva tal cual: las URLs de
   privacidad en App Store Connect (punto 1, con ventana de tiempo real), la
   declaración DSA, los headers de cache largos para `/cases/*` en la consola de
   Amplify, y las decisiones sueltas (slug de LinkedIn, Search Console, el PDF
   del CV huérfano).
3. **Lo que quedó sin reclamar** tras cerrar la ola está listado en
   `plans/README.md` bajo "Unclaimed after wave 2 closed". Nada bloquea.

### Lo que 012 encontró en el nav, que no era su tarea

El plan pedía un chip de Contact abajo de 820px. El chip son doce líneas; lo
caro fue que ponerlo bien destapó tres defectos que ya estaban ahí. Los tres
están arreglados y escritos en `CLAUDE.md` §4, pero vale la pena saberlos:

- **El nav se partía en dos renglones en TODO ancho <= 820px**, tablets
  incluidas. `.ab-nav-inner` declaraba `1fr auto` pero tenía **tres** hijos de
  grid: esconder el `<ul>` no saca al `<nav>` del layout. Nunca fue a propósito;
  la declaración dice `1fr auto` desde `fe3a590`.
- **El nav no tenía padding horizontal.** El shorthand `padding: 14px 0` de
  `.ab-nav-inner` pisaba el padding inline de `.ab-wrap`, así que el brand se
  pegaba a x=0 mientras el contenido de la página empezaba en 20px (teléfono) o
  51.2px (desktop). Ahora es longhand. **No lo regreses a shorthand.**
- **`.ab-chip` nunca le ha llegado al `<button>` del idioma.** `.ab-root button`
  (0,1,1) le gana a `.ab-chip` (0,1,0) y resetea `font` y `border`, así que ese
  control es texto plano de 16px sin borde, y lo ha sido siempre. 012 restauró
  el componente **sólo dentro del media query de 820px**, por decisión tuya, de
  modo que el cluster móvil se lee coherente y **el nav de desktop quedó
  byte-idéntico**. Arreglarlo global es una línea y un restyle visible de
  desktop: es tu llamada, está en la lista de unclaimed.

Sin hamburger menu, por decisión explícita.

---

## Estado: audit 41/41 cerrado (sesión 2026-08-03)

`vitapath-system.mp4` re-grabado — #6 y #30 cerrados. Todo lo demás ya está en
`develop` (PRs #45, #46 y #47 mergeados).

---

## El clip de Vitapath: cerrado, y lo que costó tomas

**El defecto era (#6, P1):** el pane del paramédico se quedaba en negro 4.71 s a
media reproducción — 27% de cada loop — bajo un caption que afirma "las tres
superficies al mismo tiempo". **#30:** exponía la cuenta semilla
`admin1.fase10@example.com` en el topbar y un chip de debug "Simulate movement".

Ambos cerrados en una sola toma nueva: SOS presionado de verdad en la app del
paciente, la oferta aterrizando en la paramédica, el accept, y la ambulancia
recorriendo la ruta vial real de OSRM mientras los dos mapas y la consola bajan
el ETA de 6 a 3 minutos. Scan de uniformidad **por pane** (el detector de negro
por frame completo no ve este defecto: los otros dos panes mantienen el frame
claro):

| pane | VOID(s) | antes |
|---|---|---|
| console | 0.00 | 0.00 |
| paramedic | 0.00 | **3.90** |
| patient | 0.00 | 0.00 |

De paso: `page.tsx` declaraba `w: 1600` para un archivo que mide **1740** desde
que se subió, así que el navegador reservaba la caja equivocada. Corregido.

### Gotchas nuevos — no repetirlos

**El primer clic sólo enfoca la ventana.** Si la ventana del simulador no está
al frente, el primer press la activa y **no llega a la app**. Enfoca primero
(clic en la barra de título, que no toca contenido) y después actúa. Esto casi
con seguridad fue lo que arruinó una toma anterior.

**`--speed` de `simctl location` es METROS/SEGUNDO, no km/h.** 24 m/s ≈ 86 km/h.

**zsh no hace word-splitting** de `$VAR` sin comillas: la ruta de 70 waypoints
llegó como un solo argumento (`Invalid latitude,longitude pair`). Usa un array
de bash (`read -r -a`).

**`simctl recordVideo` graba a frame rate VARIABLE** — sólo emite frame cuando
la pantalla cambia. Un `-ss` de entrada hacia un tramo estático cae en un hueco
sin frames y `overlay` pinta el fondo: **el defecto #6 otra vez, recién creado**.
Densifica con `fps=30` **antes** de recortar con `trim`; nada de `-ss` de entrada.

**Una emergencia disparada por API NO navega la app del paciente** — se queda en
la pantalla del SOS (verificado). Por eso la toma vieja relanzó la app a media
grabación, y por eso su pane del paciente mostraba el splash. Hay que presionar
el botón.

**No dejes que la paramédica llegue.** Al entrar al geofence de arribo la
pantalla revela el perfil clínico del paciente. La ruta va truncada a 2.03 km
(termina a ~886 m) para que no pase.

**Paciente y paramédica no pueden compartir coordenada**, o el arribo se dispara
al instante: paciente al final de la ruta, paramédica al inicio.

**La consola se graba a 1432×898 y se baja a 995×624.** A tamaño de slot el panel
de detalle se angosta, `ASIGNACIÓN` se apila y **`RUTEO HOSPITALARIO` se va abajo
del fold** — y la resolución de hospital por seguro y red es justo lo que promete
el caption. Ese ancho además deja fuera de cuadro el control `Simular traslado`
de la propia consola (que **no** está gateado por DEV — ver "Decisiones abiertas").

**Sincroniza por evento, no por reloj.** Los tres grabadores arrancan hasta 0.6 s
desfasados; el ancla es el frame en que la emergencia aterriza en cada superficie.
El primer scene-change del paciente **no** es el ancla: es la animación del hold
del botón, ~0.9 s antes.

Los scripts (`take.sh`, `record-console.mjs`, `compose.sh`, `void-scan.py`)
quedaron en el scratchpad de la sesión, no en el repo.

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

Eso depende del gate en
`ios-paramedic/VitapathParamedic/Views/Home/EmergencyView.swift`, donde el chip
quedó como `#if DEBUG && !CAPTURE_BUILD`. Los builds normales lo siguen mostrando
(la bandera no está definida), así que es inocuo.

> **Ojo con los repos:** los cuatro (`backend-spring` → `Vitapath_Backend`,
> `web-hospital` → `Vitapath_Web`, `ios-patient` → `Vitapath`, `ios-paramedic` →
> `Vitapath_Paramedic`) son **repositorios git independientes**. Correr
> `git status` en uno no dice nada de los otros. La rama
> `chore/hide-debug-chip-in-captures` del paramédico ya cumplió su función y
> **se borró** tras verificar el clip (decisión de Iván); `v2.1` quedó limpio.
> Si hay que re-grabar, se re-aplica el gate: son 3 líneas.

**El movimiento NO necesita el chip de debug.** Usa el GPS simulado, que además
ejercita el flujo real de ubicación. Ojo con las dos trampas de arriba:
`--speed` va en **m/s**, y en zsh hay que meter los waypoints en un array de
bash o llegan como un solo argumento.

```bash
ROUTE=(32.514868,-117.038169 32.516031,-117.036700 ... 32.528418,-117.018497)
xcrun simctl location <clone-udid> start --speed=24 --interval=1.0 "${ROUTE[@]}"
```

La ruta completa (3.2 km, 340 s) sale de OSRM:
`localhost:5001/route/v1/driving/-117.038169,32.514868;-117.018497,32.528418?overview=full&geometries=geojson`
→ 149 puntos. Para grabar se **trunca a 2.03 km** (los primeros 70) para no
disparar el arribo y su PHI.

### Coordenadas calibradas (con ambas ventanas lado a lado)

Tomarlas **después** de colocar las ventanas — reutilizar coordenadas viejas fue
lo que mandó al paramédico a la pestaña History a media toma.

| Elemento | Coordenada |
|---|---|
| Botón SOS (paciente) | **(221, 543)** — a 12 px de ahí NO registra |
| Pestaña Emergencies (paramédico) | (518, 780) |
| Botón Accept | (688, 713) |

El SOS es `mouse_move` → `left_mouse_down` → esperar 3–4 s → `left_mouse_up`,
**con la ventana ya enfocada** (si no, ese press sólo la activa).

### La secuencia

1. Reiniciar API + ambas apps · ubicaciones frescas (paciente al final de la
   ruta, paramédica al inicio) · paramédica `AVAILABLE`
2. Enfocar la ventana del paciente (clic en su barra de título)
3. Arrancar 3 grabaciones: `simctl io <udid> recordVideo` ×2 + Playwright
   `recordVideo` de la consola a 1432×898. **La consola se autentica inyectando
   el token** de `localStorage["vitapath.console.token"]` con `addInitScript` —
   nunca tecleando la contraseña en el formulario.
4. Hold del SOS → esperar la oferta → enfocar la ventana del paramédico → Accept
5. El drive arranca **por evento** (cuando la emergencia llega a `ONGOING`),
   no por reloj: un delay fijo se desincroniza de lo que tarden los taps
6. Parar todo, componer con ffmpeg `overlay` + `drawbox` (con `fps` antes de
   `trim`), y verificar con el scan de uniformidad **por pane** que
   **VOID total = 0.00 s**

> Sanidad antes de grabar: sólo debe haber **una** paramédica elegible. El
> dispatch ignora a quien tenga la ubicación más vieja que `location-stale-seconds`
> (300 s), y en la BD hay varias `AVAILABLE` con fixes de hace semanas — por eso
> la oferta cae siempre en Daniela. Verifícalo, no lo asumas:
> `SELECT id, availability, now()-last_seen_at FROM paramedic WHERE availability='AVAILABLE';`

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

**El clip de Vitapath re-grabado** cerró el hallazgo 41/41 — ver arriba.

> **Nota de entorno:** el MCP del simulador de iOS **no funciona con Xcode 27
> beta**. Busca `SimulatorKit.framework` en
> `Contents/Developer/Library/PrivateFrameworks/`, y en Xcode 27 se movió a
> `Contents/SharedFrameworks/`. No hay panel en vivo ni taps por device points;
> hay que manejar las ventanas de Device Hub con computer-use (de ahí la
> trampa del clic que sólo enfoca).

---

## Conocido y aceptado — NO es un bug nuevo

**En producción el sitio es monolingüe en inglés. CloudFront cachea el HTML y la
cookie no está en la clave de caché.** Medido en `atelierbelli.com` el
2026-08-03, después del deploy de #50:

| | |
|---|---|
| `cache-control` | `s-maxage=31536000` — el HTML se cachea **un año** |
| `vary` | `Accept-Encoding` — **sin `Cookie`** |
| etag / hash del body | idénticos con y sin `NEXT_LOCALE=es` |
| `set-cookie` en la respuesta cacheada | `NEXT_LOCALE=en` |

**El middleware NO está roto.** Con un query param que esquiva el caché,
`NEXT_LOCALE=es` devuelve `lang="es"` correctamente. Es puramente CDN.

Dos consecuencias: el toggle de idioma es un control muerto (escribe la cookie,
`router.refresh()`, y CloudFront devuelve el inglés cacheado), y la respuesta
cacheada trae un `Set-Cookie` que **reescribe a `en`** la cookie de quien ya
tuviera español. Además el caché es por POP, así que el idioma del primer
visitante de cada región queda fijado ahí.

> **Iván lo revisó y decidió dejarlo así** (2026-08-03): no rompe nada visible y
> el inglés es el default correcto. **No lo "arregles" sin preguntar.** Si algún
> día se retoma, las salidas son: `localePrefix: "as-needed"` (cada idioma
> recupera su URL, el CDN cachea por URL, y de paso vuelve la indexabilidad que
> #45 sacrificó — la más limpia), hacer el documento no cacheable, o meter
> `NEXT_LOCALE` en la clave de caché de CloudFront (eso es consola de Amplify,
> no repo). En cualquier caso el `Set-Cookie` no debería viajar en una respuesta
> cacheable.

**Por qué no lo atrapó nada antes de mergear:** ni el CI ni un `next start` local
tienen CloudFront enfrente. Los dos pasaron en verde. Esta clase de fallo sólo
aparece midiendo contra el dominio real, después del deploy.

## Censo de los repos de los 9 casos — foto del 2026-08-03

> **Esto es una foto, no estado permanente.** Los conteos de "sucio" y la rama
> en la que está parado cada repo cambian solos. Lo que **no** caduca está en
> `CLAUDE.md` (el mapeo caso → repo, que `blip` no tiene git, y la divergencia
> sana de destilería). Si estás leyendo esto meses después, vuelve a medir.

Los 13 repos detrás de los 9 casos estaban **todos en `+0/-0` con su remoto**:
ningún código de producto sin pushear. Un solo commit local sin subir, en
destilería (`da0214d`, config de un agente de social — no es producto).

Lo que había sin commitear era casi todo andamiaje de agentes, no código:
`handoff.md` en pass, `.codex/` + `CLAUDE.md` en los dos Briefmark, cinco
archivos de `.claude/*` en Savely. La única excepción que vale revisar:
**`Swift/Fingo` tiene `Fingo.xcodeproj/project.pbxproj` modificado y en el
índice (staged)** — conviene confirmar si eso es intencional o quedó de una
sesión vieja.

Ocho de los trece estaban parados fuera de su rama principal. Tres eran de esta
sesión y ya están mergeadas (`feat/me-staff-name`, `feat/topbar-staff-name`,
`fix/flowlayout-measured-width`); el resto parece convención propia de cada
proyecto (`pass` y `Savely` viven en `dev`, `Arrhythmia-Detector` en `v2.1`).

### Riesgo real fuera del portafolio

Al escanear los 31 repos de `~/Projects` salieron cuatro **sin remoto**, o sea
sin respaldo alguno: `claude-setup` (el hub del que cuelgan 10 skills globales
symlinkeadas), y `Swift/Vertix` (42 archivos sin commitear sobre un único
"Initial Commit" de 2025-11-30), `Swift/TrailFlow` (25) y `Swift/CodeHistory`
(9). Aparte, `ECC` está **188 commits atrás** de `origin/main` y otras 8 skills
globales cuelgan de él, así que corren una versión de hace más de un mes.
Nada de eso es de este proyecto — queda anotado porque afecta a todas las
sesiones, incluida ésta.

## Decisiones abiertas

- **`Simular traslado` en la consola no está gateado por DEV.**
  `canSimulate = !terminal && patient != null && detail.paramedicId != null`
  (`EmergencyDetailPanel.tsx:108`), así que el botón que mueve la ambulancia por
  la ruta aparece **también en producción**, para cualquier despachador con una
  emergencia asignada. El clip lo esquiva por encuadre, no porque no exista.
  Es la misma familia que el chip del paramédico (#30) pero en el otro lado, y
  es decisión de producto: gatearlo por DEV o dejarlo como herramienta de demo.
- **CV:** 4 decisiones pendientes en `~/Projects/CV/HANDOFF.md`, más la
  actualización de "dos apps en la App Store" ahora que Alisio salió.

## Resuelto esta sesión

- **#30, la mitad del correo** → la consola ya muestra el **nombre** del staff.
  `MeController` ya resolvía el `HospitalStaff` para sacar `hospitalId`, y esa
  fila trae `full_name` desde V19, así que el nombre no costó query extra:
  `/me` devuelve `staffName` y `AppShell` hace `staffName ?? email` (el email se
  queda en el `title`, y `.mono` sólo aplica al email — un nombre en monoespaciada
  parece un campo de base de datos). **El `sub` del JWT sigue siendo el email**:
  es dato de display, no rompe sesiones. Dos PRs: `Vitapath_Backend` y
  `Vitapath_Web`.
- **La rama `chore/hide-debug-chip-in-captures`** (repo del paramédico) se borró
  tras verificar el clip. `v2.1` limpio.

## Reglas de la casa que se aplicaron aquí

- **Nada de firmas de AI** — ni `Co-Authored-By` ni "Generated with Claude Code",
  ni en commits ni en cuerpos de PR. (Se violó una vez en los PR #45/#46; el
  criterio ya está corregido.)
- **Nunca `pnpm build` con el dev server arriba** — comparten `.next`.
- **Rama nueva desde `develop` recién mergeado** antes de cada tanda. Un commit
  llegó a quedar colgado sobre una rama ya cerrada (PR #45) y hubo que moverlo
  con cherry-pick; verifica con `git log origin/develop..HEAD`.
