import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../state/userStore';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

const CARDS = [
  { screen: 'AIChat', emoji: '🤖', title: 'AI Assistant', subtitle: 'Ask anything about your expenses', bg: '#EFF6FF', border: '#BFDBFE', accent: '#3B82F6' },
  { screen: 'BudgetDashboard', emoji: '📊', title: 'Budget Dashboard', subtitle: 'Track spending against your budget', bg: '#F0FDF4', border: '#BBF7D0', accent: '#22C55E' },
  { screen: 'SubscriptionTracker', emoji: '🔄', title: 'Subscriptions', subtitle: 'Manage recurring payments', bg: '#FFF7ED', border: '#FED7AA', accent: '#F97316' },
  { screen: 'SpendingInsights', emoji: '✨', title: 'Spending Insights', subtitle: 'See where your money goes', bg: '#FAF5FF', border: '#E9D5FF', accent: '#A855F7' },
];

function createStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
    greeting: { fontSize: 24, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold' },
    sub: { fontSize: 14, color: c.textSub, marginTop: 2 },
    scroll: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
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

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.greeting}>Personal Finance</Text>
        <Text style={s.sub}>Tools to help {firstName} spend smarter</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
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
      </ScrollView>
    </SafeAreaView>
  );
};
