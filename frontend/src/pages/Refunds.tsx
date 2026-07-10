import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Payment } from '@/lib/api';
import { formatId, lighthouseContractUrl } from '@/lib/utils';

export function Refunds() {
  const { party } = useParty();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = () => {
    if (!party) return;
    api.getPayments(party.id).then(setPayments).catch(console.error);
  };

  useEffect(load, [party]);

  const received = payments.filter(
    (p) => p.recipient === party?.id && p.status === 'active'
  );

  const handleRefund = async (contractId: string) => {
    if (!party) return;
    setLoadingId(contractId);
    try {
      await api.refundPayment(contractId, party.id);
      toast.success('Refund issued on Canton');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refund failed');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-3xl py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-cantara-teal mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold text-cantara-deep mb-2">Refunds</h1>
        <p className="text-gray-500 mb-8">Refund payments you received — exercises Payment_Refund on DevNet.</p>

        <Card className="divide-y divide-cantara-mint">
          {received.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No active received payments to refund.</p>
          ) : (
            received.map((p) => (
              <div key={p.contractId} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cantara-teal/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-cantara-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-cantara-deep">{p.description}</p>
                  <p className="text-sm text-gray-500">From {p.sender} · ${p.amount.toFixed(2)}</p>
                  <a
                    href={lighthouseContractUrl(p.contractId)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-cantara-teal hover:underline"
                  >
                    {formatId(p.contractId)}
                  </a>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={loadingId === p.contractId}
                  onClick={() => handleRefund(p.contractId)}
                >
                  Refund
                </Button>
              </div>
            ))
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
