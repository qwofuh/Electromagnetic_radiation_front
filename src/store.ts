import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "./slice/filterSlice";
import deviceDetailReducer from "./slice/deviceDetailSlice";
import userReducer from "./slice/userSlice";
import draftResucer from "./slice/draftSlice"
import ordersReducer from "./slice/ordersSlice"

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    deviceDetail: deviceDetailReducer,
    user: userReducer,
    draft: draftResucer,
    orders: ordersReducer
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;