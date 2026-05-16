import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import toast from '@/lib/toast';
import type { ApiError } from '@/lib/fetcher';

export function ResetPassword() {
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const token             = searchParams.get('token') ?? '';
  const email             = searchParams.get('email') ?? '';

  const [password,     setPassword]     = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () =>
      authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmation,
      }),
    onSuccess: () => {
      toast.success('Mot de passe réinitialisé avec succès.');
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

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <Lock className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-brand-text text-xl font-bold">Mot de passe modifié</h1>
        <p className="text-brand-muted text-sm">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <Button fullWidth onClick={() => navigate('/auth/connexion')}>
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-brand-text text-2xl font-bold">Nouveau mot de passe</h1>
        <p className="text-brand-muted text-sm mt-1">Choisissez un nouveau mot de passe sécurisé.</p>
      </div>

      {!token && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">Lien invalide ou expiré.</p>
        </div>
      )}

      <Input
        label="Nouveau mot de passe"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="8 caractères minimum"
        autoFocus
      />

      <Input
        label="Confirmer le mot de passe"
        type="password"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        error={errors.password_confirmation}
        placeholder="Répétez le mot de passe"
      />

      <Button
        fullWidth
        size="lg"
        loading={isPending}
        disabled={!token || !password || !confirmation}
        onClick={() => { setErrors({}); mutate(); }}
      >
        Réinitialiser le mot de passe
      </Button>

      <button
        onClick={() => navigate('/auth/connexion')}
        className="w-full text-center text-brand-muted text-sm hover:text-brand-text transition-colors"
      >
        ← Retour à la connexion
      </button>
    </div>
  );
}
