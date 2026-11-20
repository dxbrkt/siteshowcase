export function initFaq() {
  document.querySelectorAll('.faq-row__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.faq-row');
      const body = row ? row.querySelector('.faq-row__body') : null;
      if (!row || !body) return;
      const open = !row.classList.contains('is-open');
      row.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
    });
  });
}
