import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activityAPI, type ActivityItem } from '../services/api/activityAPI';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

const TYPE_ICONS: Record<string, string> = {
  expense: '💸',
  settlement: '✅',
};

function createStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 18, color: c.text },
    title: { fontSize: 17, fontWeight: '700', color: c.text },
    list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 12, marginBottom: 8 },
    iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
    desc: { fontSize: 14, fontWeight: '700', color: c.text },
    meta: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    amount: { fontSize: 14, fontWeight: '800', color: c.text },
    share: { fontSize: 11, color: c.textSub, marginTop: 2 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 },
    emptySub: { fontSize: 14, color: c.textSub, textAlign: 'center' },
  });
}

export const ActivityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const { data: feed = [], isLoading, refetch } = useQuery({
    queryKey: ['activity'],
    queryFn: () => activityAPI.getFeed(50),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#00658E" />}
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
