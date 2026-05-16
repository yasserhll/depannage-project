import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import toast from '@/lib/toast';
import type { ApiError } from '@/lib/fetcher';
import type { UserRole } from '@/types/auth.types';

const ROLE_HOME: Record<UserRole, string> = {
  client:    '/client',
  depanneur: '/depanneur',
  admin:     '/admin',
};

export function Login() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: Location })?.from?.pathname;

  const [login,    setLogin]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: () => authService.login({ login, password }),
    onSuccess: ({ user, token }) => {
      dispatch(setCredentials({ user, token }));
      toast.success(`Bienvenue, ${user.name} !`);
      navigate(from ?? ROLE_HOME[user.role], { replace: true });
    },
    onError: (err: ApiError) => {
      if (err.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(err.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
        setErrors(mapped);
      } else {
        toast.error(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    mutate();
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4
                        shadow-glow-orange">
          <span className="text-white font-black text-2xl">A</span>
        </div>
        <h1 className="text-brand-text text-2xl font-bold">Connexion</h1>
        <p className="text-brand-muted text-sm mt-1">Accédez à votre espace AutoDepan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email ou téléphone"
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="votre@email.com ou +33612345678"
          autoComplete="username"
          error={errors.login}
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
          required
        />

        <div className="text-right">
          <Link to="/auth/mot-de-passe-oublie" className="text-primary text-sm hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={isPending}>
          Se connecter
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-brand-muted text-sm">
          Pas encore de compte ?{' '}
          <Link to="/auth/inscription" className="text-primary font-semibold hover:underline">
            S'inscrire comme client
          </Link>
        </p>
        <p className="text-brand-muted text-sm">
          Vous êtes dépanneur ?{' '}
          <Link to="/auth/inscription/depanneur" className="text-blue-400 font-semibold hover:underline">
            Rejoindre comme dépanneur
          </Link>
        </p>
      </div>
    </div>
  );
}
