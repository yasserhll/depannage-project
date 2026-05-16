import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import toast from '@/lib/toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => authService.forgotPassword(email),
    onSuccess:  () => setSent(true),
    onError:    () => toast.error('Adresse email introuvable.'),
  });

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail size={32} className="text-primary" />
        </div>
        <h2 className="text-brand-text text-xl font-bold">Email envoyé !</h2>
        <p className="text-brand-muted text-sm mt-2">
          Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
        </p>
        <Link to="/auth/connexion" className="block mt-6 text-primary font-semibold">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-brand-text text-2xl font-bold mb-2">Mot de passe oublié</h1>
      <p className="text-brand-muted text-sm mb-6">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>
      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
        />
        <Button fullWidth loading={isPending} onClick={() => mutate()}>
          Envoyer le lien
        </Button>
      </div>
      <Link to="/auth/connexion" className="block mt-4 text-center text-brand-muted text-sm hover:text-brand-text">
        ← Retour à la connexion
      </Link>
    </div>
  );
}
