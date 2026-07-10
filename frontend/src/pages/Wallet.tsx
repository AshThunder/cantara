import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Wallet } from '@/lib/api';

export function WalletPage() {
  const { party } = useParty();
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const load = () => {
    if (!party) return;
    api.getWallet(party.id).then(setWallet).catch(console.error);
  };

  useEffect(load, [party]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-xl py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-cantara-teal mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="relative overflow-hidden rounded-3xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cantara-teal via-cantara-teal-dark to-cantara-deep" />
          <div className="relative p-8">
            <div className="flex items-center gap-3 mb-4">
              <WalletIcon className="w-6 h-6 text-white/80" />
              <p className="text-white/70 text-sm">Wallet · {party?.displayName}</p>
            </div>
            <p className="text-5xl font-bold text-white mb-2">
              ${wallet ? wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
            </p>
            <p className="text-white/60 text-sm">
              Opening ${wallet?.openingBalance.toLocaleString() ?? '—'} · derived from private payments
            </p>
            <div className="flex gap-3 mt-6">
              <Link to="/send"><Button className="bg-white text-cantara-teal-dark hover:bg-white/90">Send</Button></Link>
              <Link to="/request"><Button className="bg-white/20 text-white hover:bg-white/30 border-0">Request</Button></Link>
            </div>
          </div>
        </div>

        {wallet && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Received', value: wallet.receivedTotal },
              { label: 'Sent', value: wallet.sentTotal },
              { label: 'Refunded', value: wallet.refundedTotal },
            ].map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <p className="text-lg font-bold text-cantara-deep">
                  ${s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-6">
          <h2 className="font-bold text-cantara-deep mb-4">Ledger</h2>
          <div className="space-y-3 max-h-[28rem] overflow-y-auto">
            {(wallet?.entries ?? []).map((e) => {
              const Icon =
                e.type === 'credit' ? ArrowDownLeft : e.type === 'debit' ? ArrowUpRight : RotateCcw;
              const color =
                e.type === 'credit'
                  ? 'text-emerald-600'
                  : e.type === 'debit'
                    ? 'text-rose-600'
                    : 'text-gray-500';
              return (
                <div key={e.id} className="flex items-start gap-3 py-2 border-b border-cantara-mint last:border-0">
                  <div className={`mt-1 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cantara-deep truncate">{e.description}</p>
                    <p className="text-xs text-gray-400">
                      {e.counterparty ? `${e.counterparty} · ` : ''}
                      {new Date(e.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${color}`}>
                      {e.amount > 0 ? '+' : ''}
                      {e.type === 'refund' && e.amount === 0
                        ? '—'
                        : `$${Math.abs(e.amount).toFixed(2)}`}
                    </p>
                    <p className="text-xs text-gray-400">${e.balanceAfter.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            {!wallet?.entries.length && (
              <p className="text-sm text-gray-500 text-center py-6">No ledger entries yet</p>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
