import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

interface UserState {
  id: number | null; // Добавим ID
  username: string;
  role: number | null; // 1 - админ, 2 - пользователь
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  username: '',
  role: null,
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
};

export const loginUserAsync = createAsyncThunk(
  'user/loginUserAsync',
  async (credentials: { login: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Making login request with:', credentials);
      const response = await api.api.usersLoginCreate(credentials);
      
      console.log('Login API full response:', response);
      console.log('All response headers:', response.headers);
      
      // Получаем токен из заголовка authorization
      const authHeader = response.headers['authorization'] || response.headers['Authorization'];
      console.log('Authorization header:', authHeader);
      
      let token = null;
      let userId = null;

      if (authHeader) {
        // Сохраняем полный токен
        token = authHeader;
        console.log('Full token with Bearer:', token);
        
        // Извлекаем user_id из JWT токена
        // Токен имеет формат: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjQ2NDA0NDIsImlhdCI6MTc2NDYzOTU0MiwiaXNzIjoiYml0b3AtYWRtaW4iLCJ1c2VyX2lkIjo2LCJyb2xlIjoyfQ.A4S5ac3vylSDitsx0bWQ2TbLaP7FNigIsOiNYMLrLMo
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
          const jwtToken = tokenParts[1];
          try {
            // Декодируем JWT payload (середина токена)
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            userId = payload.user_id;
            console.log('Decoded JWT payload:', payload);
            console.log('Extracted userId:', userId);
          } catch (decodeError) {
            console.error('Error decoding JWT:', decodeError);
          }
        }
      } else {
        console.log('No authorization header found. All headers:', response.headers);
        throw new Error('Токен не найден в заголовках ответа');
      }
      
      // Сохраняем ПОЛНЫЙ токен в localStorage (с "Bearer ")
      localStorage.setItem('token', token);
      
      // Сохраняем userId в localStorage если он есть
      if (userId) {
        localStorage.setItem('userId', userId.toString());
        console.log('UserId saved to localStorage:', userId);
      }
      
      return {
        username: credentials.login,
        token: token,
        userId: userId
      };
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue('Ошибка авторизации');
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  'user/logoutUserAsync',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Logout - token from localStorage:', token);
      
      // Проверим заголовки запроса
      console.log('Making logout API call with token...');
      const response = await api.api.usersLogoutCreate();
      console.log('Logout API response status:', response.status);
      console.log('Logout API response data:', response.data);
      
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      console.log('Token removed from localStorage');
      
      return response.data; 
    } catch (error: any) {
      console.error('Logout API error details:');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      console.log('Token removed despite API error');
      
      return { apiFailed: true };
    }
  }
);

export const checkAuthAsync = createAsyncThunk(
  'user/checkAuthAsync',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('CheckAuth - token from localStorage:', token ? 'exists' : 'missing');
      
      if (token) {
        // Здесь можно добавить запрос для проверки валидности токена
        // Например: const response = await api.api.usersIdList(userId);
        return { token, username: 'user' };
      }
      return rejectWithValue('Not authenticated');
    } catch (error) {
      return rejectWithValue('Ошибка проверки авторизации');
    }
  }
);

// НОВЫЕ ФУНКЦИИ ДЛЯ ПРОФИЛЯ

export const getUserInfoAsync = createAsyncThunk(
  'user/getUserInfoAsync',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.usersIdList(userId);
      
      // Извлекаем данные из ответа
      const userData = response.data;
      console.log('Полный response:', response);
      const role = userData.is_moderator || 2;
      
      return {
        id: userId,
        username: userData.login || '',
        role: role
      };
      
    } catch (error: any) {
      console.error('Get user info error:', error);
      return rejectWithValue(error.response?.data?.error || 'Ошибка получения информации о пользователе');
    }
  }
);

export const updateUserDataAsync = createAsyncThunk(
  'user/updateUserDataAsync',
  async (updateData: {
    id: number;
    login?: string;
    currentPassword?: string;
    newPassword?: string;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен не найден');
      }
      
      // Формируем запрос для API
      const requestBody: any = {};
      
      if (updateData.login !== undefined) {
        requestBody.login = updateData.login;
      }
      
      if (updateData.currentPassword && updateData.newPassword) {
        requestBody.current_password = updateData.currentPassword;
        requestBody.new_password = updateData.newPassword;
      }
      
      console.log('Updating user data:', updateData.id, requestBody);
      
      const response = await api.api.usersIdUpdate(updateData.id, requestBody);
      
      return {
        success: true,
        username: updateData.login
      };
      
    } catch (error: any) {
      console.error('Update user error:', error);
      
      let errorMessage = 'Ошибка обновления данных';
      
      if (error.response?.data) {
        // Используем сообщение об ошибке от сервера
        errorMessage = error.response.data.error || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    // Добавьте forceLogout для принудительного выхода
    forceLogout: (state) => {
      state.id = null;
      state.username = '';
      state.role = null;
      state.isAuthenticated = false;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    },
    // Новые reducers для профиля
    setUserId: (state, action) => {
      state.id = action.payload;
      localStorage.setItem('userId', action.payload.toString());
    },
    setUserRole: (state, action) => {
      state.role = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Логин
      .addCase(loginUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { username, token } = action.payload;
        state.username = username;
        state.token = token || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
      })

      // Логаут - ОДИН обработчик!
      .addCase(logoutUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUserAsync.fulfilled, (state, action: any) => {
        state.loading = false;
        state.username = '';
        state.isAuthenticated = false;
        state.token = null;
        state.id = null;
        state.role = null;
        
        // Если API упало, показываем информационное сообщение
        if (action.payload?.apiFailed) {
          state.error = 'Вышли из системы (ошибка сервера)';
        } else {
          state.error = null;
        }
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.id = null;
        state.role = null;
      })
      
      // Проверка авторизации
      .addCase(checkAuthAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { username, token } = action.payload;
        state.username = username;
        state.token = token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthAsync.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.username = '';
        state.error = null;
        state.id = null;
        state.role = null;
      })
      
      // НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ПРОФИЛЯ
      
      // Получение информации о пользователе
      .addCase(getUserInfoAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserInfoAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload.id;
        state.username = action.payload.username;
        state.role = action.payload.role;
        state.error = null;
        // Сохраняем ID в localStorage
        localStorage.setItem('userId', action.payload.id.toString());
      })
      .addCase(getUserInfoAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обновление данных пользователя
      .addCase(updateUserDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDataAsync.fulfilled, (state, action: any) => {
        state.loading = false;
        if (action.payload.username) {
          state.username = action.payload.username;
        }
        state.error = null;
      })
      .addCase(updateUserDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const { 
  clearError, 
  setToken, 
  forceLogout,
  setUserId,
  setUserRole
} = userSlice.actions;
export default userSlice.reducer;