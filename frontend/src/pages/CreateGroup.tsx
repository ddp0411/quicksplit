import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { groupsAPI } from '@/services/api/groupsAPI';
import { getAPIErrorMessage } from '@/services/api/errorMessage';

const CATEGORIES = [
  { value: 'trip',   emoji: '✈️', label: 'Trip',   desc: 'Holidays & travel' },
  { value: 'home',   emoji: '🏠', label: 'Home',   desc: 'Rent, bills, groceries' },
  { value: 'couple', emoji: '❤️', label: 'Couple', desc: 'Shared life expenses' },
  { value: 'work',   emoji: '💼', label: 'Office', desc: 'Work lunches & events' },
  { value: 'event',  emoji: '📅', label: 'Event',  desc: 'Parties & celebrations' },
  { value: 'other',  emoji: '📁', label: 'Other',  desc: 'Everything else' },
];

const SPLIT_METHODS = [
  { value: 'equal',    label: 'Equal split',    desc: 'Split evenly every time' },
  { value: 'exact',    label: 'Exact amounts',  desc: 'Enter exact shares' },
  { value: 'percent',  label: 'Percentage',     desc: 'Split by percentages' },
];

const CURRENCIES = ['₹ INR', '$ USD', '€ EUR', '£ GBP'];

export const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultCategory = searchParams.get('category') ?? 'other';

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [splitMethod, setSplitMethod] = useState('equal');
  const [currency, setCurrency] = useState('₹ INR');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: () => groupsAPI.createGroup({
      name,
      category,
      member_emails: memberEmails,
    }),
    onSuccess: (group) => navigate(`/groups/${group.id}`),
    onError: (err) => setError(getAPIErrorMessage(err, 'Could not create group.')),
  });

  const addEmail = () => {
    const e = emailInput.trim().toLowerCase();
    if (!e) return;
    if (!e.includes('@')) { setError('Enter a valid email'); return; }
    if (memberEmails.includes(e)) { setError('Already added'); return; }
    setMemberEmails(prev => [...prev, e]);
    setEmailInput('');
    setError('');
  };

  const removeEmail = (email: string) => setMemberEmails(prev => prev.filter(e => e !== email));

  const stepTitles = ['Group details', 'Add members', 'Preferences'];

  return (
    <div className="mx-auto max-w-lg pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/groups')}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </button>
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Step {step} of 3</p>
          <h1 className="font-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>{stepTitles[step - 1]}</h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 flex gap-1.5">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Name + Category */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-5"
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Group name
              </label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
                className="input-field"
                placeholder="Goa Trip 2026"
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Group type</p>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                      category === cat.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-700'
                        : 'hover:border-primary-300'
                    }`}
                    style={{ borderColor: category !== cat.value ? 'var(--border)' : undefined }}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{cat.label}</span>
                    <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { if (name.trim()) { setError(''); setStep(2); } else setError('Enter a group name'); }}
              className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              Continue
            </button>
            {error && <p className="text-center text-sm text-negative font-semibold">{error}</p>}
          </motion.div>
        )}

        {/* Step 2: Add members */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Add members by email. You can also add them later from the group page.
            </p>

            <div className="flex gap-2">
              <input
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && addEmail()}
                className="input-field flex-1"
                placeholder="friend@email.com"
                type="email"
              />
              <button
                onClick={addEmail}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white transition hover:bg-primary-700"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            {error && <p className="text-sm text-negative font-semibold">{error}</p>}

            {/* Added members */}
            {memberEmails.length > 0 && (
              <div className="card space-y-2">
                {memberEmails.map(email => (
                  <div key={email} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-sm font-bold text-primary-700">
                        {email[0].toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{email}</p>
                    </div>
                    <button onClick={() => removeEmail(email)} className="text-slate-400 hover:text-negative transition">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {memberEmails.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed py-8 text-center" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  No members added yet
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>You can skip and add them later</p>
              </div>
            )}

            <button
              onClick={() => setStep(3)}
              className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700"
            >
              {memberEmails.length > 0 ? `Continue with ${memberEmails.length} member${memberEmails.length > 1 ? 's' : ''}` : 'Skip for now'}
            </button>
          </motion.div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-5"
          >
            <div>
              <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Default split method</p>
              <div className="space-y-2">
                {SPLIT_METHODS.map(method => (
                  <button
                    key={method.value}
                    onClick={() => setSplitMethod(method.value)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                      splitMethod === method.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-primary-300'
                    }`}
                    style={{ borderColor: splitMethod !== method.value ? 'var(--border)' : undefined }}
                  >
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{method.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{method.desc}</p>
                    </div>
                    {splitMethod === method.value && (
                      <CheckIcon className="h-5 w-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Currency</p>
              <div className="flex gap-2 flex-wrap">
                {CURRENCIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                      currency === c
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'hover:border-primary-300'
                    }`}
                    style={{ borderColor: currency !== c ? 'var(--border)' : undefined, color: currency !== c ? 'var(--text)' : undefined }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="card border-primary-200 bg-primary-50/50 dark:bg-primary-900/10">
              <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-2">Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Name</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Type</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {CATEGORIES.find(c => c.value === category)?.emoji} {CATEGORIES.find(c => c.value === category)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Members</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {memberEmails.length > 0 ? `${memberEmails.length} invited` : 'Just you'}
                  </span>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-negative font-semibold">{error}</p>}

            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Creating…' : '🚀 Create Group'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
