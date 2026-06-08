import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../state/userStore';
import { useTheme } from '../theme/useTheme';
import { activityAPI } from '../services/api/activityAPI';
import { formatCurrency } from '../utils/upi';

type C = ReturnType<typeof useTheme>['colors'];

const CARDS = [
  { screen: 'AIChat', emoji: '🤖', title: 'AI Assistant', subtitle: 'Ask anything about your expenses', bg: '#EFF6FF', border: '#BFDBFE', accent: '#3B82F6' },
  { screen: 'BudgetDashboard', emoji: '📊', title: 'Budget Dashboard', subtitle: 'Track spending against your budget', bg: '#F0FDF4', border: '#BBF7D0', accent: '#22C55E' },
  { screen: 'SubscriptionTracker', emoji: '🔄', title: 'Subscriptions', subtitle: 'Manage recurring payments', bg: '#FFF7ED', border: '#FED7AA', accent: '#F97316' },
  { screen: 'SpendingInsights', emoji: '✨', title: 'Spending Insights', subtitle: 'See where your money goes', bg: '#FAF5FF', border: '#E9D5FF', accent: '#A855F7' },
];

function MiniBarChart({ data, maxHeight = 40 }: { data: number[]; maxHeight?: number }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: maxHeight }}>
      {data.map((val, i) => {
        const h = Math.max(4, Math.round((val / max) * maxHeight));
        const isToday = i === data.length - 1;
        return (
          <View
            key={i}
            style={{
              flex: 1, height: h, borderRadius: 4,
              backgroundColor: isToday ? '#FF6B35' : 'rgba(255,255,255,0.5)',
            }}
          />
        );
      })}
    </View>
  );
}

function createStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
    greeting: { fontSize: 24, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold' },
    sub: { fontSize: 14, color: c.textSub, marginTop: 2 },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    sparkCard: { backgroundColor: '#1B4332', borderRadius: 20, padding: 20, marginBottom: 20 },
    sparkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    sparkLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '700', letterSpacing: 1 },
    sparkTotal: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 4, fontFamily: 'PlayfairDisplay_700Bold' },
    sparkDays: { fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'right' },
    sparkDayLabels: { flexDirection: 'row', gap: 4, marginTop: 6 },
    sparkDayLabel: { flex: 1, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
    cardsGap: { gap: 12 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, borderWidth: 1.5, padding: 18 },
    iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    cardEmoji: { fontSize: 26 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: c.text },
    cardSub: { fontSize: 13, color: c.textSub, marginTop: 2 },
    arrow: { fontSize: 20, fontWeight: '700' },
  });
}

export const PersonalScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const firstName = user?.name?.split(' ')[0] ?? 'You';

  const { data: activity = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: () => activityAPI.getFeed(50),
  });

  const { dailySpend, totalThisWeek, dayLabels } = useMemo(() => {
    const now = new Date();
    const days: number[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
      labels.push(['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()]);
    }
    const spend: number[] = days.map((day) =>
      (activity as any[])
        .filter((a: any) => a.type === 'expense_added' && a.created_at?.startsWith(day))
        .reduce((sum: number, a: any) => sum + (parseFloat(a.amount) || 0), 0)
    );
    return { dailySpend: spend, totalThisWeek: spend.reduce((a, b) => a + b, 0), dayLabels: labels };
  }, [activity]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.greeting}>Personal Finance</Text>
        <Text style={s.sub}>Tools to help {firstName} spend smarter</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Sparkline hero */}
        <View style={s.sparkCard}>
          <View style={s.sparkHeader}>
            <View>
              <Text style={s.sparkLabel}>THIS WEEK</Text>
              <Text style={s.sparkTotal}>{formatCurrency(totalThisWeek)}</Text>
            </View>
            <Text style={s.sparkDays}>Last 7 days</Text>
          </View>
          <MiniBarChart data={dailySpend} maxHeight={48} />
          <View style={s.sparkDayLabels}>
            {dayLabels.map((l, i) => (
              <Text key={i} style={s.sparkDayLabel}>{l}</Text>
            ))}
          </View>
        </View>

        <View style={s.cardsGap}>
          {CARDS.map(card => (
            <TouchableOpacity
              key={card.screen}
              style={[s.card, { backgroundColor: card.bg, borderColor: card.border }]}
              onPress={() => navigation.navigate(card.screen)}
              activeOpacity={0.8}
            >
              <View style={[s.iconBox, { backgroundColor: card.accent + '22' }]}>
                <Text style={s.cardEmoji}>{card.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{card.title}</Text>
                <Text style={s.cardSub}>{card.subtitle}</Text>
              </View>
              <Text style={[s.arrow, { color: card.accent }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
