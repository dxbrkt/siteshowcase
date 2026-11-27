export const office = {
  city: 'Москва',
  street: 'Алтуфьевское шоссе, д. 44',
  postalCode: '127566',
  building: 'БЦ «Альтеза»',
};

const address = encodeURIComponent(`${office.city}, ${office.street}`);
export const officeMapUrl = `https://yandex.ru/maps/?text=${address}`;
export const officeMapEmbedUrl = `https://yandex.ru/map-widget/v1/?text=${address}&z=17`;
