import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, Waves, Send, Wallet, FileText,
  Activity, Receipt, Store, LayoutDashboard, Users, Repeat, ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useParty } from '@/providers/PartyProvider';
import { cn, formatParty } from '@/lib/utils';

type NavLink = {
  name: string;
  href: string;
  description: string;
  icon: React.ElementType;
};

type MenuDef = {
  title: string;
  subtitle: string;
  groups: { label: string; links: NavLink[] }[];
};

const menus: Record<'personal' | 'business', MenuDef> = {
  personal: {
    title: 'Personal',
    subtitle: 'Private payments for your party',
    groups: [
      {
        label: 'Move money',
        links: [
          { name: 'Send', href: '/send', description: 'P2P transfer', icon: Send },
          { name: 'Multi-Send', href: '/multi-send', description: 'Up to 10 recipients', icon: Users },
          { name: 'Request', href: '/request', description: 'Ask for payment', icon: Wallet },
          { name: 'Activity', href: '/activity', description: 'History', icon: Activity },
        ],
      },
      {
        label: 'Account',
        links: [
          { name: 'Dashboard', href: '/dashboard', description: 'Overview', icon: LayoutDashboard },
          { name: 'Wallet', href: '/wallet', description: 'Balance & ledger', icon: Wallet },
          { name: 'Subscriptions', href: '/subscriptions', description: 'Recurring', icon: Repeat },
          { name: 'Refunds', href: '/refunds', description: 'Issue refunds', icon: Receipt },
        ],
      },
    ],
  },
  business: {
    title: 'Business',
    subtitle: 'Checkout and trade finance',
    groups: [
      {
        label: 'Accept payments',
        links: [
          { name: 'Checkout', href: '/checkout', description: 'Payment links', icon: Store },
          { name: 'Subscriptions', href: '/subscriptions', description: 'Recurring billing', icon: Repeat },
          { name: 'Multi-Send', href: '/multi-send', description: 'Batch payouts', icon: Users },
        ],
      },
      {
        label: 'Trade finance',
        links: [
          { name: 'Invoices', href: '/invoices', description: 'Financing flow', icon: FileText },
          { name: 'New Invoice', href: '/invoices/new', description: 'Submit proposal', icon: FileText },
          { name: 'Dashboard', href: '/dashboard', description: 'Overview', icon: LayoutDashboard },
        ],
      },
    ],
  },
};

