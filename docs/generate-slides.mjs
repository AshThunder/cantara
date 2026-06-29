import PptxGenJS from 'pptxgenjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, 'presentation-assets');
const OUT = path.join(__dirname, 'Cantara-Checkpoint-2.pptx');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'AshThunder';
pptx.title = 'Cantara — Build on Canton Hackathon';

const DEEP = '042F2E';
const TEAL = '0D9488';
const TEAL_LIGHT = '14B8A6';
const MINT = 'F0FDFA';
const WHITE = 'FFFFFF';
const GRAY = '5F8A85';

function addTitleSlide(title, subtitle, footer) {
  const slide = pptx.addSlide();
  slide.background = { color: DEEP };
  slide.addText(title, { x: 0.5, y: 1.6, w: 9, h: 1.2, fontSize: 44, bold: true, color: WHITE, fontFace: 'Arial' });
  slide.addText(subtitle, { x: 0.5, y: 2.9, w: 9, h: 0.9, fontSize: 22, color: TEAL_LIGHT, fontFace: 'Arial', italic: true });
  if (footer) {
    slide.addText(footer, { x: 0.5, y: 4.2, w: 9, h: 1.4, fontSize: 14, color: GRAY, fontFace: 'Arial' });
  }
}

function addContentSlide(title, bullets, note) {
  const slide = pptx.addSlide();
  slide.background = { color: MINT };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: TEAL } });
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.8, fontSize: 28, bold: true, color: DEEP, fontFace: 'Arial' });
  slide.addText(bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), {
    x: 0.6, y: 1.35, w: 8.8, h: 3.6, fontSize: 16, color: DEEP, fontFace: 'Arial', valign: 'top',
  });
  if (note) {
    slide.addText(note, { x: 0.5, y: 4.75, w: 9, h: 0.55, fontSize: 13, color: TEAL, fontFace: 'Arial', italic: true });
  }
}

function addTableSlide(title, headers, rows, note) {
  const slide = pptx.addSlide();
  slide.background = { color: MINT };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: TEAL } });
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.8, fontSize: 28, bold: true, color: DEEP, fontFace: 'Arial' });
  const tableRows = [
    headers.map((h) => ({ text: h, options: { bold: true, fill: { color: TEAL }, color: WHITE } })),
    ...rows.map((r) => r.map((c) => ({ text: c }))),
  ];
  slide.addTable(tableRows, {
    x: 0.5, y: 1.35, w: 9, colW: headers.map(() => 9 / headers.length),
    fontSize: 14, color: DEEP, border: { pt: 0.5, color: TEAL_LIGHT },
  });
  if (note) {
    slide.addText(note, { x: 0.5, y: 4.75, w: 9, h: 0.55, fontSize: 13, color: GRAY, fontFace: 'Arial', italic: true });
  }
}

function addImageSlide(title, imageFile, caption, bullets = []) {
  const slide = pptx.addSlide();
  slide.background = { color: MINT };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: TEAL } });
  slide.addText(title, { x: 0.5, y: 0.35, w: 9, h: 0.65, fontSize: 24, bold: true, color: DEEP, fontFace: 'Arial' });
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
  'Build on Canton Hackathon · Encode Club\nTracks: Payments (T3) + Private DeFi (T1)\n\nAshThunder / Chris Gold\ngithub.com/AshThunder/cantara'
);

// 2 — Problem (convincing hook)
addContentSlide(
  'The gap: public chains vs. institutional reality',
  [
    'Banks and SMEs cannot put payment flows and invoice terms on a public ledger',
    'Trade finance needs 3+ parties — each with different data they should (and should not) see',
    'Today: fragmented tools, 30–90 day payment delays, no shared private source of truth',
    'Result: costly intermediaries, leakage of competitive terms, slow working capital',
  ],
  'Cantara targets the overlap: everyday payments + receivables financing — both need privacy.'
);

