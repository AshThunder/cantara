import { Ledger as DemoLedger } from './ledger.js';
import { CantonLedger } from './canton/ledger.js';
import { isCantonMode, loadCantonConfig } from './canton/config.js';

export type LedgerMode = 'canton' | 'demo';

export function createLedger(): { mode: LedgerMode; demo: DemoLedger | null; canton: CantonLedger | null } {
  if (isCantonMode()) {
    const config = loadCantonConfig();
    if (!config) throw new Error('Canton mode enabled but config incomplete');
    console.log('Ledger mode: canton (5N Sandbox DevNet)');
    return { mode: 'canton', demo: null, canton: new CantonLedger(config) };
  }
  console.log('Ledger mode: demo (in-memory)');
  return { mode: 'demo', demo: new DemoLedger(), canton: null };
}
