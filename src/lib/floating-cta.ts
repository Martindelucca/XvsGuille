/**
 * CTA flotante de confirmación (mobile).
 * Aparece cuando el hero salió de vista y se retira al llegar al formulario o
 * cuando ya se confirmó. Nunca tapa el contenido: es una pastilla baja y corta.
 */
export function initFloatingCta(): void {
  const cta = document.querySelector<HTMLElement>('[data-floating-cta]');
  const hero = document.getElementById('inicio');
  const rsvp = document.getElementById('confirmar');
  if (!cta || !hero) return;

  let pastHero = false;
  let atRsvp = false;
  let dismissed = false;

  const sync = (): void => {
    cta.dataset.visible = String(pastHero && !atRsvp && !dismissed);
  };

  new IntersectionObserver(
    ([entry]) => {
      pastHero = !entry!.isIntersecting;
      sync();
    },
    { threshold: 0, rootMargin: '-40% 0px 0px 0px' },
  ).observe(hero);

  if (rsvp) {
    new IntersectionObserver(
      ([entry]) => {
        atRsvp = entry!.isIntersecting;
        sync();
      },
      { threshold: 0, rootMargin: '0px 0px -20% 0px' },
    ).observe(rsvp);
  }

  document.addEventListener('invitation:rsvp-done', () => {
    dismissed = true;
    sync();
  });

  sync();
}
