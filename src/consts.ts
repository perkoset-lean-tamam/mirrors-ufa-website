export const WHATSAPP_URL =
  'https://wa.me/79177825102?text=Здравствуйте!%20Интересует%20зеркало%20на%20заказ';
export const PHONE_TEL = 'tel:+79373398232';
export const PHONE_DISPLAY = '+7 937 339 8232';
export const MAX_URL = 'https://web.max.ru/63876228';

export const COUNTER_API_BASE = 'https://api.counterapi.dev/v2';
export const COUNTER_WORKSPACE =
  import.meta.env.PUBLIC_COUNTER_WORKSPACE ?? '';
export const COUNTER_NAME = import.meta.env.PUBLIC_COUNTER_NAME ?? '';
export const COUNTER_API_KEY = import.meta.env.PUBLIC_COUNTER_API_KEY ?? '';
export const COUNTER_ENABLED = Boolean(
  COUNTER_WORKSPACE && COUNTER_NAME && COUNTER_API_KEY,
);
export const VISIT_SESSION_KEY = 'zerkala-visit-counted';
