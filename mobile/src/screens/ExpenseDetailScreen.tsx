import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { expensesAPI, EXPENSE_CATEGORIES } from '../services/api/expensesAPI';
import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const expenseId: string = params?.expenseId;
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const { toast } = useToastStore();

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => expensesAPI.getExpense(expenseId),
    enabled: !!expenseId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => expensesAPI.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      toast('Expense deleted', 'success');
      navigation.goBack();
    },
    onError: () => toast('Failed to delete expense', 'error'),
  });

  const handleDelete = () => {
    Alert.alert('Delete expense', 'This will affect all balances. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const catInfo = EXPENSE_CATEGORIES.find(c => c.value === expense?.category);
  const isPayer = expense?.paid_by.id === user?.id;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Expense Detail</Text>
        {isPayer ? (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={s.deleteText}>Delete</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 48 }} />}
      </View>

      {isLoading || !expense ? (
        <View style={s.loading}><Text style={s.loadingText}>Loading…</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll}>
          {/* Hero */}
          <View style={s.hero}>
            <View style={s.heroIcon}>
              <Text style={{ fontSize: 32 }}>{catInfo?.emoji ?? '📦'}</Text>
            </View>
            <Text style={s.heroDesc}>{expense.description}</Text>
            <Text style={s.heroAmount}>{formatCurrency(expense.amount)}</Text>
            <Text style={s.heroMeta}>
              {expense.paid_by.name} paid · {formatDate(expense.date)}
            </Text>
            {expense.group_name && (
              <View style={s.groupPill}>
                <Text style={s.groupPillText}>🏠 {expense.group_name}</Text>
              </View>
            )}
          </View>

          {/* Shares */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Split ({expense.shares.length} people)</Text>
            {expense.shares.map(share => (
              <View key={share.id} style={s.shareRow}>
                <View style={[s.avatar, { backgroundColor: share.user.avatar_color }]}>
                  <Text style={s.avatarText}>{avatarInitials(share.user.name)}</Text>
                </View>
                <Text style={s.shareName}>{share.user.name}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.shareAmount}>{formatCurrency(share.amount_owed)}</Text>
                  {share.is_settled ? (
                    <Text style={s.settled}>Settled ✓</Text>
                  ) : (
                    <Text style={s.unsettled}>Pending</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Notes */}
          {expense.notes ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Notes</Text>
              <Text style={s.notes}>{expense.notes}</Text>
            </View>
          ) : null}

          {/* Meta */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Details</Text>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Split type</Text>
              <Text style={s.metaValue}>{expense.split_type}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Category</Text>
              <Text style={s.metaValue}>{catInfo?.label ?? expense.category}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Added by</Text>
              <Text style={s.metaValue}>{expense.created_by.name}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#111827' },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  deleteText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#9CA3AF' },
  scroll: { paddingBottom: 100 },
  hero: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4' },
  heroIcon: { width: 68, height: 68, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroDesc: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center', fontFamily: 'PlayfairDisplay_700Bold' },
  heroAmount: { fontSize: 32, fontWeight: '800', color: '#1B4332', marginTop: 6 },
  heroMeta: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  groupPill: { backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 10, borderWidth: 1, borderColor: '#BBF7D0' },
  groupPillText: { fontSize: 12, color: '#166534', fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', padding: 12, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  shareName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  shareAmount: { fontSize: 14, fontWeight: '700', color: '#111827' },
  settled: { fontSize: 11, color: '#16A34A', marginTop: 2 },
  unsettled: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  notes: { fontSize: 14, color: '#374151', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  metaLabel: { fontSize: 14, color: '#6B7280' },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#111827', textTransform: 'capitalize' },
});
