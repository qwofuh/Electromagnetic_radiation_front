import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

// Типы данных
export interface Order {
  id: number;
  status: string; // 'черновик', 'сформирован', 'завершен', 'отклонен'
  create_at: string;
  update_at?: string;
  finish_at?: string;
  distance?: number;
  total_emission?: number;
  moderator?: string;
  creator?: string;
  creator_id?: number;
  devices_count?: number;
  creator_name?: string; // Добавим для отображения имени пользователя
}

export interface OrdersState {
  orders: Order[];
  filteredOrders: Order[];
  loading: boolean;
  error: string | null;
  currentOrder: Order | null;
  creators: string[];
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    creator?: string;
  };
  completingOrderId: number | null; // ID заказа, который сейчас завершается/отклоняется
}

const initialState: OrdersState = {
  orders: [],
  filteredOrders: [],
  loading: false,
  error: null,
  currentOrder: null,
  creators: [],
  filters: {},
  completingOrderId: null,
};

// Функция для преобразования API ответа в наш формат
const transformOrderFromApi = (apiOrder: any): Order => {
  return {
    id: apiOrder.id || 0,
    status: apiOrder.status || 'неизвестно',
    create_at: apiOrder.create_at || new Date().toISOString(),
    update_at: apiOrder.update_at,
    finish_at: apiOrder.finish_at,
    distance: apiOrder.distance,
    total_emission: apiOrder.total_emission,
    moderator: apiOrder.moderator,
    creator: apiOrder.creator || apiOrder.creator_name || `Пользователь ${apiOrder.creator_id || 'неизвестен'}`,
    creator_id: apiOrder.creator_id,
    devices_count: apiOrder.devices_count || 0,
    creator_name: apiOrder.creator_name,
  };
};

// Получение всех заявок с фильтрацией на сервере
export const getAllOrdersAsync = createAsyncThunk(
  'orders/getAllOrders',
  async (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {},
  { rejectWithValue }
  ) => {
    try {
      console.log('Fetching all orders with filters:', filters);
      
      // Подготавливаем параметры для API
      const apiFilters: any = {};
      if (filters.status) apiFilters.status = filters.status;
      if (filters.startDate) apiFilters.start = filters.startDate;
      if (filters.endDate) apiFilters.end = filters.endDate;
      
      const response = await api.api.emissionsCalculationList(apiFilters);
      console.log('Orders API response:', response.data);
      
      // Преобразуем данные из API
      const apiOrders = response.data.orders || [];
      const transformedOrders: Order[] = apiOrders.map(transformOrderFromApi);
      
      return transformedOrders;
    } catch (error: any) {
      console.error('Error fetching all orders:', error);
      return rejectWithValue(error.response?.data?.error || 'Ошибка получения всех заявок');
    }
  }
);

// Получение деталей конкретной заявки (для получения информации о создателе)
export const getOrderDetailsAsync = createAsyncThunk(
  'orders/getOrderDetails',
  async (orderId: number, { rejectWithValue }) => {
    try {
      console.log('Fetching order details for ID:', orderId);
      const response = await api.api.emissionsCalculationIdList(orderId);
      console.log('Order details response:', response.data);
      
      return transformOrderFromApi(response.data.order || response.data);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      return rejectWithValue(error.response?.data?.error || 'Ошибка получения деталей заявки');
    }
  }
);

