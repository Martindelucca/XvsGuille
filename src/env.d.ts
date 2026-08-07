/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** URL /exec de la app web de Google Apps Script. Sólo servidor. */
  readonly RSVP_ENDPOINT_URL?: string;
  /** Clave compartida con el Apps Script. Sólo servidor. */
  readonly RSVP_SHARED_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
