import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GPSPosition, TrackingData } from '@/types/gps.types';

interface GPSState {
  myPosition:       GPSPosition | null;
  trackingData:     TrackingData | null;
  isTracking:       boolean;
  watchId:          number | null;
  lastBroadcastAt:  number | null;
}

const initialState: GPSState = {
  myPosition:      null,
  trackingData:    null,
  isTracking:      false,
  watchId:         null,
  lastBroadcastAt: null,
};

const gpsSlice = createSlice({
  name: 'gps',
  initialState,
  reducers: {
    setMyPosition(state, action: PayloadAction<GPSPosition>) {
      state.myPosition      = action.payload;
      state.lastBroadcastAt = Date.now();
    },
    setTrackingData(state, action: PayloadAction<TrackingData>) {
      state.trackingData = action.payload;
    },
    setTracking(state, action: PayloadAction<boolean>) {
      state.isTracking = action.payload;
    },
    setWatchId(state, action: PayloadAction<number | null>) {
      state.watchId = action.payload;
    },
    resetTracking(state) {
      state.trackingData    = null;
      state.isTracking      = false;
      state.watchId         = null;
      state.lastBroadcastAt = null;
    },
  },
});

export const { setMyPosition, setTrackingData, setTracking, setWatchId, resetTracking } = gpsSlice.actions;
export default gpsSlice.reducer;
