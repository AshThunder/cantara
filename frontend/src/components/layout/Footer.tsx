import { Link } from 'react-router-dom';
import { Waves, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-cantara-deep text-white/80 mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.12),transparent_50%)]" />
      <div className="container mx-auto px-6 sm:px-8 max-w-7xl py-14 relative">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                <Waves className="w-5 h-5 text-cantara-teal-light" />
              </div>
              <span className="text-xl font-bold text-cantara-teal-light tracking-tight">CANTARA</span>
            </div>
            <p className="text-sm text-white/55 max-w-sm leading-relaxed">
              Private payments and trade finance on Canton. Party-based privacy with Daml — not public-chain encryption theater.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-cantara-teal-light/90 mb-4 text-sm">Personal</p>
              <div className="space-y-2.5 text-sm">
                <Link to="/send" className="block text-white/55 hover:text-white">Send Money</Link>
                <Link to="/request" className="block text-white/55 hover:text-white">Request Money</Link>
                <Link to="/wallet" className="block text-white/55 hover:text-white">Wallet</Link>
                <Link to="/activity" className="block text-white/55 hover:text-white">Activity</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-cantara-teal-light/90 mb-4 text-sm">Business</p>
              <div className="space-y-2.5 text-sm">
                <Link to="/dashboard" className="block text-white/55 hover:text-white">Dashboard</Link>
                <Link to="/checkout" className="block text-white/55 hover:text-white">Checkout</Link>
                <Link to="/invoices" className="block text-white/55 hover:text-white">Invoices</Link>
                <Link to="/subscriptions" className="block text-white/55 hover:text-white">Subscriptions</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-cantara-teal-light/90 mb-4 text-sm">Resources</p>
              <div className="space-y-2.5 text-sm">
                <a href="https://lighthouse.devnet.cantonloop.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-white/55 hover:text-white">
                  Lighthouse <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://github.com/AshThunder/cantara" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-white/55 hover:text-white">
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://docs.canton.network" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-white/55 hover:text-white">
                  Canton Docs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex lg:justify-end">
            <a
              href="https://lighthouse.devnet.cantonloop.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow h-fit"
            >
              <div className="w-20 h-20 grid grid-cols-5 gap-0.5 p-1 bg-gray-50 rounded-md">
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
              <span className="text-[11px] font-medium text-gray-500">DevNet</span>
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/35 flex flex-col sm:flex-row justify-between gap-2">
          <span>Built for the Build on Canton Hackathon</span>
          <span>5N Sandbox DevNet · Package cantara 0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
