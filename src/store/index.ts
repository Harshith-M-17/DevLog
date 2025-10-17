import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import entriesReducer from './entriesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    entries: entriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
