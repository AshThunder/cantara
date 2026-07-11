import PptxGenJS from 'pptxgenjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, 'presentation-assets');
const OUT = path.join(__dirname, 'Cantara-Final.pptx');

const LIVE_APP = 'https://cantara-hackathon.vercel.app';
const LIVE_API = 'https://cantara-api-production.up.railway.app';
const REPO = 'https://github.com/AshThunder/cantara';
const PACKAGE_ID = 'b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'AshThunder';
pptx.title = 'Cantara — Build on Canton Hackathon (Final)';
pptx.subject = 'Private payments & trade finance on Canton DevNet';

const DEEP = '042F2E';
const TEAL = '0D9488';
const TEAL_LIGHT = '14B8A6';
const MINT = 'F0FDFA';
const WHITE = 'FFFFFF';
const GRAY = '5F8A85';

function hasAsset(name) {
  return fs.existsSync(path.join(ASSETS, name));
}

function addTitleSlide(title, subtitle, footer) {
  const slide = pptx.addSlide();
  slide.background = { color: DEEP };
  slide.addText(title, {
    x: 0.5, y: 1.5, w: 9, h: 1.1, fontSize: 44, bold: true, color: WHITE, fontFace: 'Arial',
  });
  slide.addText(subtitle, {
    x: 0.5, y: 2.7, w: 9, h: 0.7, fontSize: 22, color: TEAL_LIGHT, fontFace: 'Arial', italic: true,
  });
  if (footer) {
    slide.addText(footer, {
      x: 0.5, y: 3.7, w: 9, h: 1.6, fontSize: 14, color: GRAY, fontFace: 'Arial',
    });
  }
}

function addContentSlide(title, bullets, note) {
  const slide = pptx.addSlide();
  slide.background = { color: MINT };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: TEAL } });
  slide.addText(title, {
    x: 0.5, y: 0.4, w: 9, h: 0.75, fontSize: 26, bold: true, color: DEEP, fontFace: 'Arial',
  });
  slide.addText(bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), {
    x: 0.6, y: 1.3, w: 8.8, h: 3.5, fontSize: 16, color: DEEP, fontFace: 'Arial', valign: 'top',
  });
  if (note) {
    slide.addText(note, {
      x: 0.5, y: 4.85, w: 9, h: 0.45, fontSize: 13, color: TEAL, fontFace: 'Arial', italic: true,
    });
  }
}

function addTableSlide(title, headers, rows, note) {
  const slide = pptx.addSlide();
  slide.background = { color: MINT };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: TEAL } });
  slide.addText(title, {
    x: 0.5, y: 0.4, w: 9, h: 0.75, fontSize: 26, bold: true, color: DEEP, fontFace: 'Arial',
  });
  const tableRows = [
    headers.map((h) => ({ text: h, options: { bold: true, fill: { color: TEAL }, color: WHITE } })),
    ...rows.map((r) => r.map((c) => ({ text: c }))),
  ];
  slide.addTable(tableRows, {
    x: 0.5,
    y: 1.3,
    w: 9,
    colW: headers.map(() => 9 / headers.length),
    fontSize: 14,
    color: DEEP,
    border: { pt: 0.5, color: TEAL_LIGHT },
  });
  if (note) {
    slide.addText(note, {
      x: 0.5, y: 4.85, w: 9, h: 0.45, fontSize: 13, color: GRAY, fontFace: 'Arial', italic: true,
    });
  }
}

function addImageSlide(title, imageFile, caption, bullets = []) {
  if (!hasAsset(imageFile)) {
    addContentSlide(title, bullets.length ? bullets : [caption || `Asset missing: ${imageFile}`], caption);
    return;
  }
  const slide = pptx.addSlide();
  slide.background = { color: MINT };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: TEAL } });
  slide.addText(title, {
    x: 0.5, y: 0.35, w: 9, h: 0.6, fontSize: 22, bold: true, color: DEEP, fontFace: 'Arial',
  });
  slide.addImage({
    path: path.join(ASSETS, imageFile),
    x: bullets.length ? 0.45 : 0.55,
    y: 1.05,
    w: bullets.length ? 5.6 : 8.9,
    h: bullets.length ? 3.55 : 3.65,
    sizing: { type: 'contain', w: bullets.length ? 5.6 : 8.9, h: bullets.length ? 3.55 : 3.65 },
  });
  if (bullets.length) {
    slide.addText(bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), {
      x: 6.25, y: 1.15, w: 3.2, h: 3.4, fontSize: 13, color: DEEP, fontFace: 'Arial', valign: 'top',
    });
  }
  if (caption) {
    slide.addText(caption, {
      x: 0.5, y: 4.75, w: 9, h: 0.5, fontSize: 12, color: TEAL, fontFace: 'Arial', italic: true,
    });
  }
}

// 1 — Title
addTitleSlide(
  'Cantara',
  'Private payments & trade finance on Canton',
  `Build on Canton Hackathon · Encode Club
Tracks: Payments (T3) + Private DeFi (T1)

Live: ${LIVE_APP}
Repo: github.com/AshThunder/cantara`
);

