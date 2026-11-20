import { withBase } from '../lib/urls';
const siteUrl = (pathname) => withBase('/' + pathname.replace(/^\//, ''));
function formatRub(num) {
  return Math.round(num).toLocaleString('ru-RU') + ' ₽';
}
export function initCalculator() {
  const calcSelect = document.getElementById('calcServiceSelect');
  const calcQty = document.getElementById('calcQtyInput');
  const calcFreq = document.getElementById('calcFreqSelect');
  const calcUnitLabel = document.getElementById('calcUnitLabel');
  const calcPreviewSum = document.getElementById('calcPreviewSum');
  const calcAddBtn = document.getElementById('calcAddBtn');

  const matSizeSelect = document.getElementById('matSizeSelect');
  const matCountInput = document.getElementById('matCountInput');
  const matSwapsSelect = document.getElementById('matSwapsSelect');
  const matPreviewSum = document.getElementById('matPreviewSum');
  const matAddBtn = document.getElementById('matAddBtn');

  const basketEl = document.getElementById('calcBasketItems');
  const subtotalEl = document.getElementById('calcSubtotal');
  const grandTotalEl = document.getElementById('calcGrandTotal');
  const clearBtn = document.getElementById('calcClearBtn');
  const sendEstimateLink = document.getElementById('sendEstimateLink');

  if (calcSelect && basketEl) {
    let basket = [
      {
        title: 'Ежедневная поддерживающая уборка офиса',
        meta: '250 м² × 35 ₽ (разово)',
        sum: 8750,
      },
    ];

    function updateMainPreview() {
      const opt = calcSelect.options[calcSelect.selectedIndex];
      const price = parseFloat(opt.getAttribute('data-price') || '0');
      const unit = opt.getAttribute('data-unit') || 'м²';
      const qty = Math.max(1, parseFloat(calcQty.value || '1'));
      const freq = Math.max(1, parseInt(calcFreq.value || '1', 10));
      if (calcUnitLabel) calcUnitLabel.textContent = unit;
      const sum = price * qty * freq;
      if (calcPreviewSum) calcPreviewSum.textContent = formatRub(sum);
      return { opt, price, unit, qty, freq, sum };
    }

    function updateMatPreview() {
      if (!matSizeSelect) return null;
      const opt = matSizeSelect.options[matSizeSelect.selectedIndex];
      const swapPrice = parseFloat(opt.value || '0');
      const sizeLabel = opt.getAttribute('data-size') || '';
      const count = Math.max(1, parseInt(matCountInput.value || '1', 10));
      const swaps = Math.max(1, parseInt(matSwapsSelect.value || '1', 10));
      const monthlySum = swapPrice * count * swaps * 4;
      if (matPreviewSum) matPreviewSum.textContent = formatRub(monthlySum);
      return { sizeLabel, count, swaps, monthlySum };
    }

    function renderBasket() {
      if (!basket.length) {
        basketEl.innerHTML =
          '<div class="basket-empty">Добавьте интересующие виды работ слева для расчёта сметы.</div>';
      } else {
        basketEl.innerHTML = basket
          .map(
            (item, idx) => `
          <div class="basket-row">
            <div>
              <span class="basket-row__title">${item.title}</span>
              <span class="basket-row__meta">${item.meta}</span>
            </div>
            <div class="basket-row__right">
              <strong>${formatRub(item.sum)}</strong>
              <button type="button" class="basket-row__del" data-del="${idx}" aria-label="Удалить">&times;</button>
            </div>
          </div>`,
          )
          .join('');
      }

      const sub = basket.reduce((a, b) => a + b.sum, 0);
      const grand = sub;

      if (subtotalEl) subtotalEl.textContent = formatRub(sub);
      if (grandTotalEl) grandTotalEl.textContent = formatRub(grand);

      if (sendEstimateLink) {
        if (basket.length) {
          const lines = basket
            .map((it) => `• ${it.title} (${it.meta}) — ${formatRub(it.sum)}`)
            .join('\n');
          const summary = `Предварительный расчёт из калькулятора:\n${lines}\nИтого: ~${formatRub(grand)}`;
          sendEstimateLink.href = siteUrl(
            `kontakty/?service=free-estimate&summary=${encodeURIComponent(summary)}#estimate`,
          );
        } else {
          sendEstimateLink.href = siteUrl('kontakty/#estimate');
        }
      }

      basketEl.querySelectorAll('[data-del]').forEach((btn) => {
        btn.addEventListener('click', () => {
          basket.splice(parseInt(btn.getAttribute('data-del'), 10), 1);
          renderBasket();
        });
      });
    }

    [calcSelect, calcQty, calcFreq].forEach((el) => {
      if (el) {
        el.addEventListener('input', updateMainPreview);
        el.addEventListener('change', updateMainPreview);
      }
    });

    [matSizeSelect, matCountInput, matSwapsSelect].forEach((el) => {
      if (el) {
        el.addEventListener('input', updateMatPreview);
        el.addEventListener('change', updateMatPreview);
      }
    });

    if (calcAddBtn) {
      calcAddBtn.addEventListener('click', () => {
        const c = updateMainPreview();
        const title = c.opt.textContent.split(' — ')[0];
        const freqText = c.freq === 1 ? 'разово' : `${c.freq} смен/выездов`;
        basket.push({
          title,
          meta: `${c.qty} ${c.unit} × ${c.price} ₽ (${freqText})`,
          sum: c.sum,
        });
        renderBasket();
      });
    }

    if (matAddBtn) {
      matAddBtn.addEventListener('click', () => {
        const m = updateMatPreview();
        if (!m) return;
        basket.push({
          title: `Аренда грязезащитных ковров ${m.sizeLabel}`,
          meta: `${m.count} шт. × ${m.swaps} зам./нед. (4 недели)`,
          sum: m.monthlySum,
        });
        renderBasket();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        basket = [];
        renderBasket();
      });
    }

    updateMainPreview();
    updateMatPreview();
    renderBasket();
  }
}
