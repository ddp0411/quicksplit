import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useUserStore } from '../state/userStore';
import { balancesAPI } from '../services/api/balancesAPI';
import { groupsAPI } from '../services/api/groupsAPI';
import { friendsAPI } from '../services/api/friendsAPI';
import { activityAPI } from '../services/api/activityAPI';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';

const QUOTES = [
  { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
  { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
  { text: "Split the bill, share the memory.", author: "QuickSplit" },
  { text: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { text: "Friends who split bills together, stay together.", author: "QuickSplit" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  home: '🏠', trip: '✈️', couple: '❤️', work: '💼', event: '📅', other: '📁',
};
const CATEGORY_BG: Record<string, string> = {
  home: '#0EA5E9', trip: '#F59E0B', couple: '#EF4444', work: '#64748B', event: '#8B5CF6', other: '#1B4332',
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

  const todayQuote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

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

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Hero greeting card */}
        <LinearGradient
          colors={['#1B4332', '#163829']}
          style={s.heroCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={s.heroTop}>
            <Text style={s.heroGreeting}>
              {user ? getGreeting(user.name) : 'Welcome 👋'}
            </Text>
            <View style={s.heroAvatar}>
              <Text style={s.heroAvatarText}>
                {user?.name ? avatarInitials(user.name) : 'U'}
              </Text>
            </View>
          </View>
          <View style={s.quoteBlock}>
            <Text style={s.quoteText}>"{todayQuote.text}"</Text>
            <Text style={s.quoteAuthor}>— {todayQuote.author}</Text>
          </View>
        </LinearGradient>

        {/* Balance hero card */}
        <View style={s.balanceCard}>
          {balanceLoading ? (
            <ActivityIndicator color="rgba(255,255,255,0.6)" />
          ) : (
            <>
              <View style={s.balanceTop}>
                <View>
                  <Text style={s.balanceLabel}>
                    {(balance?.total_owed_to_you ?? 0) > 0
                      ? 'YOU ARE OWED'
                      : (balance?.total_you_owe ?? 0) > 0
                        ? 'YOU OWE'
                        : 'ALL SETTLED UP'}
                  </Text>
                  <Text style={s.balanceAmount}>
                    {(balance?.total_owed_to_you ?? 0) > 0
                      ? formatCurrency(balance?.total_owed_to_you ?? 0)
                      : (balance?.total_you_owe ?? 0) > 0
                        ? formatCurrency(balance?.total_you_owe ?? 0)
                        : '₹0.00'}
                  </Text>
                </View>
                <View style={s.balanceIcon}>
                  <Text style={{ fontSize: 20 }}>💼</Text>
                </View>
              </View>
              <View style={s.balanceSubrow}>
                <View style={s.balanceStat}>
                  <Text style={s.balanceStatLabel}>Net</Text>
                  <Text style={[s.balanceStatVal, { color: (balance?.net_balance ?? 0) >= 0 ? '#22C55E' : '#EF4444' }]}>
                    {(balance?.net_balance ?? 0) >= 0 ? '+' : ''}{formatCurrency(balance?.net_balance ?? 0)}
                  </Text>
                </View>
                <View style={s.divider} />
                <View style={s.balanceStat}>
                  <Text style={s.balanceStatLabel}>Owe you</Text>
                  <Text style={[s.balanceStatVal, { color: '#22C55E' }]}>
                    {formatCurrency(balance?.total_owed_to_you ?? 0)}
                  </Text>
                </View>
                <View style={s.divider} />
                <View style={s.balanceStat}>
                  <Text style={s.balanceStatLabel}>You owe</Text>
                  <Text style={[s.balanceStatVal, { color: '#EF4444' }]}>
                    {formatCurrency(balance?.total_you_owe ?? 0)}
                  </Text>
                </View>
                {(balance?.total_you_owe ?? 0) > 0 && (
                  <TouchableOpacity
                    style={s.settleBtn}
                    onPress={() => navigation.navigate('SettleUp')}
                  >
                    <Text style={s.settleBtnText}>Settle up →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {/* Quick actions */}
        <View style={s.quickActions}>
          {[
            { emoji: '➕', label: 'Add', bg: '#FF6B35', screen: 'AddExpense' },
            { emoji: '📷', label: 'Scan', bg: '#F59E0B', screen: 'Scan' },
            { emoji: '💸', label: 'Settle', bg: '#22C55E', screen: 'SettleUp' },
            { emoji: '👤', label: 'Friend', bg: '#8B5CF6', screen: 'AddFriend' },
          ].map(({ emoji, label, bg, screen }) => (
            <TouchableOpacity
              key={label}
              style={[s.quickBtn, { backgroundColor: bg }]}
              onPress={() => navigation.navigate(screen)}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
              <Text style={s.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Your Groups */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Your Groups</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
              <Text style={s.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {groupsLoading ? (
            <ActivityIndicator color="#1B4332" style={{ marginTop: 8 }} />
          ) : topGroups.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>No groups yet</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
                <Text style={s.seeAll}>+ Create</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {topGroups.map((group: any) => {
                const settled = Math.abs(group.your_balance) < 0.01;
                const emoji = CATEGORY_EMOJI[group.category] ?? '📁';
                const bgColor = CATEGORY_BG[group.category] ?? '#1B4332';
                return (
                  <TouchableOpacity
                    key={group.id}
                    style={s.groupCard}
                    onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                    activeOpacity={0.85}
                  >
                    <View style={[s.groupIcon, { backgroundColor: bgColor }]}>
                      <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    </View>
                    <Text style={s.groupName} numberOfLines={1}>{group.name}</Text>
                    {settled ? (
                      <View style={s.badge}><Text style={s.badgeSettled}>Settled</Text></View>
                    ) : group.your_balance > 0 ? (
                      <View style={s.badge}><Text style={s.badgeOwed}>owed {formatCurrency(group.your_balance)}</Text></View>
                    ) : (
                      <View style={s.badge}><Text style={s.badgeOwe}>owe {formatCurrency(Math.abs(group.your_balance))}</Text></View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Who owes you */}
        {!friendsLoading && owedToMe.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Who owes you</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
                <Text style={s.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={s.listCard}>
              {owedToMe.map((f: any, i: number) => (
                <View key={f.friendship_id} style={[s.listRow, i > 0 && s.listRowBorder]}>
                  <View style={[s.avatar, { backgroundColor: f.user.avatar_color }]}>
                    <Text style={s.avatarText}>{avatarInitials(f.user.name)}</Text>
                  </View>
                  <Text style={s.listName} numberOfLines={1}>{f.user.name}</Text>
                  <Text style={s.positiveAmt}>{formatCurrency(f.balance)}</Text>
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
                <Text style={s.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={s.listCard}>
              {iOwe.map((f: any, i: number) => (
                <View key={f.friendship_id} style={[s.listRow, i > 0 && s.listRowBorder]}>
                  <View style={[s.avatar, { backgroundColor: f.user.avatar_color }]}>
                    <Text style={s.avatarText}>{avatarInitials(f.user.name)}</Text>
                  </View>
                  <Text style={s.listName} numberOfLines={1}>{f.user.name}</Text>
                  <Text style={s.negativeAmt}>{formatCurrency(Math.abs(f.balance))}</Text>
                  <TouchableOpacity
                    style={s.settleSmallBtn}
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
          <View style={[s.section, { marginBottom: 32 }]}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
                <Text style={s.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={s.listCard}>
              {(activity as any[]).slice(0, 5).map((item: any, i: number) => (
                <View key={item.id ?? i} style={[s.listRow, i > 0 && s.listRowBorder]}>
                  <View style={s.activityIcon}>
                    <Text style={{ fontSize: 16 }}>
                      {item.type === 'expense_added' ? '💸' : item.type === 'settlement' ? '✅' : '🔔'}
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },

  heroCard: { borderRadius: 24, padding: 20, marginBottom: 12, shadowColor: '#1B4332', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  heroGreeting: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', fontFamily: 'PlayfairDisplay_700Bold' },
  heroAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  quoteBlock: { borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.35)', paddingLeft: 12 },
  quoteText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
  quoteAuthor: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '600', marginTop: 4 },

  balanceCard: { backgroundColor: '#1B4332', borderRadius: 24, padding: 20, marginBottom: 12, shadowColor: '#1B4332', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  balanceLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  balanceAmount: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', fontFamily: 'PlayfairDisplay_700Bold', marginTop: 4 },
  balanceIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  balanceSubrow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  balanceStat: { alignItems: 'flex-start' },
  balanceStatLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '600' },
  balanceStatVal: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  divider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  settleBtn: { marginLeft: 'auto' as any, backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 4 },
  settleBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  quickBtn: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 4 },
  quickLabel: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 12, fontWeight: '700', color: '#1B4332' },

  groupCard: { width: 140, borderWidth: 1.5, borderColor: '#E7E5E4', borderRadius: 16, padding: 12, backgroundColor: '#FFFFFF', gap: 8 },
  groupIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  groupName: { fontSize: 12, fontWeight: '700', color: '#111827' },
  badge: { alignSelf: 'flex-start' },
  badgeSettled: { fontSize: 10, fontWeight: '700', color: '#6B7280', backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeOwed: { fontSize: 10, fontWeight: '700', color: '#16A34A', backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeOwe: { fontSize: 10, fontWeight: '700', color: '#DC2626', backgroundColor: '#FEF2F2', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },

  emptyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E7E5E4' },
  emptyText: { fontSize: 14, color: '#6B7280' },

  listCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E5E4', paddingHorizontal: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  listRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E7E5E4' },
  avatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  listName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  positiveAmt: { fontSize: 14, fontWeight: '800', color: '#22C55E' },
  negativeAmt: { fontSize: 14, fontWeight: '800', color: '#EF4444' },
  settleSmallBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  settleSmallText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  activityIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontSize: 13, fontWeight: '600', color: '#111827' },
  activityDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
});
