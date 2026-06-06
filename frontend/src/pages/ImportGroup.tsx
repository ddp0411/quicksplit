import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { groupsAPI } from '@/services/api/groupsAPI';
import { expensesAPI } from '@/services/api/expensesAPI';
import { useUserStore } from '@/state/userStore';
import { getAPIErrorMessage } from '@/services/api/errorMessage';

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedMember { name: string }

interface ParsedExpense {
  date: string;
  description: string;
  amount: number;
  currency: string;
  paidByName: string;
}

interface ParsedData {
  groupName: string;
  members: ParsedMember[];
  expenses: ParsedExpense[];
}

type Screen = 'upload' | 'setup' | 'success';

const TYPES = [
  { value: 'trip',   emoji: '✈️', label: 'Trip' },
  { value: 'home',   emoji: '🏠', label: 'Home' },
  { value: 'couple', emoji: '❤️', label: 'Couple' },
  { value: 'other',  emoji: '📁', label: 'Other' },
];

// ── CSV Parser ────────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function toISODate(raw: string): string {
  // Handle M/D/YYYY or D/M/YYYY → YYYY-MM-DD
  const clean = raw.replace(/^"|"$/g, '').trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      const [a, b, c] = parts;
      if (c.length === 4) return `${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
    }
  }
  // Already ISO or unknown — return as-is
  return clean || new Date().toISOString().split('T')[0];
}

function parseSplitwiseCSV(text: string, filename: string): ParsedData {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { groupName: filename, members: [], expenses: [] };

  const headers = parseCSVLine(lines[0]);
  const groupName = filename
    .replace(/\.csv$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  // Find member columns from "Paid by X" / "Owed by X" headers
  const memberNames: string[] = [];
  const paidByIndices: { index: number; name: string }[] = [];

  headers.forEach((h, i) => {
    const clean = h.replace(/^"|"$/g, '').trim();
    if (/^paid by /i.test(clean)) {
      const name = clean.slice(8).trim();
      paidByIndices.push({ index: i, name });
      if (name && !memberNames.includes(name)) memberNames.push(name);
    } else if (/^owed by /i.test(clean)) {
      const name = clean.slice(8).trim();
      if (name && !memberNames.includes(name)) memberNames.push(name);
    }
  });

  // Fallback: columns after index 4 (after Date/Description/Category/Cost/Currency)
  if (memberNames.length === 0 && headers.length > 5) {
    for (let i = 5; i < headers.length; i++) {
      const name = headers[i].replace(/^"|"$/g, '').trim();
      if (name && name.toLowerCase() !== 'total balance') memberNames.push(name);
    }
  }

  const expenses: ParsedExpense[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = parseCSVLine(lines[r]);
    if (cols.length < 4) continue;
    const desc = cols[1]?.replace(/^"|"$/g, '').trim();
    const amountRaw = cols[3]?.replace(/^"|"$/g, '').replace(/,/g, '').trim();
    const amount = parseFloat(amountRaw);
    const currency = cols[4]?.replace(/^"|"$/g, '').trim() || 'INR';
    if (!desc || isNaN(amount) || amount <= 0) continue;

    let paidByName = memberNames[0] || '';
    for (const { index, name } of paidByIndices) {
      const val = parseFloat(cols[index]?.replace(/^"|"$/g, '').replace(/,/g, '').trim() || '0');
      if (val > 0) { paidByName = name; break; }
    }

    expenses.push({
      date: toISODate(cols[0] || ''),
      description: desc,
      amount,
      currency,
      paidByName,
    });
  }

  return { groupName, members: memberNames.map(name => ({ name })), expenses };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ImportGroup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [screen, setScreen] = useState<Screen>('upload');
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [groupName, setGroupName] = useState('');
  const [myIdentity, setMyIdentity] = useState('');
  const [category, setCategory] = useState('other');
  const [memberMappings, setMemberMappings] = useState<Record<string, string>>({});
  const [mappingInputs, setMappingInputs] = useState<Record<string, string>>({});
  const [openMapping, setOpenMapping] = useState<string | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState('');
  const [createdGroupName, setCreatedGroupName] = useState('');
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // File picked → parse CSV
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const data = parseSplitwiseCSV(text, file.name);
      setParsed(data);
      setGroupName(data.groupName);
      // Best-guess: pick member whose name matches user's display name
      const best = data.members.find(m => m.name.toLowerCase().includes((user?.name || '').split(' ')[0].toLowerCase()));
      setMyIdentity(best?.name || data.members[0]?.name || '');
      setScreen('setup');
    };
    reader.readAsText(file);
  };

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      if (!groupName.trim()) throw new Error('Enter a group name');
      const mappedEmails = Object.values(memberMappings).filter(e => e.includes('@'));
      const group = await groupsAPI.createGroup({ name: groupName.trim(), category, member_emails: mappedEmails });

      const exps = parsed?.expenses ?? [];
      if (exps.length > 0 && user) {
        for (let i = 0; i < exps.length; i++) {
          setImportProgress({ done: i, total: exps.length });
          const exp = exps[i];
          try {
            await expensesAPI.createExpense({
              group_id: group.id,
              description: exp.description,
              amount: exp.amount,
              currency: exp.currency,
              category: 'other',
              paid_by_user_id: user.id,
              split_type: 'equal',
              date: exp.date,
              participant_ids: [user.id],
            });
          } catch {
            // Non-fatal: continue with next expense
          }
        }
      }

      return group;
    },
    onSuccess: (group) => {
      setCreatedGroupId(group.id);
      setCreatedGroupName(groupName.trim());
      setImportProgress(null);
      setScreen('success');
    },
    onError: (err) => {
      setError(getAPIErrorMessage(err, 'Could not import group.'));
      setImportProgress(null);
    },
  });

  const inviteLink = `${window.location.origin}/join/${createdGroupId}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Join ${createdGroupName} on QuickSplit`, url: inviteLink }).catch(() => {});
    } else {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const otherMembers = (parsed?.members ?? []).filter(m => m.name !== myIdentity);

  // ── Screen A: Upload ───────────────────────────────────────────────────────
  if (screen === 'upload') {
    return (
      <div className="mx-auto max-w-lg space-y-5 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/groups')}
              className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
            </button>
            <h1 className="font-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>
              Import from Splitwise
            </h1>
          </div>
          <span className="text-sm font-bold text-slate-300 dark:text-slate-600 select-none">IMPORT</span>
        </div>

        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Bring your expense history from Splitwise in two easy ways.
        </p>

        {/* Option 1 */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <ArrowDownTrayIcon className="h-5 w-5 text-primary-600" />
            <p className="font-bold" style={{ color: 'var(--text)' }}>Option 1: Import Directly</p>
          </div>
          <ol className="ml-2 space-y-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li>1. In Splitwise, open your group and tap Export.</li>
            <li>2. From the share menu, choose QuickSplit.</li>
          </ol>
        </div>

        <div className="text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>OR</div>

        {/* Option 2 */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <DocumentArrowUpIcon className="h-5 w-5 text-primary-600" />
            <p className="font-bold" style={{ color: 'var(--text)' }}>Option 2: Upload a File</p>
          </div>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            If you've already downloaded the export file, upload it here.
          </p>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            SELECT FILE
          </button>
        </div>
      </div>
    );
  }

  // ── Screen B: Setup ────────────────────────────────────────────────────────
  if (screen === 'setup') {
    return (
      <div className="mx-auto max-w-lg space-y-5 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen('upload')}
              className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
            </button>
            <h1 className="font-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>Import Group</h1>
          </div>
          <button
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
            className="text-sm font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50 transition"
          >
            {importMutation.isPending
              ? importProgress
                ? `${importProgress.done}/${importProgress.total} expenses…`
                : 'Creating…'
              : 'IMPORT'}
          </button>
        </div>

        {/* Info banner */}
        <div className="rounded-2xl bg-primary-50 dark:bg-primary-900/20 px-4 py-3">
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">
            Import your Splitwise group. Map each friend to your contacts to finish setup.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 p-3 text-sm font-semibold text-negative">
            {error}
          </div>
        )}

        {/* Group name */}
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            Group Name
          </label>
          <input
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="input-field"
            placeholder="Enter group name"
          />
        </div>

        {/* Your identity */}
        {parsed && parsed.members.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              Your Identity
            </label>
            <select
              value={myIdentity}
              onChange={e => setMyIdentity(e.target.value)}
              className="input-field"
              style={{ color: 'var(--text)', background: 'var(--card)' }}
            >
              {parsed.members.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Which name in the CSV is you?
            </p>
          </div>
        )}

        {/* Type selector */}
        <div>
          <label className="mb-2 block text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setCategory(t.value)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition ${
                  category === t.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-700'
                    : 'hover:border-primary-300'
                }`}
                style={{ borderColor: category !== t.value ? 'var(--border)' : undefined }}
              >
                <span className="text-xl">{t.emoji}</span>
                <span className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map friends */}
        {otherMembers.length > 0 && (
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              Map Friends
            </label>
            <div className="card space-y-3">
              {otherMembers.map(m => {
                const mapped = memberMappings[m.name];
                const isOpen = openMapping === m.name;
                return (
                  <div key={m.name}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--text)' }}>
                          {m.name}
                        </p>
                        <p className={`text-xs ${mapped ? 'text-positive font-semibold' : ''}`} style={!mapped ? { color: 'var(--text-muted)' } : undefined}>
                          {mapped || 'Not mapped'}
                        </p>
                      </div>
                      <button
                        onClick={() => setOpenMapping(isOpen ? null : m.name)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          mapped
                            ? 'bg-positive/10 text-positive'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {mapped ? 'MAPPED' : 'MAP'}
                      </button>
                    </div>

                    {/* Inline email input */}
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 overflow-hidden"
                      >
                        <div className="flex gap-2">
                          <input
                            autoFocus
                            type="email"
                            value={mappingInputs[m.name] ?? ''}
                            onChange={e => setMappingInputs(prev => ({ ...prev, [m.name]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const email = mappingInputs[m.name]?.trim();
                                if (email?.includes('@')) {
                                  setMemberMappings(prev => ({ ...prev, [m.name]: email }));
                                  setOpenMapping(null);
                                }
                              }
                            }}
                            className="input-field flex-1 text-sm"
                            placeholder="friend@email.com"
                          />
                          <button
                            onClick={() => {
                              const email = mappingInputs[m.name]?.trim();
                              if (email?.includes('@')) {
                                setMemberMappings(prev => ({ ...prev, [m.name]: email }));
                                setOpenMapping(null);
                              }
                            }}
                            className="rounded-2xl bg-primary-600 px-3 py-2 text-sm font-bold text-white hover:bg-primary-700"
                          >
                            ✓
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expense summary */}
        {parsed && parsed.expenses.length > 0 && (
          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              📋 {parsed.expenses.length} expense{parsed.expenses.length !== 1 ? 's' : ''} found in CSV — will be imported after group creation.
            </p>
          </div>
        )}

        {/* Import button (bottom) */}
        <button
          onClick={() => importMutation.mutate()}
          disabled={importMutation.isPending}
          className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {importMutation.isPending
            ? importProgress
              ? `Importing expenses… (${importProgress.done}/${importProgress.total})`
              : 'Creating group…'
            : '📥 Import Group'}
        </button>
      </div>
    );
  }

  // ── Screen C: Success ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="w-full rounded-t-3xl px-6 pb-10 pt-8 text-center"
        style={{ background: 'var(--card)' }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-100 dark:bg-primary-900/30">
          <LinkIcon className="h-8 w-8 text-primary-600" />
        </div>

        <h2 className="font-display text-2xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>
          Group imported!
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          Share an invite link so your friends can join "{createdGroupName}" on QuickSplit.
        </p>

        {/* Pro referral card */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 p-4 text-left">
          <span className="mt-0.5 text-lg">⭐</span>
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">
            Get 1 month free Pro for every 3 friends who install QuickSplit from your invite!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Share link
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 rounded-2xl border py-3.5 text-sm font-bold transition hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {copied ? '✓ Copied!' : 'Copy link'}
          </button>
        </div>

        <button
          onClick={() => navigate(`/groups/${createdGroupId}`)}
          className="mt-4 text-sm font-semibold transition hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          Maybe later
        </button>
      </motion.div>
    </div>
  );
};
