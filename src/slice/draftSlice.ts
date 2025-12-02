import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api'; 

interface DeviceInOrder {
    id?: number;
    title?: string;
    image?: string;
    avg_min_power?: number;
    avg_max_power?: number;
    custom_power?: number; // ⬅️ добавь
    count?: number;        // ⬅️ добавь
}

// Данные заявки
interface OrderData {
    order_name?: string | null;
    description?: string | null;
    customer_requirements?: string | null;
    distance?: number;
    status?: string;
}

// Состояние черновой заявки
interface DraftState {
    order_id?: number;
    viewing_order_id?: number;
    count: number;
    
    devices: DeviceInOrder[]; // массив устройств в заявке
    orderData: OrderData; // поля заявки
    error: string | null;
    loading: boolean;
    userOrders: any[];
}

const initialState: DraftState = {
    order_id: undefined,
    viewing_order_id: undefined,
    count: 0,
    
    devices: [],
    orderData: {
        order_name: '',
        description: '',
        customer_requirements: '',
        status: ''
    },
    error: null,
    loading: false,
    userOrders: [],
};

// 1. Получение корзины (ID заявки и количества)
export const getDraftCart = createAsyncThunk(
    'draft/getDraftCart',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Getting draft cart...');
            const response = await api.api.emissionsCalculationDraftCartList({
                secure: true
            });
            return response.data; // { order_id: number, devices_count: number }
        } catch (error) {
            return rejectWithValue('Ошибка при загрузке корзины');
        }
    }
);

// 2. Получение детальных данных заявки по ID
export const getDraftOrderDetails = createAsyncThunk(
    'draft/getDraftOrderDetails',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await api.api.emissionsCalculationIdList(Number(orderId), {
                secure: true
            });
            return response.data; // { order: {...}, devices: [...] }
        } catch (error) {
            return rejectWithValue('Ошибка при загрузке данных заявки');
        }
    }
);

