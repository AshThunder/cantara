import PptxGenJS from 'pptxgenjs';
import { writeFileSync } from 'fs';

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
  slide.addText(title, { x: 0.5, y: 1.8, w: 9, h: 1.2, fontSize: 44, bold: true, color: WHITE, fontFace: 'Arial' });
  slide.addText(subtitle, { x: 0.5, y: 3.1, w: 9, h: 0.8, fontSize: 22, color: TEAL_LIGHT, fontFace: 'Arial', italic: true });
  if (footer) {
    slide.addText(footer, { x: 0.5, y: 4.5, w: 9, h: 1.2, fontSize: 14, color: GRAY, fontFace: 'Arial' });
  }
}

function addContentSlide(title, bullets, note) {
  const slide = pptx.addSlide();
  slide.background = { color: MINT };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: TEAL } });
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.8, fontSize: 28, bold: true, color: DEEP, fontFace: 'Arial' });
  slide.addText(bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), {
    x: 0.6, y: 1.4, w: 8.8, h: 3.8, fontSize: 16, color: DEEP, fontFace: 'Arial', valign: 'top',
  });
  if (note) {
    slide.addText(note, { x: 0.5, y: 4.8, w: 9, h: 0.5, fontSize: 13, color: TEAL, fontFace: 'Arial', italic: true });
  }
}

function addTableSlide(title, headers, rows) {
  const slide = pptx.addSlide();
  slide.background = { color: MINT };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: TEAL } });
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.8, fontSize: 28, bold: true, color: DEEP, fontFace: 'Arial' });
  const tableRows = [
    headers.map((h) => ({ text: h, options: { bold: true, fill: { color: TEAL }, color: WHITE } })),
    ...rows.map((r) => r.map((c) => ({ text: c }))),
  ];
  slide.addTable(tableRows, {
    x: 0.5, y: 1.4, w: 9, colW: [4.5, 4.5],
    fontSize: 14, color: DEEP, border: { pt: 0.5, color: TEAL_LIGHT },
  });
}

// Slide 1
addTitleSlide(
  'Cantara',
  'Private payments & trade finance on Canton',
  'Build on Canton Hackathon · Encode Club\nTrack 3: Payments · Track 1: Private DeFi\n\nAshThunder / Chris Gold\ngithub.com/AshThunder/cantara'
);

// Slide 2
addContentSlide(
  'Institutional finance needs privacy, not publicity',
  [
    'Public blockchains expose every payment and balance',
    'Trade finance involves 3+ parties with different visibility needs',
    'SMEs wait 30–90 days for invoice payment with no shared source of truth',
  ],
  'Payments and receivables should be private by default.'
);

// Slide 3
addTableSlide('Cantara — one platform, two modules', ['Payments', 'Invoices'], [
  ['P2P send & refund', 'Supplier issues invoice'],
  ['Payment requests', 'Buyer confirms'],
  ['Subscriptions', 'Financier bids confidentially'],
  ['Multi-send', 'Settlement on maturity'],
]);
{
  const slide = pptx.slides[pptx.slides.length - 1];
  slide.addText('Built on Canton Network with Daml smart contracts', {
    x: 0.5, y: 4.6, w: 9, h: 0.5, fontSize: 14, color: TEAL, fontFace: 'Arial', italic: true,
  });
}

// Slide 4
addContentSlide(
  'Party-based privacy — built into the ledger',
  [
    'Only signatories & observers see contract data',
    'Multi-party workflows native to Daml',
    'Institutional-grade infrastructure (5N Sandbox, Global Synchronizer)',
  ],
  'Unlike Ethereum: privacy by who is on the contract, not encryption on a public chain.'
);

// Slide 5
addContentSlide(
  'Architecture',
  [
    'React UI → REST API → Canton JSON Ledger API → 5N Sandbox',
    'Daml contracts (cantara-0.1.0.dar)',
    'Frontend: React + teal theme, party connect',
    'Backend: TypeScript API (demo + production path)',
  ]
);

// Slide 6
addContentSlide(
  "What's built",
  [
    'Daml: Payment, Refund, PaymentRequest, Subscription, PaymentBatch',
    'Invoices: full financing lifecycle (6 templates)',
    'App: Dashboard, Send, Invoices, Activity + demo REST API',
    'Deployed on 5N Sandbox — payment created + refunded on-ledger ✅',
  ]
);

// Slide 7
addTableSlide('Live demo proof (Seaport / 5N Sandbox)', ['Action', 'Status'], [
  ['Create Payment', '✅ Done'],
  ['Refund Payment', '✅ Done'],
  ['Invoice workflow', '🔄 In progress'],
]);
{
  const slide = pptx.slides[pptx.slides.length - 1];
  slide.addText('Package ID: b011f10b...cf3f58 · Screenshots available', {
    x: 0.5, y: 4.6, w: 9, h: 0.5, fontSize: 13, color: GRAY, fontFace: 'Arial', italic: true,
  });
}

// Slide 8
addContentSlide(
  'Privacy in action',
  [
    'Payment: signatory = sender, observer = recipient — amount private to both',
    'Financing offer: signatory = financier, observer = supplier',
    'Terms hidden from buyer until settlement',
  ],
  'Selective visibility per workflow stage.'
);

// Slide 9
addTableSlide('Roadmap', ['Phase', 'Deliverable'], [
  ['✅ Now', 'Daml contracts, deploy, payment demo'],
  ['🔄 This week', 'Invoice on-ledger demo, checkpoint submission'],
  ['Next', 'Backend → JSON Ledger API, Loop party allocation'],
  ['Final', 'Full UI ↔ Canton integration, demo video'],
]);

// Slide 10
addTitleSlide(
  'Thank you',
  'Cantara — private finance that flows on Canton',
  'github.com/AshThunder/cantara\nDeployed on 5N Sandbox via Seaport\nTracks: Payments (T3) + Private DeFi (T1)\n\nQuestions welcome'
);

const out = '/home/michael/canton/cantara/docs/Cantara-Checkpoint-2.pptx';
await pptx.writeFile({ fileName: out });
console.log('Created:', out);
