import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/state/userStore';
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

type Tab = 'mycode' | 'scan';

export const QRCodePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [tab, setTab] = useState<Tab>('mycode');
  const [copied, setCopied] = useState(false);

  const profileLink = `${window.location.origin}/add-friend/${user?.id ?? 'me'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Add ${user?.name ?? 'me'} on QuickSplit`,
        url: profileLink,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="mx-auto max-w-lg pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
        </button>
        <h1 className="font-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>
          QR Code
        </h1>
      </div>

      {/* Tab switcher */}
      <div
        className="mb-6 flex rounded-2xl p-1"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {(['mycode', 'scan'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
              tab === t
                ? 'bg-primary-600 text-white shadow-sm'
                : ''
            }`}
            style={tab !== t ? { color: 'var(--text-muted)' } : undefined}
          >
            {t === 'mycode' ? 'My Code' : 'Scan'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'mycode' ? (
          <motion.div
            key="mycode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            {/* QR card */}
            <div
              className="rounded-3xl p-6 flex flex-col items-center gap-5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {/* Avatar */}
              <div
                className="flex h-16 w-16 items-center justify-center rounded-3xl text-xl font-extrabold text-white shadow-md"
                style={{ background: '#0F9D94' }}
              >
                {initials}
              </div>
              <div className="text-center">
                <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>{user?.name ?? 'User'}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>

              {/* QR Code */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <QRCodeSVG
                  value={profileLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0F9D94"
                  level="M"
                  imageSettings={{
                    src: '',
                    height: 0,
                    width: 0,
                    excavate: false,
                  }}
                />
              </div>

              <p className="text-xs text-center px-4" style={{ color: 'var(--text-muted)' }}>
                Ask friends to scan this code to add you on QuickSplit
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition hover:border-primary-300 hover:text-primary-600"
                style={{ borderColor: 'var(--border)', color: copied ? '#10b981' : 'var(--text)' }}
              >
                {copied ? (
                  <><CheckIcon className="h-4 w-4" /> Copied!</>
                ) : (
                  <><ClipboardDocumentIcon className="h-4 w-4" /> Copy link</>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                <QrCodeIcon className="h-4 w-4" /> Share
              </button>
            </div>

            {/* Profile link preview */}
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <p className="flex-1 truncate text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {profileLink}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            {/* Camera viewfinder placeholder */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="relative flex h-72 items-center justify-center bg-slate-900">
                {/* Corner brackets */}
                <div className="absolute inset-10">
                  <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />
                </div>
                {/* Scan line animation */}
                <motion.div
                  className="absolute left-10 right-10 h-0.5 bg-primary-400 opacity-70"
                  animate={{ top: ['2.5rem', 'calc(100% - 2.5rem)'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                />
                <div className="flex flex-col items-center gap-3 z-10">
                  <CameraIcon className="h-10 w-10 text-white/40" />
                  <p className="text-sm font-semibold text-white/60">Camera not available in preview</p>
                </div>
              </div>

              <div className="p-5 text-center">
                <p className="font-bold text-base" style={{ color: 'var(--text)' }}>Scan a friend's code</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Point your camera at a QuickSplit QR code to add a friend instantly
                </p>
              </div>
            </div>

            {/* Or add manually */}
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>or</p>
            </div>
            <button
              onClick={() => navigate('/friends/add')}
              className="w-full rounded-2xl border py-3 text-sm font-bold transition hover:border-primary-300 hover:text-primary-600"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Add friend by name or email
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