function MenuWave() {
  return (
    <svg viewBox="0 0 200 40" className="w-full h-10 text-cantara-teal-light/40" aria-hidden>
      <path
        d="M0 28C40 8 70 32 100 22C130 12 160 4 200 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M0 34C40 14 70 38 100 28C130 18 160 10 200 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="188" cy="16" r="3" fill="#F59E0B" />
    </svg>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const { party, parties, connect, disconnect, isConnected } = useParty();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [partyMenuOpen, setPartyMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'personal' | 'business' | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (key: 'personal' | 'business') => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(key);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const isActive = (href: string) => pathname === href;

  const renderPanel = (key: 'personal' | 'business') => {
    const menu = menus[key];
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.18 }}
        className="fixed left-0 right-0 top-16 md:top-[4.5rem] z-50"
      >
        {/* Full-bleed panel under nav — not a floating Aruvi-style card */}
        <div
          className="bg-white border-b border-gray-100 shadow-[0_20px_50px_-20px_rgba(4,47,46,0.35)]"
          onMouseEnter={() => openMenu(key)}
          onMouseLeave={scheduleClose}
        >
          <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-[220px_1fr] gap-0">
              {/* Brand rail */}
              <div className="relative bg-cantara-deep text-white px-6 py-7 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <MenuWave />
                </div>
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cantara-teal-light mb-2">
                    Cantara
                  </p>
                  <h3 className="text-2xl font-bold mb-2">{menu.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{menu.subtitle}</p>
                </div>
              </div>

              {/* Link tiles */}
              <div className="px-6 py-7 space-y-7">
                {menu.groups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-3">
                      {group.label}
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {group.links.map((link) => (
                        <Link
                          key={link.href + link.name}
                          to={link.href}
                          onClick={() => setActiveDropdown(null)}
                          className={cn(
                            'group flex items-start gap-3 rounded-xl p-3 transition-colors border border-transparent',
                            isActive(link.href)
                              ? 'bg-cantara-mint border-cantara-teal/20'
                              : 'hover:bg-gray-50 hover:border-gray-100'
                          )}
                        >
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                              isActive(link.href)
                                ? 'bg-cantara-teal text-white'
                                : 'bg-cantara-deep/5 text-cantara-deep group-hover:bg-cantara-deep group-hover:text-white'
                            )}
                          >
                            <link.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <p className="font-semibold text-cantara-deep text-sm flex items-center gap-1">
                              {link.name}
                              <ArrowUpRight className="w-3 h-3 text-cantara-teal opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-gray-400 truncate">{link.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Wave footer accent */}
          <div className="h-1.5 bg-gradient-to-r from-cantara-deep via-cantara-teal to-cantara-accent" />
        </div>
      </motion.div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="relative container mx-auto px-6 sm:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cantara-deep rounded-lg flex items-center justify-center">
              <Waves className="w-5 h-5 text-cantara-teal-light" />
            </div>
            <span className="text-2xl font-bold text-cantara-deep tracking-tight">Cantara</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {isConnected &&
              (['personal', 'business'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onMouseEnter={() => openMenu(key)}
                  onMouseLeave={scheduleClose}
                  className={cn(
                    'flex items-center gap-1.5 px-5 py-2.5 text-base font-medium rounded-full transition-colors',
                    activeDropdown === key
                      ? 'text-white bg-cantara-deep'
                      : 'text-gray-700 hover:text-cantara-deep hover:bg-cantara-mint'
                  )}
                >
                  {key === 'personal' ? 'Personal' : 'Business'}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      activeDropdown === key && 'rotate-180'
                    )}
                  />
                </button>
              ))}
          </div>

          <AnimatePresence>
            {isConnected && activeDropdown && renderPanel(activeDropdown)}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            {!isConnected ? (
              <div className="relative hidden sm:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPartyMenuOpen(!partyMenuOpen)}>
                  Log In
                </Button>
                <Button size="sm" onClick={() => setPartyMenuOpen(!partyMenuOpen)}>
                  Sign Up
                </Button>
                {partyMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {parties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-cantara-mint transition-colors"
                        onClick={() => {
                          connect(p);
                          setPartyMenuOpen(false);
                        }}
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
                {party && (
                  <span className="hidden sm:block text-sm font-mono text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    {party.displayName} · {formatParty(party.id)}
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            )}

            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile only below — desktop panel is under Personal/Business */}

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-4 space-y-6">
                {!isConnected ? (
                  <div className="space-y-2">
                    {parties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-3 rounded-xl hover:bg-cantara-mint"
                        onClick={() => {
                          connect(p);
                          setMobileOpen(false);
                        }}
                      >
                        <span className="font-medium text-cantara-deep">{p.displayName}</span>
                        <span className="block text-xs text-gray-500 capitalize">{p.role}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  (['personal', 'business'] as const).map((key) => (
                    <div key={key}>
                      <div className="px-2 mb-3">
                        <p className="text-lg font-bold text-cantara-deep">{menus[key].title}</p>
                        <p className="text-xs text-gray-400">{menus[key].subtitle}</p>
                      </div>
                      {menus[key].groups.map((group) => (
                        <div key={group.label} className="mb-4">
                          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            {group.label}
                          </p>
                          <div className="grid grid-cols-2 gap-1">
                            {group.links.map((link) => (
                              <Link
                                key={link.name}
                                to={link.href}
                                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-cantara-mint"
                                onClick={() => setMobileOpen(false)}
                              >
                                <link.icon className="w-4 h-4 text-cantara-teal" />
                                {link.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
