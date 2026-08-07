/**
 * Overlay de apertura: la "puerta" de la invitación.
 *
 * Responsabilidades:
 *  · bloquear el scroll mientras está cerrada
 *  · atrapar el foco dentro del overlay (accesibilidad)
 *  · al abrir, correr la cortina y devolver el foco al contenido
 *  · emitir `invitation:open`, único gesto de usuario válido para el audio
 *
 * El contenido de la página SIEMPRE está en el DOM debajo del overlay: el
 * overlay es puramente visual, así que no afecta al SEO ni al no-JS.
 */

const OPEN_EVENT = 'invitation:open';

export function initOpening(): void {
  const overlay = document.querySelector<HTMLElement>('[data-opening]');
  const button = document.querySelector<HTMLButtonElement>('[data-opening-btn]');
  const main = document.querySelector<HTMLElement>('main');
  if (!overlay || !button) return;

  const root = document.documentElement;
  root.classList.add('is-locked');

  // Todo lo que no sea el overlay queda fuera del recorrido de teclado y de
  // los lectores de pantalla mientras la invitación está cerrada.
  const background = Array.from(document.body.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute('data-opening'),
  );
  background.forEach((el) => el.setAttribute('inert', ''));

  // Foco atrapado: el overlay tiene un único control, así que alcanza con
  // devolverle el foco si algo se lo lleva.
  const keepFocus = (e: FocusEvent): void => {
    if (!overlay.contains(e.target as Node)) {
      e.stopPropagation();
      button.focus();
    }
  };
  document.addEventListener('focusin', keepFocus);

  let opened = false;

  const open = (): void => {
    if (opened) return;
    opened = true;

    button.disabled = true;
    overlay.classList.add('is-opening');
    root.classList.remove('is-locked');
    background.forEach((el) => el.removeAttribute('inert'));
    document.removeEventListener('focusin', keepFocus);

    // Aviso al resto de la app (música, animaciones de entrada del hero)
    document.dispatchEvent(new CustomEvent(OPEN_EVENT));
    document.body.classList.add('is-open');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = reduced ? 0 : 1100;

    window.setTimeout(() => {
      overlay.hidden = true;
      overlay.remove();
      // El foco tiene que continuar el recorrido, no volver al principio del DOM
      main?.setAttribute('tabindex', '-1');
      main?.focus({ preventScroll: true });
    }, wait);
  };

  button.addEventListener('click', open, { once: true });
}

export { OPEN_EVENT };
