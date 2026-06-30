import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { expensesAPI, type ExpenseListItem, EXPENSE_CATEGORIES } from '../services/api/expensesAPI';
import { balancesAPI } from '../services/api/balancesAPI';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

function avatarInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function expenseCategoryEmoji(cat: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === cat)?.emoji ?? '📦';
}

type TabType = 'expenses' | 'settlements';

export const FriendDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const userId: string = params?.userId;
  const { colors } = useTheme();
  const st = createStyles(colors);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', { with_user: userId }] });
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    }, [queryClient, userId])
  );

  const { data: balanceData, isLoading, refetch } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', { with_user: userId }],
    queryFn: () => expensesAPI.getExpenses({ with_user: userId }),
    enabled: !!userId,
  });

  const { data: settlements = [] } = useQuery({
    queryKey: ['settlements'],
    queryFn: balancesAPI.getSettlements,
    enabled: !!userId,
  });

  const friendBalance = (balanceData as any)?.balances?.find((b: any) => b.user.id === userId);
  const friend = friendBalance?.user;
  const balance = friendBalance?.balance ?? 0;

  // The API already returns only expenses shared with this friend (?with_user=).
  const friendExpenses = expenses as ExpenseListItem[];

  const friendSettlements = (settlements as any[]).filter(
    (s) => s.from_user?.id === userId || s.to_user?.id === userId
  );

  return (
    <SafeAreaView style={st.safe}>
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
          <Text style={st.backText}>←</Text>
        </TouchableOpacity>
        <Text style={st.title}>Friend Detail</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#00658E" />}
      >
        {/* Profile hero */}
        <View style={st.hero}>
          <View style={[st.avatar, { backgroundColor: friend?.avatar_color ?? '#00658E' }]}>
            <Text style={st.avatarText}>{avatarInitials(friend?.name ?? 'U')}</Text>
          </View>
          <Text style={st.friendName}>{friend?.name ?? '…'}</Text>
          <Text style={st.friendEmail}>{friend?.email ?? ''}</Text>

          {Math.abs(balance) < 0.01 ? (
            <View style={st.settledBadge}><Text style={st.settledText}>All settled up ✓</Text></View>
          ) : balance > 0 ? (
            <View style={st.owedBadge}>
              <Text style={st.owedText}>{friend?.name?.split(' ')[0]} owes you {formatCurrency(balance)}</Text>
            </View>
          ) : (
            <View style={st.oweBadge}>
              <Text style={st.oweText}>You owe {friend?.name?.split(' ')[0]} {formatCurrency(Math.abs(balance))}</Text>
            </View>
          )}

          {Math.abs(balance) >= 0.01 && (
            <TouchableOpacity
              style={st.settleBtn}
              onPress={() => navigation.navigate('SettleUp', { userId, friendName: friend?.name })}
            >
              <Text style={st.settleBtnText}>Settle Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab bar */}
        <View style={st.tabBar}>
          {(['expenses', 'settlements'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[st.tabBtn, activeTab === tab && st.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[st.tabLabel, activeTab === tab && st.tabLabelActive]}>
                {tab === 'expenses' ? `Expenses (${friendExpenses.length})` : `Settlements (${friendSettlements.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <View style={st.section}>
            {friendExpenses.length === 0 ? (
              <View style={st.empty}><Text style={st.emptyText}>No shared expenses yet</Text></View>
            ) : (
              friendExpenses.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={st.expRow}
                  onPress={() => navigation.navigate('ExpenseDetail', { expenseId: e.id })}
                  activeOpacity={0.8}
                >
                  <View style={st.expIcon}>
                    <Text style={{ fontSize: 18 }}>{expenseCategoryEmoji(e.category)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.expDesc}>{e.description}</Text>
                    <Text style={st.expMeta}>{e.paid_by.name.split(' ')[0]} paid · {formatDate(e.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={st.expAmount}>{formatCurrency(e.amount)}</Text>
                    {e.your_share > 0 && <Text style={st.expShare}>your: {formatCurrency(e.your_share)}</Text>}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Settlements Tab */}
        {activeTab === 'settlements' && (
          <View style={st.section}>
            {friendSettlements.length === 0 ? (
              <View style={st.empty}><Text style={st.emptyText}>No settlements yet</Text></View>
            ) : (
              friendSettlements.map((s: any) => {
                const isPaid = s.from_user?.id !== userId;
                return (
                  <View key={s.id} style={st.settlRow}>
                    <View style={[st.settlIcon, { backgroundColor: isPaid ? '#E8F3FA' : '#FEF2F2' }]}>
                      <Text style={{ fontSize: 18 }}>{isPaid ? '📥' : '📤'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.settlDesc}>
                        {isPaid ? `${friend?.name?.split(' ')[0]} paid you` : `You paid ${friend?.name?.split(' ')[0]}`}
                      </Text>
                      <Text style={st.settlDate}>{formatDate(s.created_at)}</Text>
                      {s.notes ? <Text style={st.settlNotes}>{s.notes}</Text> : null}
                    </View>
                    <Text style={[st.settlAmount, { color: isPaid ? '#16A34A' : '#DC2626' }]}>
                      {isPaid ? '+' : '-'}{formatCurrency(s.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: c.text },
  title: { fontSize: 17, fontWeight: '700', color: c.text },
  scroll: { paddingBottom: 100 },
  hero: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder },
  avatar: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#FFFFFF', fontSize: 26, fontWeight: '700' },
  friendName: { fontSize: 20, fontWeight: '800', color: c.text, fontFamily: 'Inter_700Bold' },
  friendEmail: { fontSize: 13, color: c.textSub, marginTop: 2, marginBottom: 14 },
  settledBadge: { backgroundColor: '#E8F3FA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#C4DFEF' },
  settledText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  owedBadge: { backgroundColor: '#E8F3FA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#C4DFEF' },
  owedText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  oweBadge: { backgroundColor: '#FEF2F2', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#FECACA' },
  oweText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  settleBtn: { backgroundColor: '#00658E', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12, marginTop: 14 },
  settleBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  tabBar: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder, backgroundColor: c.card },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#00658E' },
  tabLabel: { fontSize: 13, fontWeight: '600', color: c.textMuted },
  tabLabelActive: { color: '#00658E' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 12, marginBottom: 8 },
  expIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
  expDesc: { fontSize: 14, fontWeight: '700', color: c.text },
  expMeta: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  expAmount: { fontSize: 14, fontWeight: '800', color: c.text },
  expShare: { fontSize: 11, color: c.textSub, marginTop: 2 },
  settlRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 12, marginBottom: 8 },
  settlIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settlDesc: { fontSize: 14, fontWeight: '700', color: c.text },
  settlDate: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  settlNotes: { fontSize: 12, color: c.textSub, marginTop: 2 },
  settlAmount: { fontSize: 15, fontWeight: '800' },
  empty: { backgroundColor: c.pillBg, borderRadius: 14, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14, color: c.textMuted },
  });
}
