'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

// Donation options. Each is optional; the Support button only renders when at least one is set.
const BKASH = process.env.NEXT_PUBLIC_BKASH_NUMBER?.trim() || '';
const NAGAD = process.env.NEXT_PUBLIC_NAGAD_NUMBER?.trim() || '';
const PATREON = process.env.NEXT_PUBLIC_PATREON_URL?.trim() || '';
const COFFEE = process.env.NEXT_PUBLIC_PATREON_COFFEE_URL?.trim() || '';
const HAS_SUPPORT = Boolean(BKASH || NAGAD || PATREON || COFFEE);

function WalletRow({ name, number }: { name: string; number: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked; the number is still selectable */ }
  }
  return (
    <div className="desk-wallet">
      <div className="min-w-0">
        <p className="desk-wallet-name">{name}</p>
        <p className="desk-wallet-number select-all">{number}</p>
      </div>
      <button type="button" onClick={copy} className="desk-secondary shrink-0" aria-label={`Copy ${name} number`}>
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  );
}

export default function SupportLink({ variant = 'button' }: { variant?: 'button' | 'text' }) {
  if (!HAS_SUPPORT) return null;
  const trigger = variant === 'text'
    ? <DialogTrigger className="desk-support-text">☕ Fund my caffeine addiction ↗</DialogTrigger>
    : (
      <DialogTrigger
        aria-label="Support CF Ladder"
        className="desk-support flex items-center gap-1 px-2 py-2 text-xs shrink-0 font-medium"
      >
        <span aria-hidden="true">☕</span><span className="desk-support-label">Support</span>
      </DialogTrigger>
    );

  return (
    <Dialog>
      {trigger}
      <DialogContent className="desk-dialog">
        <DialogHeader>
          <DialogTitle>☕ Support CF Ladder</DialogTitle>
          <DialogDescription>
            CF Ladder is free and open source. If it helped you climb, a small tip keeps the servers running and new features coming.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {(BKASH || NAGAD) && (
            <section className="space-y-2">
              <h3 className="desk-support-heading">🇧🇩 From Bangladesh</h3>
              {BKASH && <WalletRow name="bKash" number={BKASH} />}
              {NAGAD && <WalletRow name="Nagad" number={NAGAD} />}
              <p className="text-xs text-muted-foreground">Use <strong>Send Money</strong> in the app, then paste the number.</p>
            </section>
          )}
          {(COFFEE || PATREON) && (
            <section className="space-y-2">
              <h3 className="desk-support-heading">🌍 From anywhere else</h3>
              {COFFEE && (
                <a href={COFFEE} target="_blank" rel="noopener noreferrer" className="desk-action flex w-full justify-center">
                  ☕ Buy me a coffee · $5 ↗
                </a>
              )}
              <p className="text-xs text-muted-foreground">
                {COFFEE ? 'One-time payment by card or PayPal on Patreon.' : 'Card or PayPal. You can cancel any time.'}
                {COFFEE && PATREON && <> Or <a href={PATREON} target="_blank" rel="noopener noreferrer" className="underline">support monthly ↗</a></>}
              </p>
              {!COFFEE && PATREON && (
                <a href={PATREON} target="_blank" rel="noopener noreferrer" className="desk-action flex w-full justify-center">
                  Support on Patreon ↗
                </a>
              )}
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
