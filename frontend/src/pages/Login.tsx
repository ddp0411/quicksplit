import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const Login: React.FC = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const authError = getAPIErrorMessage(loginError, 'Invalid credentials. Please try again.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    login({ email: email.trim().toLowerCase(), password });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-600 shadow-button">
            <span className="font-display text-2xl font-extrabold text-white">Q</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your QuickSplit account</p>
        </div>

        {/* Social buttons (UI only) */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={() => alert('Google login coming soon')}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border py-3 text-sm font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.9 20-21 0-1.3-.1-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.2 16.7 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.3-17.7 10.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.5-2.1 14.3-5.4l-6.6-5.6C29.8 35.9 27 37 24 37c-5.8 0-10.7-3.9-12.4-9.3l-7 5.4C8.1 40.9 15.4 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.8 2.4-2.3 4.4-4.3 5.9l6.6 5.6C42.2 36.5 45 31 45 24c0-1.3-.1-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => alert('Apple login coming soon')}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border py-3 text-sm font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.1c-52.1-75.1-87.2-192.3-87.2-303.1 0-203.8 132.4-312.9 261.1-312.9 70.2 0 128.6 46.2 172.5 46.2 42.2 0 108.6-49 191.4-49 30.8 0 108.2 2.6 163.7 98.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-5 flex items-center">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
          <span className="mx-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 p-3 text-sm font-semibold text-negative">
              {authError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Password</label>
              <button type="button" className="text-xs font-bold text-primary-600 hover:underline">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPw
                  ? <EyeSlashIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  : <EyeIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !email || !password}
            className="w-full rounded-2xl bg-accent-500 py-3.5 text-sm font-bold text-white shadow-button transition hover:bg-accent-600 disabled:opacity-60"
          >
            {isLoggingIn ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
};
