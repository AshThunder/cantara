import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Card } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Payment } from '@/lib/api';

export function Activity() {
  const { party } = useParty();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!party) return;
    api.getPayments(party.id).then(setPayments).catch(console.error);
  }, [party]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-3xl py-8">
        <h1 className="text-3xl font-bold text-cantara-deep mb-8">Activity</h1>
        <Card className="divide-y divide-cantara-mint">
          {payments.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No payments yet.</p>
          ) : (
            payments.map((p) => {
              const isSent = p.sender === party?.id;
              return (
                <div key={p.contractId} className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSent ? 'bg-red-50' : 'bg-green-50'}`}>
                    {isSent ? <ArrowUpRight className="w-5 h-5 text-red-500" /> : <ArrowDownLeft className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-cantara-deep">{p.description}</p>
                    <p className="text-sm text-gray-500">{isSent ? 'To' : 'From'} {isSent ? p.recipient : p.sender}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                      {isSent ? '-' : '+'}${p.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{p.status}</p>
                  </div>
                </div>
              );
            })
          )}
        </Card>
        <Link to="/dashboard" className="block text-center mt-6 text-cantara-teal hover:underline">Back to Dashboard</Link>
      </main>
      <Footer />
    </div>
  );
}
