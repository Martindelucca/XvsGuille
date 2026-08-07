# Mis XV · Guille Chalpe

Invitación web para los quince de Guille Chalpe — 12 de septiembre.

Una sola página, pensada mobile-first para abrirse desde WhatsApp, con
confirmación de asistencia y un acceso al álbum de fotos de la noche.

---

## Índice

1. [Instalar](#1-instalar)
2. [Ejecutar](#2-ejecutar)
3. [Dónde se cambia cada dato](#3-dónde-se-cambia-cada-dato)
4. [Google Maps](#4-google-maps)
5. [Google Drive](#5-google-drive)
6. [Dónde quedan las confirmaciones](#6-dónde-quedan-las-confirmaciones)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Deploy en Vercel](#8-deploy-en-vercel)
9. [Portada PDF](#9-portada-pdf)
10. [Música](#10-música)
11. [Imagen de WhatsApp (Open Graph)](#11-imagen-de-whatsapp-open-graph)
12. [Cómo está armado](#12-cómo-está-armado)
13. [Checklist final de QA](#13-checklist-final-de-qa)

---

## 1. Instalar

Requiere **Node.js 20 o superior** (probado en 24).

```bash
npm install
```

## 2. Ejecutar

```bash
npm run dev
```

Abre <http://localhost:4321>.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en vivo |
| `npm run build` | Compila el sitio a `dist/` |
| `npm run preview` | Sirve el build de producción para probarlo |
| `npm run og` | Regenera `og-image.png` y `apple-touch-icon.png` |

---

## 3. Dónde se cambia cada dato

**Todo está en un solo archivo: [`src/data/event.config.ts`](src/data/event.config.ts).**
No hay ningún dato del evento escrito dentro de un componente.

Los campos que faltan definir están marcados con `TODO` y hoy valen `''`.

| Campo | Qué es | Si queda vacío |
| --- | --- | --- |
| `date` | Fecha y hora ISO con huso `-03:00`. **Alimenta la cuenta regresiva.** | No se muestra el countdown |
| `displayDate`, `dayNumber`, `monthName` | Cómo se escribe la fecha en pantalla | — |
| `time` | Horario, ej. `'21:00 hs'` | Se omite la línea de horario |
| `venue` | Nombre del salón | **Se oculta toda la sección Ubicación** |
| `address` | Dirección completa | Se omite la dirección |
| `mapsUrl` | Link de Google Maps | Se genera solo con salón + dirección |
| `mapsEmbedUrl` | Mapa embebido (opcional) | Sólo se muestra el botón (recomendado) |
| `rsvpDeadline` | Texto, ej. `'el 25 de agosto'` | Se omite la frase de fecha límite |
| `driveUrl` | Carpeta de Drive para las fotos | **Se oculta la sección "Compartamos este recuerdo"** |
| `dressCode` | Ej. `'Elegante'` | **Se oculta la sección Dress code** |
| `dressCodeNote` | Aclaración debajo | Se omite |
| `agenda` | Lista de horarios | Se oculta la sección Agenda |
| `musicUrl` | Ruta a un audio propio | No aparece el control ♫ |
| `whatsappFallback` | Teléfono para confirmar si el formulario falla | No se ofrece el fallback |
| `siteUrl` | **Dominio final.** Se usa en canonical, Open Graph y en la portada PDF | — |

> **Las secciones se ocultan solas.** No hace falta borrar componentes ni
> comentar código: si el dato está vacío, la sección no se renderiza.

Para apagar una sección aunque el dato exista: `showDressCode: false`,
`showAgenda: false`.

Los **textos** (frases, copy, mensajes de error) viven aparte, en
[`src/data/copy.ts`](src/data/copy.ts).

---

## 4. Google Maps

En `event.config.ts`:

```ts
mapsUrl: 'https://maps.app.goo.gl/XXXXXXXX',
```

**Cómo obtenerlo:** buscá el salón en Google Maps → *Compartir* → *Copiar
vínculo*.

Si lo dejás vacío, el botón **igual funciona**: se arma solo a partir de
`venue` + `address`. Conviene igual pegar el link real para que abra el lugar
exacto y no un resultado de búsqueda.

**Mapa embebido (opcional).** En Maps: *Compartir* → *Insertar un mapa* →
copiar **sólo el valor de `src`** del `<iframe>` y ponerlo en `mapsEmbedUrl`.
En móvil el botón es más útil que el mapa, así que la recomendación es dejarlo
vacío.

---

## 5. Google Drive

En `event.config.ts`:

```ts
driveUrl: 'https://drive.google.com/drive/folders/XXXXXXXX',
```

**Importante — permisos.** Para que los invitados puedan subir fotos sin tener
cuenta configurada:

1. Creá una carpeta en Drive, por ejemplo `XV Guille — Fotos`.
2. Botón derecho → **Compartir**.
3. En *Acceso general* poné **Cualquier persona con el enlace**.
4. Cambiá el rol de *Lector* a **Editor** (si no, no pueden subir nada).
5. Copiá el enlace y pegalo en `driveUrl`.

El botón abre Drive en una pestaña nueva (`target="_blank"` con
`rel="noopener noreferrer"`).

---

## 6. Dónde quedan las confirmaciones

**En una planilla de Google Sheets tuya.**

Se eligió Sheets + Apps Script en vez de una base de datos porque el
organizador no necesita nada técnico: abre la planilla y ve las confirmaciones
como cualquier otra hoja, con filtros y orden.

Recorrido de una confirmación:

```
Invitado → POST /api/rsvp (función en Vercel) → Apps Script → Google Sheet
                    ↑                                ↑
        valida y filtra bots            la URL vive en una variable de
                                        entorno: nunca sale al navegador
```

Columnas de la planilla:

| Fecha de confirmación | Nombre | ¿Asiste? | Acompañantes | Total personas | Restricción alimentaria |
| --- | --- | --- | --- | --- | --- |

### Puesta en marcha (una sola vez, ~10 minutos)

1. Creá una planilla nueva en <https://sheets.new> y llamala *Confirmaciones XV Guille*.
2. Menú **Extensiones → Apps Script**.
3. Borrá lo que haya y pegá el contenido de
   [`google-apps-script/Codigo.gs`](google-apps-script/Codigo.gs).
4. En la línea `var SHARED_SECRET = '...'` poné una clave larga y aleatoria.
   Guardala, la vas a necesitar en el paso 8.
5. Guardá (💾).
6. Botón **Implementar → Nueva implementación**.
7. Engranaje ⚙ → **Aplicación web**, y configurá:
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier usuario**
8. **Implementar** → autorizá los permisos → copiá la **URL de la aplicación
   web** (termina en `/exec`).
9. Esa URL va en `RSVP_ENDPOINT_URL` y la clave del paso 4 en
   `RSVP_SHARED_SECRET` (ver sección siguiente).

> Cada vez que edites el `.gs` tenés que hacer **Implementar → Administrar
> implementaciones → editar ✏️ → Versión: Nueva versión**. Si no, sigue
> corriendo el código viejo.

**Probar que quedó bien:** abrí la URL `/exec` en el navegador. Debe responder
`{"ok":true,"service":"rsvp"}`.

### Mientras no esté configurado

El formulario no se rompe: muestra el mensaje *"La confirmación online todavía
no está activa"*. Si además cargás `whatsappFallback`, aparece un enlace para
confirmar por WhatsApp.

---

## 7. Variables de entorno

Sólo dos, y **ninguna llega al navegador** (no llevan el prefijo `PUBLIC_`, así
que Astro nunca las incluye en el bundle).

| Variable | Para qué | Ejemplo |
| --- | --- | --- |
| `RSVP_ENDPOINT_URL` | URL `/exec` de la app web de Apps Script | `https://script.google.com/macros/s/AKfy.../exec` |
| `RSVP_SHARED_SECRET` | Clave compartida con el Apps Script. Debe ser **idéntica** a `SHARED_SECRET` en `Codigo.gs` | `f3a9c0...` (24+ caracteres al azar) |

**En local:** copiá `.env.example` a `.env` y completá los valores.
`.env` está en `.gitignore`: no se sube nunca.

**En producción:** Vercel → *Project Settings* → *Environment Variables*.
Cargalas para *Production* y *Preview*, y **volvé a desplegar** para que tomen
efecto.

---

## 8. Deploy en Vercel

### Opción A — desde GitHub (recomendada)

1. Subí el proyecto a un repositorio.
2. En <https://vercel.com/new> importá el repo.
3. Vercel detecta Astro solo. No hay que tocar la configuración de build.
4. Cargá las dos variables de entorno de la sección anterior.
5. **Deploy**.

### Opción B — desde la terminal

```bash
npm i -g vercel
```

```bash
vercel --prod
```

### Después del deploy

1. Copiá el dominio final (ej. `https://xv-guille.vercel.app`).
2. Ponelo en `siteUrl` dentro de `event.config.ts` — de ahí salen el canonical,
   el Open Graph y el enlace de la portada PDF.
3. Volvé a desplegar.

El sitio se sirve **estático desde el CDN**; la única función serverless es
`/api/rsvp`.

---

## 9. Portada PDF

La página <http://localhost:4321/sobre> es el sobre que se manda por WhatsApp.
Tiene `noindex` y no forma parte de la invitación.

**Para generar el PDF:**

1. Abrí `https://TU-DOMINIO/sobre` **en Chrome** (en escritorio).
2. `Ctrl + P` (imprimir).
3. Destino: **Guardar como PDF**.
4. Márgenes: **Ninguno**.
5. Tildá **Gráficos de fondo** (si no, sale el sobre en blanco).
6. Guardar.

Chrome conserva los hipervínculos al exportar, así que **toda la tarjeta queda
clickeable** y abre la invitación.

> Antes de generarlo, confirmá que `siteUrl` tenga el dominio definitivo: ese
> es el link que va a quedar dentro del PDF.

---

## 10. Música

Es opcional y está apagada por defecto.

1. Poné un archivo `.mp3` en `public/audio/`.
2. En `event.config.ts`: `musicUrl: '/audio/tu-tema.mp3'`.

Aparece un control ♫ discreto abajo a la izquierda. La música **nunca arranca
sola**: sólo puede iniciarse con el gesto de *"Abrir invitación"*, que es lo
único que los navegadores permiten. Si igual la bloquean, el control queda
disponible y no se rompe nada. Se puede apagar en cualquier momento.

Usá un archivo liviano (idealmente menos de 2 MB): se carga con `preload="none"`,
así que no pesa hasta que alguien lo activa.

---

## 11. Imagen de WhatsApp (Open Graph)

`public/og-image.png` (1200×630) es lo que se ve al pegar el link.

Se genera con:

```bash
npm run og
```

El script lee los datos de `event.config.ts`, así que si cambiás el nombre o la
fecha, corrélo de nuevo. También produce `apple-touch-icon.png`.

> WhatsApp cachea las vistas previas de forma agresiva. Si cambiaste la imagen
> y seguís viendo la vieja, probá el link con un parámetro (`?v=2`) o esperá
> unas horas.

---

## 12. Cómo está armado

**Astro 5 + TypeScript + CSS propio.** Sin framework de UI y sin librería de
animaciones: la página entrega HTML estático y unos pocos kB de JavaScript.

```
src/
├── data/
│   ├── event.config.ts   ← TODOS los datos del evento (el único que se edita)
│   └── copy.ts           ← todos los textos
├── styles/
│   ├── tokens.css        ← color, tipografía, espaciado, motion
│   ├── base.css          ← reset, secciones, utilidades de aparición
│   ├── typography.css    ← clases de texto y botones
│   └── fonts.css         ← @font-face (fuentes propias, sin Google Fonts)
├── components/
│   ├── ornaments/        ← Monogram, Rule, Botanical, Icon (SVG propios)
│   └── *.astro           ← una sección por archivo
├── lib/                  ← countdown, reveal, rsvp, música, apertura
├── layouts/BaseLayout.astro
└── pages/
    ├── index.astro       ← la invitación
    ├── sobre.astro       ← portada para el PDF
    └── api/rsvp.ts       ← única ruta con servidor
```

Detalles que conviene conocer si vas a tocar el código:

- **Las fuentes son propias** (`public/fonts/`), no se pide nada a Google. Se
  precargan las dos críticas.
- **Los retardos de las animaciones de entrada van inline**
  (`style="animation-delay:320ms"`) a propósito: en los motores donde
  `animation-delay` es shorthand, un `var()` la invalida y el retardo cae a 0.
- **Para estilar un componente hijo desde el padre hace falta `:global()`**:
  Astro le da a cada componente su propio scope, así que una clase del padre no
  alcanza al hijo. El tamaño y la opacidad de los ornamentos se pasan con
  custom properties (`--botanical-w`) por el mismo motivo.
- **Todo respeta `prefers-reduced-motion`** vía la variable `--motion`, que
  pasa a `0` y anula desplazamientos, blur y escalas.

---

## 13. Checklist final de QA

Verificado en este proyecto:

**Estructura y datos**
- [x] Ningún dato del evento hardcodeado fuera de `event.config.ts`
- [x] Las secciones sin datos se ocultan solas, sin huecos ni errores
- [x] El sitio compila y renderiza con TODOS los campos vacíos
- [x] El sitio compila y renderiza con todos los campos completos (9 secciones)

**Responsive** — sin scroll horizontal en ningún ancho
- [x] 375 px (iPhone SE / 13 mini)
- [x] 430 px (iPhone 15 Pro Max)
- [x] 768 px (tablet)
- [x] 1024 px
- [x] 1440 px
- [x] Apaisado en pantallas bajas (el hero deja de forzar 100svh)
- [x] Áreas táctiles ≥ 44 px en todos los controles

**Formulario**
- [x] Nombre vacío o muy corto → error y foco en el campo
- [x] Sin elegir asistencia → error
- [x] "Sí" muestra acompañantes y restricción; "No" los oculta y los desactiva
- [x] "Otra" restricción vacía → error
- [x] Estado de carga: `aria-busy`, texto "Enviando", spinner
- [x] Doble envío bloqueado (3 intentos seguidos → 1 sola petición)
- [x] Enviar después de confirmar no vuelve a llamar al servidor
- [x] Error de servidor → mensaje claro y botón habilitado de nuevo
- [x] Sin conexión → mensaje propio, no falla en silencio
- [x] Éxito sin recargar, con foco movido al mensaje
- [x] Mensaje distinto para "sí" y para "no"
- [x] Honeypot: respuesta 200 silenciosa, no escribe en la planilla
- [x] Validación también del lado del servidor (no confía en el cliente)

**Enlaces**
- [x] Maps abre en pestaña nueva, con `rel="noopener noreferrer"`
- [x] Maps funciona incluso sin `mapsUrl` (se arma con salón + dirección)
- [x] Drive abre en pestaña nueva
- [x] "Agendar" genera el evento de Google Calendar con fecha y lugar
- [x] Los tres accesos del cierre apuntan a donde deben

**Accesibilidad**
- [x] Un solo `<h1>`; jerarquía de encabezados coherente
- [x] Todos los inputs con `<label>` real; radios dentro de `<fieldset>`/`<legend>`
- [x] Contraste AA verificado en 13 pares de color, incluido el peor punto del
      degradado del hero
- [x] Foco visible en todos los controles
- [x] Mientras la portada está cerrada, el resto de la página queda `inert`
- [x] Errores anunciados con `role="alert"`
- [x] `prefers-reduced-motion` respetado (sin desplazamientos, blur ni retardos)
- [x] `lang="es-AR"`, landmarks `main` / `footer` / `nav`
- [x] Sin controles enfocables dentro de `aria-hidden`

**Performance**
- [x] ~3 kB de JavaScript comprimido, en un solo archivo
- [x] Cero dependencias de terceros en el navegador
- [x] Fuentes propias, precargadas, sólo subset latino
- [x] CSS incrustado en el HTML (una sola petición)
- [x] Cero peticiones a dominios externos
- [x] El countdown se pausa cuando la pestaña queda oculta
- [x] Sin imágenes de mapa/audio hasta que se piden (`loading="lazy"`,
      `preload="none"`)

**SEO y compartir**
- [x] `title`, `description`, canonical
- [x] Open Graph completo + `og:image` 1200×630
- [x] Datos estructurados `schema.org/Event`
- [x] `/sobre` con `noindex`
- [x] `robots.txt`

**Sin errores**
- [x] Consola limpia, sin errores de JavaScript
- [x] Build de producción sin advertencias

### Lo que queda por hacer (necesita datos tuyos)

- [ ] Confirmar **año y hora** reales en `date`
- [ ] Cargar salón, dirección y horario
- [ ] Pegar el link de Google Maps
- [ ] Crear la carpeta de Drive **con permiso de edición** y pegar el link
- [ ] Definir dress code y fecha límite de confirmación
- [ ] Conectar la planilla (sección 6) y cargar las variables de entorno
- [ ] Poner el dominio final en `siteUrl` y volver a correr `npm run og`
- [ ] Exportar la portada PDF desde `/sobre`
