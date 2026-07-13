#!/usr/bin/env python3
"""Generate 1920x1080 pitch-deck stills for the 3-minute video."""
from PIL import Image, ImageDraw, ImageFont
import os

FRAMES = "/home/michael/canton/cantara/docs/video-3min/deck"
ASSETS = "/home/michael/canton/cantara/docs/presentation-assets"
W, H = 1920, 1080
DEEP = (4, 47, 46)
TEAL = (20, 184, 166)
WHITE = (255, 255, 255)
MINT = (240, 253, 250)
GRAY = (95, 138, 133)

os.makedirs(FRAMES, exist_ok=True)

def font(size, bold=False):
    path = (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    )
    return ImageFont.truetype(path, size)

def wrap(draw, text, f, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=f) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def card(name, title, bullets, note=None, bg=DEEP, title_c=WHITE, body_c=TEAL):
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    if bg == MINT:
        d.rectangle([0, 0, W, 16], fill=TEAL)
    ft, fb, fn = font(58, True), font(34), font(26)
    y = 140
    d.text((110, y), title, font=ft, fill=title_c)
    y += 110
    for b in bullets:
        for line in wrap(d, "•  " + b, fb, W - 220):
            d.text((130, y), line, font=fb, fill=body_c if bg == DEEP else DEEP)
            y += 54
        y += 10
    if note:
        y = max(y + 30, H - 140)
        for line in wrap(d, note, fn, W - 220):
            d.text((110, y), line, font=fn, fill=GRAY if bg == DEEP else TEAL)
            y += 36
    path = os.path.join(FRAMES, name)
    img.save(path)
    print("wrote", path)

def image_slide(name, title, image_path, caption):
    img = Image.new("RGB", (W, H), MINT)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 16], fill=TEAL)
    d.text((110, 50), title, font=font(42, True), fill=DEEP)
    shot = Image.open(image_path).convert("RGB")
    max_w, max_h = 1680, 820
    shot.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    x = (W - shot.width) // 2
    y = 120
    img.paste(shot, (x, y))
    d.text((110, H - 70), caption, font=font(24), fill=TEAL)
    path = os.path.join(FRAMES, name)
    img.save(path)
    print("wrote", path)

card(
    "d01-title.png",
    "Cantara",
    [
        "Private payments & trade finance on Canton",
        "Build on Canton Hackathon · Encode Club",
        "Tracks: T3 Payments + T1 Private DeFi",
    ],
    "Live: cantara-hackathon.vercel.app",
)

card(
    "d02-problem.png",
    "The problem",
    [
        "Banks and SMEs cannot put payment amounts or invoice terms on a public ledger",
        "Trade finance needs 3+ parties — each with different visibility",
        "Result: delays, intermediaries, and leaked competitive terms",
    ],
    "Cantara targets everyday payments + receivables financing — both need privacy.",
    bg=MINT,
    title_c=DEEP,
    body_c=DEEP,
)

card(
    "d03-why.png",
    "Why Canton",
    [
        "Daml defines who sees what: signatories, observers, controllers",
        "Multi-party workflows are native — not bolted on",
        "Institutional validators — we run on 5N Sandbox DevNet",
    ],
    "Privacy by party membership — only contract parties see the data.",
    bg=MINT,
    title_c=DEEP,
    body_c=DEEP,
)

card(
    "d04-tracks.png",
    "One platform, two tracks",
    [
        "T3 Payments: send, refund, request, multi-send, subscriptions, checkout, wallet",
        "T1 Invoices: propose → accept → attest → offer → settle",
        "Same counterparty graph, same privacy model",
    ],
    bg=MINT,
    title_c=DEEP,
    body_c=DEEP,
)

card(
    "d05-arch.png",
    "Live on DevNet",
    [
        "React UI on Vercel → Express API on Railway",
        "LEDGER_MODE=canton → JSON Ledger API v2 → 5N Sandbox",
        "Package cantara 0.1.0 on 5N — payments, refunds, subscriptions, invoice financing on-ledger; app adds multi-send, checkout, wallet, SDK",
    ],
    'Health check returns mode: "canton"',
    bg=MINT,
    title_c=DEEP,
    body_c=DEEP,
)

if os.path.exists(f"{ASSETS}/execution-log.png"):
    image_slide(
        "d06-payment-proof.png",
        "On-ledger proof — Payment created",
        f"{ASSETS}/execution-log.png",
        "Seaport / 5N Sandbox CreatedEvent — not a mock ledger",
    )
if os.path.exists(f"{ASSETS}/refunded-payment.png"):
    image_slide(
        "d07-refund-proof.png",
        "On-ledger proof — Refund exercised",
        f"{ASSETS}/refunded-payment.png",
        "Payment_Refund → RefundedPayment on DevNet",
    )

card(
    "d08-demo.png",
    "Live product demo",
    [
        "Next: walk the real app at cantara-hackathon.vercel.app",
        "Send, activity, multi-send, requests, checkout, subscriptions, invoices",
        "Every action hits Canton DevNet",
    ],
    "Add your voice — silent bed for Encode submission",
)
print("deck frames ready")
