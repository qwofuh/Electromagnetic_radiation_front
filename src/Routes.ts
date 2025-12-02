// Пути маршрутов
export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  LOGIN: '/login', 
  REGISTER: '/register',
  DEVICE_DETAIL: '/detailed_device/:id',
  DEVICES: '/devices',
  DRAFT: '/emission_calculations/:id',
  // Добавьте другие маршруты
};

// Человеко-читаемые названия для маршрутов
export const ROUTE_LABELS = {
  [ROUTES.HOME]: 'Главная',
  [ROUTES.CATALOG]: 'Каталог',
  [ROUTES.LOGIN]: 'Вход',
  [ROUTES.REGISTER]: 'Регистрация',
  [ROUTES.DEVICE_DETAIL]: 'Устройство',
  [ROUTES.DEVICES]: 'Устройства',
  // Добавьте другие названия
};