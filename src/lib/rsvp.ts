/**
 * Formulario de confirmación.
 *
 * Estados: idle → submitting → success | error.
 * Doble envío: bloqueado por bandera + `disabled` + `aria-busy`.
 * Errores: se anuncian con role="alert" y el foco va al primer campo inválido.
 */
import { validateRsvp, type RsvpResponse } from './rsvp-types';

type State = 'idle' | 'submitting' | 'success' | 'error';

export function initRsvp(): void {
  const form = document.querySelector<HTMLFormElement>('[data-rsvp-form]');
  const panel = document.querySelector<HTMLElement>('[data-rsvp-panel]');
  const success = document.querySelector<HTMLElement>('[data-rsvp-success]');
  if (!form || !panel || !success) return;

  const submitBtn = form.querySelector<HTMLButtonElement>('[data-rsvp-submit]');
  const submitLabel = form.querySelector<HTMLElement>('[data-rsvp-submit-label]');
  const formError = form.querySelector<HTMLElement>('[data-rsvp-error]');
  const conditional = form.querySelector<HTMLElement>('[data-rsvp-conditional]');
  const dietarySelect = form.querySelector<HTMLSelectElement>('#rsvp-dietary');
  const dietaryOther = form.querySelector<HTMLElement>('[data-rsvp-dietary-other]');
  const dietaryOtherInput = form.querySelector<HTMLInputElement>('#rsvp-dietary-other');
  const successTitle = success.querySelector<HTMLElement>('[data-rsvp-success-title]');
  const successText = success.querySelector<HTMLElement>('[data-rsvp-success-text]');
  const errors = JSON.parse(form.dataset.errors ?? '{}') as Record<string, string>;
  const messages = JSON.parse(form.dataset.messages ?? '{}') as Record<string, { title: string; text: string }>;
  const labels = JSON.parse(form.dataset.labels ?? '{}') as Record<string, string>;

  let state: State = 'idle';

  /* --- Campos condicionales ---------------------------------------------- */
  const syncAttending = (): void => {
    const yes = form.querySelector<HTMLInputElement>('input[name="attending"][value="yes"]');
    const show = Boolean(yes?.checked);
    if (conditional) {
      conditional.hidden = !show;
      // Los campos ocultos no deben participar de la validación nativa
      conditional
        .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
        .forEach((el) => (el.disabled = !show));
    }
    if (show) syncDietary();
  };

  const syncDietary = (): void => {
    if (!dietarySelect || !dietaryOther || !dietaryOtherInput) return;
    const isOther = dietarySelect.value === 'Otra';
    dietaryOther.hidden = !isOther;
    dietaryOtherInput.disabled = !isOther;
    if (isOther) dietaryOtherInput.focus();
  };

  form
    .querySelectorAll<HTMLInputElement>('input[name="attending"]')
    .forEach((el) => el.addEventListener('change', syncAttending));
  dietarySelect?.addEventListener('change', syncDietary);
  syncAttending();

  /* --- Errores por campo -------------------------------------------------- */
  const setFieldError = (field: string, message: string | null): void => {
    const holder = form.querySelector<HTMLElement>(`[data-field="${field}"]`);
    const note = form.querySelector<HTMLElement>(`[data-field-error="${field}"]`);
    const input = form.querySelector<HTMLInputElement>(`[data-input="${field}"]`);
    if (!holder || !note) return;
    holder.dataset.invalid = message ? 'true' : 'false';
    note.textContent = message ?? '';
    note.hidden = !message;
    input?.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const clearErrors = (): void => {
    ['name', 'attending', 'dietary'].forEach((f) => setFieldError(f, null));
    if (formError) {
      formError.textContent = '';
      formError.hidden = true;
    }
  };

  const setState = (next: State): void => {
    state = next;
    const busy = next === 'submitting';
    form.setAttribute('aria-busy', String(busy));
    if (submitBtn) submitBtn.disabled = busy;
    if (submitLabel) {
      submitLabel.textContent = busy ? (labels.submitting ?? 'Enviando') : (labels.submit ?? 'Confirmar');
    }
    form.dataset.state = next;
  };

  /* --- Envío -------------------------------------------------------------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state === 'submitting' || state === 'success') return; // anti doble envío

    clearErrors();

    const data = new FormData(form);
    const dietaryValue =
      data.get('dietary') === 'Otra'
        ? String(data.get('dietaryOther') ?? '').trim()
        : String(data.get('dietary') ?? '');

    const candidate = {
      name: String(data.get('name') ?? ''),
      attending: String(data.get('attending') ?? ''),
      companions: Number(data.get('companions') ?? 0),
      dietary: dietaryValue,
      website: String(data.get('website') ?? ''),
    };

    const check = validateRsvp(candidate);
    if (!check.ok) {
      setFieldError(check.field, errors[check.field] ?? 'Revisá este campo.');
      form.querySelector<HTMLElement>(`[data-input="${check.field}"]`)?.focus();
      return;
    }

    if (data.get('dietary') === 'Otra' && dietaryValue.length === 0) {
      setFieldError('dietary', errors.dietaryOther ?? 'Contame cuál.');
      dietaryOtherInput?.focus();
      return;
    }

    if (!navigator.onLine) {
      showFormError(errors.offline ?? errors.network);
      return;
    }

    setState('submitting');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...check.value, website: candidate.website }),
      });

      const body = (await res.json().catch(() => ({ ok: false }))) as RsvpResponse;

      if (!res.ok || !body.ok) {
        setState('error');
        showFormError(res.status >= 500 || !res.ok ? errors.server : (body.message ?? errors.server));
        return;
      }

      setState('success');
      const key = check.value.attending === 'yes' ? 'successYes' : 'successNo';
      if (successTitle) successTitle.textContent = messages[key]?.title ?? '¡Gracias!';
      if (successText) successText.textContent = messages[key]?.text ?? '';

      panel.hidden = true;
      success.hidden = false;
      success.setAttribute('tabindex', '-1');
      success.focus({ preventScroll: true });
      // El CTA flotante ya no tiene sentido una vez confirmado
      document.dispatchEvent(new CustomEvent('invitation:rsvp-done'));
    } catch {
      setState('error');
      showFormError(errors.network);
    }
  });

  function showFormError(message?: string): void {
    if (!formError) return;
    formError.textContent = message ?? 'Algo salió mal.';
    formError.hidden = false;
    formError.setAttribute('tabindex', '-1');
    formError.focus({ preventScroll: true });
  }
}
