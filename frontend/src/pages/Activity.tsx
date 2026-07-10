import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Card } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Payment } from '@/lib/api';
import { formatId, lighthouseContractUrl, lighthouseTxUrl } from '@/lib/utils';
import { useEffect, useState } from 'react';

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
        <div className="flex items-end justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-cantara-deep">Activity</h1>
          <a
            href="https://lighthouse.devnet.cantonloop.com/contracts"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-cantara-teal hover:underline inline-flex items-center gap-1"
          >
            5N Lighthouse <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <Card className="divide-y divide-cantara-mint">
          {payments.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No payments yet.</p>
          ) : (
            payments.map((p) => {
              const isSent = p.sender === party?.id;
              return (
                <div key={p.contractId} className="p-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSent ? 'bg-red-50' : 'bg-green-50'}`}>
                    {isSent ? <ArrowUpRight className="w-5 h-5 text-red-500" /> : <ArrowDownLeft className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cantara-deep">{p.description}</p>
                    <p className="text-sm text-gray-500">{isSent ? 'To' : 'From'} {isSent ? p.recipient : p.sender}</p>
                    <div className="mt-2 space-y-1 text-xs font-mono text-gray-500">
                      {p.updateId && (
                        <a
                          href={lighthouseTxUrl(p.updateId)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:text-cantara-teal"
                          title={p.updateId}
                        >
                          Tx {formatId(p.updateId)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a
                        href={lighthouseContractUrl(p.contractId)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:text-cantara-teal"
                        title={p.contractId}
                      >
                        Contract {formatId(p.contractId)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
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
