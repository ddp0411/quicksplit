import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useUserStore } from '@/state/userStore';
import { balancesAPI } from '@/services/api/balancesAPI';
import { groupsAPI } from '@/services/api/groupsAPI';
import { friendsAPI } from '@/services/api/friendsAPI';
import { activityAPI } from '@/services/api/activityAPI';
import { EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { formatCurrency } from '@/utils/upi';
import { formatDate } from '@/utils/helpers';
import { SkeletonRow } from '@/components/ui/SkeletonCard';
import { PageTransition } from '@/components/layout/PageTransition';
import { SparklesIcon } from '@heroicons/react/24/outline';

const QUOTES = [
  { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
  { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
  { text: "The world is a book, and those who do not travel read only one page.", author: "Saint Augustine" },
  { text: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { text: "Do not save what is left after spending; spend what is left after saving.", author: "Warren Buffett" },
  { text: "Split the bill, share the memory.", author: "QuickSplit" },
  { text: "Happiness is a road trip with friends and no unpaid debts.", author: "Anonymous" },
  { text: "Not all those who wander are lost — but always split the hotel bill.", author: "QuickSplit" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "It's not about how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
  { text: "A penny saved is a penny earned.", author: "Benjamin Franklin" },
  { text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.", author: "Marcel Proust" },
  { text: "Travel makes one modest. You see what a tiny place you occupy in the world.", author: "Gustave Flaubert" },
  { text: "The best things in life are free. The second best are very expensive.", author: "Coco Chanel" },
  { text: "Money is only a tool. It will take you wherever you wish.", author: "Ayn Rand" },
  { text: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", author: "Dave Ramsey" },
  { text: "Every day is a journey, and the journey itself is home.", author: "Matsuo Basho" },
  { text: "Too many people spend money they haven't earned to buy things they don't want.", author: "Will Rogers" },
  { text: "Friends who split bills together, stay together.", author: "QuickSplit" },
  { text: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
];

const AI_INSIGHTS = [
  "Your food expenses tend to spike on weekends. Try meal prepping to save up to 30%.",
  "You have unsettled balances. Settling now keeps friendships stress-free.",
  "Groups with regular check-ins settle 2× faster. Drop a reminder today.",
  "Scanning receipts takes 10 seconds and prevents bill disputes entirely.",
  "Review your biggest expense category and set a budget to stay on track.",
];

const CATEGORY_META: Record<string, { emoji: string; gradient: string }> = {
  home:   { emoji: '🏠', gradient: 'from-sky-500 to-sky-700' },
  trip:   { emoji: '✈️', gradient: 'from-amber-500 to-amber-700' },
  couple: { emoji: '❤️', gradient: 'from-rose-500 to-rose-700' },
  work:   { emoji: '💼', gradient: 'from-slate-500 to-slate-700' },
  event:  { emoji: '📅', gradient: 'from-violet-500 to-violet-700' },
  other:  { emoji: '📁', gradient: 'from-primary-500 to-primary-700' },
};

const categoryMap = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));

function getGreeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${time}, ${name.split(' ')[0]} 👋`;
}

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const todayQuote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);
  const todayInsight = useMemo(() => AI_INSIGHTS[new Date().getDate() % AI_INSIGHTS.length], []);

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance-overview'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsAPI.getGroups,
  });

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: activity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: () => activityAPI.getFeed(5),
  });

  const topGroups = useMemo(
    () => [...groups].sort((a, b) => Math.abs(b.your_balance) - Math.abs(a.your_balance)).slice(0, 4),
    [groups],
  );

  const owedToMe = useMemo(
    () => friends.filter(f => f.balance > 0.01).sort((a, b) => b.balance - a.balance).slice(0, 3),
    [friends],
  );

  const iOwe = useMemo(
    () => friends.filter(f => f.balance < -0.01).sort((a, b) => a.balance - b.balance).slice(0, 3),
    [friends],
  );

  const initials = user?.name ? avatarInitials(user.name) : 'U';

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg space-y-4 pb-24">

        {/* Hero — greeting + daily quote */}
        <div className="rounded-3xl p-6 shadow-green" style={{ background: 'linear-gradient(135deg, #0F4B70 0%, #0A3858 100%)' }}>
          <div className="mb-4 flex items-start justify-between">
            <p className="font-display text-xl font-extrabold text-white">
              {user ? getGreeting(user.name) : 'Welcome 👋'}
            </p>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold text-white">
              {initials}
            </div>
          </div>
          <blockquote className="border-l-2 border-white/40 pl-3">
            <p className="text-sm italic leading-relaxed text-white/90">"{todayQuote.text}"</p>
            <p className="mt-1.5 text-xs font-semibold text-white/60">— {todayQuote.author}</p>
          </blockquote>
        </div>

        {/* Balance hero card — dark forest green, moodboard style */}
        <div className="rounded-3xl p-5 shadow-green" style={{ background: '#0F4B70' }}>
          {balanceLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-white/20" />
              <div className="h-8 w-40 animate-pulse rounded bg-white/20" />
              <div className="h-8 w-28 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                    {(balance?.total_owed_to_you ?? 0) > 0 ? 'You are owed' : (balance?.total_you_owe ?? 0) > 0 ? 'You owe' : 'All settled up'}
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-white">
                    {(balance?.total_owed_to_you ?? 0) > 0
                      ? formatCurrency(balance?.total_owed_to_you ?? 0)
                      : (balance?.total_you_owe ?? 0) > 0
                        ? formatCurrency(balance?.total_you_owe ?? 0)
                        : '₹0.00'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <span className="text-lg">💼</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-white/50">Net</p>
                    <p className={`text-sm font-extrabold ${(balance?.net_balance ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {(balance?.net_balance ?? 0) >= 0 ? '+' : ''}{formatCurrency(balance?.net_balance ?? 0)}
                    </p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-[10px] font-semibold text-white/50">Owe you</p>
                    <p className="text-sm font-extrabold text-positive">{formatCurrency(balance?.total_owed_to_you ?? 0)}</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-[10px] font-semibold text-white/50">You owe</p>
                    <p className="text-sm font-extrabold text-negative">{formatCurrency(balance?.total_you_owe ?? 0)}</p>
                  </div>
                </div>
                {(balance?.total_you_owe ?? 0) > 0 && (
                  <button
                    onClick={() => navigate('/settle-up')}
                    className="rounded-xl bg-accent-500 px-3 py-1.5 text-xs font-bold text-white shadow-button transition hover:bg-accent-600"
                  >
                    Settle up now →
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: '➕', label: 'Add', bg: 'bg-accent-500 hover:bg-accent-600', route: '/expenses/new' },
            { emoji: '📷', label: 'Scan', bg: 'bg-amber-500 hover:bg-amber-600', route: '/scan' },
            { emoji: '💸', label: 'Settle', bg: 'bg-emerald-500 hover:bg-emerald-600', route: '/settle-up' },
            { emoji: '👤', label: 'Friend', bg: 'bg-violet-500 hover:bg-violet-600', route: '/friends/add' },
          ].map(({ emoji, label, bg, route }) => (
            <button
              key={label}
              onClick={() => navigate(route)}
              className={`${bg} flex flex-col items-center gap-1.5 rounded-2xl py-3.5 text-white transition active:scale-95`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>

        {/* Your groups strip */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Your Groups</p>
            <Link to="/groups" className="text-xs font-bold text-primary-600 hover:underline">See all →</Link>
          </div>

          {groupsLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-24 w-36 shrink-0 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
              ))}
            </div>
          ) : topGroups.length === 0 ? (
            <div className="card flex items-center justify-between px-4 py-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No groups yet</p>
              <button onClick={() => navigate('/groups/new')} className="text-xs font-bold text-primary-600">+ Create</button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {topGroups.map(group => {
                const meta = CATEGORY_META[group.category] ?? CATEGORY_META.other;
                const settled = Math.abs(group.your_balance) < 0.01;
                return (
                  <motion.button
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    whileTap={{ scale: 0.97 }}
                    className="flex w-36 shrink-0 flex-col items-start gap-2 rounded-2xl border p-3 text-left transition hover:border-primary-300"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-lg shadow-sm`}>
                      {meta.emoji}
                    </div>
                    <p className="w-full truncate text-xs font-bold" style={{ color: 'var(--text)' }}>{group.name}</p>
                    {settled ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Settled</span>
                    ) : group.your_balance > 0 ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-positive dark:bg-emerald-900/20">
                        owed {formatCurrency(group.your_balance)}
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-negative dark:bg-rose-900/20">
                        owe {formatCurrency(Math.abs(group.your_balance))}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Who owes you */}
        {!friendsLoading && owedToMe.length > 0 && (
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Who owes you</p>
              <Link to="/friends" className="text-xs font-bold text-primary-600 hover:underline">See all →</Link>
            </div>
            <div className="card space-y-3">
              {owedToMe.map(f => (
                <div key={f.friendship_id} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                    style={{ background: f.user.avatar_color }}
                  >
                    {avatarInitials(f.user.name)}
                  </div>
                  <p className="flex-1 truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>{f.user.name}</p>
                  <span className="text-sm font-extrabold text-positive">{formatCurrency(f.balance)}</span>
                  <button
                    onClick={() => alert(`Reminder sent to ${f.user.name}`)}
                    className="rounded-xl border px-2.5 py-1 text-[10px] font-bold transition hover:border-warning hover:text-warning"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    Remind 🔔
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* You owe */}
        {!friendsLoading && iOwe.length > 0 && (
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>You owe</p>
              <Link to="/friends" className="text-xs font-bold text-primary-600 hover:underline">See all →</Link>
            </div>
            <div className="card space-y-3">
              {iOwe.map(f => (
                <div key={f.friendship_id} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                    style={{ background: f.user.avatar_color }}
                  >
                    {avatarInitials(f.user.name)}
                  </div>
                  <p className="flex-1 truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>{f.user.name}</p>
                  <span className="text-sm font-extrabold text-negative">{formatCurrency(Math.abs(f.balance))}</span>
                  <button
                    onClick={() => navigate(`/settle-up/${f.user.id}`)}
                    className="rounded-xl bg-accent-500 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-accent-600"
                  >
                    Settle →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Recent Activity</p>
            <Link to="/activity" className="text-xs font-bold text-primary-600 hover:underline">See all →</Link>
          </div>

          {activityLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : activity.length === 0 ? (
            <div className="card py-8 text-center">
              <p className="text-3xl">📭</p>
              <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                No activity yet — add your first expense!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activity.map((item, i) => {
                const cat = item.type === 'expense' ? categoryMap[item.category] : null;
                return (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => item.type === 'expense' && navigate(`/expenses/${item.id}`)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 ${item.type === 'expense' ? 'cursor-pointer transition hover:border-primary-300' : ''}`}
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg dark:bg-primary-900/20">
                      {item.type === 'expense' ? (cat?.emoji ?? '📦') : '✅'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.description}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {item.group_name ? `${item.group_name} · ` : ''}
                        {formatDate(item.type === 'expense' ? item.date : item.created_at)}
                      </p>
                    </div>
                    <p className={`shrink-0 text-sm font-extrabold ${item.type === 'settlement' ? 'text-positive' : ''}`}
                      style={item.type === 'expense' ? { color: 'var(--text)' } : undefined}>
                      {formatCurrency(item.amount)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI insight */}
        <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, #0F4B70 0%, #0A3858 100%)' }}>
          <div className="mb-3 flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-white/80" />
            <p className="text-xs font-bold uppercase tracking-wide text-white/80">AI Insight</p>
          </div>
          <p className="text-sm font-semibold leading-relaxed text-white">{todayInsight}</p>
          <button
            onClick={() => navigate('/personal/ai-chat')}
            className="mt-4 rounded-xl bg-white/20 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/30"
          >
            Chat with AI →
          </button>
        </div>

      </div>
    </PageTransition>
  );
};
