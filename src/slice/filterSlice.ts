import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
import type{ DsDevice } from '../api/Api';
import { setOrderId, setCount } from './draftSlice'; 

interface FilterState {
  query: string;
  data: DsDevice[];
  loading: boolean;
}

const initialState: FilterState = {
  query: "",
  data: [],
  loading: false
};

// В filterSlice.ts
const mapServerToDsDevice = (serverDevice: any): DsDevice => ({
  id: serverDevice.ID,
  title: serverDevice.Title,
  image: serverDevice.Image,
  avgMinPower: serverDevice.AvgMinPower,
  avgMaxPower: serverDevice.AvgMaxPower,
  minSafeRange: serverDevice.MinSafeRange,
  maxSafeRange: serverDevice.MaxSafeRange,
  radiationType: serverDevice.RadiationType,
  radiationSource: serverDevice.RadiationSource,
  maxRadiationZone: serverDevice.MaxRadiationZone,
  visability: serverDevice.Visability,
});

export const getFilteredData = createAsyncThunk(
  'filter/getFilteredData',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { filter }: any = getState();
    try {
      const response = await api.api.devicesList({ title: filter.query });
      
      const devicesArray = (response.data.devices || []).map(mapServerToDsDevice);
      
      // Сохраняем данные о черновой заявке если они есть
      const draftOrderId = response.data.draft_order_id; 
      const devicesCount = response.data.devices_count || response.data.count || 0;
      
      if (draftOrderId) {
        dispatch(setOrderId(draftOrderId));
        dispatch(setCount(devicesCount));
      }
      
      return devicesArray as DsDevice[];
      
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке данных');
    }
  }
);

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFilteredData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFilteredData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Теперь action.payload - это DsDevice[]
      })
      .addCase(getFilteredData.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { setQuery } = filterSlice.actions;
export default filterSlice.reducer;