import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Send as SendIcon, Shield, Check } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api } from '@/lib/api';

type Step = 'recipient' | 'amount' | 'confirm' | 'success';

export function Send() {
  const { party, parties } = useParty();
  const [step, setStep] = useState<Step>('recipient');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const recipientParty = parties.find((p) => p.id === recipient);

  const handleSend = async () => {
    if (!party) return;
    setLoading(true);
    try {
      await api.sendPayment({
        sender: party.id,
        recipient,
        amount: parseFloat(amount),
        currency: 'USD',
        description: note || 'Payment',
      });
      toast.success(`Payment sent to ${recipientParty?.displayName}`);
      setStep('success');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment failed');
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

        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-cantara-deep mb-2">Payment Sent</h2>
                <p className="text-gray-500 mb-8">${amount} sent privately to {recipientParty?.displayName}</p>
                <Link to="/dashboard"><Button className="w-full">Back to Dashboard</Button></Link>
              </Card>
            </motion.div>
          ) : (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cantara-teal/10 rounded-xl flex items-center justify-center">
                    <SendIcon className="w-5 h-5 text-cantara-teal" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-cantara-deep">Send Money</h1>
                    <p className="text-sm text-gray-500">Private payment on Canton</p>
                  </div>
                </div>

                {step === 'recipient' && (
                  <>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient party</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 mb-6"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    >
                      <option value="">Select a party…</option>
                      {parties.filter((p) => p.id !== party?.id).map((p) => (
                        <option key={p.id} value={p.id}>{p.displayName}</option>
                      ))}
                    </select>
                    <Button className="w-full" disabled={!recipient} onClick={() => setStep('amount')}>Continue</Button>
                  </>
                )}

                {step === 'amount' && (
                  <>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (USD)</label>
                    <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="mb-4" />
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Note (optional)</label>
                    <Input placeholder="What's this for?" value={note} onChange={(e) => setNote(e.target.value)} className="mb-6" />
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStep('recipient')}>Back</Button>
                      <Button className="flex-1" disabled={!amount || parseFloat(amount) <= 0} onClick={() => setStep('confirm')}>Continue</Button>
                    </div>
                  </>
                )}

                {step === 'confirm' && (
                  <>
                    <div className="bg-cantara-mint rounded-xl p-5 mb-6 space-y-3">
                      <div className="flex justify-between"><span className="text-gray-500">To</span><span className="font-medium">{recipientParty?.displayName}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-xl">${amount}</span></div>
                      {note && <div className="flex justify-between"><span className="text-gray-500">Note</span><span>{note}</span></div>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <Shield className="w-4 h-4 text-cantara-teal" />
                      Only you and {recipientParty?.displayName} will see this amount
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStep('amount')}>Back</Button>
                      <Button className="flex-1" isLoading={loading} onClick={handleSend}>Send Payment</Button>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
