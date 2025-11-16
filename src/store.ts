import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "./slice/filterSlice";

export const store = configureStore({
  reducer: {
    filter: filterReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;