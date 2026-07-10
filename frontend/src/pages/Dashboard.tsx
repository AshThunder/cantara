import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Send, Download, FileText, ArrowRight, Shield, Sparkles, Wallet, Eye, EyeOff,
  Copy, ArrowUpRight, ArrowDownLeft, Users, Clock, Store, Repeat,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { api, type Payment, type Stats, type Wallet as WalletType } from '@/lib/api';
import { formatParty } from '@/lib/utils';

export function Dashboard() {
  const { party } = useParty();
  const [stats, setStats] = useState<Stats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (!party) return;
    api.getStats(party.id).then(setStats).catch(console.error);
    api.getPayments(party.id).then(setPayments).catch(console.error);
    api.getWallet(party.id).then(setWallet).catch(console.error);
  }, [party]);

  const copyParty = () => {
    if (!party) return;
    navigator.clipboard.writeText(party.id);
    toast.success('Party id copied');
  };

  const recent = payments.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 sm:px-8 max-w-7xl py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back{party ? `, ${party.displayName}` : ''}
          </h1>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
              {party && formatParty(party.id, 6)}
            </span>
            <button type="button" onClick={copyParty} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cantara-teal via-cantara-teal-dark to-cantara-deep" />
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-1/2 -right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full" />
                  <div className="absolute -bottom-1/2 -left-1/4 w-[400px] h-[400px] bg-white/5 rounded-full" />
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
                </div>

                <div className="relative p-8 md:p-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">Private Balance</p>
                        <p className="text-white font-bold">Wallet</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBalance((v) => !v)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/90 text-sm font-medium transition-all backdrop-blur-sm"
                    >
                      {showBalance ? <><EyeOff className="w-4 h-4" /> Hide</> : <><Eye className="w-4 h-4" /> Reveal</>}
                    </button>
                  </div>

                  <div className="mb-8">
                    <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                      {showBalance && wallet ? (
                        <motion.span initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-baseline gap-3">
                          ${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          <span className="text-2xl font-normal text-white/70">USD</span>
                        </motion.span>
                      ) : (
                        <span className="tracking-wider">$••••••</span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Opening ${wallet?.openingBalance.toLocaleString() ?? '—'} · party-visible on Canton
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link to="/send">
                      <Button className="bg-white text-cantara-teal-dark hover:bg-white/90 shadow-lg shadow-black/10">
                        <Send className="w-4 h-4 mr-2" /> Send
                      </Button>
                    </Link>
                    <Link to="/multi-send">
                      <Button className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm">
                        <Users className="w-4 h-4 mr-2" /> Multi-Send
                      </Button>
                    </Link>
                    <Link to="/request">
                      <Button className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm">
                        <Download className="w-4 h-4 mr-2" /> Request
                      </Button>
                    </Link>
                    <Link to="/wallet">
                      <Button className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm">
                        <Wallet className="w-4 h-4 mr-2" /> Wallet
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Sent', value: stats.sent, icon: ArrowUpRight },
                  { label: 'Received', value: stats.received, icon: ArrowDownLeft },
                  { label: 'Refunded', value: stats.refunded, icon: Repeat },
                  { label: 'Invoices', value: stats.invoices, icon: FileText },
                ].map((s) => (
                  <Card key={s.label} className="p-4 border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cantara-deep/10 rounded-xl flex items-center justify-center">
                        <s.icon className="w-5 h-5 text-cantara-deep" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                        <p className="text-sm text-gray-500">{s.label}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Card className="overflow-hidden border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <Link to="/activity" className="text-sm text-cantara-teal hover:text-cantara-teal-dark font-medium flex items-center gap-1 group">
                  View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No activity yet</h3>
                  <p className="text-gray-500 mb-6 text-sm">Private payments will show up here.</p>
                  <Link to="/send"><Button><Send className="w-4 h-4 mr-2" />Send Money</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recent.map((p) => {
                    const sent = p.sender === party?.id;
                    return (
                      <div key={p.contractId} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sent ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          {sent
                            ? <ArrowUpRight className="w-5 h-5 text-red-500" />
                            : <ArrowDownLeft className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{p.description || (sent ? 'Sent' : 'Received')}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {sent ? `To ${p.recipient}` : `From ${p.sender}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${sent ? 'text-red-600' : 'text-emerald-600'}`}>
                            {sent ? '-' : '+'}${p.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden border-gray-100">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-3 space-y-1">
                {[
                  { to: '/wallet', icon: Wallet, label: 'Wallet', color: 'bg-cantara-teal' },
                  { to: '/send', icon: Send, label: 'Send Money', color: 'bg-cantara-deep' },
                  { to: '/multi-send', icon: Users, label: 'Multi-Send', color: 'bg-cantara-teal' },
                  { to: '/subscriptions', icon: Repeat, label: 'Subscriptions', color: 'bg-cantara-deep' },
                  { to: '/checkout', icon: Store, label: 'Merchant Checkout', color: 'bg-cantara-accent' },
                  { to: '/invoices', icon: FileText, label: 'Trade Finance', color: 'bg-cantara-deep' },
                  { to: '/activity', icon: Clock, label: 'Activity', color: 'bg-cantara-teal' },
                ].map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center`}>
                      <a.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 flex-1">{a.label}</span>
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
