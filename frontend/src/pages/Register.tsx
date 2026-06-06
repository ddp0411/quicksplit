import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const Register: React.FC = () => {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [localError, setLocalError] = useState('');

  const authError = getAPIErrorMessage(registerError, 'Registration failed. Please try again.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!name.trim()) { setLocalError('Please enter your name'); return; }
    if (!email.trim().includes('@')) { setLocalError('Enter a valid email'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return; }
    if (!agree) { setLocalError('Please accept the terms to continue'); return; }
    registerUser({ name: name.trim(), email: email.trim().toLowerCase(), password });
  };

  const error = localError || (registerError ? authError : '');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-600 shadow-button">
            <span className="font-display text-2xl font-extrabold text-white">Q</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Create account</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Start splitting expenses for free</p>
        </div>

        {/* Social buttons */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={() => alert('Google signup coming soon')}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border py-3 text-sm font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.9 20-21 0-1.3-.1-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.2 16.7 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.3-17.7 10.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.5-2.1 14.3-5.4l-6.6-5.6C29.8 35.9 27 37 24 37c-5.8 0-10.7-3.9-12.4-9.3l-7 5.4C8.1 40.9 15.4 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.8 2.4-2.3 4.4-4.3 5.9l6.6 5.6C42.2 36.5 45 31 45 24c0-1.3-.1-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Sign up with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-5 flex items-center">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
          <span className="mx-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Rohan Mehta"
              autoComplete="name"
            />
          </div>

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
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="At least 6 characters"
                autoComplete="new-password"
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

          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Confirm password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                className="sr-only"
              />
              <div className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition ${agree ? 'bg-primary-600 border-primary-600' : ''}`}
                style={{ borderColor: agree ? undefined : 'var(--border)' }}>
                {agree && <span className="text-white text-xs font-extrabold">✓</span>}
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              I agree to the{' '}
              <span className="font-bold text-primary-600">Terms of Service</span>{' '}
              and{' '}
              <span className="font-bold text-primary-600">Privacy Policy</span>
            </p>
          </label>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-button transition hover:bg-primary-700 disabled:opacity-60"
          >
            {isRegistering ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
