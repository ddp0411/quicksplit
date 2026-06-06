import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, MagnifyingGlassIcon, UserPlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { friendsAPI, type UserMini } from '@/services/api/friendsAPI';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { SkeletonRow } from '@/components/ui/SkeletonCard';

type Tab = 'search' | 'qr';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const AddFriend: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['user-search', query],
    queryFn: () => friendsAPI.searchUsers(query),
    enabled: query.trim().length >= 2,
  });

  const addMutation = useMutation({
    mutationFn: (email: string) => friendsAPI.addFriend(email),
    onSuccess: (_, email) => {
      setSentTo(prev => new Set([...prev, email]));
      setError('');
    },
    onError: (err) => setError(getAPIErrorMessage(err, 'Could not send request.')),
  });

  const handleDirectAdd = () => {
    if (!query.trim().includes('@')) { setError('Enter a valid email address'); return; }
    addMutation.mutate(query.trim().toLowerCase());
  };

  return (
    <div className="mx-auto max-w-lg pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate('/friends')}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </button>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Add Friend</h1>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-2xl border p-1" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        {(['search', 'qr'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold capitalize transition ${
              tab === t ? 'bg-primary-600 text-white' : ''
            }`}
            style={tab !== t ? { color: 'var(--text-muted)' } : undefined}
          >
            {t === 'search' ? '🔍 Search' : '📷 QR Code'}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              autoFocus
              value={query}
              onChange={e => { setQuery(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleDirectAdd()}
              placeholder="Search by name or email…"
              className="input-field pl-9"
            />
          </div>

          {error && <p className="text-sm text-negative font-semibold">{error}</p>}

          {/* Quick add by email CTA */}
          {query.includes('@') && !isFetching && results.length === 0 && (
            <div className="card text-center py-6">
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                No user found for <strong style={{ color: 'var(--text)' }}>{query}</strong>
              </p>
              <button
                onClick={handleDirectAdd}
                disabled={addMutation.isPending || sentTo.has(query.trim().toLowerCase())}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                <UserPlusIcon className="h-4 w-4" />
                {sentTo.has(query.trim().toLowerCase()) ? 'Request sent!' : 'Send invite'}
              </button>
            </div>
          )}

          {/* Results */}
          {isFetching ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((user: UserMini) => {
                const sent = sentTo.has(user.email);
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-2xl border p-3"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
                      style={{ background: user.avatar_color }}
                    >
                      {avatarInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-sm" style={{ color: 'var(--text)' }}>{user.name}</p>
                      <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                    <button
                      onClick={() => addMutation.mutate(user.email)}
                      disabled={sent || addMutation.isPending}
                      className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
                        sent
                          ? 'bg-emerald-100 text-positive dark:bg-emerald-900/30'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {sent ? (
                        <><CheckCircleIcon className="h-3.5 w-3.5" /> Sent</>
                      ) : (
                        <><UserPlusIcon className="h-3.5 w-3.5" /> Add</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : query.length >= 2 && !query.includes('@') ? (
            <div className="card py-10 text-center">
              <p className="text-2xl">🔍</p>
              <p className="mt-2 font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try searching by email address</p>
            </div>
          ) : query.length < 2 ? (
            <div className="card py-10 text-center">
              <p className="text-3xl">👥</p>
              <p className="mt-3 font-bold text-base" style={{ color: 'var(--text)' }}>Find your friends</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Search by name or email to send a friend request
              </p>
            </div>
          ) : null}
        </div>
      )}

      {tab === 'qr' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card py-10 text-center space-y-4"
          >
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-6xl">
              📷
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: 'var(--text)' }}>Scan to Add Friend</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Ask your friend to show their QR code from Account → QR Code
              </p>
            </div>
            <div className="rounded-2xl border-2 border-dashed py-8 text-center" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Camera access required</p>
              <button className="mt-3 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700">
                Open Camera
              </button>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              QR scanning coming soon · Use search for now
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
