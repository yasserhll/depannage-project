import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Check, Paperclip, ClipboardList } from 'lucide-react';
import { api } from '@/lib/fetcher';
import { Card, CardBody } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import toast from '@/lib/toast';
import type { Document } from '@/types/depanneur.types';

const DOC_TYPES = [
  { key: 'carte_identite',    label: 'Carte d\'identité',         required: true  },
  { key: 'permis_conduire',   label: 'Permis de conduire',        required: true  },
  { key: 'carte_grise',       label: 'Carte grise du véhicule',   required: true  },
  { key: 'assurance',         label: 'Assurance professionnelle', required: true  },
  { key: 'kbis',              label: 'KBIS / Extrait registre',   required: false },
] as const;

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  approved: 'success',
  pending:  'warning',
  rejected: 'error',
};

export function Documents() {
  const qc                                  = useQueryClient();
  const [uploading, setUploading]           = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ documents: Document[] }>({
    queryKey: ['depanneur-documents'],
    queryFn:  () => api.get('/depanneur/documents'),
  });

  const documents = data?.documents ?? [];
  const getDoc    = (type: string) => documents.find((d) => d.type === type);

  const handleUpload = async (type: string, file: File) => {
    setUploading(type);
    const form = new FormData();
    form.append('type', type);
    form.append('file', file);
    try {
      await api.post('/depanneur/documents/upload', form);
      toast.success('Document envoyé pour validation.');
      qc.invalidateQueries({ queryKey: ['depanneur-documents'] });
    } catch {
      toast.error('Erreur lors de l\'envoi du document.');
    } finally {
      setUploading(null);
    }
  };

  const allApproved = DOC_TYPES
    .filter((t) => t.required)
    .every((t) => getDoc(t.key)?.status === 'approved');

  const STATUS_LABEL: Record<string, React.ReactNode> = {
    approved: <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Validé</span>,
    pending:  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> En attente</span>,
    rejected: <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Rejeté</span>,
  };

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-brand-text text-xl font-bold">Documents KYC</h1>
        <p className="text-brand-muted text-sm mt-1">
          Soumettez vos documents pour activer votre compte dépanneur.
        </p>
      </div>

      {allApproved ? (
        <div className="bg-green-600/10 border border-green-600/20 rounded-xl p-4">
          <p className="text-green-400 text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Tous vos documents sont validés. Votre compte est actif.
          </p>
        </div>
      ) : (
        <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 flex-shrink-0" />
            Soumettez les documents requis (*). Notre équipe les vérifiera sous 24-48h.
          </p>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}

      <div className="space-y-3">
        {DOC_TYPES.map(({ key, label, required }) => {
          const doc = getDoc(key);
          const isUploading = uploading === key;
          return (
            <Card key={key}>
              <CardBody>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-brand-text text-sm font-medium">{label}</p>
                      {required && <span className="text-red-400 text-xs">*</span>}
                    </div>
                    {doc && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color={STATUS_COLOR[doc.status] ?? 'info'}>
                          {STATUS_LABEL[doc.status] ?? doc.status}
                        </Badge>
                        {doc.rejection_reason && (
                          <span className="text-red-400 text-xs truncate max-w-[200px]">
                            {doc.rejection_reason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {doc?.status === 'approved' ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : doc?.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-amber-400" />
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(key, file);
                            e.target.value = '';
                          }}
                          disabled={isUploading}
                        />
                        <span className={`
                          inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                          border border-brand-border text-brand-text transition-all
                          ${isUploading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-surface-raised cursor-pointer active:scale-95'}
                        `}>
                          {isUploading ? (
                            <><Spinner size="sm" /> Envoi…</>
                          ) : doc?.status === 'rejected' ? (
                            'Renvoyer'
                          ) : (
                            <><Paperclip className="w-4 h-4" /> Envoyer</>
                          )}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
