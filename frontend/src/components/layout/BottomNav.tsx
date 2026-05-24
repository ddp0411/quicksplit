import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUserStore } from '@/state/userStore';
import {
  ClockIcon,
  DocumentTextIcon,
  HomeIcon,
  QrCodeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const items = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/scan', label: 'Scan', icon: DocumentTextIcon },
  { to: '/split', label: 'Split', icon: QrCodeIcon },
  { to: '/history', label: 'History', icon: ClockIcon },
];

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useUserStore();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_28px_rgba(36,31,78,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex min-w-0 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-100',
              ].join(' ')
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className="flex min-w-0 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100"
        >
          <UserCircleIcon className="h-5 w-5" />
          <span className="truncate">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
