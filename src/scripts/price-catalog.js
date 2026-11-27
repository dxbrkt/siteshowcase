export function initPriceCatalog() {
  const catalog = document.getElementById('prices');
  const panels = Array.from(catalog.querySelectorAll('[data-price-panel]'));
  const links = Array.from(catalog.querySelectorAll('[data-price-link]'));
  const direction = document.getElementById('priceDirection');
  const object = catalog.querySelector('[data-price-object]');

  function selectPanel(id) {
    direction.value = id;
    for (const panel of panels) panel.hidden = panel.id !== id;
    for (const link of links) {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  function selectFromUrl() {
    const panel = panels.find((element) => `#${element.id}` === location.hash);
    if (panel) selectPanel(panel.id);
    if (!location.hash) selectPanel(panels[0].id);
  }

  function navigate(id) {
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    selectPanel(id);
  }

  for (const link of links) {
    link.addEventListener('click', (event) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      navigate(link.hash.slice(1));
    });
  }
  direction.addEventListener('change', () => navigate(direction.value));
  window.addEventListener('hashchange', selectFromUrl);

  if (object) {
    const rows = object
      .closest('[data-price-panel]')
      .querySelectorAll('[data-price-type]');
    const filterObjects = () => {
      for (const row of rows) {
        row.hidden =
          Boolean(object.value) && row.dataset.priceType !== object.value;
        row.querySelector('[data-object-name]').hidden = Boolean(object.value);
      }
    };
    object.addEventListener('change', filterObjects);
    filterObjects();
    object.closest('.prices-object').hidden = false;
  }

  selectPanel(panels[0].id);
  selectFromUrl();
  direction.closest('.prices-picker').hidden = false;
  catalog.dataset.enhanced = '';

  const initialPanel = panels.find((panel) => `#${panel.id}` === location.hash);
  if (initialPanel) initialPanel.scrollIntoView();
}
