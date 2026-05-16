import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer   from './slices/authSlice';
import gpsReducer    from './slices/gpsSlice';
import socketReducer from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    auth:   authReducer,
    gps:    gpsReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Le socket.io client n'est pas sérialisable — on l'exclut
        ignoredActions: ['socket/setSocketStatus'],
      },
    }),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector<RootState, T>(selector);
