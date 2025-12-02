import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
import type{ DsDevice } from '../api/Api';

interface DeviceDetailState {
  device: DsDevice | null;
  loading: boolean;
  error: string | null;
}

const initialState: DeviceDetailState = {
  device: null,
  loading: false,
  error: null
};

export const getDeviceDetail = createAsyncThunk(
  'deviceDetail/getDeviceDetail',
  async (deviceId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.deviceIdList(deviceId);
      
      // Проверим структуру ответа
      const serverDevice = response.data.device;
      
      // Преобразуем данные с сервера
      const mappedDevice = {
        id: serverDevice.ID || serverDevice.id,
        title: serverDevice.Title || serverDevice.title,
        image: serverDevice.Image || serverDevice.image,
        avgMinPower: serverDevice.AvgMinPower || serverDevice.avgMinPower,
        avgMaxPower: serverDevice.AvgMaxPower || serverDevice.avgMaxPower,
        minSafeRange: serverDevice.MinSafeRange || serverDevice.minSafeRange,
        maxSafeRange: serverDevice.MaxSafeRange || serverDevice.maxSafeRange,
        radiationType: serverDevice.RadiationType || serverDevice.radiationType,
        radiationSource: serverDevice.RadiationSource || serverDevice.radiationSource,
        maxRadiationZone: serverDevice.MaxRadiationZone || serverDevice.maxRadiationZone,
        visability: serverDevice.Visability || serverDevice.visability,
      } as DsDevice;

      return mappedDevice;
      
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке устройства');
    }
  }
);

export const deviceDetailSlice = createSlice({
  name: "deviceDetail",
  initialState,
  reducers: {
    clearDevice: (state) => {
      state.device = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDeviceDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeviceDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.device = action.payload;
      })
      .addCase(getDeviceDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearDevice } = deviceDetailSlice.actions;
export default deviceDetailSlice.reducer;