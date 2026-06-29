import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type Party } from '@/lib/api';

type PartyContextValue = {
  party: Party | null;
  parties: Party[];
  connect: (party: Party) => void;
  disconnect: () => void;
  isConnected: boolean;
  loading: boolean;
};

const PartyContext = createContext<PartyContextValue | null>(null);

export function PartyProvider({ children }: { children: ReactNode }) {
  const [party, setParty] = useState<Party | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getParties()
      .then(setParties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PartyContext.Provider
      value={{
        party,
        parties,
        connect: setParty,
        disconnect: () => setParty(null),
        isConnected: party !== null,
        loading,
      }}
    >
      {children}
    </PartyContext.Provider>
  );
}

export function useParty() {
  const ctx = useContext(PartyContext);
  if (!ctx) throw new Error('useParty must be used within PartyProvider');
  return ctx;
}
