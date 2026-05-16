import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { Card, CardBody } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from '@/lib/toast';
import type { Payment } from '@/types/payment.types';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  released:   'success',
  captured:   'info',
  authorized: 'warning',
  refunded:   'error',
  disputed:   'error',
  failed:     'error',
};

export function AdminPayments() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ payments: Payment[] }>({
    queryKey: ['admin-payments'],
    queryFn:  () => api.get('/admin/payments'),
  });

  const { mutate: release } = useMutation({
    mutationFn: (id: number) => api.post(`/admin/payments/${id}/release`, {}),
    onSuccess: () => { toast.success('Paiement libéré.'); qc.invalidateQueries({ queryKey: ['admin-payments'] }); },
  });

  const payments = data?.payments ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-brand-text text-2xl font-bold">Paiements</h1>
      {isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}
      <div className="grid gap-3">
        {payments.map((p) => (
          <Card key={p.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-text font-bold">{formatCurrency(p.amount)}</p>
                  <p className="text-brand-muted text-xs">{p.stripe_payment_intent_id}</p>
                  <p className="text-brand-muted text-xs">{formatDate(p.created_at)}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge color={STATUS_COLOR[p.status] ?? 'info'}>{p.status}</Badge>
                  {p.status === 'captured' && (
                    <Button size="sm" variant="secondary" onClick={() => release(p.id)}>
                      Libérer
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
