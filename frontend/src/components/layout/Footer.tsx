import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-cantara-deep text-white/80 mt-auto">
      <div className="container mx-auto px-6 max-w-7xl py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Waves className="w-6 h-6 text-cantara-teal-light" />
              <span className="text-lg font-bold text-white">Cantara</span>
            </div>
            <p className="text-sm text-white/60 max-w-xs">
              Private payments and trade finance on Canton Network.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <p className="font-semibold text-white mb-3">Payments</p>
              <div className="space-y-2">
                <Link to="/send" className="block text-white/60 hover:text-cantara-teal-light">Send</Link>
                <Link to="/request" className="block text-white/60 hover:text-cantara-teal-light">Request</Link>
                <Link to="/subscriptions" className="block text-white/60 hover:text-cantara-teal-light">Subscriptions</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white mb-3">Trade Finance</p>
              <div className="space-y-2">
                <Link to="/invoices" className="block text-white/60 hover:text-cantara-teal-light">Invoices</Link>
                <Link to="/invoices/new" className="block text-white/60 hover:text-cantara-teal-light">New Invoice</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/40">
          Built for the Build on Canton Hackathon · Party-based privacy on Daml
        </div>
      </div>
    </footer>
  );
}
