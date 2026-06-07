import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { balancesAPI, type BalanceWithUser } from '../services/api/balancesAPI';
import { formatCurrency } from '../utils/upi';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const BalancesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const owedToYou = (data?.balances ?? []).filter(b => b.balance > 0.01);
  const youOwe = (data?.balances ?? []).filter(b => b.balance < -0.01);

  function BalanceRow({ item, type }: { item: BalanceWithUser; type: 'owed' | 'owe' }) {
    const isOwed = type === 'owed';
    return (
      <View style={s.row}>
        <View style={[s.avatar, { backgroundColor: item.user.avatar_color }]}>
          <Text style={s.avatarText}>{avatarInitials(item.user.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{item.user.name}</Text>
          <Text style={[s.label, { color: isOwed ? '#16A34A' : '#DC2626' }]}>
            {isOwed ? 'Owes you' : 'You owe'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text style={[s.amount, { color: isOwed ? '#16A34A' : '#DC2626' }]}>
            {formatCurrency(Math.abs(item.balance))}
          </Text>
          {!isOwed && (
            <TouchableOpacity
              style={s.settleBtn}
              onPress={() => navigation.navigate('SettleUp', { userId: item.user.id, friendName: item.user.name })}
            >
              <Text style={s.settleBtnText}>Settle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Balances</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary bar */}
      {data && (
        <View style={s.summary}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Owed to you</Text>
            <Text style={[s.summaryAmount, { color: '#16A34A' }]}>{formatCurrency(data.total_owed_to_you)}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>You owe</Text>
            <Text style={[s.summaryAmount, { color: '#DC2626' }]}>{formatCurrency(data.total_you_owe)}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Net balance</Text>
            <Text style={[s.summaryAmount, { color: data.net_balance >= 0 ? '#16A34A' : '#DC2626' }]}>
              {data.net_balance >= 0 ? '+' : ''}{formatCurrency(data.net_balance)}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={[...owedToYou, ...youOwe]}
        keyExtractor={item => item.user.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#1B4332" />}
        ListHeaderComponent={
          <>
            {owedToYou.length > 0 && <Text style={s.sectionTitle}>Owed to you ({owedToYou.length})</Text>}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>⚖️</Text>
              <Text style={s.emptyTitle}>All settled up!</Text>
              <Text style={s.emptySub}>No outstanding balances</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const isFirstYouOwe = index === owedToYou.length && youOwe.length > 0;
          return (
            <>
              {isFirstYouOwe && <Text style={[s.sectionTitle, { marginTop: 16 }]}>You owe ({youOwe.length})</Text>}
              <BalanceRow item={item} type={item.balance > 0 ? 'owed' : 'owe'} />
            </>
          );
        }}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#111827' },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  summary: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4', paddingVertical: 16 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  summaryAmount: { fontSize: 16, fontWeight: '800' },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: '#E7E5E4' },
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', padding: 14, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '700', color: '#111827' },
  label: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800' },
  settleBtn: { backgroundColor: '#1B4332', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  settleBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#6B7280' },
});
