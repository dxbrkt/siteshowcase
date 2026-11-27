import {
  CALCULATOR_DIRECTIONS,
  displayRate,
  formatRub,
  getUnit,
} from '../data/pricing-directions';
import { withBase } from '../lib/urls';

const periodNames = {
  once: 'Разово',
  month: 'За месяц',
  fourWeeks: 'За 4 недели',
  roof: 'Абонентское обслуживание кровли',
};

function formatCost(cents, from = false) {
  return `${from ? 'от ' : ''}${formatRub(cents / 100)}`;
}

function toggleField(field, visible) {
  field.disabled = !visible;
  field.closest('.estimate-field').hidden = !visible;
}

function populate(select, labels, placeholder) {
  const prompt = new Option(placeholder, '', true, true);
  prompt.disabled = true;
  select.replaceChildren(
    prompt,
    ...labels.map(([value, label]) => new Option(label, value)),
  );
}

export function initCalculator() {
  const form = document.getElementById('estimateForm');
  const section = document.getElementById('calculator');
  const direction = document.getElementById('estimateDirection');
  const group = document.getElementById('estimateGroup');
  const groupLabel = document.getElementById('estimateGroupLabel');
  const work = document.getElementById('estimateWork');
  const workLabel = document.getElementById('estimateWorkLabel');
  const details = document.getElementById('estimateDetails');
  const quantity = document.getElementById('estimateQuantity');
  const quantityLabel = document.getElementById('estimateQuantityLabel');
  const frequency = document.getElementById('estimateFrequency');
  const swaps = document.getElementById('estimateSwaps');
  const footer = document.getElementById('estimateFormFooter');
  const rate = document.getElementById('estimateRate');
  const preview = document.getElementById('estimatePreview');
  const list = document.getElementById('estimateItems');
  const totals = document.getElementById('estimateTotals');
  const clear = document.getElementById('estimateClear');
  const empty = document.getElementById('estimateEmpty');
  const send = document.getElementById('estimateSend');
  const note = document.getElementById('estimateNote');
  const mobileLink = document.getElementById('estimateMobileLink');
  const status = document.getElementById('estimateStatus');
  const directions = new Map(
    CALCULATOR_DIRECTIONS.map((entry) => [entry.slug, entry]),
  );
  const items = new Map(
    CALCULATOR_DIRECTIONS.flatMap((entry) =>
      entry.groups.flatMap((category, groupIndex) =>
        category.items.map((item) => [
          item.id,
          { item, direction: entry, groupIndex },
        ]),
      ),
    ),
  );
  const basket = [];

  function readLine() {
    const selection = items.get(work.value);
    if (!selection || !quantity.validity.valid || !quantity.value) return null;

    const { item, direction: entry, groupIndex } = selection;
    const count = quantity.valueAsNumber;
    const { unit } = getUnit(item.unit);
    const visits = item.repeatable ? Number(frequency.value) : 1;
    const replacements = Number(swaps.value);
    const multiplier = item.rental ? replacements * 4 : visits;
    const period = item.rental
      ? 'fourWeeks'
      : item.subscription
        ? 'roof'
        : visits > 1
          ? 'month'
          : 'once';
    const category = entry.groups[groupIndex];
    const title = item.rental
      ? `Аренда ковров · ${item.label}`
      : entry.groups.length > 1
        ? `${item.label} · ${category.label}`
        : item.label;
    const amount = count.toLocaleString('ru-RU');
    const rateText = formatCost(item.price * 100, item.from);
    const breakdown = item.rental
      ? `${amount} ${unit} × ${rateText} × ${replacements} зам./нед. × 4 нед.`
      : `${amount} ${unit} × ${rateText}${visits > 1 ? ` × ${visits} выездов` : ''}`;

    return {
      title,
      breakdown,
      cents: Math.round(count * item.price * multiplier * 100),
      from: item.from,
      period,
    };
  }

  function updatePreview() {
    const line = readLine();
    preview.value = line
      ? `${formatCost(line.cents, line.from)} · ${periodNames[line.period].toLowerCase()}`
      : '';
    preview.hidden = !line;
  }

  function selectWork() {
    const item = items.get(work.value)?.item;
    details.hidden = !item;
    footer.hidden = !item;
    toggleField(quantity, Boolean(item));
    toggleField(frequency, Boolean(item?.repeatable));
    toggleField(swaps, Boolean(item?.rental));

    if (item) {
      const { label, unit } = getUnit(item.unit);
      quantityLabel.textContent = `${label}, ${unit}`;
      quantity.min = item.unit === 'шт.' ? '1' : '0.01';
      quantity.max = item.rental ? '200' : '500000';
      quantity.step = item.unit === 'шт.' ? '1' : '0.01';
      quantity.inputMode = item.unit === 'шт.' ? 'numeric' : 'decimal';
      quantity.value = '';
      frequency.value = '1';
      swaps.value = '2';
      rate.textContent = displayRate(item.priceText, item.unit, item.rental);
    }
    updatePreview();
  }

  function selectGroup() {
    const entry = directions.get(direction.value);
    const category = entry?.groups[Number(group.value)];
    const isSize = entry?.slug === 'gryazezashchitnye-kovry';
    workLabel.textContent = isSize ? 'Размер ковра' : 'Вид работ';
    populate(
      work,
      category?.items.map((item) => [item.id, item.label]) ?? [],
      isSize ? 'Выберите размер' : 'Выберите работу',
    );
    toggleField(work, Boolean(category));
    selectWork();
  }

  function selectDirection() {
    const entry = directions.get(direction.value);
    if (!entry) return;
    groupLabel.textContent =
      entry.slug === 'uborka-pomeshenij'
        ? 'Тип объекта'
        : entry.slug === 'gryazezashchitnye-kovry'
          ? 'Услуга'
          : 'Раздел';
    populate(
      group,
      entry.groups.map((category, index) => [String(index), category.label]),
      'Выберите раздел',
    );
    toggleField(group, entry.groups.length > 1);
    group.required = entry.groups.length > 1;
    group.value = '0';
    selectGroup();
  }

  function renderLine(line, index) {
    const row = document.createElement('li');
    row.className = 'estimate-item';

    const title = document.createElement('strong');
    title.textContent = line.title;

    const breakdown = document.createElement('small');
    breakdown.textContent = line.breakdown;

    const amount = document.createElement('span');
    amount.className = 'estimate-item__amount';
    amount.textContent = `${formatCost(line.cents, line.from)} · ${periodNames[line.period].toLowerCase()}`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'estimate-remove';
    remove.dataset.removeItem = String(index);
    remove.setAttribute('aria-label', `Удалить: ${line.title}`);
    const cross = document.createElement('span');
    cross.setAttribute('aria-hidden', 'true');
    cross.textContent = '×';
    remove.append(cross);

    row.append(title, breakdown, amount, remove);
    return row;
  }

  function renderBasket() {
    const hasItems = basket.length > 0;
    empty.hidden = hasItems;
    for (const element of [list, totals, clear, send, note, mobileLink])
      element.hidden = !hasItems;
    list.replaceChildren(...basket.map(renderLine));
    totals.replaceChildren();
    if (!hasItems) return;

    const subtotals = new Map();
    for (const { period, cents, from } of basket) {
      const total = subtotals.get(period) || { cents: 0, from: false };
      total.cents += cents;
      total.from ||= from;
      subtotals.set(period, total);
    }

    const totalLines = [];
    for (const [period, label] of Object.entries(periodNames)) {
      const total = subtotals.get(period);
      if (!total) continue;
      const amount = formatCost(total.cents, total.from);
      const row = document.createElement('div');
      const name = document.createElement('dt');
      name.textContent = label;
      const value = document.createElement('dd');
      value.textContent = amount;
      row.append(name, value);
      totals.append(row);
      totalLines.push(`${label}: ${amount}`);
    }

    const summary = [
      'Предварительная смета',
      ...basket.map(
        (line) =>
          `• ${line.title} (${line.breakdown}) — ${formatCost(line.cents, line.from)}, ${periodNames[line.period].toLowerCase()}`,
      ),
      '',
      ...totalLines,
    ].join('\n');
    const params = new URLSearchParams({ service: 'free-estimate', summary });
    send.href = withBase(`/kontakty/?${params}#estimate`);
    mobileLink.textContent = `К смете (${basket.length}) ↓`;
  }

  direction.addEventListener('change', selectDirection);
  group.addEventListener('change', selectGroup);
  work.addEventListener('change', selectWork);
  quantity.addEventListener('input', updatePreview);
  frequency.addEventListener('change', updatePreview);
  swaps.addEventListener('change', updatePreview);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const line = readLine();
    if (!line) return;
    basket.push(line);
    renderBasket();
    status.textContent = `Добавлено: ${line.title}. Позиций в смете: ${basket.length}.`;
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-item]');
    if (!button) return;
    const index = Number(button.dataset.removeItem);
    basket.splice(index, 1);
    renderBasket();
    status.textContent = `Позиция удалена. Позиций в смете: ${basket.length}.`;
    (
      list.querySelectorAll('button')[Math.min(index, basket.length - 1)] ??
      direction
    ).focus();
  });

  clear.addEventListener('click', () => {
    basket.length = 0;
    renderBasket();
    status.textContent = 'Смета очищена.';
    direction.focus();
  });

  for (const link of document.querySelectorAll('[data-estimate-item]')) {
    const selection = items.get(link.dataset.estimateItem);
    if (!selection) continue;
    link.hidden = false;
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
      direction.value = selection.direction.slug;
      selectDirection();
      group.value = String(selection.groupIndex);
      selectGroup();
      work.value = selection.item.id;
      selectWork();
      if (location.hash !== '#calculator')
        history.pushState(null, '', '#calculator');
      section.scrollIntoView({ behavior: 'instant' });
      quantity.focus({ preventScroll: true });
    });
  }

  form.closest('.estimate-layout').hidden = false;
}
