import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api } from '@/lib/api';

export function InvoiceNew() {
  const { party, parties } = useParty();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!party) return;
    setLoading(true);
    try {
      await api.createInvoice({
        supplier: party.id,
        buyer,
        description,
        amount: parseFloat(amount),
        currency: 'USD',
        dueDate: new Date(dueDate).toISOString(),
      });
      toast.success('Invoice submitted to buyer');
      navigate('/invoices');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-xl py-8">
        <Link to="/invoices" className="inline-flex items-center gap-2 text-gray-500 hover:text-cantara-teal mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cantara-accent/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-cantara-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-cantara-deep">New Invoice</h1>
              <p className="text-sm text-gray-500">Supplier: {party?.displayName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Buyer</label>
              <select className="w-full h-12 px-4 rounded-xl border border-gray-200" value={buyer} onChange={(e) => setBuyer(e.target.value)}>
                <option value="">Select buyer…</option>
                {parties.filter((p) => p.id !== party?.id).map((p) => (
                  <option key={p.id} value={p.id}>{p.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Goods or services provided" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (USD)</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Due date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <Button
            className="w-full mt-8"
            variant="accent"
            isLoading={loading}
            disabled={!buyer || !description || !amount || !dueDate}
            onClick={handleSubmit}
          >
            Submit Invoice
          </Button>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
