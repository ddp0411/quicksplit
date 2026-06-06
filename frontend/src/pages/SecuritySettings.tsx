import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export const SecuritySettings: React.FC = () => (
  <div className="mx-auto max-w-lg space-y-5">
    <div className="flex items-center gap-3">
      <Link to="/account" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
        <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
      </Link>
      <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Security</h1>
    </div>

    <div className="card">
      <div className="settings-row">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600">
            <ShieldCheckIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Authenticate with Biometrics</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Require Face ID or fingerprint to open QuickSplit</p>
          </div>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" disabled className="sr-only peer" />
          <div className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:content-[''] opacity-50" />
        </label>
      </div>
    </div>

    <div className="rounded-2xl border border-dashed p-4 text-center" style={{ borderColor: 'var(--border)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
        Biometric authentication is coming soon.
      </p>
    </div>
  </div>
);
