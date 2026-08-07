/** Contrato compartido entre el formulario y el endpoint. Un solo lugar. */

export interface RsvpPayload {
  name: string;
  attending: 'yes' | 'no';
  companions: number;
  dietary: string;
  /** Honeypot: los humanos lo dejan vacío, los bots lo completan. */
  website?: string;
}

export interface RsvpResponse {
  ok: boolean;
  /** Código de error legible para el cliente; nunca detalles internos. */
  error?: 'validation' | 'not_configured' | 'upstream' | 'rate_limited';
  message?: string;
}

/** Validación única, usada en el cliente y en el servidor. */
export function validateRsvp(input: unknown): { ok: true; value: RsvpPayload } | { ok: false; field: string } {
  const raw = input as Partial<Record<keyof RsvpPayload, unknown>>;

  const name = typeof raw?.name === 'string' ? raw.name.trim().replace(/\s+/g, ' ') : '';
  if (name.length < 3 || name.length > 80) return { ok: false, field: 'name' };

  const attending = raw?.attending;
  if (attending !== 'yes' && attending !== 'no') return { ok: false, field: 'attending' };

  const companionsRaw = Number(raw?.companions ?? 0);
  const companions =
    attending === 'yes' && Number.isFinite(companionsRaw)
      ? Math.min(20, Math.max(0, Math.trunc(companionsRaw)))
      : 0;

  const dietary =
    attending === 'yes' && typeof raw?.dietary === 'string' ? raw.dietary.trim().slice(0, 120) : '';

  return { ok: true, value: { name, attending, companions, dietary } };
}
