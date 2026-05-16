import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, FileText, ArrowRight } from 'lucide-react';
import { api } from '@/lib/fetcher';
import { Card, CardBody } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { formatDate } from '@/lib/utils';
import toast from '@/lib/toast';

interface KYCProfile {
  id:           number;
  kyc_status:   string;
  business_name: string | null;
  user: {
    id:         number;
    name:       string;
    email:      string;
    phone:      string;
    created_at: string;
  };
  documents: {
    id:         number;
    type:       string;
    url:        string;
    status:     string;
  }[];
}

export function KYCReview() {
  const qc                                   = useQueryClient();
  const [selected,  setSelected]             = useState<KYCProfile | null>(null);
  const [notes,     setNotes]                = useState('');

  const { data, isLoading } = useQuery<{ profiles: KYCProfile[]; pagination: object }>({
    queryKey: ['admin-kyc-pending'],
    queryFn:  () => api.get('/admin/kyc/pending'),
    refetchInterval: 30_000,
  });

  const pending = data?.profiles ?? [];

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (userId: number) => api.post(`/admin/kyc/${userId}/approve`, { notes }),
    onSuccess: () => {
      toast.success('Compte approuvé !');
      setSelected(null);
      setNotes('');
      qc.invalidateQueries({ queryKey: ['admin-kyc-pending'] });
    },
    onError: () => toast.error('Erreur lors de l\'approbation.'),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: (userId: number) => api.post(`/admin/kyc/${userId}/reject`, { reason: notes }),
    onSuccess: () => {
      toast.success('Compte rejeté.');
      setSelected(null);
      setNotes('');
      qc.invalidateQueries({ queryKey: ['admin-kyc-pending'] });
    },
    onError: () => toast.error('Erreur lors du rejet.'),
  });

  const DOC_LABELS: Record<string, string> = {
    carte_identite:    'Carte d\'identité',
    permis_conduire:   'Permis de conduire',
    carte_grise:       'Carte grise',
    assurance:         'Assurance',
    kbis:              'KBIS',
    selfie_verification: 'Selfie',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-brand-text text-2xl font-bold">Validation KYC</h1>
        <p className="text-brand-muted text-sm">
          {pending.length} dossier{pending.length > 1 ? 's' : ''} en attente
        </p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Liste */}
        <div className="space-y-3">
          {pending.map((profile) => (
            <Card
              key={profile.id}
              onClick={() => { setSelected(profile); setNotes(''); }}
              className={selected?.id === profile.id ? 'border-primary' : ''}
            >
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-brand-text font-semibold">{profile.user.name}</p>
                    {profile.business_name && (
                      <p className="text-brand-muted text-xs">{profile.business_name}</p>
                    )}
                    <p className="text-brand-muted text-xs">{profile.user.email}</p>
                    <p className="text-brand-muted text-xs mt-1">
                      {profile.documents.length} document{profile.documents.length > 1 ? 's' : ''} soumis
                      · Inscrit {formatDate(profile.user.created_at)}
                    </p>
                  </div>
                  <Badge color="warning">En attente</Badge>
                </div>
              </CardBody>
            </Card>
          ))}

          {!isLoading && pending.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-brand-muted">Aucun dossier en attente.</p>
            </div>
          )}
        </div>

        {/* Panneau de révision */}
        {selected && (
          <div className="space-y-4 sticky top-4">
            <Card>
              <CardBody className="space-y-4">
                <div>
                  <h2 className="text-brand-text font-bold text-lg">{selected.user.name}</h2>
                  <p className="text-brand-muted text-sm">{selected.user.email} · {selected.user.phone}</p>
                </div>

                {/* Documents */}
                <div className="space-y-2">
                  <p className="text-brand-text text-sm font-medium">Documents</p>
                  {selected.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-surface-raised
                                 rounded-xl hover:bg-surface-overlay transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-muted" />
                        <span className="text-brand-text text-sm">
                          {DOC_LABELS[doc.type] ?? doc.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}>
                          {doc.status}
                        </Badge>
                        <span className="text-primary text-xs flex items-center gap-1">
                          Voir <ArrowRight className="w-3 h-3 inline" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-brand-text text-sm font-medium block mb-2">
                    Note (requise pour le rejet)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Raison du rejet ou commentaires…"
                    rows={3}
                    className="w-full bg-surface-raised border border-brand-border rounded-xl
                               px-4 py-3 text-brand-text text-sm resize-none
                               focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="danger"
                    fullWidth
                    loading={rejecting}
                    disabled={!notes.trim()}
                    onClick={() => reject(selected.user.id)}
                  >
                    <XCircle className="w-4 h-4 inline mr-1" /> Rejeter
                  </Button>
                  <Button
                    fullWidth
                    loading={approving}
                    onClick={() => approve(selected.user.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" /> Approuver
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
