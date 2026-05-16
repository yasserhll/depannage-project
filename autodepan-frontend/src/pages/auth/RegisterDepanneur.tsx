import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Car, ClipboardList } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import toast from '@/lib/toast';
import type { ApiError } from '@/lib/fetcher';

export function RegisterDepanneur() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form,   setForm]   = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const { mutate, isPending } = useMutation({
    mutationFn: () => authService.registerDepanneur({ ...form, role: 'depanneur' }),
    onSuccess: ({ user, token }) => {
      dispatch(setCredentials({ user, token }));
      toast.success('Compte dépanneur créé ! Veuillez compléter votre profil et soumettre vos documents.');
      navigate('/depanneur', { replace: true });
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

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-brand-text text-2xl font-bold">Espace Dépanneur</h1>
        <p className="text-brand-muted text-sm mt-1">
          Rejoignez notre réseau de dépanneurs professionnels
        </p>
      </div>

      <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4 mb-6">
        <p className="text-blue-400 text-sm font-medium mb-2 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 flex-shrink-0" /> Après l'inscription vous devrez fournir :
        </p>
        <ul className="text-brand-muted text-xs space-y-1">
          <li>• Carte d'identité nationale</li>
          <li>• Permis de conduire</li>
          <li>• Carte grise du véhicule</li>
          <li>• Assurance professionnelle</li>
        </ul>
        <p className="text-brand-muted text-xs mt-2">
          Validation sous 24-48h par notre équipe.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setErrors({}); mutate(); }}
        className="space-y-4"
      >
        <Input label="Nom complet"               type="text"     value={form.name}                  onChange={update('name')}                  error={errors.name}                  required />
        <Input label="Email"                     type="email"    value={form.email}                 onChange={update('email')}                 error={errors.email}                 required />
        <Input label="Téléphone"                 type="tel"      value={form.phone}                 onChange={update('phone')}                 error={errors.phone}                 required />
        <Input label="Mot de passe"              type="password" value={form.password}              onChange={update('password')}              error={errors.password}              required />
        <Input label="Confirmer mot de passe"    type="password" value={form.password_confirmation} onChange={update('password_confirmation')} error={errors.password_confirmation} required />

        <Button type="submit" variant="secondary" fullWidth size="lg" loading={isPending}>
          Créer mon compte dépanneur
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
