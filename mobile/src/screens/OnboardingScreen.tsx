import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

const SLIDES = [
  { emoji: '🍕', title: 'Split bills effortlessly', body: 'Add expenses on the go and split with friends in seconds.' },
  { emoji: '👥', title: 'Track group debts', body: 'See who owes what at a glance across all your groups.' },
  { emoji: '⚡', title: 'Settle instantly', body: 'Pay back friends via UPI — GPay, PhonePe, or cash.' },
  { emoji: '🤖', title: 'AI-powered insights', body: 'Get smart spending summaries and split suggestions.' },
  { emoji: '📸', title: 'Scan any receipt', body: 'Photograph a bill and let QuickSplit split it automatically.' },
];

type C = ReturnType<typeof useTheme>['colors'];

function createStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 24 },
    skip: { alignSelf: 'flex-end', paddingTop: 8, paddingBottom: 4 },
    skipText: { color: c.textSub, fontSize: 14, fontWeight: '600' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 80, marginBottom: 24 },
    title: { fontSize: 26, fontWeight: '800', color: c.text, textAlign: 'center', fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 12 },
    body: { fontSize: 16, color: c.textSub, textAlign: 'center', lineHeight: 24, maxWidth: 300 },
    dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 28 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.cardBorder },
    dotActive: { width: 24, backgroundColor: '#FF6B35' },
    btn: {
      backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 16,
      alignItems: 'center', marginBottom: 16,
      shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
    },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [idx, setIdx] = useState(0);

  const next = () => {
    if (idx < SLIDES.length - 1) setIdx(i => i + 1);
    else navigation.replace('Login');
  };

  const skip = () => navigation.replace('Login');
  const slide = SLIDES[idx];

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.skip} onPress={skip}>
        <Text style={s.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={s.content}>
        <Text style={s.emoji}>{slide.emoji}</Text>
        <Text style={s.title}>{slide.title}</Text>
        <Text style={s.body}>{slide.body}</Text>
      </View>

      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === idx && s.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={next} activeOpacity={0.85}>
        <Text style={s.btnText}>
          {idx === SLIDES.length - 1 ? 'Get started' : 'Continue →'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
