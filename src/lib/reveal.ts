/**
 * Reveal progresivo al hacer scroll.
 * Un solo IntersectionObserver para toda la página: no hay listeners de scroll,
 * así que no compite con el hilo principal durante el desplazamiento.
 */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        // Escalonado por grupo: data-reveal="2" → 2 × 90 ms de retardo
        const step = Number(el.dataset.reveal) || 0;
        el.style.setProperty('--reveal-delay', `${step * 90}ms`);
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );

  targets.forEach((el) => observer.observe(el));
}
