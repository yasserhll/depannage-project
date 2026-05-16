import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '@/types/auth.types';

const TOKEN_KEY = 'autodepan_token';

const initialState: AuthState = {
  user:      null,
  token:     localStorage.getItem(TOKEN_KEY),
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user      = action.payload.user;
      state.token     = action.payload.token;
      state.isLoading = false;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user      = action.payload;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    logout(state) {
      state.user      = null;
      state.token     = null;
      state.isLoading = false;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export const { setCredentials, setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