// Завершение или отклонение заявки
export const completeOrRejectOrderAsync = createAsyncThunk(
  'orders/completeOrRejectOrder',
  async (params: { 
    orderId: number; 
    moderatorId: number; 
    status: 'завершен' | 'отклонен' 
  }, { rejectWithValue, dispatch }) => {
    try {
      const { orderId, moderatorId, status } = params;
      console.log(`${status === 'завершен' ? 'Завершение' : 'Отклонение'} заявки:`, orderId);
      
      // Отправляем запрос на сервер
      const response = await api.api.emissionsCalculationIdCompleteUpdate(
        orderId, 
        { moderator_id: moderatorId, status }
      );
      console.log('Complete/Reject order response:', response.data);
      
      // После успешного обновления перезагружаем список заявок
      await dispatch(getAllOrdersAsync({}));
      
      return { 
        orderId, 
        status,
        orderData: response.data.order || transformOrderFromApi(response.data)
      };
    } catch (error: any) {
      console.error(`Error ${params.status === 'завершен' ? 'completing' : 'rejecting'} order:`, error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         `Ошибка ${params.status === 'завершен' ? 'завершения' : 'отклонения'} заявки`;
      return rejectWithValue(errorMessage);
    }
  }
);

// Получение информации о создателях
export const fetchCreatorsAsync = createAsyncThunk(
  'orders/fetchCreators',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching all orders for creators list');
      const response = await api.api.emissionsCalculationList({});
      const orders = response.data.orders || [];
      
      // Собираем уникальных создателей
      const creatorsSet = new Set<string>();
      orders.forEach((order: any) => {
        const creatorName = order.creator || order.creator_name || `Пользователь ${order.creator_id}`;
        if (creatorName) {
          creatorsSet.add(creatorName);
        }
      });
      
      return Array.from(creatorsSet).sort((a, b) => a.localeCompare(b, 'ru'));
    } catch (error: any) {
      console.error('Error fetching creators:', error);
      return rejectWithValue(error.response?.data?.error || 'Ошибка получения списка создателей');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    updateOrderStatusLocally: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        order.status = status;
      }
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = status;
      }
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    applyCreatorFilter: (state, action) => {
      const creatorFilter = action.payload;
      if (!creatorFilter) {
        state.filteredOrders = state.orders;
      } else {
        state.filteredOrders = state.orders.filter(order => 
          order.creator && order.creator.toLowerCase().includes(creatorFilter.toLowerCase())
        );
      }
    },
    resetFilters: (state) => {
      state.filters = {};
      state.filteredOrders = state.orders;
    },
    setCompletingOrderId: (state, action) => {
      state.completingOrderId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllOrdersAsync
      .addCase(getAllOrdersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrdersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.filteredOrders = action.payload;
        state.error = null;
      })
      .addCase(getAllOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // getOrderDetailsAsync
      .addCase(getOrderDetailsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetailsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        
        // Обновляем заявку в списке, если она есть
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(getOrderDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // completeOrRejectOrderAsync
      .addCase(completeOrRejectOrderAsync.pending, (state, action) => {
        state.completingOrderId = action.meta.arg.orderId;
        state.error = null;
      })
      .addCase(completeOrRejectOrderAsync.fulfilled, (state, action) => {
        const { orderId, status, orderData } = action.payload;
        state.completingOrderId = null;
        
        // Обновляем заявку в списке
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = {
            ...state.orders[orderIndex],
            status: status,
            total_emission: orderData.total_emission,
            finish_at: orderData.finish_at,
            moderator: orderData.moderator,
          };
        }
        
        // Обновляем текущую заявку, если она активна
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder = {
            ...state.currentOrder,
            status: status,
            total_emission: orderData.total_emission,
            finish_at: orderData.finish_at,
            moderator: orderData.moderator,
          };
        }
        
        // Обновляем отфильтрованный список
        state.filteredOrders = state.orders.filter(order => {
          if (state.filters.status && order.status !== state.filters.status) {
            return false;
          }
          return true;
        });
        
        state.error = null;
      })
      .addCase(completeOrRejectOrderAsync.rejected, (state, action) => {
        state.completingOrderId = null;
        state.error = action.payload as string;
      })
      
      // fetchCreatorsAsync
      .addCase(fetchCreatorsAsync.pending, (state) => {
        // Не устанавливаем loading в true, чтобы не блокировать UI
        state.error = null;
      })
      .addCase(fetchCreatorsAsync.fulfilled, (state, action) => {
        state.creators = action.payload;
        state.error = null;
      })
      .addCase(fetchCreatorsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearOrdersError, 
  clearCurrentOrder, 
  updateOrderStatusLocally,
  setFilters,
  applyCreatorFilter,
  resetFilters,
  setCompletingOrderId
} = ordersSlice.actions;

export default ordersSlice.reducer;