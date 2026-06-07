import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { expensesAPI, type ExpenseListItem, EXPENSE_CATEGORIES } from '../services/api/expensesAPI';
import { balancesAPI } from '../services/api/balancesAPI';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function expenseCategoryEmoji(cat: string) {
  return EXPENSE_CATEGORIES.find(c => c.value === cat)?.emoji ?? '📦';
}

export const FriendDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const userId: string = params?.userId;

  const { data: balanceData, isLoading, refetch } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', { with_user: userId }],
    queryFn: () => expensesAPI.getExpenses(),
    enabled: !!userId,
  });

  const friendBalance = balanceData?.balances.find(b => b.user.id === userId);
  const friend = friendBalance?.user;
  const balance = friendBalance?.balance ?? 0;

  const friendExpenses = (expenses as ExpenseListItem[]).filter(
    e => e.paid_by.id === userId || e.your_share > 0
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Friend Detail</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#1B4332" />}
      >
        {/* Profile hero */}
        <View style={s.hero}>
          <View style={[s.avatar, { backgroundColor: friend?.avatar_color ?? '#1B4332' }]}>
            <Text style={s.avatarText}>{avatarInitials(friend?.name ?? 'U')}</Text>
          </View>
          <Text style={s.friendName}>{friend?.name ?? '…'}</Text>
          <Text style={s.friendEmail}>{friend?.email ?? ''}</Text>

          {Math.abs(balance) < 0.01 ? (
            <View style={s.settledBadge}><Text style={s.settledText}>All settled up ✓</Text></View>
          ) : balance > 0 ? (
            <View style={s.owedBadge}>
              <Text style={s.owedText}>{friend?.name?.split(' ')[0]} owes you {formatCurrency(balance)}</Text>
            </View>
          ) : (
            <View style={s.oweBadge}>
              <Text style={s.oweText}>You owe {friend?.name?.split(' ')[0]} {formatCurrency(Math.abs(balance))}</Text>
            </View>
          )}

          {Math.abs(balance) >= 0.01 && (
            <TouchableOpacity
              style={s.settleBtn}
              onPress={() => navigation.navigate('SettleUp', { userId, friendName: friend?.name })}
            >
              <Text style={s.settleBtnText}>Settle Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shared expenses */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Shared Expenses</Text>
          {friendExpenses.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No shared expenses yet</Text>
            </View>
          ) : (
            friendExpenses.map(e => (
              <TouchableOpacity
                key={e.id}
                style={s.expRow}
                onPress={() => navigation.navigate('ExpenseDetail', { expenseId: e.id })}
                activeOpacity={0.8}
              >
                <View style={s.expIcon}>
                  <Text style={{ fontSize: 18 }}>{expenseCategoryEmoji(e.category)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.expDesc}>{e.description}</Text>
                  <Text style={s.expMeta}>{e.paid_by.name.split(' ')[0]} paid · {formatDate(e.date)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.expAmount}>{formatCurrency(e.amount)}</Text>
                  {e.your_share > 0 && (
                    <Text style={s.expShare}>your share: {formatCurrency(e.your_share)}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#111827' },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  scroll: { paddingBottom: 100 },
  hero: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4' },
  avatar: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#FFFFFF', fontSize: 26, fontWeight: '700' },
  friendName: { fontSize: 20, fontWeight: '800', color: '#111827', fontFamily: 'PlayfairDisplay_700Bold' },
  friendEmail: { fontSize: 13, color: '#6B7280', marginTop: 2, marginBottom: 14 },
  settledBadge: { backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#BBF7D0' },
  settledText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  owedBadge: { backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#BBF7D0' },
  owedText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  oweBadge: { backgroundColor: '#FEF2F2', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#FECACA' },
  oweText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  settleBtn: { backgroundColor: '#1B4332', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12, marginTop: 14 },
  settleBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', padding: 12, marginBottom: 8 },
  expIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  expDesc: { fontSize: 14, fontWeight: '700', color: '#111827' },
  expMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  expAmount: { fontSize: 14, fontWeight: '800', color: '#111827' },
  expShare: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  empty: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
