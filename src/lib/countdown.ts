/**
 * Cuenta regresiva. Se apoya en un timestamp absoluto con offset horario, así
 * que es correcta para un invitado en cualquier zona horaria.
 * Se pausa cuando la pestaña queda oculta (ahorra batería en mobile).
 */

type Parts = { days: number; hours: number; minutes: number; seconds: number };

const split = (ms: number): Parts => ({
  days: Math.floor(ms / 86_400_000),
  hours: Math.floor(ms / 3_600_000) % 24,
  minutes: Math.floor(ms / 60_000) % 60,
  seconds: Math.floor(ms / 1000) % 60,
});

const pad = (n: number): string => String(Math.max(0, n)).padStart(2, '0');

export function initCountdown(): void {
  const root = document.querySelector<HTMLElement>('[data-countdown]');
  if (!root) return;

  const target = new Date(root.dataset.countdown ?? '').getTime();
  if (Number.isNaN(target)) {
    root.hidden = true;
    return;
  }

  const cells: Record<keyof Parts, HTMLElement | null> = {
    days: root.querySelector('[data-unit="days"]'),
    hours: root.querySelector('[data-unit="hours"]'),
    minutes: root.querySelector('[data-unit="minutes"]'),
    seconds: root.querySelector('[data-unit="seconds"]'),
  };
  const grid = root.querySelector<HTMLElement>('[data-countdown-grid]');
  const done = root.querySelector<HTMLElement>('[data-countdown-done]');

  let timer: number | undefined;

  const render = (): void => {
    const remaining = target - Date.now();

    if (remaining <= 0) {
      if (grid) grid.hidden = true;
      if (done) done.hidden = false;
      stop();
      return;
    }

    const parts = split(remaining);
    (Object.keys(cells) as Array<keyof Parts>).forEach((key) => {
      const cell = cells[key];
      if (!cell) return;
      const next = key === 'days' ? String(parts.days) : pad(parts[key]);
      if (cell.textContent !== next) cell.textContent = next;
    });
  };

  const start = (): void => {
    render();
    if (timer === undefined) timer = window.setInterval(render, 1000);
  };

  const stop = (): void => {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };

  start();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
}
