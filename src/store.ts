import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "./slice/filterSlice";
import deviceDetailReducer from "./slice/deviceDetailSlice";
import userReducer from "./slice/userSlice";
import draftResucer from "./slice/draftSlice"

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    deviceDetail: deviceDetailReducer,
    user: userReducer,
    draft: draftResucer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;