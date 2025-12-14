export interface Device {
  id: number;
  title: string;
  image: string;
  minavgpower: number;
  maxavgpower: number;
  minsaferange: number;
  maxsaferange: number;
  radiationtype: string;
  radiationsource: string;
  maxradiationzone: string;
  visability?: boolean;
}

// Интерфейс данных, который возвращает бэкенд (поля с заглавной буквы)
export interface ServerDevice {
  ID: number;
  Title: string;
  Image?: string;
  AvgMinPower: number;
  AvgMaxPower: number;
  MinSafeRange: number;
  MaxSafeRange: number;
  RadiationType: string;
  RadiationSource: string;
  MaxRadiationZone: string;
  Visability?: boolean;
}

export interface CartResponse {
  request_id: number;
  count: number;
}

export interface ServerDevicesResponse {
  devices: ServerDevice[];
  status: string;
}

export interface DeviceResponse {
  device: ServerDevice;
  status: string;
}

/**
 * Получение всех устройств или поиск по названию
 */
export const getDevices = async (title = ""): Promise<ServerDevicesResponse> => {
  try {
    const response = await fetch(`/api/devices?title=${encodeURIComponent(title)}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки устройств: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn('Сервер недоступен, используются мок-данные:', error);
    // Фильтруем мок-данные по заголовку, если указан поисковый запрос
    const mockData = await import('./mock').then(m => m.DEVICES_MOCK);
    const filteredDevices = mockData.devices.filter(d => 
      !title || d.title.toLowerCase().includes(title.toLowerCase())
    ).map(d => ({
      ID: d.id,
      Title: d.title,
      Image: d.image,
      AvgMinPower: d.minavgpower,
      AvgMaxPower: d.maxavgpower,
      MinSafeRange: d.minsaferange,
      MaxSafeRange: d.maxsaferange,
      RadiationType: d.radiationtype,
      RadiationSource: d.radiationsource,
      MaxRadiationZone: d.maxradiationzone,
      Visability: d.visability ?? true
    }));
    
    return {
      devices: filteredDevices,
      status: "success"
    };
  }
};

/**
 * Преобразование данных с сервера во frontend-формат Device
 */
export const mapServerToDevice = (s: ServerDevice): Device => ({
  id: s.ID,
  title: s.Title,
  image: s.Image ?? "",
  minavgpower: s.AvgMinPower,
  maxavgpower: s.AvgMaxPower,
  minsaferange: s.MinSafeRange,
  maxsaferange: s.MaxSafeRange,
  radiationtype: s.RadiationType,
  radiationsource: s.RadiationSource,
  maxradiationzone: s.MaxRadiationZone,
  visability: s.Visability,
});

/**
 * Получение конкретного устройства по ID
 * Запрашиваем `/api/devices/{id}` и маппим ответ в frontend-формат Device
 */
export const getDeviceById = async (id: number): Promise<Device> => {
  try {
    const response = await fetch(`/api/device/${id}`, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки устройства: ${response.statusText}`);
    }

    const data: DeviceResponse = await response.json();
        console.log("RAW API RESPONSE for device", id, ":", data); // ← добавить эту строку
        
    if (!data.device) {
      throw new Error('Устройство не найдено');
    }
    
    return mapServerToDevice(data.device);
  } catch (error) {
    console.warn('Сервер недоступен, используются мок-данные:', error);
    const mockData = await import('./mock').then(m => m.DEVICES_MOCK);
    const device = mockData.devices.find(d => d.id === id);
    
    if (!device) {
      throw new Error('Устройство не найдено в мок-данных');
    }
    
    return device;
  }
};

// Получение информации о корзине
export const getCartInfo = async (): Promise<CartResponse> => {
  const response = await fetch(`/api/emissions_calculation/draft/cart`);
  if (!response.ok) {
    throw new Error("Failed to fetch cart info");
  }
  return response.json();
};