// 2 — Problem
addContentSlide(
  'The gap: public chains vs. institutional reality',
  [
    'Banks and SMEs cannot put payment flows and invoice terms on a public ledger',
    'Trade finance needs 3+ parties — each with different visibility requirements',
    'Today: fragmented tools, 30–90 day delays, no shared private source of truth',
    'Result: costly intermediaries, leaked competitive terms, trapped working capital',
  ],
  'Cantara targets the overlap: everyday payments + receivables financing — both need privacy.'
);

// 3 — Why Canton
addContentSlide(
  'Why Canton — privacy is a first-class primitive',
  [
    'Daml defines who sees what: signatories, observers, controllers',
    'Multi-party workflows are native — not bolted on with ZK or off-chain DBs',
    'Institutional validators (5N Sandbox DevNet via Seaport)',
    'We deployed cantara-0.1.0.dar and exercise real choices on-ledger — live today',
  ],
  'Privacy by party membership beats encryption on a transparent chain for B2B finance.'
);

// 4 — Solution
addTableSlide(
  'One platform, two hackathon tracks',
  ['Payments (T3)', 'Invoices (T1)'],
  [
    ['P2P send, refund, requests', 'Supplier proposes invoice'],
    ['Subscriptions & multi-send', 'Buyer confirms & attests'],
    ['Merchant checkout + SDK', 'Financier offers confidential terms'],
    ['Wallet & activity', 'Settlement on maturity'],
  ],
  'Same counterparty graph, same privacy model — one product for judges.'
);

// 5 — Architecture (live)
addContentSlide(
  'Live architecture — DevNet end to end',
  [
    `React UI on Vercel — ${LIVE_APP}`,
    `Express API on Railway — LEDGER_MODE=canton → JSON Ledger API v2`,
    'Daml: 12 templates in cantara-0.1.0.dar on 5N Sandbox',
    `Package ID ${PACKAGE_ID.slice(0, 16)}…${PACKAGE_ID.slice(-8)}`,
  ],
  'Health: /api/health → mode: "canton"'
);

// 6 — Contracts
addContentSlide(
  'Smart contracts delivered',
  [
    'Payments: Payment, RefundedPayment, PaymentRequest, Subscription, PaymentBatch',
    'Invoices: proposal → accept → attest → offer → finance → settle',
    'Proven on-ledger: Payment create + Refund + full invoice lifecycle via live API',
    'Merchant SDK (cantara-sdk) for checkout links in external apps',
  ]
);

// 7 — Landing
addImageSlide(
  'Live product — landing',
  'landing.png',
  `${LIVE_APP} — public, connected to Canton DevNet API`,
  ['Get Started → party connect', 'Payments + invoices in one UI', 'Built for Encode demo']
);

// 8 — Dashboard
addImageSlide(
  'Working product — dashboard',
  'dashboard.png',
  'Private balance (party-visible), quick actions, live stats from DevNet-backed API.',
  ['Reveal/hide balance', 'Send · Multi-send · Request', 'Wallet · Activity · Invoices']
);

// 9 — Activity / payments
addImageSlide(
  'Payments in action',
  'activity.png',
  'Alice → Bob private payments with Lighthouse tx/contract links.',
  ['Track 3 deliverable', 'Amounts scoped to parties', 'DevNet explorer links']
);

// 10 — On-ledger payment
addImageSlide(
  'On-ledger proof — Payment created',
  'execution-log.png',
  'Seaport / 5N Sandbox: PaymentActive CreatedEvent — not a mock ledger.',
  ['Real CreatedEvent', 'USD amount on-ledger', 'Package cantara 0.1.0']
);

// 11 — On-ledger refund
addImageSlide(
  'On-ledger proof — Refund exercised',
  'refunded-payment.png',
  'Payment_Refund → RefundedPayment — full payment lifecycle on DevNet.',
  ['RefundedPayment active', 'Choice exercised on-ledger', 'Validator: 5N Sandbox']
);

// 12 — Privacy
addContentSlide(
  'Privacy in action — selective disclosure by design',
  [
    'Payment: sender signs, recipient observes — amount hidden from everyone else',
    'Financing offer: financier + supplier only — buyer sees attestation, not terms',
    'Invoice stages reveal more only as the workflow progresses',
    'Matches how real trade finance desks negotiate — on a shared private ledger',
  ]
);

// 13 — Links / ask
addTableSlide(
  'Try it — submission links',
  ['Resource', 'URL'],
  [
    ['Live app', LIVE_APP],
    ['API health', `${LIVE_API}/api/health`],
    ['GitHub', REPO],
    ['DevNet', 'cantara v0.1.0 on 5N Sandbox (Seaport)'],
  ],
  'Tracks T1 + T3 · Questions welcome'
);
{
  const slide = pptx.slides[pptx.slides.length - 1];
  slide.addText('AshThunder / Chris Gold · Build on Canton Hackathon', {
    x: 0.5, y: 4.85, w: 9, h: 0.4, fontSize: 13, bold: true, color: DEEP, fontFace: 'Arial',
  });
}

await pptx.writeFile({ fileName: OUT });
console.log('Created:', OUT);
console.log('Assets used from:', ASSETS);
for (const f of ['landing.png', 'dashboard.png', 'activity.png', 'execution-log.png', 'refunded-payment.png']) {
  console.log(`  ${f}: ${hasAsset(f) ? 'ok' : 'MISSING'}`);
}
