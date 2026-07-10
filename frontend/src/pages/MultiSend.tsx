import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type BatchPaymentResult } from '@/lib/api';
import { formatId, lighthouseTxUrl } from '@/lib/utils';

type Row = { recipient: string; amount: string };

export function MultiSend() {
  const { party, parties } = useParty();
  const [rows, setRows] = useState<Row[]>([{ recipient: '', amount: '' }]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchPaymentResult | null>(null);

  const others = parties.filter((p) => p.id !== party?.id);

  const addRow = () => {
    if (rows.length >= 10) return;
    setRows([...rows, { recipient: '', amount: '' }]);
  };

  const updateRow = (i: number, patch: Partial<Row>) => {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const removeRow = (i: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, idx) => idx !== i));
  };

  const handleSend = async () => {
    if (!party) return;
    const recipients = rows
      .map((r) => ({ recipient: r.recipient, amount: parseFloat(r.amount) }))
      .filter((r) => r.recipient && r.amount > 0);
    if (recipients.length === 0) {
      toast.error('Add at least one recipient with amount');
      return;
    }
    setLoading(true);
    try {
      const res = await api.multiSend({
        sender: party.id,
        currency: 'USD',
        description: note || 'Multi-send batch',
        recipients,
      });
      setResult(res);
      toast.success(`Sent to ${res.payments.length} recipients on Canton`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Multi-send failed');
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

        {result ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-cantara-deep mb-2">Batch sent</h2>
            <p className="text-gray-500 mb-4">{result.payments.length} payments created on DevNet</p>
            {result.updateId && (
              <a
                href={lighthouseTxUrl(result.updateId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-mono text-cantara-teal mb-6"
              >
                Tx {formatId(result.updateId)} <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <div className="flex flex-col gap-3">
              <Link to="/activity"><Button className="w-full">View Activity</Button></Link>
              <Button variant="outline" className="w-full" onClick={() => setResult(null)}>Send another</Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cantara-teal/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-cantara-teal" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-cantara-deep">Multi-Send</h1>
                <p className="text-sm text-gray-500">Batch up to 10 recipients in one ledger tx</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    className="flex-1 h-11 px-3 rounded-xl border border-gray-200"
                    value={row.recipient}
                    onChange={(e) => updateRow(i, { recipient: e.target.value })}
                  >
                    <option value="">Recipient…</option>
                    {others.map((p) => (
                      <option key={p.id} value={p.id}>{p.displayName}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="w-28"
                    value={row.amount}
                    onChange={(e) => updateRow(i, { amount: e.target.value })}
                  />
                  <button type="button" className="p-2 text-gray-400 hover:text-red-500" onClick={() => removeRow(i)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="mb-4" disabled={rows.length >= 10} onClick={addRow}>
              <Plus className="w-4 h-4 mr-1" /> Add recipient
            </Button>

            <label className="text-sm font-medium text-gray-700 mb-2 block">Note</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Payroll batch" className="mb-6" />
            <Button className="w-full" isLoading={loading} onClick={handleSend}>Send batch</Button>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
