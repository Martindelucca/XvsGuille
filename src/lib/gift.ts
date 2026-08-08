/**
 * Copiar el alias al portapapeles.
 * El alias siempre está visible y es seleccionable a mano: el botón es una
 * comodidad, nunca el único camino. Si el navegador bloquea el portapapeles
 * (pasa en contextos no seguros), se lo deja seleccionado y se avisa.
 */
export function initGift(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-gift-copy]');
  const alias = document.querySelector<HTMLElement>('[data-gift-alias]');
  const status = document.querySelector<HTMLElement>('[data-gift-status]');
  if (!button || !alias) return;

  const labelIdle = button.dataset.labelIdle ?? 'Copiar alias';
  const labelDone = button.dataset.labelDone ?? 'Copiado';
  const labelError = button.dataset.labelError ?? 'No se pudo copiar';

  let resetTimer: number | undefined;

  const announce = (message: string): void => {
    if (status) status.textContent = message;
  };

  const selectAlias = (): void => {
    const range = document.createRange();
    range.selectNodeContents(alias);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  button.addEventListener('click', async () => {
    const text = (alias.textContent ?? '').trim();
    if (!text) return;

    window.clearTimeout(resetTimer);

    try {
      await navigator.clipboard.writeText(text);
      button.dataset.state = 'done';
      announce(labelDone);
    } catch {
      // Sin portapapeles: al menos lo dejamos listo para copiar a mano.
      selectAlias();
      button.dataset.state = 'error';
      announce(labelError);
    }

    resetTimer = window.setTimeout(() => {
      button.dataset.state = 'idle';
      announce('');
    }, 3000);
  });

  button.dataset.state = 'idle';
  button.setAttribute('aria-label', labelIdle);
}
