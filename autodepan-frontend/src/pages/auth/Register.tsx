import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import toast from '@/lib/toast';
import type { ApiError } from '@/lib/fetcher';

export function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form,   setForm]   = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const { mutate, isPending } = useMutation({
    mutationFn: () => authService.register({ ...form, role: 'client' }),
    onSuccess: ({ user, token }) => {
      dispatch(setCredentials({ user, token }));
      toast.success('Compte créé avec succès !');
      navigate('/client', { replace: true });
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
        <h1 className="text-brand-text text-2xl font-bold">Créer un compte</h1>
        <p className="text-brand-muted text-sm mt-1">Espace Client — Demandez un dépannage en quelques secondes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nom complet"   type="text"     value={form.name}     onChange={update('name')}     placeholder="Prénom Nom"            error={errors.name}     required />
        <Input label="Email"         type="email"    value={form.email}    onChange={update('email')}    placeholder="votre@email.com"       error={errors.email}    required />
        <Input label="Téléphone"     type="tel"      value={form.phone}    onChange={update('phone')}    placeholder="+213 6XX XXX XXX"      error={errors.phone}    required />
        <Input label="Mot de passe"  type="password" value={form.password} onChange={update('password')} placeholder="Min. 8 caractères"     error={errors.password} required />
        <Input
          label="Confirmer le mot de passe"
          type="password"
          value={form.password_confirmation}
          onChange={update('password_confirmation')}
          placeholder="Répéter le mot de passe"
          error={errors.password_confirmation}
          required
        />

        <Button type="submit" fullWidth size="lg" loading={isPending}>
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-brand-muted text-sm">
        Déjà un compte ?{' '}
        <Link to="/auth/connexion" className="text-primary font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
