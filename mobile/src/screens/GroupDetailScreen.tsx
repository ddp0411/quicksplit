import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsAPI } from '../services/api/groupsAPI';
import { expensesAPI, type ExpenseListItem, EXPENSE_CATEGORIES } from '../services/api/expensesAPI';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';

const CATEGORY_MAP: Record<string, { emoji: string; color: string }> = {
  home: { emoji: '🏠', color: '#10B981' },
  trip: { emoji: '✈️', color: '#6366F1' },
  couple: { emoji: '💑', color: '#EC4899' },
  work: { emoji: '💼', color: '#F59E0B' },
  other: { emoji: '🎉', color: '#1B4332' },
};

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function expenseCategoryEmoji(cat: string) {
  return EXPENSE_CATEGORIES.find(c => c.value === cat)?.emoji ?? '📦';
}

export const GroupDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const groupId: string = params?.groupId;

  const { data: group, isLoading: loadingGroup, refetch } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsAPI.getGroup(groupId),
    enabled: !!groupId,
  });

  const { data: balances } = useQuery({
    queryKey: ['group-balances', groupId],
    queryFn: () => groupsAPI.getBalances(groupId),
    enabled: !!groupId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', { group_id: groupId }],
    queryFn: () => expensesAPI.getExpenses({ group_id: groupId }),
    enabled: !!groupId,
  });

  const cat = group ? (CATEGORY_MAP[group.category] ?? CATEGORY_MAP.other) : CATEGORY_MAP.other;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.groupName} numberOfLines={1}>{group?.name ?? '…'}</Text>
          <Text style={s.groupCategory}>{cat.emoji} {group?.category ?? ''}</Text>
        </View>
        <TouchableOpacity
          style={s.addExpBtn}
          onPress={() => navigation.navigate('AddExpense', { groupId })}
        >
          <Text style={s.addExpText}>+ Expense</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={loadingGroup} onRefresh={refetch} tintColor="#1B4332" />}
      >
        {/* Members */}
        {group && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Members ({group.member_count})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.membersRow}>
              {group.members.map(m => (
                <View key={m.id} style={s.memberItem}>
                  <View style={[s.avatar, { backgroundColor: m.user.avatar_color }]}>
                    <Text style={s.avatarText}>{avatarInitials(m.user.name)}</Text>
                  </View>
                  <Text style={s.memberName} numberOfLines={1}>{m.user.name.split(' ')[0]}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Simplified debts */}
        {balances && balances.simplified_debts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Who owes who</Text>
            {balances.simplified_debts.map((d, i) => (
              <View key={i} style={s.debtRow}>
                <View style={[s.debtAvatar, { backgroundColor: d.from_user.avatar_color }]}>
                  <Text style={s.debtAvatarText}>{avatarInitials(d.from_user.name)}</Text>
                </View>
                <Text style={s.debtLabel}>
                  <Text style={{ fontWeight: '700' }}>{d.from_user.name.split(' ')[0]}</Text>
                  {' owes '}
                  <Text style={{ fontWeight: '700' }}>{d.to_user.name.split(' ')[0]}</Text>
                </Text>
                <Text style={s.debtAmount}>{formatCurrency(d.amount)}</Text>
              </View>
            ))}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total group spending</Text>
              <Text style={s.totalAmount}>{formatCurrency(balances.total_expenses)}</Text>
            </View>
          </View>
        )}

        {/* Expenses */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Expenses ({(expenses as ExpenseListItem[]).length})</Text>
          {(expenses as ExpenseListItem[]).length === 0 ? (
            <View style={s.expEmpty}>
              <Text style={s.expEmptyText}>No expenses yet. Add the first one!</Text>
            </View>
          ) : (
            (expenses as ExpenseListItem[]).map(e => (
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
                  <Text style={s.expMeta}>
                    {e.paid_by.name.split(' ')[0]} paid · {formatDate(e.date)}
                  </Text>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#111827' },
  groupName: { fontSize: 17, fontWeight: '800', color: '#111827', fontFamily: 'PlayfairDisplay_700Bold' },
  groupCategory: { fontSize: 12, color: '#6B7280', marginTop: 1, textTransform: 'capitalize' },
  addExpBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  addExpText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  scroll: { paddingBottom: 100 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  membersRow: { marginHorizontal: -4 },
  memberItem: { alignItems: 'center', marginHorizontal: 6, width: 52 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  memberName: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  debtRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFBEB', borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A', padding: 12, marginBottom: 8 },
  debtAvatar: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  debtAvatarText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  debtLabel: { flex: 1, fontSize: 13, color: '#374151' },
  debtAmount: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E7E5E4' },
  totalLabel: { fontSize: 13, color: '#6B7280' },
  totalAmount: { fontSize: 14, fontWeight: '700', color: '#111827' },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', padding: 12, marginBottom: 8 },
  expIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  expDesc: { fontSize: 14, fontWeight: '700', color: '#111827' },
  expMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  expAmount: { fontSize: 14, fontWeight: '800', color: '#111827' },
  expShare: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  expEmpty: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 20, alignItems: 'center' },
  expEmptyText: { fontSize: 14, color: '#9CA3AF' },
});
