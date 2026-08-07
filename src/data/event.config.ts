/* ============================================================================
 *  EVENT CONFIG — ÚNICO archivo que hay que editar para cambiar la invitación.
 *  Ningún dato del evento debe escribirse dentro de un componente.
 *
 *  Reglas:
 *   · Un campo vacío ("") = dato todavía no definido.
 *   · Las secciones que dependen de un dato vacío se OCULTAN automáticamente.
 *     No hace falta borrar componentes ni comentar código.
 * ========================================================================== */

export const event = {
  /* --- Identidad ---------------------------------------------------------- */
  celebrant: 'Guille Chalpe',
  celebrantShort: 'Guille',
  eventType: 'XV',
  monogram: 'GC',

  /* --- Fecha y hora ------------------------------------------------------- */
  /**
   * TODO: confirmar AÑO y HORA reales.
   * Formato ISO 8601 con offset de Argentina (-03:00). El countdown se calcula
   * desde acá, así que es correcto en cualquier zona horaria del invitado.
   * Si se deja "", el countdown no se muestra.
   */
  date: '2026-09-12T21:00:00-03:00',
  displayDate: '12 de septiembre',
  displayDateLong: '12 de septiembre de 2026',
  dayNumber: '12',
  monthName: 'Septiembre',

  /** TODO: horario de inicio, ej. "21:00 hs". Vacío = no se muestra. */
  time: '21:00 hs',

  /* --- Lugar -------------------------------------------------------------- */
  /** TODO: nombre del salón. Vacío = la sección Ubicación se oculta entera. */
  venue: 'Salon Beyond',
  /** TODO: dirección completa, ej. "Av. Siempreviva 742, Córdoba". */
  address: '',
  /** TODO: link de Google Maps (ver README → "Dónde poner Google Maps"). */
  mapsUrl: 'https://maps.app.goo.gl/QKiVq3UFAQdJxDph8',
  /**
   * Opcional. Iframe embebido de Google Maps (src del <iframe>, NO el link).
   * Vacío = sólo se muestra el botón, que es lo recomendado en mobile.
   */
  mapsEmbedUrl: '',

  /* --- Confirmación de asistencia ----------------------------------------- */
  /** TODO: fecha límite en texto, ej. "el 25 de agosto". Vacío = se omite la frase. */
  rsvpDeadline: '1 de septiembre',
  /** Pedir cantidad de acompañantes en el formulario. */
  askCompanions: true,
  /** Máximo de acompañantes seleccionables. */
  maxCompanions: 5,
  /** Pedir restricción alimentaria. */
  askDietary: true,
  /**
   * Fallback si el backend no está configurado o falla:
   * número en formato internacional sin "+" ni espacios, ej. "5493511234567".
   * Vacío = no se ofrece fallback por WhatsApp.
   */
  whatsappFallback: '',

  /* --- Fotos del evento (Google Drive) ------------------------------------ */
  /** TODO: link de la carpeta de Drive con permiso de subida. Vacío = sección oculta. */
  driveUrl: 'https://drive.google.com/drive/folders/1_wP8lJsV6Zl9x6nzI_xKwZHs-OnsJdfi?usp=sharing',

  /* --- Dress code (opcional) ---------------------------------------------- */
  /** Poner en false para ocultar la sección aunque haya valor. */
  showDressCode: true,
  /** TODO: ej. "Elegante". Vacío = sección oculta. */
  dressCode: 'Elegante Sport',
  /** Aclaración opcional bajo el dress code. */
  dressCodeNote: 'Colores prrohibidos: Azul, Plateado y Bordo',

  /* --- Agenda (opcional) --------------------------------------------------- */
  showAgenda: true,
  /** Vacío = sección oculta. Agregar/quitar filas libremente. */
  agenda: [
    // { time: '21:00', label: 'Recepción' },
      { time: '21:30', label: 'Comienza la celebración' },
      { time: '01:00', label: 'Fiesta' },
  ] as Array<{ time: string; label: string }>,

  /* --- Música (opcional) --------------------------------------------------- */
  /**
   * TODO: ruta a un archivo de audio propio, ej. "/audio/tema.mp3"
   * (colocarlo en /public/audio/). Vacío = no aparece el control ♫.
   * No se reproduce nunca sin que el usuario toque "Abrir invitación".
   */
  musicUrl: '',
  musicVolume: 0.35,

  /* --- Sitio / SEO --------------------------------------------------------- */
  /** TODO: dominio final. Se usa para canonical y Open Graph. */
  siteUrl: 'https://xv-guille.vercel.app',
  ogImage: '/og-image.png',
} as const;

/* ============================================================================
 *  Derivados — no editar. Se calculan a partir de lo de arriba.
 * ========================================================================== */

/** true si el string tiene contenido real. */
export const filled = (v: string | undefined | null): boolean =>
  typeof v === 'string' && v.trim().length > 0;

export const sections = {
  countdown: filled(event.date),
  agenda: event.showAgenda && event.agenda.length > 0,
  location: filled(event.venue) || filled(event.address),
  map: filled(event.mapsEmbedUrl),
  dressCode: event.showDressCode && filled(event.dressCode),
  photos: filled(event.driveUrl),
  music: filled(event.musicUrl),
} as const;

/** Link de Google Maps: usa el configurado, o arma uno con la dirección. */
export const mapsHref = (): string => {
  if (filled(event.mapsUrl)) return event.mapsUrl;
  const query = [event.venue, event.address].filter(filled).join(', ');
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : '';
};

/** Link "Agendar" para Google Calendar, generado desde date + venue. */
export const calendarHref = (): string => {
  if (!filled(event.date)) return '';
  const start = new Date(event.date);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000); // 6 h de fiesta
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.eventType} de ${event.celebrantShort}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Invitación: ${event.siteUrl}`,
    location: [event.venue, event.address].filter(filled).join(', '),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const whatsappFallbackHref = (): string =>
  filled(event.whatsappFallback)
    ? `https://wa.me/${event.whatsappFallback}?text=${encodeURIComponent(
        `¡Hola! Quiero confirmar mi asistencia a los ${event.eventType} de ${event.celebrantShort}.`,
      )}`
    : '';

export type EventConfig = typeof event;
