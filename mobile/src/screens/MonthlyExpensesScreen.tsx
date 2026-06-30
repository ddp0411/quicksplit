import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { expensesAPI, type ExpenseListItem, EXPENSE_CATEGORIES } from '../services/api/expensesAPI';
import { SkeletonRow } from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/upi';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function categoryEmoji(cat: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === cat)?.emoji ?? '📦';
}

interface MonthSection {
  key: string;          // `${year}-${month}`
  year: number;
  month: number;        // 0-11
  title: string;        // "June 2026"
  total: number;        // sum of the user's share
  data: ExpenseListItem[];
}

export const MonthlyExpensesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createStyles(colors);

  // Default filter: ALL months + ALL years.
  const [yearFilter, setYearFilter] = useState<'all' | number>('all');
  const [monthFilter, setMonthFilter] = useState<'all' | number>('all');

  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ['my-expenses'],
    queryFn: () => expensesAPI.getExpenses({ limit: 200 }),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Distinct years present in the data, newest first — for the year filter pills.
  const years = useMemo(() => {
    const set = new Set<number>();
    (expenses as ExpenseListItem[]).forEach((e) => {
      const y = new Date(e.date + 'T00:00:00').getFullYear();
      if (!Number.isNaN(y)) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [expenses]);

  // Group into month sections, most-recent month first; rows newest-first within a month.
  const sections = useMemo<MonthSection[]>(() => {
    const map = new Map<string, MonthSection>();
    for (const e of expenses as ExpenseListItem[]) {
      const d = new Date(e.date + 'T00:00:00');
      const year = d.getFullYear();
      const month = d.getMonth();
      if (Number.isNaN(year)) continue;
      if (yearFilter !== 'all' && year !== yearFilter) continue;
      if (monthFilter !== 'all' && month !== monthFilter) continue;
      const key = `${year}-${month}`;
      const spend = e.your_share ?? 0;
      if (!map.has(key)) {
        map.set(key, { key, year, month, title: `${MONTHS[month]} ${year}`, total: 0, data: [] });
      }
      const section = map.get(key)!;
      section.data.push(e);
      section.total += spend;
    }
    const out = Array.from(map.values());
    out.sort((a, b) => (b.year - a.year) || (b.month - a.month));
    out.forEach((sec) =>
      sec.data.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    );
    return out;
  }, [expenses, yearFilter, monthFilter]);

  const grandTotal = useMemo(
    () => sections.reduce((sum, sec) => sum + sec.total, 0),
    [sections]
  );

  const renderFilterPills = () => (
    <View style={s.filters}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
        {(['all', ...years] as ('all' | number)[]).map((y) => (
          <TouchableOpacity
            key={String(y)}
            style={[s.pill, yearFilter === y && s.pillActive]}
            onPress={() => setYearFilter(y)}
          >
            <Text style={[s.pillText, yearFilter === y && s.pillTextActive]}>
              {y === 'all' ? 'All years' : y}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
        {(['all', ...Array.from({ length: 12 }, (_, i) => i)] as ('all' | number)[]).map((m) => (
          <TouchableOpacity
            key={String(m)}
            style={[s.pill, monthFilter === m && s.pillActive]}
            onPress={() => setMonthFilter(m)}
          >
            <Text style={[s.pillText, monthFilter === m && s.pillTextActive]}>
              {m === 'all' ? 'All months' : MONTHS[m as number].slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>My Expenses</Text>
          <Text style={s.subtitle}>
            {formatCurrency(grandTotal)} · {yearFilter === 'all' && monthFilter === 'all'
              ? 'all time'
              : 'filtered'}
          </Text>
        </View>
        <TouchableOpacity style={s.toolsBtn} onPress={() => navigation.navigate('PersonalHub')}>
          <Text style={s.toolsBtnText}>Tools</Text>
        </TouchableOpacity>
      </View>

      {renderFilterPills()}

      {isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 10, marginTop: 12 }}>
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} width="100%" height={56} />)}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🧾</Text>
              <Text style={s.emptyTitle}>No expenses {monthFilter !== 'all' || yearFilter !== 'all' ? 'for this filter' : 'yet'}</Text>
              <Text style={s.emptySub}>Add an expense and it'll show up here, grouped by month.</Text>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{(section as MonthSection).title}</Text>
              <Text style={s.sectionTotal}>{formatCurrency((section as MonthSection).total)}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.row}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
            >
              <View style={s.rowIcon}>
                <Text style={{ fontSize: 18 }}>{categoryEmoji(item.category)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowDesc} numberOfLines={1}>{item.description}</Text>
                {item.group_name ? (
                  <Text style={s.rowMeta} numberOfLines={1}>{item.group_name}</Text>
                ) : null}
              </View>
              <Text style={s.rowAmount}>{formatCurrency(item.your_share ?? 0)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
    title: { fontSize: 24, fontWeight: '800', color: c.text, fontFamily: 'Inter_700Bold' },
    subtitle: { fontSize: 13, color: c.textSub, marginTop: 2 },
    toolsBtn: { backgroundColor: c.pillBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    toolsBtnText: { fontSize: 13, fontWeight: '700', color: c.sectionLabel },
    filters: { gap: 8, paddingBottom: 8 },
    pillRow: { paddingHorizontal: 20, gap: 8 },
    pill: { backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'transparent' },
    pillActive: { backgroundColor: '#E8F3FA', borderColor: '#00658E' },
    pillText: { fontSize: 13, fontWeight: '600', color: c.textSub },
    pillTextActive: { color: '#00658E' },
    list: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 4 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 8 },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: c.text },
    sectionTotal: { fontSize: 14, fontWeight: '800', color: c.primary },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 12, marginBottom: 8 },
    rowIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
    rowDesc: { fontSize: 14, fontWeight: '700', color: c.text },
    rowMeta: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    rowAmount: { fontSize: 14, fontWeight: '800', color: c.text },
    empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 },
    emptySub: { fontSize: 14, color: c.textSub, textAlign: 'center', lineHeight: 20 },
  });
}
