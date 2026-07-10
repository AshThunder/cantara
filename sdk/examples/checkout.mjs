/**
 * Example: create a merchant checkout via the Cantara SDK.
 * Requires API on http://localhost:3001 (Canton or demo mode).
 */
import { Cantara } from '../dist/index.js';

const cantara = new Cantara({
  apiUrl: process.env.CANTARA_API_URL ?? 'http://localhost:3001/api',
  merchant: process.env.CANTARA_MERCHANT ?? 'Carol',
  payBaseUrl: process.env.CANTARA_PAY_BASE ?? 'http://localhost:5173',
});

const health = await cantara.health();
console.log('API:', health);

const checkout = await cantara.createCheckout({
  amount: 19.99,
  description: 'SDK demo order',
});

console.log('Checkout created:');
console.log('  contractId:', checkout.contractId);
console.log('  payUrl:    ', checkout.payUrl);

const wallet = await cantara.getWallet();
console.log(`Merchant wallet: $${wallet.balance.toFixed(2)} ${wallet.currency}`);
