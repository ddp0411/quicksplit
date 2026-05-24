import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { datasetAPI } from '@/services/api/datasetAPI';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/state/userStore';
import {
  ArrowRightOnRectangleIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export const Profile: React.FC = () => {
  const { user } = useUserStore();
  const { logout } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['dataset-stats'],
    queryFn: datasetAPI.getStats,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="bg-gradient-to-br from-ink to-primary-800 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10">
            <UserCircleIcon className="h-10 w-10" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-3xl font-extrabold tracking-normal">{user?.name}</p>
            <p className="truncate text-sm font-semibold text-white/65">{user?.email}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-center gap-3">
          <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold text-slate-900">Secure session</p>
            <p className="text-sm font-medium text-slate-500">Bearer token active</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
            <CircleStackIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold text-slate-900">Dataset entries</p>
            <p className="text-sm font-medium text-slate-500">{stats?.total_entries ?? 0} receipts</p>
          </div>
        </Card>
      </div>

      <Card>
        <Button type="button" variant="danger" onClick={logout}>
          <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </Card>
    </div>
  );
};
