import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store';
import { setUser, setLoading, logout } from '@/store/slices/authSlice';
import { api } from '@/lib/fetcher';
import type { User } from '@/types/auth.types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isLoading } = useAppSelector((s) => s.auth);

  const { data, isSuccess, isError } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn:  () =>
      api.get<{ user: User }>('/auth/me').then((r) => r.user),
    enabled:  !!token && !user,
    retry:    false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data));
    }
    if (isError) {
      dispatch(logout());
    }
    if (!token) {
      dispatch(setLoading(false));
    }
  }, [isSuccess, isError, data, token, dispatch]);

  return { user, token, isLoading, isAuthenticated: !!user && !!token };
}
