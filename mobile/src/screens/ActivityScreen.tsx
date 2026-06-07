import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activityAPI, type ActivityItem } from '../services/api/activityAPI';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';

const TYPE_ICONS: Record<string, string> = {
  expense: '💸',
  settlement: '✅',
};

export const ActivityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { data: feed = [], isLoading, refetch } = useQuery({
    queryKey: ['activity'],
    queryFn: () => activityAPI.getFeed(50),
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Activity</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={feed as ActivityItem[]}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#1B4332" />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>📋</Text>
              <Text style={s.emptyTitle}>No activity yet</Text>
              <Text style={s.emptySub}>Your expense history will appear here</Text>
            </View>
          ) : null
        }
        renderItem={({ item: a }) => (
          <TouchableOpacity
            style={s.row}
            onPress={() => a.type === 'expense' && navigation.navigate('ExpenseDetail', { expenseId: a.id })}
            activeOpacity={0.8}
          >
            <View style={s.iconBox}>
              <Text style={{ fontSize: 20 }}>{TYPE_ICONS[a.type] ?? '📦'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.desc}>{a.description}</Text>
              <Text style={s.meta}>
                {a.group_name ? `${a.group_name} · ` : ''}{formatDate(a.date)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.amount}>{formatCurrency(a.amount)}</Text>
              {a.your_share > 0 && a.type === 'expense' && (
                <Text style={s.share}>your share: {formatCurrency(a.your_share)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
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
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', padding: 12, marginBottom: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  desc: { fontSize: 14, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '800', color: '#111827' },
  share: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
