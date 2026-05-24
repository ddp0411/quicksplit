import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/state/userStore';
import { Button } from '../ui/Button';
import {
  ArrowRightOnRectangleIcon,
  ClockIcon,
  DocumentTextIcon,
  QrCodeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition md:inline-flex',
      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ');

  return (
    <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="app-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-sky-500 text-xl font-black text-white shadow-button">
              ₹
            </span>
            <span className="truncate font-display text-2xl font-extrabold tracking-normal text-ink">
              QuickSplit
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NavLink to="/scan" className={navLinkClass}>
                  <DocumentTextIcon className="h-4 w-4" />
                  Scan
                </NavLink>
                <NavLink to="/split" className={navLinkClass}>
                  <QrCodeIcon className="h-4 w-4" />
                  Split
                </NavLink>
                <NavLink to="/history" className={navLinkClass}>
                  <ClockIcon className="h-4 w-4" />
                  History
                </NavLink>
                <span className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 lg:inline-flex">
                  <UserCircleIcon className="h-4 w-4" />
                  {user?.name}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
