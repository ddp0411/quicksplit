import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/state/userStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SettingsRow } from '@/components/ui/SettingsRow';
import {
  QrCodeIcon,
  BellIcon,
  ShieldCheckIcon,
  SunIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  ArrowRightStartOnRectangleIcon,
  PencilIcon,
  GiftIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export const AccountTab: React.FC = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      {/* Header */}
      <h1 className="font-display text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Account</h1>

      {/* Profile card */}
      <div className="card flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-primary-600 text-xl font-extrabold text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate text-lg" style={{ color: 'var(--text)' }}>{user?.name ?? 'User'}</p>
          <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>
        <button
          onClick={() => navigate('/account/edit')}
          className="flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold text-primary-600 transition hover:bg-primary-50 dark:hover:bg-primary-900/20"
          style={{ borderColor: 'var(--border)' }}
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {/* Pro Banner */}
      <button
        onClick={() => navigate('/pro')}
        className="w-full rounded-3xl bg-gradient-to-r from-primary-600 to-primary-800 p-5 text-left shadow-button transition hover:opacity-90"
      >
        <p className="text-xs font-bold text-white/70 uppercase tracking-wide">Premium</p>
        <p className="mt-1 font-display text-xl font-extrabold text-white">
          Upgrade to QuickSplit Pro 💎
        </p>
        <p className="mt-1 text-sm text-white/80">
          AI insights, unlimited groups, OCR scanning & more
        </p>
        <div className="mt-3 inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold text-white">
          Start 7-day free trial
        </div>
      </button>

      {/* Tools */}
      <div className="card">
        <SettingsRow icon={<QrCodeIcon className="h-4 w-4" />} label="Scan code" to="/account/qr" />
        <SettingsRow icon={<StarIcon className="h-4 w-4" />} label="QuickSplit Pro" to="/pro" />
      </div>

      {/* Preferences */}
      <div className="card">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Preferences</p>
        <SettingsRow icon={<BellIcon className="h-4 w-4" />} label="Notifications" to="/settings/notifications" />
        <SettingsRow icon={<ShieldCheckIcon className="h-4 w-4" />} label="Security" to="/settings/security" />
        <SettingsRow icon={<SunIcon className="h-4 w-4" />} label="Appearance" to="/settings/appearance" />
      </div>

      {/* Actions */}
      <div className="card">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>More</p>
        <SettingsRow icon={<GiftIcon className="h-4 w-4" />} label="Referral rewards" description="Invite friends, earn Pro months" to="/account/referral" />
        <SettingsRow icon={<ArrowDownTrayIcon className="h-4 w-4" />} label="Import from Splitwise" description="Bring over your groups and balances" to="/account/import" />
      </div>

      {/* Feedback */}
      <div className="card">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Feedback</p>
        <SettingsRow icon={<StarIcon className="h-4 w-4" />} label="Rate QuickSplit" onClick={() => {}} />
        <SettingsRow icon={<ChatBubbleLeftIcon className="h-4 w-4" />} label="Contact us" onClick={() => window.open('mailto:support@quicksplit.app')} />
      </div>

      {/* Logout */}
      <div className="card">
        <SettingsRow
          icon={<ArrowRightStartOnRectangleIcon className="h-4 w-4" />}
          label="Log out"
          destructive
          onClick={() => setShowLogout(true)}
          right={<span />}
        />
      </div>

      {/* Footer */}
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Made with ❤️ in India · v1.0.0
      </p>

      <ConfirmDialog
        open={showLogout}
        title="Log out?"
        message="You'll need to log back in to access your account."
        confirmLabel="Log out"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
};
