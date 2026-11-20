export function initNavigation() {
  const navbar = document.getElementById('navbar');
  function syncNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 10);
  }
  syncNavbarScroll();
  window.addEventListener('scroll', syncNavbarScroll, { passive: true });

  const openBtn = document.getElementById('drawerOpenBtn');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const backdrop = document.getElementById('drawerBackdrop');
  const drawer = document.getElementById('mobileDrawer');

  function setDrawerOpen(open) {
    if (!drawer || !backdrop || !openBtn) return;
    drawer.classList.toggle('navbar__drawer--open', open);
    backdrop.classList.toggle('navbar__backdrop--open', open);
    openBtn.classList.toggle('navbar__hamburger--open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    if (open) closeBtn?.focus();
    else openBtn.focus();
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (drawer) drawer.inert = true;
  document.addEventListener('keydown', (event) => {
    if (!drawer?.classList.contains('navbar__drawer--open')) return;
    if (event.key === 'Escape') setDrawerOpen(false);
    if (event.key === 'Tab') {
      const items = [...drawer.querySelectorAll('a, button')];
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  if (openBtn) openBtn.addEventListener('click', () => setDrawerOpen(true));
  if (closeBtn) closeBtn.addEventListener('click', () => setDrawerOpen(false));
  if (backdrop) backdrop.addEventListener('click', () => setDrawerOpen(false));
  if (drawer) {
    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setDrawerOpen(false));
    });
  }
}
