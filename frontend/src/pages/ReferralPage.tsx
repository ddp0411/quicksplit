import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

const steps = [
  'Create a group and share the invite link',
  'When someone joins through your link, your referral count updates automatically',
  "Already on Pro? Any free month you earn starts after your current subscription ends or renews",
  "3 qualifying referrals = 1 free month of Pro (max 12 months)",
];

export const ReferralPage: React.FC = () => {
  const [howOpen, setHowOpen] = useState(false);
  const referralCount = 0;
  const referralLink = `https://quicksplit.app/join?ref=user123`;

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join QuickSplit', url: referralLink });
    } else {
      navigator.clipboard.writeText(referralLink);
      alert('Link copied!');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/account" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Referral Rewards</h1>
      </div>

      {/* Progress card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎁</span>
          <div>
            <p className="font-bold" style={{ color: 'var(--text)' }}>Referral Rewards</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Invite {3 - referralCount} more friends to earn your next free month of Pro
            </p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-2 rounded-full bg-primary-600 transition-all"
            style={{ width: `${(referralCount / 3) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs font-semibold text-primary-600">{referralCount}/3</p>
      </div>

      {/* How it works accordion */}
      <div className="card">
        <button
          className="flex w-full items-center justify-between"
          onClick={() => setHowOpen(o => !o)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 text-xs font-bold">ℹ</div>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>How referral rewards work</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Invite friends to earn free Pro months</p>
            </div>
          </div>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${howOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
        </button>
        {howOpen && (
          <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>How it works</p>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="font-bold text-primary-600 shrink-0">{i + 1}.</span>
                <p style={{ color: 'var(--text)' }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share */}
      <div className="card space-y-3">
        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Your invite link</p>
        <div className="flex items-center gap-2 rounded-2xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
          <p className="flex-1 truncate text-sm text-primary-600 font-medium">{referralLink}</p>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={share}>Share link</Button>
          <Button variant="secondary" className="flex-1" onClick={() => navigator.clipboard.writeText(referralLink)}>
            Copy link
          </Button>
        </div>
      </div>
    </div>
  );
};