// 3 — Why Canton (the reason to build here)
addContentSlide(
  'Why Canton — privacy is a first-class primitive',
  [
    'Daml contracts define who sees what: signatories, observers, controllers per choice',
    'Multi-party workflows are native — not bolted on with ZK proofs or off-chain databases',
    'Institutional validators (5N Sandbox, Global Synchronizer) — built for regulated finance',
    'We deployed cantara-0.1.0.dar and exercised real choices on-ledger — not a mockup',
  ],
  'Privacy by party membership beats encryption on a transparent chain for B2B finance.'
);

// 4 — Solution
addTableSlide('One platform, two hackathon tracks', ['Payments (T3)', 'Invoices (T1)'], [
  ['P2P send, refund, requests', 'Supplier proposes invoice'],
  ['Subscriptions & multi-send', 'Buyer confirms & attests'],
  ['Private balances per party', 'Financier offers confidential terms'],
  ['Activity & dashboard', 'Settlement on maturity'],
], 'Same counterparty graph, same privacy model — one product story for judges.');

// 5 — Architecture
addContentSlide(
  'End-to-end architecture',
  [
    'React UI — party connect, payments, invoice workflow (live demo)',
    'TypeScript REST API — demo ledger today; JSON Ledger API path to 5N Sandbox',
    'Daml templates — 12 contract types in cantara-0.1.0.dar',
    'Deployed on 5N Sandbox via Seaport — package ID b011f10b…cf3f58',
  ]
);

// 6 — Contracts built
addContentSlide(
  'Smart contracts delivered',
  [
    'Payments: Payment, RefundedPayment, PaymentRequest, Subscription, PaymentBatch',
    'Invoices: proposal → confirmation → attestation → offer → finance → settlement',
    'Demo script exercises full flows in Daml',
    'Checkpoint proof: Payment create + Refund exercised on shared validator ✅',
  ]
);

// 7 — Product: Dashboard
addImageSlide(
  'Working product — unified dashboard',
  'dashboard.png',
  'Local full-stack demo: Daml-backed API, React UI, party-based session.',
  [
    'Private balance view',
    'Send, request, invoice actions',
    'Stats from live API',
    'Built for hackathon demo, not slides-only',
  ]
);

// 8 — Product: Activity
addImageSlide(
  'Payments in action',
  'activity.png',
  'Alice → Bob $100 payment visible in Activity — amounts scoped to involved parties.',
  [
    'P2P payment recorded',
    'Role-aware UI',
    'Track 3 deliverable',
  ]
);

// 9 — On-ledger: Payment created
addImageSlide(
  'On-ledger proof — Payment created',
  'execution-log.png',
  'Seaport execution log: PaymentActive contract on 5N Sandbox, June 29 2026.',
  [
    'Real CreatedEvent',
    'USD 100.00 on-ledger',
    'Not simulated',
  ]
);

// 10 — On-ledger: Refund
addImageSlide(
  'On-ledger proof — Refund exercised',
  'refunded-payment.png',
  'Payment_Refund choice produced RefundedPayment — full payment lifecycle proven.',
  [
    'RefundedPayment active',
    '12 templates in DAR',
    'Validator: 5N Sandbox',
  ]
);

// 11 — Privacy model
addContentSlide(
  'Privacy in action — selective disclosure by design',
  [
    'Payment: sender signs, recipient observes — amount hidden from everyone else',
    'Financing offer: financier + supplier only — buyer sees attestation, not terms',
    'Invoice stages reveal more only as workflow progresses',
    'Matches how real trade finance desks negotiate — on a shared private ledger',
  ]
);

// 12 — Roadmap & ask
addTableSlide('Roadmap to final demo', ['Phase', 'Deliverable'], [
  ['✅ Done', 'Daml build, deploy, payment + refund on-ledger, full UI'],
  ['🔄 Next', 'Invoice workflow on Seaport, Loop party on sandbox'],
  ['Final', 'Backend wired to JSON Ledger API, demo video'],
]);
{
  const slide = pptx.slides[pptx.slides.length - 1];
  slide.addText('github.com/AshThunder/cantara · Questions welcome', {
    x: 0.5, y: 4.85, w: 9, h: 0.4, fontSize: 14, bold: true, color: DEEP, fontFace: 'Arial',
  });
}

await pptx.writeFile({ fileName: OUT });
console.log('Created:', OUT);
