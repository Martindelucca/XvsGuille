/**
 * Control de música.
 *
 * Regla de oro: el audio NUNCA arranca solo. Sólo puede iniciarse dentro del
 * gesto de "Abrir invitación" (o del propio botón ♫), que es lo único que los
 * navegadores aceptan. Si el navegador igual lo rechaza, el control queda en
 * pausa sin romper nada.
 */
import { OPEN_EVENT } from './opening';

const FADE_MS = 900;

export function initMusic(): void {
  const audio = document.querySelector<HTMLAudioElement>('[data-music-audio]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-music-toggle]');
  if (!audio || !toggle) return;

  const maxVolume = Number(audio.dataset.volume ?? '0.35');
  const labelOn = toggle.dataset.labelOn ?? 'Pausar música';
  const labelOff = toggle.dataset.labelOff ?? 'Reproducir música';

  let fadeTimer: number | undefined;

  const fadeTo = (to: number, done?: () => void): void => {
    window.clearInterval(fadeTimer);
    const from = audio.volume;
    const start = performance.now();
    fadeTimer = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / FADE_MS);
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (t === 1) {
        window.clearInterval(fadeTimer);
        done?.();
      }
    }, 40);
  };

  const setState = (playing: boolean): void => {
    toggle.dataset.playing = String(playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? labelOn : labelOff);
  };

  const play = async (): Promise<void> => {
    try {
      audio.volume = 0;
      await audio.play();
      fadeTo(maxVolume);
      setState(true);
    } catch {
      // Autoplay bloqueado: dejamos el control disponible, sin ruido para el usuario.
      setState(false);
    }
  };

  const pause = (): void => {
    fadeTo(0, () => audio.pause());
    setState(false);
  };

  toggle.addEventListener('click', () => {
    if (audio.paused) void play();
    else pause();
  });

  // Primer intento: dentro del gesto de apertura.
  document.addEventListener(OPEN_EVENT, () => void play(), { once: true });

  setState(false);
}
