import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const FEATURES = [
  {
    title: 'Smart OCR',
    body: 'Snap a photo and let our AI extract every item, tax and tip automatically.',
    icon: (c: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M4 8 V6 a2 2 0 0 1 2-2 h2 M16 4 h2 a2 2 0 0 1 2 2 v2 M20 16 v2 a2 2 0 0 1-2 2 h-2 M8 20 H6 a2 2 0 0 1-2-2 v-2" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M7 12 H17" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    title: 'Group Dynamics',
    body: 'Create persistent groups for roommates or travel buddies to track balances.',
    icon: (c: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="9" cy="8" r="3" stroke={c} strokeWidth="1.8" />
        <Path d="M3.5 19 c0-3 2.5-5 5.5-5 s5.5 2 5.5 5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <Circle cx="17.5" cy="7" r="2.4" stroke={c} strokeWidth="1.8" />
        <Path d="M15.5 13 c3-.3 5 1.6 5 4.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    title: 'Direct Pay',
    body: 'Settle up with one tap using your favourite UPI apps — GPay, PhonePe & more.',
    icon: (c: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="6" width="18" height="12" rx="3" stroke={c} strokeWidth="1.8" />
        <Path d="M3 10 H21" stroke={c} strokeWidth="1.8" />
        <Path d="M7 14 H11" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    ),
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient colors={['#DCEEFB', '#EAF4FC', '#F9F9FC']} style={s.flex}>
      <SafeAreaView style={s.flex}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.wordmark}>QuickSplit</Text>
            <TouchableOpacity style={s.headerBtn} onPress={() => navigation.replace('Register')} activeOpacity={0.85}>
              <Text style={s.headerBtnText}>Get Started</Text>
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={s.chip}>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <Path d="M12 3 L13.7 10.3 L21 12 L13.7 13.7 L12 21 L10.3 13.7 L3 12 L10.3 10.3 Z" fill="#00658E" />
            </Svg>
            <Text style={s.chipText}>AI-POWERED FINANCE</Text>
          </View>

          <Text style={s.h1}>Split smarter.{'\n'}Spend wiser.{'\n'}Pay instantly.</Text>
          <Text style={s.sub}>
            Experience the future of shared expenses. Our intelligent ledger automates
            calculations, manages balances, and settles debts with a single tap.
          </Text>

          <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.replace('Register')} activeOpacity={0.9}>
            <Text style={s.primaryBtnText}>Get Started Free  →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.replace('Login')} activeOpacity={0.85}>
            <Text style={s.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>

          {/* Social proof */}
          <View style={s.social}>
            <View style={s.avatarRow}>
              {['#00658E', '#4552C3', '#0093C4'].map((bg, i) => (
                <View key={i} style={[s.avatar, { backgroundColor: bg, marginLeft: i === 0 ? 0 : -10 }]} />
              ))}
            </View>
            <Text style={s.socialText}><Text style={s.socialBold}>15k+</Text> active splitters today</Text>
          </View>

          {/* Sample split card */}
          <View style={s.sampleCard}>
            <View style={s.sampleTop}>
              <View>
                <Text style={s.sampleLabel}>RECENT DINNER</Text>
                <Text style={s.sampleAmount}>₹284.50</Text>
              </View>
              <View style={s.paidPill}><Text style={s.paidPillText}>85% Paid</Text></View>
            </View>
            <Text style={s.sampleMeta}>Splitting with 4 friends</Text>
            <View style={s.track}><View style={[s.trackFill, { width: '85%' }]} /></View>
            <View style={s.sampleRow}>
              <View style={s.sampleStat}>
                <Text style={s.sampleStatLabel}>YOUR SHARE</Text>
                <Text style={s.sampleStatVal}>₹71.12</Text>
              </View>
              <View style={[s.sampleStat, s.sampleStatBlue]}>
                <Text style={[s.sampleStatLabel, { color: 'rgba(255,255,255,0.8)' }]}>PENDING</Text>
                <Text style={[s.sampleStatVal, { color: '#FFFFFF' }]}>₹42.00</Text>
              </View>
            </View>
          </View>

          {/* Features */}
          {FEATURES.map((f) => (
            <View key={f.title} style={s.featureCard}>
              <View style={s.featureIcon}>{f.icon('#00658E')}</View>
              <Text style={s.featureTitle}>{f.title}</Text>
              <Text style={s.featureBody}>{f.body}</Text>
            </View>
          ))}

          <Text style={s.copyright}>© 2026 QuickSplit. All rights reserved.</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  wordmark: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#16344A', letterSpacing: -0.4 },
  headerBtn: { backgroundColor: '#16344A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  headerBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#CFE4F2',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 18,
  },
  chipText: { fontSize: 11, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#00658E', letterSpacing: 0.5 },

  h1: { fontSize: 40, lineHeight: 46, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#16344A', letterSpacing: -1, marginTop: 16 },
  sub: { fontSize: 15, lineHeight: 23, color: '#5A6B78', fontFamily: 'Inter_400Regular', marginTop: 14 },

  primaryBtn: {
    backgroundColor: '#00658E', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 22,
    shadowColor: '#00658E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  secondaryBtn: {
    borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12,
    borderWidth: 1.5, borderColor: '#B9D7EA', backgroundColor: 'rgba(255,255,255,0.6)',
  },
  secondaryBtnText: { color: '#00658E', fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  social: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  avatarRow: { flexDirection: 'row' },
  avatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#FFFFFF' },
  socialText: { fontSize: 13, color: '#5A6B78', fontFamily: 'Inter_400Regular' },
  socialBold: { fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#16344A' },

  sampleCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginTop: 24,
    borderWidth: 1, borderColor: '#E7EEF4',
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 4,
  },
  sampleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sampleLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: '#8B98A4', fontFamily: 'Inter_700Bold' },
  sampleAmount: { fontSize: 28, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#16344A', marginTop: 2, letterSpacing: -0.5 },
  paidPill: { backgroundColor: '#E7F0F7', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  paidPillText: { fontSize: 11, fontWeight: '700', color: '#00658E', fontFamily: 'Inter_700Bold' },
  sampleMeta: { fontSize: 13, color: '#5A6B78', marginTop: 10, fontFamily: 'Inter_400Regular' },
  track: { height: 6, borderRadius: 3, backgroundColor: '#E8EEF3', marginTop: 8, overflow: 'hidden' },
  trackFill: { height: 6, borderRadius: 3, backgroundColor: '#00658E' },
  sampleRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  sampleStat: { flex: 1, backgroundColor: '#F3F6F9', borderRadius: 12, padding: 12 },
  sampleStatBlue: { backgroundColor: '#7FCDFF' },
  sampleStatLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: '#8B98A4', fontFamily: 'Inter_700Bold' },
  sampleStatVal: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#16344A', marginTop: 3 },

  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 18, padding: 18, marginTop: 14,
    borderWidth: 1, borderColor: '#E7EEF4', alignItems: 'flex-start',
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#E7F0F7',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  featureTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#16344A' },
  featureBody: { fontSize: 14, lineHeight: 21, color: '#5A6B78', fontFamily: 'Inter_400Regular', marginTop: 6 },

  copyright: { fontSize: 12, color: '#9AA8B2', textAlign: 'center', marginTop: 28, fontFamily: 'Inter_400Regular' },
});
