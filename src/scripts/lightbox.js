export function initLightbox() {
  const dialog = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const closeButton = document.getElementById('lightboxClose');
  const previous = document.getElementById('lightboxPrev');
  const next = document.getElementById('lightboxNext');
  const triggers = [...document.querySelectorAll('.js-lightbox-item')];

  if (
    !(dialog instanceof HTMLDialogElement) ||
    !image ||
    !caption ||
    !triggers.length
  )
    return;

  let items = [];
  let index = 0;
  let opener;
  let originalOverflow;

  function showImage(nextIndex) {
    index = (nextIndex + items.length) % items.length;
    const { src, caption: description = '' } = items[index].dataset;
    image.src = src;
    image.alt = description;
    caption.textContent = description;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const source = trigger.dataset.src;
      if (!source) return;

      const seen = new Set();
      items = triggers.filter((item) => {
        const src = item.dataset.src;
        if (!src || seen.has(src) || item.closest('[hidden]')) return false;
        seen.add(src);
        return true;
      });

      const selectedIndex = items.findIndex(
        (item) => item.dataset.src === source,
      );
      if (selectedIndex < 0) return;
      event.preventDefault();
      opener = trigger;
      showImage(selectedIndex);
      originalOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });

    if (trigger.getAttribute('role') === 'button') {
      trigger.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        trigger.click();
      });
    }
  });

  closeButton?.addEventListener('click', () => dialog.close());
  previous?.addEventListener('click', () => showImage(index - 1));
  next?.addEventListener('click', () => showImage(index + 1));

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showImage(index - 1);
    if (event.key === 'ArrowRight') showImage(index + 1);
  });

  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    document.body.style.overflow = originalOverflow;
    opener?.focus();
  });
}
