import type { APIRoute } from 'astro';
import { validateRsvp, type RsvpResponse } from '@/lib/rsvp-types';

/**
 * Proxy del formulario hacia Google Apps Script.
 *
 * Por qué existe en vez de postear directo desde el navegador:
 *  · la URL del Apps Script queda en una variable de entorno del servidor y
 *    nunca viaja en el bundle, así que nadie puede escribir en la planilla;
 *  · valida del lado del servidor (no se confía en el cliente);
 *  · filtra bots con el honeypot antes de tocar la hoja de cálculo.
 *
 * Es la ÚNICA ruta del sitio que se renderiza on-demand. Todo lo demás es HTML
 * estático servido desde el CDN.
 */
export const prerender = false;

const json = (body: RsvpResponse, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const POST: APIRoute = async ({ request }) => {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: 'validation' }, 400);
  }

  // Honeypot: un humano jamás completa este campo.
  // Respondemos 200 a propósito para no darle señal al bot.
  const honeypot = (input as { website?: unknown })?.website;
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return json({ ok: true }, 200);
  }

  const check = validateRsvp(input);
  if (!check.ok) {
    return json({ ok: false, error: 'validation', message: `Campo inválido: ${check.field}` }, 400);
  }

  const endpoint = import.meta.env.RSVP_ENDPOINT_URL;
  const secret = import.meta.env.RSVP_SHARED_SECRET ?? '';

  if (!endpoint) {
    // Todavía no se conectó la planilla. El formulario muestra el fallback.
    return json(
      { ok: false, error: 'not_configured', message: 'La confirmación online todavía no está activa.' },
      503,
    );
  }

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      // text/plain evita el preflight CORS de Apps Script; el cuerpo sigue
      // siendo JSON y del otro lado se parsea igual.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        ...check.value,
        secret,
        submittedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      console.error('[rsvp] upstream respondió', upstream.status);
      return json({ ok: false, error: 'upstream' }, 502);
    }

    const result = (await upstream.json().catch(() => ({ ok: true }))) as { ok?: boolean };
    if (result.ok === false) {
      return json({ ok: false, error: 'upstream' }, 502);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[rsvp] fallo al contactar la planilla', err);
    return json({ ok: false, error: 'upstream' }, 502);
  }
};

/** Cualquier otro método no tiene sentido en este endpoint. */
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
