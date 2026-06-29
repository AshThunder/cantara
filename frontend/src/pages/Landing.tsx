import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Send, FileText, Users, ArrowRight, Waves } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';

const features = [
  {
    icon: Send,
    title: 'Private Payments',
    desc: 'Send, request, and subscribe — amounts visible only to the parties involved.',
  },
  {
    icon: FileText,
    title: 'Invoice Financing',
    desc: 'Suppliers, buyers, and financiers coordinate with selective visibility.',
  },
  {
    icon: Shield,
    title: 'Canton Privacy',
    desc: 'Party-based confidentiality built into Daml — no public ledger exposure.',
  },
  {
    icon: Users,
    title: 'Multi-Party Workflows',
    desc: 'Institutional-grade trade finance and payments on one platform.',
  },
];

export function Landing() {
  const { isConnected, parties, connect } = useParty();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-cantara-deep text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.15),transparent_60%)]" />
        <div className="container mx-auto px-6 max-w-7xl py-24 md:py-32 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cantara-teal/20 text-cantara-teal-light text-sm font-medium mb-6">
              <Waves className="w-4 h-4" />
              Built on Canton Network
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Private payments.<br />
              <span className="text-cantara-teal-light">Trade finance.</span><br />
              One flow.
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-lg">
              Cantara brings confidential P2P payments and invoice financing to institutions — powered by Daml smart contracts on Canton.
            </p>
            <div className="flex flex-wrap gap-4">
              {isConnected ? (
                <Link to="/dashboard">
                  <Button variant="accent" size="lg">
                    Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button variant="accent" size="lg" onClick={() => connect(parties[0])}>
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              <Link to="/invoices">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Explore Invoices
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="h-16 bg-gradient-to-b from-transparent to-cantara-mint" />
      </section>

      {/* Features */}
      <section className="py-20 bg-cantara-mint">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-3xl font-bold text-cantara-deep text-center mb-12">
            Two modules. One platform.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-cantara-mint hover:shadow-lg transition-shadow"
              >
                <div className="w-11 h-11 bg-cantara-teal/10 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-cantara-teal" />
                </div>
                <h3 className="font-bold text-cantara-deep mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
