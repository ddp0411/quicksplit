import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/state/userStore';
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  CameraIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

type Tab = 'mycode' | 'scan';

export const QRCodePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [tab, setTab] = useState<Tab>('mycode');
  const [copied, setCopied] = useState(false);

  // Scan tab state
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const profileLink = `${window.location.origin}/add-friend/${user?.id ?? 'me'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Add ${user?.name ?? 'me'} on QuickSplit`, url: profileLink }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // ── QR Scan logic ─────────────────────────────────────────────────────────

  const stopScan = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setScanning(false);
  };

  const handleQRResult = (value: string) => {
    setScanResult(value);
    // Parse QuickSplit profile link: {origin}/add-friend/{userId}
    try {
      const url = new URL(value);
      const parts = url.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('add-friend');
      if (idx !== -1 && parts[idx + 1]) {
        navigate(`/friends/add?userId=${parts[idx + 1]}`);
        return;
      }
    } catch { /* not a URL */ }
    // Bare UUID fallback
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      navigate(`/friends/add?userId=${value}`);
    }
    // else: show the raw value and let user dismiss
  };

  useEffect(() => {
    if (!scanning) return;
    intervalRef.current = setInterval(() => {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) return;
      const { videoWidth, videoHeight } = video;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      const imgData = ctx.getImageData(0, 0, videoWidth, videoHeight);
      const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
      if (code?.data) {
        stopScan();
        handleQRResult(code.data);
      }
    }, 200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  // Stop camera when leaving scan tab
  useEffect(() => { if (tab !== 'scan') stopScan(); }, [tab]);

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
              tab === t ? 'bg-primary-600 text-white shadow-sm' : ''
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
            <div
              className="rounded-3xl p-6 flex flex-col items-center gap-5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
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
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <QRCodeSVG
                  value={profileLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0F9D94"
                  level="M"
                  imageSettings={{ src: '', height: 0, width: 0, excavate: false }}
                />
              </div>
              <p className="text-xs text-center px-4" style={{ color: 'var(--text-muted)' }}>
                Ask friends to scan this code to add you on QuickSplit
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition hover:border-primary-300 hover:text-primary-600"
                style={{ borderColor: 'var(--border)', color: copied ? '#10b981' : 'var(--text)' }}
              >
                {copied ? <><CheckIcon className="h-4 w-4" /> Copied!</> : <><ClipboardDocumentIcon className="h-4 w-4" /> Copy link</>}
              </button>
              <button
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                <QrCodeIcon className="h-4 w-4" /> Share
              </button>
            </div>

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
            {/* Camera viewfinder */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="relative flex h-72 items-center justify-center bg-slate-900 overflow-hidden">
                {/* Corner brackets always shown */}
                <div className="absolute inset-10 z-10 pointer-events-none">
                  <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />
                </div>

                {scanning && (
                  <>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      videoConstraints={{ facingMode: 'environment' }}
                      onUserMediaError={(e) => {
                        setCameraError(typeof e === 'string' ? e : 'Camera access denied');
                        setScanning(false);
                      }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* Animated scan line */}
                    <motion.div
                      className="absolute left-10 right-10 h-0.5 bg-primary-400 opacity-80 z-10"
                      animate={{ top: ['2.5rem', 'calc(100% - 2.5rem)'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                    />
                  </>
                )}

                {!scanning && !cameraError && (
                  <div className="flex flex-col items-center gap-3 z-10">
                    <CameraIcon className="h-10 w-10 text-white/50" />
                    <p className="text-sm font-semibold text-white/70">Tap to start camera</p>
                  </div>
                )}

                {cameraError && (
                  <div className="flex flex-col items-center gap-2 px-6 text-center z-10">
                    <XMarkIcon className="h-8 w-8 text-rose-400" />
                    <p className="text-sm font-semibold text-white/80">Camera unavailable</p>
                    <p className="text-xs text-white/50">{cameraError}</p>
                  </div>
                )}

                {/* hidden canvas for frame decoding */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="p-5 text-center">
                {scanning ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-bold text-base" style={{ color: 'var(--text)' }}>Scanning…</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Point at a QuickSplit QR code
                    </p>
                    <button
                      onClick={stopScan}
                      className="mt-1 rounded-xl border px-4 py-1.5 text-sm font-bold transition hover:border-rose-300 hover:text-rose-500"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-bold text-base" style={{ color: 'var(--text)' }}>Scan a friend's code</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Point your camera at a QuickSplit QR code to add a friend instantly
                    </p>
                    <button
                      onClick={() => { setCameraError(''); setScanResult(null); setScanning(true); }}
                      className="flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-button transition active:scale-95"
                    >
                      <CameraIcon className="h-4 w-4" /> Open Camera
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scan result (non-navigable QR) */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-1">QR Detected</p>
                <p className="text-sm font-mono break-all" style={{ color: 'var(--text-muted)' }}>{scanResult}</p>
              </motion.div>
            )}

            {/* Manual fallback */}
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>or</p>
            </div>
            <button
              onClick={() => navigate('/friends/add')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition hover:border-primary-300 hover:text-primary-600"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <UserPlusIcon className="h-4 w-4" /> Add friend by name or email
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
