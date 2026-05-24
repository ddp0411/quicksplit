import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { groupsAPI, type Group } from '@/services/api/groupsAPI';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { formatCurrency } from '@/utils/upi';
import {
  ArrowRightIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  HeartIcon,
  HomeIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  home: { icon: HomeIcon, color: 'text-sky-700', bg: 'bg-sky-50' },
  trip: { icon: GlobeAltIcon, color: 'text-amber-700', bg: 'bg-amber-50' },
  couple: { icon: HeartIcon, color: 'text-rose-700', bg: 'bg-rose-50' },
  work: { icon: BuildingOfficeIcon, color: 'text-slate-700', bg: 'bg-slate-100' },
  other: { icon: PlusIcon, color: 'text-primary-700', bg: 'bg-primary-50' },
};

const CATEGORIES = [
  { value: 'home', label: 'Home' },
  { value: 'trip', label: 'Trip' },
  { value: 'couple', label: 'Couple' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
];

interface CreateGroupForm {
  name: string;
  description: string;
  category: string;
  member_emails: string;
}

export const Groups: React.FC = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState('');

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsAPI.getGroups,
  });

  const { register, handleSubmit, reset, watch } = useForm<CreateGroupForm>({
    defaultValues: { category: 'other' },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateGroupForm) => groupsAPI.createGroup({
      name: data.name,
      description: data.description,
      category: data.category,
      member_emails: data.member_emails
        ? data.member_emails.split(',').map(e => e.trim()).filter(Boolean)
        : [],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      setShowCreate(false);
      setCreateError('');
      reset();
    },
    onError: (err) => setCreateError(getAPIErrorMessage(err, 'Could not create group.')),
  });

  const selectedCategory = watch('category');
  const totalYouOwe = groups.reduce((s, g) => s + Math.min(0, g.your_balance), 0);
  const totalOwed = groups.reduce((s, g) => s + Math.max(0, g.your_balance), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-lg bg-gradient-to-br from-ink to-primary-800 p-5 text-white shadow-button md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-white/70">Shared spaces</p>
          <h1 className="mt-1 font-display text-4xl font-extrabold tracking-normal">Groups</h1>
          <p className="mt-2 text-sm font-semibold text-white/70">{groups.length} active groups</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-64">
          <div className="rounded-lg bg-white/10 p-3">
            <p className="text-xs font-semibold text-white/70">You are owed</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-200">{formatCurrency(totalOwed)}</p>
          </div>
          <div className="rounded-lg bg-white/10 p-3">
            <p className="text-xs font-semibold text-white/70">You owe</p>
            <p className="mt-1 text-xl font-extrabold text-rose-200">{formatCurrency(Math.abs(totalYouOwe))}</p>
          </div>
        </div>
      </div>

      {/* Create Group Panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-primary-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-ink">Create group</h2>
                <Button size="icon" variant="ghost" onClick={() => { setShowCreate(false); setCreateError(''); reset(); }}>
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              {createError && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  {createError}
                </div>
              )}

              <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
                <Input label="Group name" {...register('name', { required: true })} placeholder="Goa Trip 2026" />
                <Input label="Description (optional)" {...register('description')} placeholder="Our annual trip" />

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Category</p>
                  <div className="grid grid-cols-5 gap-2">
                    {CATEGORIES.map(cat => {
                      const meta = CATEGORY_META[cat.value];
                      const isSelected = selectedCategory === cat.value;
                      return (
                        <label
                          key={cat.value}
                          className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition ${
                            isSelected
                              ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                              : 'border-slate-200 hover:border-primary-200'
                          }`}
                        >
                          <input type="radio" value={cat.value} {...register('category')} className="sr-only" />
                          <span className={`rounded-lg p-1.5 ${meta.bg} ${meta.color}`}>
                            <meta.icon className="h-4 w-4" />
                          </span>
                          <span className="text-[11px] font-bold text-slate-700">{cat.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Invite members (emails, comma-separated)"
                  {...register('member_emails')}
                  placeholder="aman@gmail.com, priya@gmail.com"
                />

                <Button type="submit" loading={createMutation.isPending} className="w-full">
                  Create group
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups list */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">Your groups</h2>
        <Button onClick={() => setShowCreate(v => !v)} variant={showCreate ? 'secondary' : 'primary'}>
          <PlusIcon className="mr-1.5 h-4 w-4" />
          New group
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map(i => <div key={i} className="h-36 animate-pulse rounded-lg bg-white shadow-soft" />)}
        </div>
      ) : groups.length === 0 ? (
        <Card className="py-12 text-center">
          <GlobeAltIcon className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 font-bold text-slate-900">No groups yet</p>
          <p className="mt-1 text-sm text-slate-500">Create a group for trips, home expenses, or work lunches.</p>
          <Button className="mt-5" onClick={() => setShowCreate(true)}>
            <PlusIcon className="mr-2 h-5 w-5" />
            Create first group
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group: Group) => {
            const meta = CATEGORY_META[group.category] || CATEGORY_META.other;
            return (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card hover className="h-full cursor-pointer transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 rounded-lg p-2.5 ${meta.bg} ${meta.color}`}>
                        <meta.icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{group.name}</p>
                        <p className="text-xs font-medium text-slate-500 capitalize">{group.category}</p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-primary-600 mt-1" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">{group.member_count} members</p>
                    {Math.abs(group.your_balance) < 0.01 ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Settled
                      </span>
                    ) : group.your_balance > 0 ? (
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-emerald-600">you are owed</p>
                        <p className="font-extrabold text-emerald-700 text-sm">{formatCurrency(group.your_balance)}</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-rose-500">you owe</p>
                        <p className="font-extrabold text-rose-600 text-sm">{formatCurrency(Math.abs(group.your_balance))}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
