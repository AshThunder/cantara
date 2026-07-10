import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, ExternalLink } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Payment, type PaymentRequest } from '@/lib/api';
import { formatId, lighthouseContractUrl, lighthouseTxUrl } from '@/lib/utils';

/** Customer pay flow for a merchant PaymentRequest. */
export function Pay() {
  const { id } = useParams();
  const { party, parties, connect, isConnected } = useParty();
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState<Payment | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !party) return;
    // Load all parties' requests by scanning known parties (merchant may differ)
    Promise.all(parties.map((p) => api.getPaymentRequests(p.id).catch(() => [] as PaymentRequest[])))
      .then((lists) => {
        const found = lists.flat().find((r) => r.contractId === id);
        if (!found) {
          setError('Payment request not found or already fulfilled');
          return;
        }
        setRequest(found);
        if (found.amount != null) setAmount(String(found.amount));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [id, party, parties]);

  const handlePay = async () => {
    if (!party || !id) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter amount');
      return;
    }
    setLoading(true);
    try {
      const payment = await api.fulfillPaymentRequest(id, party.id, amt);
      setPaid(payment);
      toast.success('Paid on Canton DevNet');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-md py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-cantara-teal mb-6">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        {!isConnected ? (
          <Card className="p-8 text-center">
            <h1 className="text-xl font-bold text-cantara-deep mb-4">Connect to pay</h1>
            <p className="text-gray-500 mb-6">Choose a party to fulfill this checkout on Canton.</p>
            <div className="space-y-2">
              {parties.map((p) => (
                <Button key={p.id} className="w-full" variant="outline" onClick={() => connect(p)}>
                  {p.displayName}
                </Button>
              ))}
            </div>
          </Card>
        ) : paid ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-cantara-deep mb-2">Payment complete</h2>
            <p className="text-gray-500 mb-4">${paid.amount.toFixed(2)} paid privately</p>
            {paid.updateId && (
              <a href={lighthouseTxUrl(paid.updateId)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-mono text-cantara-teal mb-6">
                Tx {formatId(paid.updateId)} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <Link to="/activity"><Button className="w-full">View Activity</Button></Link>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cantara-teal/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-cantara-teal" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-cantara-deep">Checkout</h1>
                <p className="text-sm text-gray-500">Paying as {party?.displayName}</p>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            {request && (
              <>
                <div className="bg-cantara-mint rounded-xl p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Merchant</span>
                    <span className="font-medium">{request.requester}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">For</span>
                    <span className="font-medium">{request.description}</span>
                  </div>
                  <a href={lighthouseContractUrl(request.contractId)} target="_blank" rel="noreferrer" className="text-xs font-mono text-cantara-teal hover:underline">
                    {formatId(request.contractId)}
                  </a>
                </div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (USD)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={request.amount != null}
                  className="mb-6"
                />
                <Button className="w-full" isLoading={loading} onClick={handlePay}>
                  Pay privately
                </Button>
              </>
            )}
            {!request && !error && <p className="text-gray-500 text-sm">Loading request…</p>}
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
