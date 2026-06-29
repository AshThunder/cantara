import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Waves, Send, Wallet, FileText, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { cn, formatParty } from '@/lib/utils';

const nav = {
  personal: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Send', href: '/send', icon: Send },
    { name: 'Request', href: '/request', icon: Wallet },
    { name: 'Activity', href: '/activity', icon: Wallet },
  ],
  finance: [
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Business', href: '/business', icon: LayoutDashboard },
  ],
};

export function Header() {
  const { pathname } = useLocation();
  const { party, parties, connect, disconnect, isConnected } = useParty();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [partyMenuOpen, setPartyMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cantara-mint shadow-sm">
      <nav className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-cantara-deep rounded-xl flex items-center justify-center">
              <Waves className="w-5 h-5 text-cantara-teal-light" />
            </div>
            <span className="text-xl font-bold text-cantara-deep tracking-tight">Cantara</span>
          </Link>

          {isConnected && (
            <div className="hidden md:flex items-center gap-1">
              {[...nav.personal, ...nav.finance].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'text-cantara-teal bg-cantara-mint'
                      : 'text-gray-600 hover:text-cantara-teal hover:bg-cantara-mint/50'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {!isConnected ? (
              <div className="relative">
                <Button size="sm" onClick={() => setPartyMenuOpen(!partyMenuOpen)}>
                  Connect Party
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                {partyMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-cantara-mint py-2 z-50">
                    {parties.map((p) => (
                      <button
                        key={p.id}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-cantara-mint transition-colors"
                        onClick={() => { connect(p); setPartyMenuOpen(false); }}
                      >
                        <span className="font-medium text-cantara-deep">{p.displayName}</span>
                        <span className="block text-xs text-gray-500 capitalize">{p.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm font-mono text-gray-500 bg-cantara-mint px-3 py-1.5 rounded-lg">
                  {party?.displayName} · {formatParty(party!.id)}
                </span>
                <Button variant="outline" size="sm" onClick={disconnect}>Disconnect</Button>
              </div>
            )}

            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-cantara-mint"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && isConnected && (
          <div className="md:hidden py-4 border-t border-cantara-mint space-y-1">
            {[...nav.personal, ...nav.finance].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-cantara-mint"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
