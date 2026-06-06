import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const features = [
  'Unlimited groups & expenses',
  'OCR bill scanning',
  'AI spending insights & chat',
  'Smart budget tracking',
  'Subscription tracker',
  'Advanced charts & analytics',
  'CSV / PDF export',
  'Priority support',
];

const plans = [
  { id: 'yearly', label: 'Yearly', badge: 'BEST VALUE', price: '₹599', period: '/year', sub: '₹49.9/month, billed annually' },
  { id: 'quarterly', label: 'Quarterly', badge: '', price: '₹249', period: '/quarter', sub: '₹83/month' },
  { id: 'monthly', label: 'Monthly', badge: '', price: '₹99', period: '/month', sub: 'No commitment' },
];

export const ProUpgrade: React.FC = () => {
  const [selected, setSelected] = useState('yearly');
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-10">
      {/* Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 text-white overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl mb-4">
          💎
        </div>
        <h1 className="font-display text-2xl font-extrabold">Upgrade to QuickSplit Pro</h1>
        <p className="mt-1 text-sm text-white/80">Take full control of your shared finances</p>

        {/* Timeline */}
        <div className="mt-5 space-y-3">
          {[
            { icon: '▶', label: 'Today', desc: 'Start your free trial — full access immediately' },
            { icon: '🔔', label: '5 days before trial ends', desc: "You'll receive a reminder" },
            { icon: '⭐', label: 'After 7 days', desc: 'Your subscription begins, cancel anytime' },
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs">{step.icon}</div>
                {i < 2 && <div className="w-px flex-1 bg-white/20 mt-1 mb-0 min-h-[20px]" />}
              </div>
              <div className="pb-3">
                <p className="font-bold text-sm text-primary-200">{step.label}</p>
                <p className="text-xs text-white/70">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>What's included</p>
        <div className="space-y-2">
          {features.map(f => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary-600" />
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plan selector */}
      <div className="space-y-2">
        {plans.map(plan => (
          <button
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`w-full flex items-center justify-between rounded-2xl border-2 p-4 transition ${
              selected === plan.id
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-transparent bg-[var(--card)]'
            }`}
            style={{ boxShadow: selected === plan.id ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-bold" style={{ color: 'var(--text)' }}>{plan.label}</p>
                {plan.badge && (
                  <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">{plan.badge}</span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{plan.sub}</p>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-lg text-primary-600">{plan.price}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => alert('Coming soon! Payment integration in progress.')}
        className="btn-primary w-full py-4 text-base"
      >
        Try It Free — 7 days
      </button>
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Cancel anytime before trial ends. No charge until after 7 days.
      </p>
      <button
        onClick={() => navigate('/account/referral')}
        className="block w-full text-center text-sm font-bold text-primary-600 hover:underline"
      >
        🎁 Or earn Pro free — invite friends
      </button>
    </div>
  );
};
