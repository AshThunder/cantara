import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Repeat, Clock } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Subscription, type SchedulerStatus } from '@/lib/api';
import { formatId, lighthouseContractUrl } from '@/lib/utils';

export function Subscriptions() {
  const { party, parties } = useParty();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [intervalDays, setIntervalDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);
  const [runningSched, setRunningSched] = useState(false);

  const load = () => {
    if (!party) return;
    api.getSubscriptions(party.id).then(setSubs).catch(console.error);
    api.getScheduler().then(setScheduler).catch(() => setScheduler(null));
  };

  useEffect(load, [party]);

  const handleCreate = async () => {
    if (!party) return;
    const amt = parseFloat(amount);
    if (!recipient || !amt || amt <= 0) {
      toast.error('Pick a recipient and amount');
      return;
    }
    setLoading(true);
    try {
      await api.createSubscription({
        subscriber: party.id,
        recipient,
        amount: amt,
        currency: 'USD',
        description: note || 'Subscription',
        intervalDays: parseInt(intervalDays, 10) || 30,
      });
      toast.success('Subscription created on Canton');
      setAmount('');
      setNote('');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (contractId: string) => {
    if (!party) return;
    setBusyId(contractId);
    try {
      await api.executeSubscription(contractId, party.id);
      toast.success('Subscription payment executed on-ledger');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Execute failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (contractId: string) => {
    if (!party) return;
    setBusyId(contractId);
    try {
      await api.cancelSubscription(contractId, party.id);
      toast.success('Subscription cancelled');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleRunScheduler = async () => {
    setRunningSched(true);
    try {
      const result = await api.runScheduler();
      toast.success(
        result
          ? `Scheduler: ${result.executed} executed, ${result.failed} failed`
          : 'Scheduler ran'
      );
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Scheduler failed');
    } finally {
      setRunningSched(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-xl py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-cantara-teal mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {scheduler && (
          <Card className="p-4 mb-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-cantara-teal shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cantara-deep">
                Auto-charge {scheduler.enabled ? 'on' : 'off'} · every {Math.round(scheduler.pollMs / 1000)}s
              </p>
              <p className="text-xs text-gray-500 truncate">
                {scheduler.lastRun
                  ? `Last run: ${scheduler.lastRun.executed} ok / ${scheduler.lastRun.failed} fail · ${new Date(scheduler.lastRun.checkedAt).toLocaleTimeString()}`
                  : 'Waiting for first poll'}
              </p>
            </div>
            <Button size="sm" variant="outline" isLoading={runningSched} onClick={handleRunScheduler}>
              Run now
            </Button>
          </Card>
        )}

        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cantara-teal/10 rounded-xl flex items-center justify-center">
              <Repeat className="w-5 h-5 text-cantara-teal" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-cantara-deep">Subscriptions</h1>
              <p className="text-sm text-gray-500">Recurring private payments on Canton</p>
            </div>
          </div>

          <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient</label>
          <select
            className="w-full h-12 px-4 rounded-xl border border-gray-200 mb-4"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          >
            <option value="">Select party…</option>
            {parties.filter((p) => p.id !== party?.id).map((p) => (
              <option key={p.id} value={p.id}>{p.displayName}</option>
            ))}
          </select>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (USD)</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mb-4" />
          <label className="text-sm font-medium text-gray-700 mb-2 block">Interval (days)</label>
          <Input type="number" value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} className="mb-4" />
          <label className="text-sm font-medium text-gray-700 mb-2 block">Note</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pro plan" className="mb-6" />
          <Button className="w-full" isLoading={loading} onClick={handleCreate}>Create Subscription</Button>
        </Card>

        <h2 className="font-bold text-cantara-deep mb-4">Active subscriptions</h2>
        <Card className="divide-y divide-cantara-mint">
          {subs.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">No subscriptions yet.</p>
          ) : (
            subs.map((s) => (
              <div key={s.contractId} className="p-4 space-y-3">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-cantara-deep">{s.description}</p>
                    <p className="text-sm text-gray-500">
                      {s.subscriber} → {s.recipient} · ${s.amount.toFixed(2)} / {s.intervalDays}d
                    </p>
                    <p className="text-xs text-gray-400">
                      Next due {new Date(s.nextPaymentAt).toLocaleString()}
                    </p>
                    <a href={lighthouseContractUrl(s.contractId)} target="_blank" rel="noreferrer" className="text-xs font-mono text-cantara-teal hover:underline">
                      {formatId(s.contractId)}
                    </a>
                  </div>
                </div>
                {s.subscriber === party?.id && (
                  <div className="flex gap-2">
                    <Button size="sm" isLoading={busyId === s.contractId} onClick={() => handleExecute(s.contractId)}>
                      Execute payment
                    </Button>
                    <Button size="sm" variant="outline" isLoading={busyId === s.contractId} onClick={() => handleCancel(s.contractId)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
