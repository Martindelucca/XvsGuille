/** Punto de entrada único del cliente. Todo lo demás es HTML y CSS. */
import { initOpening } from './opening';
import { initReveal } from './reveal';
import { initCountdown } from './countdown';
import { initRsvp } from './rsvp';
import { initMusic } from './music';
import { initFloatingCta } from './floating-cta';

const boot = (): void => {
  initOpening();
  initReveal();
  initCountdown();
  initRsvp();
  initMusic();
  initFloatingCta();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
