export function initGallery() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const filterGrid = document.querySelector('.js-filter-grid');

  if (filterPills.length && filterGrid) {
    const cards = Array.from(filterGrid.children);
    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-filter') || 'all';
        filterPills.forEach((p) => p.classList.toggle('is-active', p === pill));
        cards.forEach((c) => {
          c.hidden = !(
            cat === 'all' || c.getAttribute('data-category') === cat
          );
        });
      });
    });
  }
}
