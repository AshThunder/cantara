import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Download, FileText, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Payment, type Stats } from '@/lib/api';

export function Dashboard() {
  const { party } = useParty();
  const [stats, setStats] = useState<Stats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!party) return;
    api.getStats(party.id).then(setStats).catch(console.error);
    api.getPayments(party.id).then(setPayments).catch(console.error);
  }, [party]);

  const receivedTotal = payments
    .filter((p) => p.recipient === party?.id && p.status === 'active')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-7xl py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-cantara-deep">Welcome back, {party?.displayName}</h1>
          <p className="text-gray-500 font-mono text-sm mt-1">{party?.id}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cantara-teal via-cantara-teal-dark to-cantara-deep" />
              <div className="relative p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-white/80" />
                  <div>
                    <p className="text-white/70 text-sm">Private Balance</p>
                    <p className="text-white font-bold">Canton Coin</p>
                  </div>
                </div>
                <p className="text-5xl font-bold text-white mb-2">
                  ${receivedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-white/60 text-sm flex items-center gap-2 mb-8">
                  <Sparkles className="w-4 h-4" />
                  Received total · visible only to your party
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/send"><Button className="bg-white text-cantara-teal-dark hover:bg-white/90"><Send className="w-4 h-4 mr-2" />Send</Button></Link>
                  <Link to="/request"><Button className="bg-white/20 text-white hover:bg-white/30 border-0"><Download className="w-4 h-4 mr-2" />Request</Button></Link>
                  <Link to="/invoices/new"><Button className="bg-cantara-accent text-cantara-deep hover:bg-amber-400"><FileText className="w-4 h-4 mr-2" />New Invoice</Button></Link>
                </div>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Sent', value: stats.sent },
                  { label: 'Received', value: stats.received },
                  { label: 'Refunded', value: stats.refunded },
                  { label: 'Invoices', value: stats.invoices },
                ].map((s) => (
                  <Card key={s.label} className="p-4">
                    <p className="text-2xl font-bold text-cantara-deep">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="font-bold text-cantara-deep mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { to: '/send', icon: Send, label: 'Send Money' },
                  { to: '/invoices', icon: FileText, label: 'Trade Finance' },
                  { to: '/activity', icon: Download, label: 'Activity' },
                ].map((a) => (
                  <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-cantara-mint transition-colors group">
                    <div className="w-10 h-10 bg-cantara-teal rounded-xl flex items-center justify-center">
                      <a.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-cantara-deep flex-1">{a.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-cantara-teal" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
