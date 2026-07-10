import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type Party } from '@/lib/api';

type PartyContextValue = {
  party: Party | null;
  parties: Party[];
  connect: (party: Party) => void;
  disconnect: () => void;
  isConnected: boolean;
  loading: boolean;
  apiError: boolean;
};

const PartyContext = createContext<PartyContextValue | null>(null);

export function PartyProvider({ children }: { children: ReactNode }) {
  const [party, setParty] = useState<Party | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    api.getParties()
      .then((list) => {
        setParties(list);
        setApiError(false);
      })
      .catch((err) => {
        console.error(err);
        setApiError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const connect = (next: Party) => {
    if (!next?.id) return;
    setParty(next);
  };

  return (
    <PartyContext.Provider
      value={{
        party,
        parties,
        connect,
        disconnect: () => setParty(null),
        isConnected: party != null,
        loading,
        apiError,
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
