import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/state/userStore';
import { Button } from '../ui/Button';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  BoltIcon,
  UserCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/home',     label: 'Home',     icon: HomeIcon },
  { to: '/friends',  label: 'Friends',  icon: UsersIcon },
  { to: '/groups',   label: 'Groups',   icon: UserGroupIcon },
  { to: '/personal', label: 'Personal', icon: SparklesIcon },
  { to: '/activity', label: 'Activity', icon: BoltIcon },
  { to: '/account',  label: 'Account',  icon: UserCircleIcon },
];

const FULLSCREEN_ROUTES = ['/', '/onboarding'];

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useUserStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (FULLSCREEN_ROUTES.includes(pathname)) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }: { isActive: boolean }) => [
    'hidden items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition md:inline-flex',
    isActive
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
  ].join(' ');

  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{ background: 'color-mix(in srgb, var(--card) 85%, transparent)', borderColor: 'var(--border)' }}
    >
      <div className="app-container">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to={isAuthenticated ? '/home' : '/'} className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-lg font-black text-white shadow-button">
              Q
            </span>
            <span className="truncate font-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>
              QuickSplit
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={linkClass}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="hidden rounded-2xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:text-negative md:inline-flex"
                >
                  Logout
                </button>
                {/* Mobile user avatar */}
                <Link to="/account" className="flex md:hidden">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {user?.name?.[0] ?? 'U'}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
