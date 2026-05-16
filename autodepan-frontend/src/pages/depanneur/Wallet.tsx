import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { Card, CardBody, CardHeader } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Wallet as WalletType, WalletTransaction } from '@/types/depanneur.types';

export function Wallet() {
  const { data: walletData, isLoading: loadingWallet } = useQuery<{ data: WalletType }>({
    queryKey: ['wallet'],
    queryFn:  () => api.get('/depanneur/wallet'),
  });

  const { data: txData, isLoading: loadingTx } = useQuery<{ data: WalletTransaction[] }>({
    queryKey: ['wallet-transactions'],
    queryFn:  () => api.get('/depanneur/wallet/transactions'),
  });

  const wallet = walletData?.data;
  const transactions = txData?.data ?? [];

  const TX_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
    credit:     'success',
    release:    'success',
    debit:      'error',
    withdrawal: 'error',
    pending:    'warning',
  };

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      <h1 className="text-brand-text text-xl font-bold">Mon Wallet</h1>

      {loadingWallet ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : wallet && (
        <Card className="bg-gradient-to-br from-blue-900/40 to-slate-800/40 border-blue-800/40">
          <CardBody>
            <p className="text-brand-muted text-sm mb-1">Solde disponible</p>
            <p className="text-brand-text text-4xl font-black">{formatCurrency(wallet.balance)}</p>
            {wallet.pending_balance > 0 && (
              <p className="text-amber-400 text-sm mt-2">
                + {formatCurrency(wallet.pending_balance)} en attente
              </p>
            )}
            <div className="flex gap-6 mt-4 pt-4 border-t border-blue-800/30">
              <div>
                <p className="text-brand-muted text-xs">Total gagné</p>
                <p className="text-green-400 font-bold">{formatCurrency(wallet.total_earned)}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Retiré</p>
                <p className="text-brand-text font-bold">{formatCurrency(wallet.total_withdrawn)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <p className="text-brand-text font-bold">Historique des transactions</p>
        </CardHeader>
        {loadingTx ? (
          <CardBody><div className="flex justify-center py-4"><Spinner /></div></CardBody>
        ) : (
          <CardBody className="p-0">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4 border-b border-brand-border last:border-0">
                <div className="flex items-center gap-3">
                  <Badge color={TX_COLORS[tx.type] ?? 'info'}>
                    {tx.type}
                  </Badge>
                  <div>
                    <p className="text-brand-text text-sm">{tx.description}</p>
                    <p className="text-brand-muted text-xs">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${
                  ['credit','release'].includes(tx.type) ? 'text-green-400' : 'text-red-400'
                }`}>
                  {['credit','release'].includes(tx.type) ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <CardBody className="text-center py-8">
                <p className="text-brand-muted text-sm">Aucune transaction.</p>
              </CardBody>
            )}
          </CardBody>
        )}
      </Card>
    </div>
  );
}
