import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { axiosClient } from '@/services/api/axiosClient';
import { useUserStore } from '@/state/userStore';
import { getAPIErrorMessage } from '@/services/api/errorMessage';

const AVATAR_COLORS = [
  '#0F9D94', '#2BB673', '#E74C3C', '#F4A300',
  '#8B5CF6', '#3B82F6', '#EC4899', '#14B8A6',
];

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, token } = useUserStore();

  const [name, setName] = useState(user?.name ?? '');
  const [upiId, setUpiId] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const saveMutation = useMutation({
    mutationFn: () => axiosClient.patch('/auth/me/', { name: name.trim(), upi_id: upiId.trim() }),
    onSuccess: () => {
      if (user && token) {
        setUser({ ...user, name: name.trim() }, token);
      }
      setSaved(true);
      setTimeout(() => navigate('/account'), 1000);
    },
    onError: (err) => setError(getAPIErrorMessage(err, 'Could not save changes.')),
  });

  const handleSave = () => {
    if (!name.trim()) { setError('Name cannot be empty'); return; }
    setError('');
    saveMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-lg pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/account')}
            className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
          </button>
          <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Edit Profile</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || saved}
          className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
            saved ? 'bg-positive text-white' : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {saved ? <><CheckIcon className="h-4 w-4" /> Saved</> : saveMutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Avatar */}
      <div className="card mb-4 flex flex-col items-center gap-4">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-extrabold text-white shadow-button transition-all"
          style={{ background: avatarColor }}
        >
          {avatarInitials(name || user?.name || 'U')}
        </div>
        <div>
          <p className="mb-2 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Choose avatar color
          </p>
          <div className="flex gap-2.5">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setAvatarColor(color)}
                className="relative flex h-8 w-8 rounded-xl transition hover:scale-110"
                style={{ background: color }}
              >
                {avatarColor === color && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="card space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 p-3 text-sm font-semibold text-negative">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Full name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>
            UPI ID
            <span className="ml-2 rounded-full bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 text-[10px] font-bold text-primary-700">
              optional
            </span>
          </label>
          <input
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            className="input-field"
            placeholder="yourname@upi"
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Used to generate payment QR codes
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Email</label>
          <input
            value={user?.email ?? ''}
            disabled
            className="input-field opacity-50 cursor-not-allowed"
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
        </div>
      </div>
    </div>
  );
};
