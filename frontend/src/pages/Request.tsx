import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Link2 } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type PaymentRequest } from '@/lib/api';
import { formatId, lighthouseContractUrl } from '@/lib/utils';

export function Request() {
  const { party } = useParty();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);

  const load = () => {
    if (!party) return;
    api.getPaymentRequests(party.id).then(setRequests).catch(console.error);
  };

  useEffect(load, [party]);

  const handleCreate = async () => {
    if (!party) return;
    const parsed = amount ? parseFloat(amount) : null;
    if (parsed !== null && (Number.isNaN(parsed) || parsed <= 0)) {
      toast.error('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      await api.createPaymentRequest({
        requester: party.id,
        amount: parsed,
        currency: 'USD',
        description: note || 'Payment request',
      });
      toast.success('Payment request created on Canton');
      setAmount('');
      setNote('');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-xl py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-cantara-teal mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cantara-teal/10 rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5 text-cantara-teal" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-cantara-deep">Request Money</h1>
              <p className="text-sm text-gray-500">Creates a PaymentRequest contract on DevNet</p>
            </div>
          </div>

          <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (USD, optional)</label>
          <Input
            type="number"
            placeholder="Leave empty for any amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-4"
          />
          <label className="text-sm font-medium text-gray-700 mb-2 block">Note</label>
          <Input
            placeholder="What's this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mb-6"
          />
          <Button className="w-full" isLoading={loading} onClick={handleCreate}>
            Create Request
          </Button>
        </Card>

        <h2 className="font-bold text-cantara-deep mb-4">Your open requests</h2>
        <Card className="divide-y divide-cantara-mint">
          {requests.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">No open requests yet.</p>
          ) : (
            requests.map((r) => (
              <div key={r.contractId} className="p-4">
                <p className="font-medium text-cantara-deep">{r.description}</p>
                <p className="text-sm text-gray-500">
                  {r.amount != null ? `$${r.amount.toFixed(2)}` : 'Any amount'} · {r.requestId}
                </p>
                <a
                  href={lighthouseContractUrl(r.contractId)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-cantara-teal hover:underline"
                >
                  {formatId(r.contractId)}
                </a>
              </div>
            ))
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
