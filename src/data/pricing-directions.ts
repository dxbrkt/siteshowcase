import { CALCULATOR_ITEMS, MAT_RENTAL_SIZES } from './pricing';

export const DIRECTIONS = [
  { slug: 'uborka-ofisov', label: 'Уборка офисов', groups: ['Уборка офисов'] },
  {
    slug: 'uborka-pomeshenij',
    label: 'БЦ, ТЦ и другие помещения',
    groups: ['Уборка помещений /'],
  },
  {
    slug: 'uhod-za-polami',
    label: 'Уход за полами',
    groups: ['Уход за твердыми полами /'],
  },
  {
    slug: 'mojka-okon-i-fasadov',
    label: 'Мойка окон и фасадов',
    groups: ['МОЙКА ОКОН И ФАСАДОВ'],
  },
  {
    slug: 'vysotnye-raboty',
    label: 'Высотные работы',
    groups: ['Услуги промышленного альпинизма'],
  },
  {
    slug: 'uborka-posle-remonta',
    label: 'После ремонта, мероприятий и ЧП',
    groups: ['Уборка после'],
  },
  {
    slug: 'uborka-territorii',
    label: 'Уборка территории',
    groups: ['Уборка прилегающей территории', 'Вывоз мусора'],
  },
  { slug: 'ekspluataciya-zdanij', label: 'Эксплуатация зданий', groups: [] },
  {
    slug: 'himchistka',
    label: 'Химчистка мебели и ковролина',
    groups: ['Химчистка'],
  },
  {
    slug: 'gryazezashchitnye-kovry',
    label: 'Грязезащитные ковры',
    groups: ['АРЕНДА И ОБСЛУЖИВАНИЕ', 'ПРОДАЖА ГРЯЗЕЗАЩИТНЫХ'],
  },
  {
    slug: 'uborka-kvartir',
    label: 'Уборка квартир',
    groups: ['УБОРКА КВАРТИР /'],
  },
  {
    slug: 'uborka-kottedzhej',
    label: 'Уборка коттеджей',
    groups: ['УБОРКА КОТТЕДЖЕЙ'],
  },
  {
    slug: 'other',
    label: 'Дополнительные работы',
    groups: ['Дополнительные услуги'],
  },
];

const objectLabels: Record<string, string> = {
  'Торговых центров': 'Торговые центры',
  'Бизнес центров': 'Бизнес-центры',
  'Служебных помещений': 'Служебные помещения',
  'Подземного паркинга': 'Подземный паркинг',
  Магазинов: 'Магазины',
  Ресторанов: 'Рестораны',
  'Строительный площадок': 'Строительные площадки',
  'Фитнес-центров': 'Фитнес-центры',
  'Медицинских учреждений': 'Медицинские учреждения',
  Гостиниц: 'Гостиницы',
  Аэропорта: 'Аэропорты',
  'Складских помещений': 'Склады',
  Цехов: 'Цеха',
};

const unitDetails: Record<string, { unit: string; label: string }> = {
  'кв. м': { unit: 'м²', label: 'Площадь' },
  'п. м': { unit: 'пог. м', label: 'Длина' },
  'куб. м': { unit: 'м³', label: 'Объём' },
  'шт.': { unit: 'шт.', label: 'Количество' },
};

export const getUnit = (unit: string) =>
  unitDetails[unit] ?? { unit, label: 'Объём' };

const compactName = (text: string) => text.replace(/\s+/g, ' ').trim();
export function displayWorkName(text: string) {
  const name = compactName(text);
  return name.charAt(0).toUpperCase() + name.slice(1);
}
const normalize = (text: string) =>
  compactName(text).toLowerCase().replaceAll('ё', 'е');

const formatAmount = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});
export const formatRub = (rubles: number) =>
  `${formatAmount.format(rubles)}\u00a0₽`;

function groupLabel(group: string) {
  if (group.startsWith('АРЕНДА И ОБСЛУЖИВАНИЕ')) return 'Аренда и замена';
  if (group.startsWith('ПРОДАЖА ГРЯЗЕЗАЩИТНЫХ')) return 'Продажа';
  const parts = group.split(' / ');
  const suffix = compactName(parts.at(-1) ?? group);
  return (
    objectLabels[suffix] ??
    (parts.length > 1
      ? suffix.charAt(0).toUpperCase() + suffix.slice(1)
      : suffix)
  );
}

export const CALCULATOR_DIRECTIONS = DIRECTIONS.flatMap((direction) => {
  const items = CALCULATOR_ITEMS.filter((item) =>
    direction.groups.some((group) => item.group.startsWith(group)),
  ).map((item) => {
    const rental = item.group.startsWith('АРЕНДА И ОБСЛУЖИВАНИЕ')
      ? MAT_RENTAL_SIZES.find((size) => size.size === `${item.name} см`)
      : undefined;
    return {
      ...item,
      label: rental
        ? rental.size.replace(/(\d)х(\d)/u, '$1 × $2')
        : displayWorkName(item.name),
      price: rental?.pricePerSwap ?? item.price,
      rental: Boolean(rental),
      subscription: item.group.includes('Абонентское обслуживание кровли'),
      repeatable:
        /ежедневн|поддерживающ/i.test(item.name + item.group) ||
        (item.group === 'Уборка офисов' && item.id !== 'h_price_field_4') ||
        item.group === 'Уборка прилегающей территории',
      from: item.priceText.startsWith('от '),
    };
  });
  const groups = [...new Set(items.map((item) => item.group))].map((group) => ({
    label: groupLabel(group),
    items: items.filter((item) => item.group === group),
  }));
  return groups.length
    ? [{ slug: direction.slug, label: direction.label, groups }]
    : [];
});

export function connectPriceRow(
  slug: string,
  name: string,
  unit: string,
  price: string,
) {
  const direction = CALCULATOR_DIRECTIONS.find(
    (direction) => direction.slug === slug,
  );
  for (const group of direction?.groups ?? []) {
    const sourceGroup = group.items[0].group;
    const groupSuffix = sourceGroup.slice(sourceGroup.indexOf(' / ') + 3);
    const suffix = ` (${groupSuffix})`;
    const normalizedName = normalize(name);
    const withoutGroup =
      sourceGroup.includes(' / ') && normalizedName.endsWith(normalize(suffix))
        ? normalizedName.slice(0, -normalize(suffix).length).trim()
        : normalizedName;

    const item = group.items.find(
      (item) =>
        item.unit === unit &&
        item.priceText === price &&
        [normalizedName, withoutGroup].includes(normalize(item.name)),
    );

    if (item) return { item, group: group.label };
  }
}

export function displayRate(price: string, unit: string, rental = false) {
  const rate = /^(от )?([\d\s]+(?:,\d+)?) руб\.$/u.exec(price);
  if (!rate) return price;

  const amount = Number(rate[2].replace(/\s/g, '').replace(',', '.'));
  const basis = rental ? ' за замену' : `/${getUnit(unit).unit}`;
  return `${rate[1] ?? ''}${formatRub(amount)}${basis}`;
}
