import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useThemeStore, type ThemeMode } from '@/state/themeStore';
import { applyTheme } from '@/utils/theme';

const options: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
  { mode: 'light', label: 'Light', icon: '☀️', description: 'Always use light appearance' },
  { mode: 'dark', label: 'Dark', icon: '🌙', description: 'Always use dark appearance' },
  { mode: 'system', label: 'System', icon: '◑', description: 'App appearance adjusts to match your system settings' },
];

export const AppearanceSettings: React.FC = () => {
  const { mode, setMode } = useThemeStore();

  const handleSelect = (m: ThemeMode) => {
    setMode(m);
    applyTheme(m);
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/account" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Appearance</h1>
      </div>

      <div className="card divide-y" style={{ '--tw-divide-color': 'var(--border)' } as React.CSSProperties}>
        {options.map(opt => (
          <button
            key={opt.mode}
            onClick={() => handleSelect(opt.mode)}
            className="settings-row w-full text-left transition hover:opacity-75"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{opt.icon}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{opt.label}</p>
                {opt.description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.description}</p>}
              </div>
            </div>
            {mode === opt.mode && <CheckIcon className="h-5 w-5 text-primary-600" />}
          </button>
        ))}
      </div>
    </div>
  );
};
