import React, { useMemo, useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';
import { balancesAPI } from '../services/api/balancesAPI';
import { groupsAPI } from '../services/api/groupsAPI';
import { friendsAPI } from '../services/api/friendsAPI';
import { activityAPI } from '../services/api/activityAPI';
import { expensesAPI } from '../services/api/expensesAPI';
import { SkeletonCard, SkeletonRow } from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';

const AI_INSIGHTS = [
  'You spent 23% more on food this month compared to last month 🍕',
  'Your biggest expense category this week is Transport 🚗',
  'You have 3 unsettled balances. Consider settling up soon! 💸',
  'Great job! You split 5 bills with friends this week 🎉',
  'Tip: Adding expenses right away helps keep balances accurate ✅',
  'Your group "Goa Trip" has outstanding balances — check in! 🏖️',
  'You owe money to 2 friends. Settle up to keep friendships smooth 😊',
  'Monthly reminder: Review your budgets to stay on track 📊',
  'Did you know? You can scan receipts with your camera 📷',
  'Keep splitting! Every shared expense tracked saves arguments later 🤝',
];

const CATEGORY_EMOJI: Record<string, string> = {
  home: '🏠', trip: '✈️', couple: '💑', work: '💼', event: '📅', other: '🎉',
};

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getGreeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${time}, ${name.split(' ')[0]} 👋`;
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { colors } = useTheme();
  const { toast } = useToastStore();
  const s = createStyles(colors);

  const sendReminder = async (friend: any) => {
    try {
      const expenses = await expensesAPI.getExpenses({ limit: 5 });
      const shared = (expenses as any[]).find(
        (e: any) => e.paid_by?.id !== user?.id &&
          e.shares?.some((s: any) => s.user?.id === friend.user?.id && !s.is_settled)
      );
      if (shared) {
        await (expensesAPI as any).addComment?.(shared.id, { content: `Hi ${friend.user.name.split(' ')[0]}, friendly reminder to settle up 🙏` });
      }
    } catch { /* silent — API may not have comments on all expenses */ }
    toast(`Reminder sent to ${friend.user.name.split(' ')[0]} 🔔`, 'success');
  };

  const todayInsight = useMemo(() => AI_INSIGHTS[new Date().getDate() % AI_INSIGHTS.length], []);

  // Local-only finance data (subscriptions + budgets) for the Spending Insights card.
  const [subsMonthly, setSubsMonthly] = useState(0);
  const [budgetInfo, setBudgetInfo] = useState<{ count: number; over: number }>({ count: 0, over: 0 });

  // NOTE: balance uses the shared ['balances'] key so writes elsewhere (AddExpense /
  // SettleUp) that invalidate ['balances'] also refresh Home.
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const { data: groups = [], isLoading: groupsLoading, refetch: refetchGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsAPI.getGroups,
  });

  const { data: friends = [], isLoading: friendsLoading, refetch: refetchFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: activity = [], isLoading: activityLoading, refetch: refetchActivity } = useQuery({
    queryKey: ['activity'],
    queryFn: () => activityAPI.getFeed(5),
  });

  const { data: myExpenses = [], refetch: refetchMyExpenses } = useQuery({
    queryKey: ['my-expenses'],
    queryFn: () => expensesAPI.getExpenses({ limit: 200 }),
  });

  useFocusEffect(
    useCallback(() => {
      refetchBalance();
      refetchGroups();
      refetchFriends();
      refetchActivity();
      refetchMyExpenses();
      // Subscriptions + budgets live only in AsyncStorage (same keys the Personal tools write).
      (async () => {
        try {
          const [subsRaw, budgetsRaw] = await Promise.all([
            AsyncStorage.getItem('qs-subscriptions'),
            AsyncStorage.getItem('qs-budgets'),
          ]);
          const subs: any[] = subsRaw ? JSON.parse(subsRaw) : [];
          setSubsMonthly(subs.reduce((sum, sub) => sum + (sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount), 0));
          const budgets: any[] = budgetsRaw ? JSON.parse(budgetsRaw) : [];
          setBudgetInfo({
            count: budgets.length,
            over: budgets.filter((b) => b.limit > 0 && b.spent >= b.limit).length,
          });
        } catch { /* ignore local read errors */ }
      })();
    }, [refetchBalance, refetchGroups, refetchFriends, refetchActivity, refetchMyExpenses])
  );

  // Current-month spend (sum of the user's share) split into personal (non-group) vs group.
  const { monthSpend, personalSpend, groupSpend } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    let personal = 0;
    let group = 0;
    for (const e of myExpenses as any[]) {
      const d = new Date(e.date + 'T00:00:00');
      if (d.getFullYear() !== y || d.getMonth() !== m) continue;
      const share = e.your_share ?? 0;
      if (e.group) group += share;
      else personal += share;
    }
    return { monthSpend: personal + group, personalSpend: personal, groupSpend: group };
  }, [myExpenses]);

  const topGroups = useMemo(
    () => [...groups].sort((a: any, b: any) => Math.abs(b.your_balance) - Math.abs(a.your_balance)).slice(0, 4),
    [groups],
  );

  const owedToMe = useMemo(
    () => friends.filter((f: any) => f.balance > 0.01).sort((a: any, b: any) => b.balance - a.balance).slice(0, 3),
    [friends],
  );

  const iOwe = useMemo(
    () => friends.filter((f: any) => f.balance < -0.01).sort((a: any, b: any) => a.balance - b.balance).slice(0, 3),
    [friends],
  );

  const net = balance?.net_balance ?? 0;
  const owed = balance?.total_owed_to_you ?? 0;
  const owe = balance?.total_you_owe ?? 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Top app bar */}
        <View style={s.appBar}>
          <View style={s.appBarLeft}>
            <TouchableOpacity
              style={s.appAvatar}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open account"
              onPress={() => navigation.navigate('Account')}
            >
              <Text style={s.appAvatarText}>{user?.name ? avatarInitials(user.name) : 'U'}</Text>
            </TouchableOpacity>
            <Text style={s.brand}>QuickSplit</Text>
          </View>
          <TouchableOpacity style={s.bellBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Activity')}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M6 9 a6 6 0 0 1 12 0 c0 5 2 6 2 6 H4 s2-1 2-6" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M10 20 a2 2 0 0 0 4 0" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <Text style={s.greeting}>{user ? getGreeting(user.name) : 'Welcome 👋'}</Text>

        {/* Total Balance card */}
        <LinearGradient
          colors={[colors.primarySoft, colors.card]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={s.balanceCard}
        >
          {balanceLoading ? (
            <View style={{ gap: 10 }}>
              <SkeletonRow width="40%" height={12} />
              <SkeletonRow width="65%" height={34} />
            </View>
          ) : (
            <>
              <Text style={s.balanceLabel}>TOTAL BALANCE</Text>
              <Text style={s.balanceAmount}>{net >= 0 ? '' : '-'}{formatCurrency(Math.abs(net))}</Text>
              <View style={s.trendRow}>
                <View style={[s.trendPill, { backgroundColor: net >= 0 ? colors.successBg : colors.errorBg }]}>
                  <Text style={[s.trendPillText, { color: net >= 0 ? colors.successText : colors.errorText }]}>
                    {net >= 0 ? "▲ you're ahead" : '▼ you owe overall'}
                  </Text>
                </View>
                <Text style={s.trendSub}>
                  {Math.abs(net) < 0.01 ? 'all settled up' : net >= 0 ? 'net owed to you' : 'net you owe'}
                </Text>
              </View>
            </>
          )}
        </LinearGradient>

        {/* You are owed card */}
        <TouchableOpacity
          style={s.splitCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Friends')}
        >
          <View style={s.splitTop}>
            <View style={[s.iconTile, { backgroundColor: colors.pillBg }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M7 17 L17 7 M9 7 H17 V15" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={s.chevron}>›</Text>
          </View>
          <Text style={s.splitLabel}>YOU ARE OWED</Text>
          <Text style={[s.splitAmount, { color: colors.successText }]}>{formatCurrency(owed)}</Text>
          {owedToMe.length > 0 && (
            <View style={s.avatarStack}>
              {owedToMe.map((f: any, i: number) => (
                <View key={f.friendship_id} style={[s.stackAvatar, { backgroundColor: f.user.avatar_color, marginLeft: i === 0 ? 0 : -8, borderColor: colors.card }]}>
                  <Text style={s.stackAvatarText}>{avatarInitials(f.user.name)}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* You owe card */}
        <TouchableOpacity
          style={s.splitCard}
          activeOpacity={0.85}
          onPress={() => owe > 0 ? navigation.navigate('SettleUp') : navigation.navigate('Friends')}
        >
          <View style={s.splitTop}>
            <View style={[s.iconTile, { backgroundColor: colors.errorBg }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M17 7 L7 17 M15 17 H7 V9" stroke={colors.errorText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={s.chevron}>›</Text>
          </View>
          <Text style={s.splitLabel}>YOU OWE</Text>
          <Text style={[s.splitAmount, { color: colors.errorText }]}>{formatCurrency(owe)}</Text>
          {owe > 0
            ? <Text style={s.splitMeta}>Tap to settle up →</Text>
            : <Text style={s.splitMeta}>You're all clear 🎉</Text>}
        </TouchableOpacity>

        {/* AI Insight Card */}
        <TouchableOpacity
          style={s.insightCard}
          onPress={() => navigation.navigate('Personal', { screen: 'AIChat' })}
          activeOpacity={0.85}
        >
          <View style={s.insightIcon}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 3 L13.7 10.3 L21 12 L13.7 13.7 L12 21 L10.3 13.7 L3 12 L10.3 10.3 Z" fill={colors.primary} />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.insightLabel}>AI INSIGHT</Text>
            <Text style={s.insightText} numberOfLines={2}>{todayInsight}</Text>
          </View>
          <Text style={s.insightCta}>Chat →</Text>
        </TouchableOpacity>

        {/* Spending Insights → full insights view (expenses + subscriptions + budgets) */}
        <TouchableOpacity
          style={s.insightsCard}
          onPress={() => navigation.navigate('Personal', { screen: 'SpendingInsights' })}
          activeOpacity={0.85}
        >
          <View style={s.insightsHeader}>
            <View style={s.spendLeft}>
              <View style={[s.iconTile, { backgroundColor: colors.tertiaryContainer }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M4 19 V5 M4 19 H20 M7 14.5 L11 10 L14 13 L19 7" stroke={colors.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View>
                <Text style={s.spendLabel}>SPENDING INSIGHTS</Text>
                <Text style={s.spendAmount}>
                  {formatCurrency(monthSpend)}<Text style={s.spendPeriod}> this month</Text>
                </Text>
              </View>
            </View>
            <Text style={s.spendCta}>View →</Text>
          </View>
          <View style={s.insightsStats}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{formatCurrency(personalSpend)}</Text>
              <Text style={s.statLabel}>Personal</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{formatCurrency(groupSpend)}</Text>
              <Text style={s.statLabel}>Groups</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{formatCurrency(subsMonthly)}</Text>
              <Text style={s.statLabel}>Subs/mo</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statValue, budgetInfo.over > 0 && { color: colors.errorText }]}>{budgetInfo.count}</Text>
              <Text style={s.statLabel}>{budgetInfo.over > 0 ? `${budgetInfo.over} over` : 'Budgets'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Active Groups */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Active Groups</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
              <Text style={s.seeAll}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          {groupsLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2].map((i) => <SkeletonCard key={i} height={72} />)}
            </View>
          ) : topGroups.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>No groups yet</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Groups', { screen: 'NewGroup' })}>
                <Text style={s.seeAll}>+ CREATE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.listCard}>
              {topGroups.map((group: any, i: number) => {
                const settled = Math.abs(group.your_balance) < 0.01;
                const emoji = CATEGORY_EMOJI[group.category] ?? '📁';
                return (
                  <TouchableOpacity
                    key={group.id}
                    style={[s.groupRow, i > 0 && s.rowBorder]}
                    onPress={() => navigation.navigate('Groups', { screen: 'GroupDetail', params: { groupId: group.id } })}
                    activeOpacity={0.8}
                  >
                    <View style={[s.iconTile, { backgroundColor: colors.pillBg }]}>
                      <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.groupName} numberOfLines={1}>{group.name}</Text>
                      <View style={s.track}>
                        <View style={[s.trackFill, { width: settled ? '100%' : '55%', backgroundColor: settled ? colors.successText : colors.primary }]} />
                      </View>
                    </View>
                    <Text style={[s.groupAmt, { color: settled ? colors.textMuted : group.your_balance > 0 ? colors.successText : colors.errorText }]}>
                      {settled ? 'Settled' : `${group.your_balance > 0 ? '+' : '-'}${formatCurrency(Math.abs(group.your_balance))}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Who owes you */}
        {!friendsLoading && owedToMe.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Who owes you</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
                <Text style={s.seeAll}>SEE ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={s.listCard}>
              {owedToMe.map((f: any, i: number) => (
                <View key={f.friendship_id} style={[s.listRow, i > 0 && s.rowBorder]}>
                  <View style={[s.avatar, { backgroundColor: f.user.avatar_color }]}>
                    <Text style={s.avatarText}>{avatarInitials(f.user.name)}</Text>
                  </View>
                  <Text style={s.listName} numberOfLines={1}>{f.user.name}</Text>
                  <Text style={[s.amtStrong, { color: colors.successText }]}>{formatCurrency(f.balance)}</Text>
                  <TouchableOpacity style={[s.remindBtn, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]} onPress={() => sendReminder(f)}>
                    <Text style={[s.remindBtnText, { color: colors.warningText }]}>🔔 Remind</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* You owe */}
        {!friendsLoading && iOwe.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>You owe</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
                <Text style={s.seeAll}>SEE ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={s.listCard}>
              {iOwe.map((f: any, i: number) => (
                <View key={f.friendship_id} style={[s.listRow, i > 0 && s.rowBorder]}>
                  <View style={[s.avatar, { backgroundColor: f.user.avatar_color }]}>
                    <Text style={s.avatarText}>{avatarInitials(f.user.name)}</Text>
                  </View>
                  <Text style={s.listName} numberOfLines={1}>{f.user.name}</Text>
                  <Text style={[s.amtStrong, { color: colors.errorText }]}>{formatCurrency(Math.abs(f.balance))}</Text>
                  <TouchableOpacity
                    style={[s.settleSmallBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('SettleUp', { userId: f.user.id })}
                  >
                    <Text style={s.settleSmallText}>Settle →</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        {!activityLoading && (activity as any[]).length > 0 && (
          <View style={[s.section, { marginBottom: 24 }]}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
                <Text style={s.seeAll}>SEE ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={s.listCard}>
              {(activity as any[]).slice(0, 5).map((item: any, i: number) => (
                <View key={item.id ?? i} style={[s.listRow, i > 0 && s.rowBorder]}>
                  <View style={[s.iconTile, { backgroundColor: colors.pillBg }]}>
                    <Text style={{ fontSize: 16 }}>
                      {item.type === 'expense' ? '💸' : item.type === 'settlement' ? '✅' : '🔔'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.activityTitle} numberOfLines={1}>{item.title ?? item.description ?? 'Activity'}</Text>
                    <Text style={s.activityDate}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    container: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },

    appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
    appBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    appAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    appAvatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    brand: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold', color: c.primary, letterSpacing: -0.4 },
    bellBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

    greeting: { fontSize: 14, color: c.textSub, fontFamily: 'Inter_500Medium', marginTop: 4, marginBottom: 14 },

    balanceCard: {
      borderRadius: 22, padding: 22, borderWidth: 1, borderColor: c.cardBorder, marginBottom: 14,
      shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 3,
    },
    balanceLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: c.textSub, fontFamily: 'Inter_700Bold' },
    balanceAmount: { fontSize: 44, fontWeight: '700', fontFamily: 'Inter_700Bold', color: c.primary, letterSpacing: -1.5, marginTop: 6 },
    trendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    trendPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    trendPillText: { fontSize: 12, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    trendSub: { fontSize: 13, color: c.textMuted, fontFamily: 'Inter_400Regular' },

    splitCard: {
      backgroundColor: c.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: c.cardBorder, marginBottom: 14,
      shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 2,
    },
    splitTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    chevron: { fontSize: 24, color: c.textMuted, fontWeight: '300' },
    splitLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: c.textSub, fontFamily: 'Inter_700Bold' },
    splitAmount: { fontSize: 30, fontWeight: '700', fontFamily: 'Inter_700Bold', letterSpacing: -0.8, marginTop: 4, color: c.text },
    splitMeta: { fontSize: 13, color: c.textMuted, marginTop: 8, fontFamily: 'Inter_400Regular' },
    avatarStack: { flexDirection: 'row', marginTop: 12 },
    stackAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    stackAvatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', fontFamily: 'Inter_700Bold' },

    iconTile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    insightCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder, padding: 14, marginBottom: 14,
    },
    insightIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
    insightLabel: { fontSize: 10, fontWeight: '700', color: c.textMuted, letterSpacing: 1, marginBottom: 3, fontFamily: 'Inter_700Bold' },
    insightText: { fontSize: 13, color: c.textSub, lineHeight: 18, fontFamily: 'Inter_400Regular' },
    insightCta: { fontSize: 13, fontWeight: '700', color: c.primary, marginLeft: 4, fontFamily: 'Inter_700Bold' },

    insightsCard: {
      backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder, padding: 14, marginBottom: 18,
    },
    insightsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    spendLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    spendLabel: { fontSize: 10, fontWeight: '700', color: c.textMuted, letterSpacing: 1, marginBottom: 3, fontFamily: 'Inter_700Bold' },
    spendAmount: { fontSize: 20, fontWeight: '700', color: c.text, fontFamily: 'Inter_700Bold' },
    spendPeriod: { fontSize: 12, fontWeight: '500', color: c.textMuted, fontFamily: 'Inter_400Regular' },
    spendCta: { fontSize: 13, fontWeight: '700', color: c.primary, marginLeft: 8, fontFamily: 'Inter_700Bold' },
    insightsStats: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.cardBorder },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 14, fontWeight: '700', color: c.text, fontFamily: 'Inter_700Bold' },
    statLabel: { fontSize: 10, color: c.textMuted, marginTop: 2, fontFamily: 'Inter_400Regular' },
    statDivider: { width: StyleSheet.hairlineWidth, height: 26, backgroundColor: c.cardBorder },

    section: { marginBottom: 18 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: c.text, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
    seeAll: { fontSize: 11, fontWeight: '700', color: c.primary, letterSpacing: 0.5, fontFamily: 'Inter_700Bold' },

    listCard: { backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder, paddingHorizontal: 14 },
    groupRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
    rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.cardBorder },
    groupName: { fontSize: 14, fontWeight: '600', color: c.text, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
    groupAmt: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    track: { height: 5, borderRadius: 3, backgroundColor: c.surfaceHigh, overflow: 'hidden' },
    trackFill: { height: 5, borderRadius: 3 },

    emptyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.cardBorder },
    emptyText: { fontSize: 14, color: c.textSub, fontFamily: 'Inter_400Regular' },

    listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
    avatar: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    listName: { flex: 1, fontSize: 14, fontWeight: '600', color: c.text, fontFamily: 'Inter_600SemiBold' },
    amtStrong: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    settleSmallBtn: { borderRadius: 9, paddingHorizontal: 11, paddingVertical: 6 },
    settleSmallText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    remindBtn: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1 },
    remindBtnText: { fontSize: 11, fontWeight: '700', fontFamily: 'Inter_700Bold' },

    activityTitle: { fontSize: 13, fontWeight: '600', color: c.text, fontFamily: 'Inter_600SemiBold' },
    activityDate: { fontSize: 11, color: c.textMuted, marginTop: 2, fontFamily: 'Inter_400Regular' },
  });
}
