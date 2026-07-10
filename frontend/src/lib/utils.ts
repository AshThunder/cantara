import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const LIGHTHOUSE = 'https://lighthouse.devnet.cantonloop.com';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatParty(party: string, chars = 4): string {
  if (party.length <= chars * 2 + 3) return party;
  return `${party.slice(0, chars)}…${party.slice(-chars)}`;
}

export function formatId(id: string, chars = 8): string {
  if (id.length <= chars * 2 + 1) return id;
  return `${id.slice(0, chars)}…${id.slice(-chars)}`;
}

export function lighthouseContractUrl(contractId: string): string {
  return `${LIGHTHOUSE}/contracts/${contractId}`;
}

export function lighthouseTxUrl(updateId: string): string {
  return `${LIGHTHOUSE}/transactions/${updateId}`;
}

