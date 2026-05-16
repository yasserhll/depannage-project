import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface SocketState {
  status:        SocketStatus;
  activeMission: string | null;
}

const initialState: SocketState = {
  status:        'disconnected',
  activeMission: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocketStatus(state, action: PayloadAction<SocketStatus>) {
      state.status = action.payload;
    },
    setActiveMission(state, action: PayloadAction<string | null>) {
      state.activeMission = action.payload;
    },
  },
});

export const { setSocketStatus, setActiveMission } = socketSlice.actions;
export default socketSlice.reducer;
