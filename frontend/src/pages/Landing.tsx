import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, ArrowRight, Eye, EyeOff, Wallet, Send, QrCode,
  CheckCircle2, FileText, Store, Users,
  UserRound, Star, Waves, ExternalLink,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';

/** Section transition — logo-inspired double wave (not a flat needle). */
const WaveDivider = ({
  flip = false,
  from = '#FFFFFF',
  to = '#042F2E',
}: {
  flip?: boolean;
  from?: string;
  to?: string;
}) => (
  <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`} aria-hidden>
    <svg
      viewBox="0 0 1440 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-[72px] sm:h-[100px] block"
      preserveAspectRatio="none"
    >
      <rect width="1440" height="100" fill={from} />
      {/* Primary wave fill — matches Cantara logo curve rhythm */}
      <path
        d="M0 48C180 18 300 78 480 52C660 26 780 8 960 38C1140 68 1260 72 1440 42V100H0V48Z"
        fill={to}
      />
      {/* Secondary softer wave (logo double-stroke feel) */}
      <path
        d="M0 58C200 28 340 82 520 58C700 34 820 18 1000 48C1180 78 1300 70 1440 52"
        stroke="#14B8A6"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
        fill="none"
      />
      <circle cx="1380" cy="48" r="5" fill="#F59E0B" opacity="0.9" />
    </svg>
  </div>
);

/** Stylized QR — links to Lighthouse explorer, not a fake app store. */
function DevNetBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href="https://lighthouse.devnet.cantonloop.com"
      target="_blank"
      rel="noreferrer"
      className={`inline-flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow ${className}`}
    >
      <div className="w-24 h-24 grid grid-cols-5 gap-0.5 p-1.5 bg-gray-50 rounded-lg">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-[1px] ${
              [0, 1, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 21, 22, 24].includes(i)
                ? 'bg-cantara-deep'
                : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
        DevNet explorer <ExternalLink className="w-3 h-3" />
      </span>
    </a>
  );
}

const PhoneMockup = () => (
  <motion.div
    initial={{ opacity: 0, y: 80 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.35 }}
    className="relative mx-auto w-[280px] sm:w-[320px]"
  >
    <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
      <div className="bg-white rounded-[2.5rem] overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-gray-400 rounded-sm" />
            <div className="w-4 h-4 bg-gray-400 rounded-full" />
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cantara-deep rounded-lg flex items-center justify-center">
                <Waves className="w-4 h-4 text-cantara-teal-light" />
              </div>
              <span className="font-semibold text-gray-900">Cantara</span>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <Eye className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-cantara-teal to-cantara-deep rounded-2xl p-5 mb-4">
            <p className="text-white/70 text-sm mb-1">Private Balance</p>
            <motion.p
              className="text-3xl font-bold text-white mb-4"
              animate={{ opacity: [1, 0.65, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              $•••••
            </motion.p>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <Lock className="w-3 h-3" />
              <span>Visible to your party only</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: Send, label: 'Send' },
              { icon: Wallet, label: 'Request' },
              { icon: QrCode, label: 'Pay' },
            ].map((action) => (
              <div key={action.label} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <action.icon className="w-5 h-5 text-cantara-deep" />
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cantara-teal/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-cantara-teal" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Payment received</p>
                  <p className="text-gray-500 text-xs">Just now</p>
                </div>
              </div>
              <span className="font-semibold text-cantara-teal text-sm">+$•••</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 mx-auto w-32 h-1 bg-gray-600 rounded-full" />
    </div>
  </motion.div>
);

/** Checkout preview — mirrored vs Aruvi (copy left, card right) + amber accents. */
function CheckoutPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 max-w-md w-full"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="w-9 h-9 bg-cantara-deep rounded-lg flex items-center justify-center">
          <Waves className="w-4 h-4 text-cantara-teal-light" />
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <UserRound className="w-5 h-5" />
          <Wallet className="w-5 h-5" />
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cantara-mint to-gray-100 flex items-center justify-center shrink-0 border border-cantara-mint">
          <Shield className="w-10 h-10 text-cantara-teal" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg mb-1">Private Payment</h3>
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-4 h-4 fill-cantara-accent text-cantara-accent" />
            ))}
            <Star className="w-4 h-4 text-gray-200" />
          </div>
          <p className="text-2xl font-bold text-cantara-deep tracking-wide mb-3">$ ••• . ••</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Status:</span>
            <span className="w-5 h-5 rounded-full bg-cantara-teal flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="w-5 h-5 rounded-full bg-gray-200" />
            <span className="w-5 h-5 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
      <Link to="/checkout">
        <Button className="w-full" size="lg">
          <Waves className="w-4 h-4 mr-2" />
          Pay with Cantara
        </Button>
      </Link>
    </motion.div>
  );
}

const featureCards = [
  { title: 'Send with party privacy', icon: EyeOff, blurb: 'P2P amounts stay between sender and recipient.' },
  { title: 'Request private payments', icon: Shield, blurb: 'Share a request — only parties on the contract see it.' },
  { title: 'Merchant checkout links', icon: Store, blurb: 'Create pay links that settle privately on Canton.' },
  { title: 'Invoice financing flows', icon: FileText, blurb: 'Supplier, buyer, and financier with selective visibility.' },
];

/** Soft wave motif matching the Cantara logo mark. */
function LogoWave({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" fill="none" className={className} aria-hidden>
      <path
        d="M2 16C8 8 14 8 20 14C26 20 32 20 38 14C42 10 45 10 46 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M2 20C8 12 14 12 20 18C26 24 32 24 38 18C42 14 45 14 46 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

const steps = [
  {
    n: '01',
    icon: Users,
    title: 'Connect a party',
    desc: 'Pick Alice, Bob, Carol, or Financier — each maps to Canton actAs on DevNet.',
  },
  {
    n: '02',
    icon: Send,
    title: 'Move money privately',
    desc: 'Send, request, subscribe, or multi-send. Amounts stay between contract parties.',
  },
  {
    n: '03',
    icon: FileText,
    title: 'Finance an invoice',
    desc: 'Supplier → buyer → financier with selective visibility through settlement.',
  },
];

export function Landing() {
  const { isConnected, parties, connect, loading, apiError } = useParty();
  const canConnect = !loading && parties.length > 0;

  const start = () => {
    const first = parties[0];
    if (first) connect(first);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {apiError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-3 text-sm text-center">
          Backend not reachable — start with{' '}
          <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">cd backend && npm run dev</code>
          {' '}then refresh.
        </div>
      )}

      {/* Hero */}
      <section className="relative pt-16 pb-8 md:pt-24 md:pb-16 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.08),transparent_55%)]" />
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-cantara-teal font-semibold text-lg mb-5">
                Built on Canton Network
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-cantara-deep leading-[1.08] mb-6"
              >
                Pay private,<br />settle with confidence.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="text-xl text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Confidential P2P payments and multi-party invoice financing — amounts visible only to the parties on the contract.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                {isConnected ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="px-10 shadow-lg">
                      Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" className="px-10 shadow-lg" disabled={!canConnect} onClick={start}>
                    {loading ? 'Loading…' : canConnect ? 'Get Started' : 'Start backend first'}
                    {canConnect && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                )}
                <Link to="/invoices">
                  <Button variant="outline" size="lg">Explore Invoices</Button>
                </Link>
              </motion.div>
            </div>
            <PhoneMockup />
          </div>
        </div>
      </section>

      <WaveDivider from="#FFFFFF" to="#042F2E" />

      {/* Feature showcase — aligned grid, not clickable */}
      <section className="relative bg-cantara-deep py-20 -mt-1 overflow-hidden">
        {/* Background wave marks (logo motif) */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] text-cantara-teal-light">
          <LogoWave className="absolute top-8 left-[-2%] w-72 h-36 rotate-[-8deg]" />
          <LogoWave className="absolute bottom-10 right-[-4%] w-96 h-48 rotate-[6deg]" />
        </div>

        <div className="container mx-auto px-6 sm:px-8 max-w-7xl relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white max-w-md leading-tight">
              Two tracks.<br />One private stack.
            </h2>
            <p className="text-white/50 text-sm max-w-xs sm:text-right">
              Payments and trade finance on the same Canton privacy model.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featureCards.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-7 flex flex-col min-h-[220px] select-none"
              >
                <h3 className="text-xl font-bold text-cantara-deep leading-snug mb-3 min-h-[3.5rem]">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 flex-1 mb-6">{f.blurb}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="w-11 h-11 bg-cantara-mint rounded-full flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-cantara-deep" />
                  </div>
                  {/* Logo-style wave mark instead of clickable arrow */}
                  <div className="relative text-cantara-teal">
                    <LogoWave className="w-14 h-7" />
                    <span className="absolute right-0 top-1 w-2 h-2 rounded-full bg-cantara-accent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider flip from="#FFFFFF" to="#042F2E" />

      {/* Checkout — content stays on white; wave + DevNet badge sit below */}
      <section className="relative bg-white pt-16 sm:pt-24 overflow-hidden">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-14 items-center pb-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <p className="text-cantara-accent font-semibold text-sm uppercase tracking-wider mb-3">Merchant checkout</p>
              <h2 className="text-4xl md:text-5xl font-bold text-cantara-deep mb-5 leading-tight">
                Checkout that stays between parties
              </h2>
              <p className="text-lg text-gray-500 mb-8 max-w-md">
                Create a payment link, share it, and settle on Canton. Customers pay at{' '}
                <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">/pay/:id</code>
                {' '}— amounts never hit a public chain.
              </p>
              <Link to="/checkout" className="inline-block">
                <Button size="lg">Open Merchant Checkout</Button>
              </Link>
            </motion.div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative z-10">
              <CheckoutPreview />
            </div>
          </div>
        </div>

        <div className="relative">
          <WaveDivider from="#FFFFFF" to="#042F2E" />
          <div className="bg-cantara-deep pb-10 pt-2 relative flex justify-end px-6 sm:px-12">
            <DevNetBadge className="-mt-16 sm:-mt-20 relative z-10" />
          </div>
        </div>
      </section>

      {/* Bridge back to white with inverted wave */}
      <WaveDivider flip from="#FFFFFF" to="#042F2E" />

      {/* How to begin — timeline with icons, not giant purple numbers */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-cantara-deep mb-3">Live on DevNet in minutes</h2>
            <p className="text-gray-500">No wallet wrap step — connect a party and exercise Daml contracts.</p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-10">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-cantara-teal/20 via-cantara-accent/40 to-cantara-teal/20" />
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto w-20 h-20 rounded-2xl bg-cantara-mint border border-cantara-teal/20 flex items-center justify-center mb-5 shadow-sm">
                  <s.icon className="w-8 h-8 text-cantara-teal" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cantara-accent text-cantara-deep text-xs font-bold flex items-center justify-center">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-cantara-deep mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees — amber accent strip, 3 tiles not 2 purple $0s */}
      <section className="pb-24 bg-white">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-cantara-deep text-center mb-10">
            Built for the hackathon — not a fee schedule
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { label: 'Platform fees', value: '$0' },
              { label: 'Account opening', value: '$0' },
              { label: 'Subscription product fees', value: '$0' },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl bg-gradient-to-br from-gray-50 to-cantara-mint/40 border border-gray-100 p-10 text-center"
              >
                <p className="text-5xl font-bold text-cantara-accent mb-2">{f.value}</p>
                <p className="text-gray-600 font-medium">{f.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-cantara-deep text-center mb-4">
            How privacy works
          </h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-14">
            Canton party-based visibility in Daml — amounts stay between contract parties.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Only parties see data', desc: 'Sender, recipient, and authorized observers — nobody else on the network.' },
              { icon: Lock, title: 'Contracts enforce access', desc: 'Signatories and observers are written into every payment and invoice template.' },
              { icon: Shield, title: 'Institutional grade', desc: 'Same privacy model used for multi-party capital markets workflows on Canton.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-cantara-mint rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-cantara-teal" />
                </div>
                <h3 className="text-xl font-bold text-cantara-deep mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA — white band before footer */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-cantara-deep mb-4">
            Built for teams that need selective disclosure
          </h2>
          <p className="text-gray-500 mb-10">
            From private P2P to supplier–buyer–financier invoice flows — Cantara keeps each party in the room that matters.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {isConnected ? (
              <Link to="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            ) : (
              <Button size="lg" disabled={!canConnect} onClick={start}>
                Go to Dashboard
              </Button>
            )}
            <Link to="/checkout">
              <Button variant="outline" size="lg">Business Solutions</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
