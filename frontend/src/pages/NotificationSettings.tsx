import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

const groups = [
  {
    title: 'Groups and friends',
    items: [
      { key: 'group_add', label: 'When someone adds me to a group' },
      { key: 'friend_add', label: 'When someone adds me as a friend' },
    ],
  },
  {
    title: 'Expenses',
    items: [
      { key: 'expense_added', label: 'When an expense is added' },
      { key: 'expense_edited', label: 'When an expense is edited or deleted' },
      { key: 'someone_pays', label: 'When someone pays me' },
    ],
  },
  {
    title: 'News and updates',
    items: [
      { key: 'news', label: 'QuickSplit news and updates' },
    ],
  },
];

type Prefs = Record<string, boolean>;

const defaultPrefs: Prefs = {
  group_add: true, friend_add: true,
  expense_added: false, expense_edited: false, someone_pays: true,
  news: true,
};

function loadPrefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem('qs_notif_prefs') ?? 'null') ?? defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export const NotificationSettings: React.FC = () => {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);

  const toggle = (key: string) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem('qs_notif_prefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/account" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Notifications</h1>
      </div>

      {groups.map(group => (
        <div key={group.title} className="card">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {group.title}
          </p>
          {group.items.map(item => (
            <div key={item.key} className="settings-row">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.label}</p>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={prefs[item.key] ?? false}
                  onChange={() => toggle(item.key)}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-primary-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-full dark:bg-slate-700" />
              </label>
            </div>
          ))}
        </div>
      ))}

      <Button className="w-full" onClick={save}>
        {saved ? 'Saved!' : 'Save changes'}
      </Button>
    </div>
  );
};
