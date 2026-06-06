import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface SettingsRowProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  to?: string;
  onClick?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
}

const Inner: React.FC<SettingsRowProps> = ({ icon, label, description, right, destructive }) => (
  <div className="settings-row cursor-pointer hover:opacity-75 transition-opacity active:opacity-60">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600">
          {icon}
        </div>
      )}
      <div>
        <p className={`text-sm font-semibold ${destructive ? 'text-negative' : ''}`} style={!destructive ? { color: 'var(--text)' } : undefined}>
          {label}
        </p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
    </div>
    {right ?? <ChevronRightIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />}
  </div>
);

export const SettingsRow: React.FC<SettingsRowProps> = (props) => {
  if (props.to) {
    return <Link to={props.to}><Inner {...props} /></Link>;
  }
  return <button type="button" className="w-full text-left" onClick={props.onClick}><Inner {...props} /></button>;
};
