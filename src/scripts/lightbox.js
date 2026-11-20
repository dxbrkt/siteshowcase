export function initLightbox() {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCaption');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');

  const triggers = Array.from(document.querySelectorAll('.js-lightbox-item'));
  let lbIndex = -1;

  function visibleItems() {
    return triggers.filter(
      (el, index) =>
        !el.hidden &&
        triggers.findIndex(
          (item) =>
            item.getAttribute('data-src') === el.getAttribute('data-src'),
        ) === index,
    );
  }

  function openLbAt(i) {
    const vis = visibleItems();
    if (!lb || !lbImg || !vis.length) return;
    lbIndex = (i + vis.length) % vis.length;
    const item = vis[lbIndex];
    lbImg.src = item.getAttribute('data-src') || '';
    lbImg.alt = item.getAttribute('data-caption') || '';
    if (lbCap) lbCap.textContent = item.getAttribute('data-caption') || '';
    lb.hidden = false;
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    if (!lb) return;
    lb.hidden = true;
    lb.setAttribute('aria-hidden', 'true');
    if (lbImg) lbImg.src = '';
    document.body.style.overflow = '';
  }

  triggers.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const vis = visibleItems();
      openLbAt(
        Math.max(
          0,
          vis.findIndex(
            (item) =>
              item.getAttribute('data-src') === el.getAttribute('data-src'),
          ),
        ),
      );
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lbPrev)
    lbPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      openLbAt(lbIndex - 1);
    });
  if (lbNext)
    lbNext.addEventListener('click', (e) => {
      e.stopPropagation();
      openLbAt(lbIndex + 1);
    });
  if (lb)
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLb();
    });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lb && !lb.hidden) closeLb();
    } else if (lb && !lb.hidden) {
      if (e.key === 'ArrowLeft') openLbAt(lbIndex - 1);
      if (e.key === 'ArrowRight') openLbAt(lbIndex + 1);
    }
  });
}
