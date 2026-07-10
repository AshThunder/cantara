import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Store, Copy, Check } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type PaymentRequest } from '@/lib/api';
import { formatId, lighthouseContractUrl } from '@/lib/utils';

/** Merchant checkout — create payment links (PaymentRequest) customers can pay. */
export function Checkout() {
  const { party } = useParty();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const load = () => {
    if (!party) return;
    api.getPaymentRequests(party.id).then(setRequests).catch(console.error);
  };

  useEffect(load, [party]);

  const handleCreate = async () => {
    if (!party) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a checkout amount');
      return;
    }
    setLoading(true);
    try {
      const req = await api.createPaymentRequest({
        requester: party.id,
        amount: amt,
        currency: 'USD',
        description: note || 'Checkout payment',
      });
      toast.success('Checkout link created on Canton');
      setAmount('');
      setNote('');
      load();
      const url = `${window.location.origin}/pay/${req.contractId}`;
      await navigator.clipboard.writeText(url);
      setCopied(req.contractId);
      toast.success('Pay link copied');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (contractId: string) => {
    const url = `${window.location.origin}/pay/${contractId}`;
    await navigator.clipboard.writeText(url);
    setCopied(contractId);
    toast.success('Link copied');
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
            <div className="w-10 h-10 bg-cantara-accent/20 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-cantara-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-cantara-deep">Merchant Checkout</h1>
              <p className="text-sm text-gray-500">Create a private payment link for customers</p>
            </div>
          </div>

          <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (USD)</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mb-4" />
          <label className="text-sm font-medium text-gray-700 mb-2 block">Product / note</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Invoice #1042" className="mb-6" />
          <Button className="w-full" variant="accent" isLoading={loading} onClick={handleCreate}>
            Create checkout link
          </Button>
        </Card>

        <h2 className="font-bold text-cantara-deep mb-4">Open checkout links</h2>
        <Card className="divide-y divide-cantara-mint">
          {requests.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">No open checkout links.</p>
          ) : (
            requests.map((r) => (
              <div key={r.contractId} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-cantara-deep">{r.description}</p>
                  <p className="text-sm text-gray-500">
                    {r.amount != null ? `$${r.amount.toFixed(2)}` : 'Any'} · {r.requestId}
                  </p>
                  <a href={lighthouseContractUrl(r.contractId)} target="_blank" rel="noreferrer" className="text-xs font-mono text-cantara-teal hover:underline">
                    {formatId(r.contractId)}
                  </a>
                </div>
                <Button size="sm" variant="outline" onClick={() => copyLink(r.contractId)}>
                  {copied === r.contractId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Link to={`/pay/${r.contractId}`}>
                  <Button size="sm">Open</Button>
                </Link>
              </div>
            ))
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
