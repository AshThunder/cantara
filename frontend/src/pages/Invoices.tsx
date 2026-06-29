import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Plus, Clock, CheckCircle, ArrowRight, Check } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Invoice, type InvoiceProposal } from '@/lib/api';

const stageStyle: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  attested: 'bg-purple-100 text-purple-700',
  financed: 'bg-cantara-teal/10 text-cantara-teal-dark',
  settled: 'bg-green-100 text-green-700',
};

export function Invoices() {
  const { party } = useParty();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proposals, setProposals] = useState<InvoiceProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!party) return;
    setLoading(true);
    api.getInvoices(party.id)
      .then((data) => {
        setInvoices(data.invoices);
        setProposals(data.proposals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [party]);

  const handleAccept = async (contractId: string) => {
    if (!party) return;
    try {
      await api.acceptProposal(contractId, party.id);
      toast.success('Invoice confirmed');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleAttest = async (contractId: string) => {
    if (!party) return;
    try {
      await api.attestInvoice(contractId, party.id, 'Financier');
      toast.success('Invoice attested to financier');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleOffer = async (contractId: string) => {
    if (!party) return;
    try {
      await api.submitOffer(contractId, party.id, {
        advanceRate: 0.85,
        discountFee: 0.03,
        currency: 'USD',
      });
      toast.success('Financing offer submitted');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleSettle = async (contractId: string) => {
    if (!party) return;
    try {
      await api.settleInvoice(contractId, party.id);
      toast.success('Invoice settled');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const roleFor = (inv: Invoice | InvoiceProposal) => {
    if (!party) return '';
    if ('stage' in inv) {
      if (inv.supplier === party.id) return 'supplier';
      if (inv.buyer === party.id) return 'buyer';
      if (inv.financier === party.id) return 'financier';
    } else {
      if (inv.supplier === party.id) return 'supplier';
      if (inv.buyer === party.id) return 'buyer';
    }
    return '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-7xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cantara-deep">Invoice Financing</h1>
            <p className="text-gray-500 mt-1">Private trade finance for {party?.displayName}</p>
          </div>
          <Link to="/invoices/new">
            <Button variant="accent"><Plus className="w-4 h-4 mr-2" />New Invoice</Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <div className="grid gap-4">
            {proposals.map((inv) => (
              <Card key={inv.contractId} className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-cantara-deep">{inv.description}</h3>
                    <p className="text-sm text-gray-500">{inv.invoiceId} · Proposal · {roleFor(inv)}</p>
                  </div>
                  <p className="font-bold">${inv.amount.toLocaleString()}</p>
                  {party?.id === inv.buyer && (
                    <Button size="sm" onClick={() => handleAccept(inv.contractId)}>
                      <Check className="w-4 h-4 mr-1" /> Confirm
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {invoices.map((inv) => (
              <Card key={inv.contractId} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cantara-teal/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-cantara-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-cantara-deep">{inv.description}</h3>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${stageStyle[inv.stage]}`}>
                        {inv.stage}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{inv.invoiceId} · {roleFor(inv)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cantara-deep">${inv.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                      {inv.stage === 'settled' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {inv.currency}
                    </p>
                  </div>
                  {party?.id === inv.buyer && inv.stage === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => handleAttest(inv.contractId)}>Attest</Button>
                  )}
                  {party?.id === inv.financier && inv.stage === 'attested' && (
                    <Button size="sm" variant="accent" onClick={() => handleOffer(inv.contractId)}>Offer</Button>
                  )}
                  {party?.id === inv.buyer && inv.stage === 'financed' && (
                    <Button size="sm" onClick={() => handleSettle(inv.contractId)}>Settle</Button>
                  )}
                  <ArrowRight className="w-5 h-5 text-gray-300" />
                </div>
              </Card>
            ))}

            {proposals.length === 0 && invoices.length === 0 && (
              <Card className="p-12 text-center text-gray-500">
                No invoices yet. Create one as a supplier or wait for a proposal as a buyer.
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
