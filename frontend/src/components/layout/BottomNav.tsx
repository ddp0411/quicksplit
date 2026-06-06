import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUserStore } from '@/state/userStore';
import { ActionSheet } from '@/components/ui/ActionSheet';
import {
  UsersIcon,
  UserGroupIcon,
  BoltIcon,
  UserCircleIcon,
  SparklesIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  UsersIcon as UsersSolid,
  UserGroupIcon as UserGroupSolid,
  BoltIcon as BoltSolid,
  UserCircleIcon as UserCircleSolid,
  SparklesIcon as SparklesSolid,
} from '@heroicons/react/24/solid';

const tabs = [
  { to: '/friends',  label: 'Friends',  icon: UsersIcon,       iconActive: UsersSolid },
  { to: '/groups',   label: 'Groups',   icon: UserGroupIcon,   iconActive: UserGroupSolid },
  { to: '/personal', label: 'Personal', icon: SparklesIcon,    iconActive: SparklesSolid },
  { to: '/activity', label: 'Activity', icon: BoltIcon,        iconActive: BoltSolid },
  { to: '/account',  label: 'Account',  icon: UserCircleIcon,  iconActive: UserCircleSolid },
];

const FULLSCREEN_ROUTES = ['/', '/onboarding'];

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  const { pathname } = useLocation();
  const [showAction, setShowAction] = useState(false);

  if (!isAuthenticated || FULLSCREEN_ROUTES.includes(pathname)) return null;

  const half1 = tabs.slice(0, 2);
  const half2 = tabs.slice(2);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl md:hidden"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        }}
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2 pt-2">
          {half1.map(({ to, label, icon: Icon, iconActive: IconActive }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => [
                'flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-bold transition-all',
                isActive ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500',
              ].join(' ')}
            >
              {({ isActive }) => (
                <>
                  {isActive ? <IconActive className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* FAB */}
          <div className="relative flex flex-col items-center" style={{ marginTop: '-20px' }}>
            <button
              type="button"
              onClick={() => setShowAction(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 shadow-button transition-transform active:scale-95"
            >
              <PlusIcon className="h-6 w-6 text-white" />
            </button>
            <span className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">Add</span>
          </div>

          {half2.map(({ to, label, icon: Icon, iconActive: IconActive }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => [
                'flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-bold transition-all',
                isActive ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500',
              ].join(' ')}
            >
              {({ isActive }) => (
                <>
                  {isActive ? <IconActive className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <ActionSheet open={showAction} onClose={() => setShowAction(false)} />
    </>
  );
};
