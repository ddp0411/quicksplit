import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowDownTrayIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

export const ImportSplitwise: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleImport = () => {
    if (!file) return;
    setTimeout(() => setDone(true), 800);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-positive/10 text-4xl">✅</div>
        <h2 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Import complete!</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your Splitwise data has been imported. Check your groups.</p>
        <Link to="/groups" className="btn-primary px-8 py-3 text-sm">View groups</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/account" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Import from Splitwise</h1>
      </div>

      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Bring your expense history from Splitwise in two easy ways.
      </p>

      {/* Option 1 */}
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <ArrowDownTrayIcon className="h-5 w-5 text-primary-600" />
          <p className="font-bold" style={{ color: 'var(--text)' }}>Option 1: Import directly</p>
        </div>
        <ol className="space-y-1.5 text-sm ml-8" style={{ color: 'var(--text-muted)' }}>
          <li>1. In Splitwise, export your group data</li>
          <li>2. From the share menu, choose QuickSplit</li>
        </ol>
      </div>

      <div className="text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>OR</div>

      {/* Option 2 */}
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <DocumentArrowUpIcon className="h-5 w-5 text-primary-600" />
          <p className="font-bold" style={{ color: 'var(--text)' }}>Option 2: Upload a file</p>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          If you've already downloaded the export file, upload it here.
        </p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
        {file ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-2xl border p-3" style={{ borderColor: 'var(--border)' }}>
              <DocumentArrowUpIcon className="h-4 w-4 text-primary-600" />
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{file.name}</p>
            </div>
            <Button className="w-full" onClick={handleImport}>Import now</Button>
          </div>
        ) : (
          <Button className="w-full" variant="secondary" onClick={() => fileRef.current?.click()}>
            SELECT FILE
          </Button>
        )}
      </div>
    </div>
  );
};