// Добавление устройства в заявку
export const addDeviceToDraftOrder = createAsyncThunk(
  'draft/addDeviceToDraftOrder',
  async (deviceId: number, { rejectWithValue }) => {
    try {
      console.log('🔄 Adding device to draft order:', deviceId);
      
      // ⚠️ Попробуем БЕЗ Content-Type
      const response = await api.api.emissionsCalculationDraftAddIdCreate(deviceId, {
        secure: true,
        // ЯВНО убираем Content-Type
        headers: {
          'Content-Type': undefined
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue('Ошибка при добавлении устройства в заявку');
    }
  }
);

export const saveDraftOrder = createAsyncThunk(
  'draft/saveDraftOrder',
  async ({ orderId, distance, devices }: { 
    orderId: number; 
    distance: number; 
    devices: DeviceInOrder[] 
  }, { rejectWithValue }) => {
    try {
      // 1. Обновляем расстояние
      await api.api.emissionsCalculationIdUpdate(
        orderId, 
        { distance: distance }, // request параметр
        {} // params (опционально)
      );
      
      // 2. Для каждого устройства обновляем мощность
      const updatePromises = devices.map(device => 
        api.api.emissionsCalculationDevicesOrderIdMaterialIdCustomPowerUpdate(
          orderId, 
          device.id!, 
          { custom_power: device.custom_power || device.avg_min_power || 0 }, // request
          {} // params
        )
      );
      
      await Promise.all(updatePromises);

      await api.api.emissionsCalculationIdFormUpdate(orderId);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue('Ошибка сохранения заявки');
    }
  }
);

export const removeDeviceFromOrder = createAsyncThunk(
  'draft/removeDeviceFromOrder',
  async ({ orderId, materialId, index }: { 
    orderId: number; 
    materialId: number;
    index: number;
  }, { rejectWithValue, dispatch }) => {
    try {
      // 1. Удаляем устройство через API
      await api.api.emissionsCalculationOrderIdDeviceMaterialIdDelete(orderId, materialId);
      
      // 2. Удаляем устройство из локального состояния
      dispatch(removeDevice(index));
      
      return { success: true };
    } catch (error) {
      return rejectWithValue('Ошибка удаления устройства');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'draft/deleteOrder',
  async (orderId: number, { rejectWithValue, dispatch }) => {
    try {
      // Удаляем заявку через API
      await api.api.emissionsCalculationDeleteIdCreate(orderId);
      
      // Очищаем локальное состояние
      dispatch(clearDraft());
      
      return { success: true };
    } catch (error) {
      return rejectWithValue('Ошибка удаления заявки');
    }
  }
);

export const getUserOrders = createAsyncThunk(
  'draft/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.emissionsCalculationList();
      return response.data; // ⬅️ возвращаем только data
    } catch (error) {
      return rejectWithValue('Ошибка получения списка заявок');
    }
  }
);

const draftSlice = createSlice({
    name: 'draft',
    initialState,
    reducers: {
        setOrderId: (state, action) => {
            state.order_id = action.payload;
        },
        setCount: (state, action) => {
            state.count = action.payload;
        },
        clearDraft: (state) => {
    state.order_id = undefined;
    state.count = 0;
    state.devices = [];
    state.orderData = {
        order_name: '',
        description: '',
        customer_requirements: '',
        distance: 0
    };
    state.error = null;
    state.loading = false;
},
        updateOrderData: (state, action) => {
            state.orderData = { ...state.orderData, ...action.payload };
        },
        updateDevicePower: (state, action) => {
        if (state.devices[action.payload.index]) {
            state.devices[action.payload.index].custom_power = action.payload.custom_power;
        }},
        removeDevice: (state, action) => {
    state.devices = state.devices.filter((_, index) => index !== action.payload);
    state.count = state.devices.length;
}
    },
    extraReducers: (builder) => {
    builder
        // Получение корзины
        .addCase(getDraftCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getDraftCart.fulfilled, (state, action) => {
    state.loading = false;
    const { orderID, itemCount } = action.payload;
    
    if (orderID) {
        state.order_id = orderID; // ⬅️ сохраняем ID черновика
    }
    if (itemCount !== undefined) {
        state.count = itemCount;
    }
})
        .addCase(getDraftCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        
        // Получение детальных данных заявки
        .addCase(getDraftOrderDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getDraftOrderDetails.fulfilled, (state, action) => {
    state.loading = false;
    
    if (action.payload.order) {
        state.devices = action.payload.order.devices.map((device: any) => ({
            ...device,
            custom_power: device.custom_power || device.avg_min_power || 0,
            count: device.count || 1
        }));
        
        state.viewing_order_id = action.payload.order.id;
        state.orderData = {
            order_name: action.payload.order.order_name || `Заявка #${action.payload.order.id}`,
            description: action.payload.order.description || 'Описание отсутствует',
            customer_requirements: action.payload.order.customer_requirements || 'Требования не указаны',
            distance: action.payload.order.distance || 0,
            status: action.payload.order.status || '' // ⬅️ добавь status
        };
    }
})
        .addCase(getDraftOrderDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
            
            // Добавление устройства в заявку
            .addCase(addDeviceToDraftOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addDeviceToDraftOrder.fulfilled, (state, _action) => {
                state.loading = false;
                // После успешного добавления увеличиваем счетчик
                state.count += 1;
                // Можно также обновить список устройств если нужно
            })
            .addCase(addDeviceToDraftOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getUserOrders.fulfilled, (state, action) => {
                state.userOrders = action.payload.orders || [];
                })
            .addCase(getUserOrders.rejected, (state, action) => {
            state.error = action.payload as string;
            })
    }
});

export const { setOrderId, setCount, clearDraft, updateOrderData, updateDevicePower, removeDevice } = draftSlice.actions;
export default draftSlice.reducer;