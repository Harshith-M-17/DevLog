import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any;
  token: string | null;
  isHydrating: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isHydrating: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
      state.isHydrating = false;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isHydrating = false;
    },
    setHydrating(state, action: PayloadAction<boolean>) {
      state.isHydrating = action.payload;
    },
  },
});

export const { setUser, setToken, logout, setHydrating } = authSlice.actions;
export default authSlice.reducer;
