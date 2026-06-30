import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Ocean Breeze (Stitch onboarding) tokens — light, pre-auth.
const C = {
  surface: '#F9F9FC',
  card: '#FFFFFF',
  primary: '#00658E',
  primaryContainer: '#7FCDFF',
  onPrimaryContainer: '#00577B',
  primaryFixed: '#C7E7FF',
  tertiary: '#4552C3',
  tertiaryContainer: '#BAC0FF',
  tertiaryFixed: '#DFE0FF',
  secondaryContainer: '#CCE4EC',
  onSecondaryContainer: '#50666D',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#40484E',
  outline: '#70787F',
  outlineVariant: '#BFC7CF',
  surfaceVariant: '#E2E2E5',
  surfaceLow: '#F3F3F6',
  surfaceHigh: '#E8E8EA',
  glass: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.5)',
};

const AVA = ['#00658E', '#4552C3', '#0093C4', '#7FCDFF'];
const INI = ['A', 'R', 'S', 'M'];

/* ───────────────────────── icons ───────────────────────── */

const Sparkle = ({ c = C.tertiary, s = 16 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M12 3 L13.6 9.4 L20 11 L13.6 12.6 L12 19 L10.4 12.6 L4 11 L10.4 9.4 Z" fill={c} />
  </Svg>
);

const TrendDown = ({ c = C.onPrimaryContainer, s = 18 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M4 7 L10 13 L13 10 L20 17" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M20 12 V17 H15" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Group = ({ c = '#FFFFFF', s = 22 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Circle cx="9" cy="8" r="3.4" fill={c} />
    <Path d="M3.4 19 c0-3.1 2.6-5.2 5.6-5.2 s5.6 2.1 5.6 5.2 Z" fill={c} />
    <Circle cx="17.4" cy="8.6" r="2.7" fill={c} opacity={0.72} />
    <Path d="M15.6 14.2 c2.9-.5 5.2 1.6 5.2 4.8 Z" fill={c} opacity={0.72} />
  </Svg>
);

const Card = ({ c = C.onPrimaryContainer, s = 18 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Rect x="3" y="6" width="18" height="12" rx="2.5" fill={c} />
    <Rect x="3" y="9.2" width="18" height="2" fill="#FFFFFF" opacity={0.85} />
    <Rect x="6" y="14" width="5" height="1.8" rx="0.9" fill="#FFFFFF" opacity={0.7} />
  </Svg>
);

const ReceiptLong = ({ c = C.primary, s = 20 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M6 3 h12 v18 l-2-1.3 -2 1.3 -2-1.3 -2 1.3 -2-1.3 -2 1.3 Z" fill="none" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
    <Path d="M9 8 H15 M9 11 H15 M9 14 H13" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
  </Svg>
);

const CheckCircle = ({ c = C.onSecondaryContainer, s = 20 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" fill={c} />
    <Path d="M8 12.4 L11 15.4 L16 9.6" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Wallet = ({ c = '#FFFFFF', s = 22 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Rect x="3" y="6" width="18" height="13" rx="3" fill={c} />
    <Rect x="13" y="10.5" width="9" height="5" rx="2.5" fill={c} opacity={0.35} />
    <Circle cx="17" cy="13" r="1.4" fill={C.primary} />
  </Svg>
);

const Shield = ({ c = C.onSurface, s = 16 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M12 3 L19 6 V11 c0 5-3.5 8-7 10 -3.5-2-7-5-7-10 V6 Z" fill="none" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
    <Path d="M9 12 l2 2 4-4" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Bolt = ({ c = C.onSurface, s = 16 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M13 2 L4 14 H11 L10 22 L20 9 H13 Z" fill={c} />
  </Svg>
);

const Restaurant = ({ c = C.primary, s = 18 }: { c?: string; s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M7 3 V21 M5 3 V8 a2 2 0 0 0 4 0 V3" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16.5 3 c-1.8 0-2.8 2-2.8 5 s1 4 1.8 4 v9" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ───────────────────────── shared bits ───────────────────────── */

function Avatar({ i, size = 32 }: { i: number; size?: number }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: AVA[i % AVA.length], borderWidth: 2, borderColor: '#FFFFFF',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: size * 0.36, fontFamily: 'Inter_700Bold' }}>
        {INI[i % INI.length]}
      </Text>
    </View>
  );
}

function Dots({ active }: { active: number }) {
  return (
    <View style={st.dots}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[st.dot, i === active && st.dotActive]} />
      ))}
    </View>
  );
}

function TopBar({ onSkip }: { onSkip: () => void }) {
  return (
    <View style={st.topbar}>
      <Text style={st.wordmark}>QuickSplit</Text>
      <TouchableOpacity onPress={onSkip} hitSlop={12}>
        <Text style={st.skipTop}>SKIP</Text>
      </TouchableOpacity>
    </View>
  );
}

function StepFooter({ active, onPress }: { active: number; onPress: () => void }) {
  return (
    <View style={st.footer}>
      <Dots active={active} />
      <TouchableOpacity style={[st.btn, st.btnLight]} onPress={onPress} activeOpacity={0.9}>
        <Text style={st.btnTextLight}>Continue</Text>
        <Text style={st.arrowLight}>→</Text>
      </TouchableOpacity>
      <View style={st.home} />
    </View>
  );
}

type SlideProps = { onSkip: () => void; onContinue: () => void };

/* ───────────────────────── Slide 1 · Split Smarter ───────────────────────── */

function SlideSplit({ onSkip, onContinue }: SlideProps) {
  return (
    <ScrollView style={{ width }} contentContainerStyle={st.page} showsVerticalScrollIndicator={false}>
      <TopBar onSkip={onSkip} />

      <View style={st.middle}>
        <View style={st.medallionWrap}>
          <View style={st.glassRing} />
          <View style={st.innerCircle}>
            <LinearGradient colors={['#9BD7FA', '#7FCDFF']} style={st.innerFill}>
              <Group c="#FFFFFF" s={84} />
            </LinearGradient>
          </View>

          <View style={[st.floatPill, st.pillTopRight]}>
            <Card c={C.onPrimaryContainer} s={16} />
            <Text style={st.pillTextDark}>Split ₹120.00</Text>
          </View>
          <View style={[st.floatPillWhite, st.pillBottomLeft]}>
            <Group c={C.primary} s={16} />
            <Text style={st.pillTextPrimary}>4 People</Text>
          </View>
        </View>

        <Text style={st.title}>Split Smarter</Text>
        <Text style={st.subtitle}>
          Effortlessly track and divide shared expenses with friends and family.
        </Text>
      </View>

      <StepFooter active={0} onPress={onContinue} />
    </ScrollView>
  );
}

/* ───────────────────────── Slide 2 · Spend Wiser ───────────────────────── */

const BARS = [
  { h: 38, on: false }, { h: 67, on: false }, { h: 53, on: false },
  { h: 90, on: true }, { h: 34, on: false },
];
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

function SlideSpend({ onSkip, onContinue }: SlideProps) {
  return (
    <ScrollView style={{ width }} contentContainerStyle={st.page} showsVerticalScrollIndicator={false}>
      <TopBar onSkip={onSkip} />

      <View style={st.middle}>
        <View style={st.spendWrap}>
          <View style={st.spendGlow} />
          <View style={st.spendCard}>
            <View style={st.rowBetween}>
              <View>
                <Text style={st.kicker}>MONTHLY SPENDING</Text>
                <Text style={st.spendAmount}>₹2,840.00</Text>
              </View>
              <View style={st.trendBox}>
                <TrendDown c={C.onPrimaryContainer} s={20} />
              </View>
            </View>

            <View style={st.chart}>
              {BARS.map((b, i) => (
                <View key={i} style={st.barCol}>
                  <View
                    style={[
                      st.bar,
                      { height: `${b.h}%`, backgroundColor: b.on ? C.primary : 'rgba(0,101,142,0.16)' },
                    ]}
                  />
                </View>
              ))}
            </View>
            <View style={st.daysRow}>
              {DAYS.map((d, i) => (
                <Text key={d} style={[st.dayText, BARS[i].on && st.dayActive]}>{d}</Text>
              ))}
            </View>
          </View>

          {/* AI insight chip */}
          <View style={[st.insightChip, st.chipTopRight]}>
            <View style={st.insightIcon}><Sparkle c={C.tertiary} s={16} /></View>
            <View>
              <Text style={st.insightKicker}>AI INSIGHT</Text>
              <Text style={st.insightText}>Coffee spend is down 12%!</Text>
            </View>
          </View>

          {/* Dining chip */}
          <View style={[st.diningChip, st.chipBottomLeft]}>
            <Restaurant c={C.primary} s={16} />
            <Text style={st.diningText}>Dining: ₹420</Text>
          </View>
        </View>

        <Text style={st.title}>Spend Wiser</Text>
        <Text style={st.subtitle}>
          Get AI-powered insights into your spending habits and stay in control of your budget with smart automation.
        </Text>
      </View>

      <StepFooter active={1} onPress={onContinue} />
    </ScrollView>
  );
}

/* ───────────────────────── Slide 3 · Scan & Settle ───────────────────────── */

function SlideScan({ onSkip, onContinue }: SlideProps) {
  return (
    <ScrollView style={{ width }} contentContainerStyle={st.page} showsVerticalScrollIndicator={false}>
      <TopBar onSkip={onSkip} />

      <View style={st.middle}>
        <View style={st.scanWrap}>
          {/* Phone */}
          <View style={st.phone}>
            <View style={st.phoneScreen}>
              <View style={st.phoneTop}>
                <ReceiptLong c={C.primary} s={18} />
                <View style={st.phoneHandle} />
              </View>

              <View style={st.viewport}>
                <LinearGradient colors={['#D9C7A6', '#C2A77E']} style={st.viewportFill}>
                  {/* receipt */}
                  <View style={st.receipt}>
                    <View style={[st.rLine, { width: '70%' }]} />
                    <View style={[st.rLine, { width: '90%' }]} />
                    <View style={[st.rLine, { width: '55%' }]} />
                    <View style={[st.rLine, { width: '80%' }]} />
                    <View style={[st.rLine, { width: '40%' }]} />
                  </View>
                  {/* detection regions */}
                  <View style={[st.detect, { top: '26%' }]} />
                  <View style={[st.detect, { top: '52%' }]} />
                  {/* scan beam */}
                  <View style={st.scanBeam} />
                </LinearGradient>
              </View>

              <View style={st.notif}>
                <CheckCircle c={C.onSecondaryContainer} s={20} />
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={[st.nLine, { width: '45%' }]} />
                  <View style={[st.nLine, { width: '70%', opacity: 0.5 }]} />
                </View>
              </View>
            </View>
          </View>

          {/* UPI Active card */}
          <View style={[st.glassCard, st.upiCard]}>
            <View style={st.rowGap6}>
              <Card c={C.primary} s={15} />
              <Text style={st.glassKicker}>UPI ACTIVE</Text>
            </View>
            <View style={st.upiBar} />
          </View>

          {/* SMART OCR card */}
          <View style={[st.glassCard, st.ocrCard]}>
            <View style={st.rowBetween}>
              <View style={st.ocrIcon}><Sparkle c={C.tertiary} s={15} /></View>
              <Text style={st.ocrKicker}>SMART OCR</Text>
            </View>
            <Text style={st.ocrText}>Scanning items…</Text>
          </View>
        </View>

        <Text style={st.title}>Scan & Settle</Text>
        <Text style={st.subtitle}>
          Snap a photo of any receipt and settle up instantly with integrated UPI payments.
        </Text>
      </View>

      <StepFooter active={2} onPress={onContinue} />
    </ScrollView>
  );
}

/* ───────────────────────── Slide 4 · Ready to Split? ───────────────────────── */

function SlideReady({ onGetStarted, onLogin }: { onGetStarted: () => void; onLogin: () => void }) {
  return (
    <ScrollView style={{ width }} contentContainerStyle={st.page} showsVerticalScrollIndicator={false}>
      {/* Centered brand lockup */}
      <View style={st.brandHeader}>
        <View style={st.brandRow}>
          <View style={st.brandTile}><Wallet c="#FFFFFF" s={22} /></View>
          <Text style={st.brandWord}>QuickSplit</Text>
        </View>
        <Text style={st.brandTag}>JOIN 15K+ SPLITTERS</Text>
      </View>

      <View style={st.middle}>
        <View style={st.readyWrap}>
          <LinearGradient colors={[C.primary, C.tertiary]} style={st.readyShadowCard} />
          <View style={st.readyCard}>
            <View style={st.rowBetween}>
              <View style={{ gap: 6 }}>
                <View style={[st.barPh, { width: 88 }]} />
                <View style={[st.barPh, { width: 56, opacity: 0.5 }]} />
              </View>
              <View style={st.chipPh} />
            </View>

            <View style={st.splitArea}>
              <View style={st.track}>
                <View style={st.trackFill} />
                <View style={[st.trackAva, { left: '0%', marginLeft: -14 }]}><Avatar i={0} size={28} /></View>
                <View style={[st.trackAva, { left: '65%', marginLeft: -14 }]}><Avatar i={1} size={28} /></View>
                <View style={[st.trackAva, { left: '100%', marginLeft: -28 }]}>
                  <View style={st.plusAva}><Text style={st.plusText}>+3</Text></View>
                </View>
              </View>
            </View>

            <View style={st.rowBetween}>
              <View>
                <Text style={st.groupLabel}>Group Total</Text>
                <Text style={st.groupTotal}>₹1,240.00</Text>
              </View>
              <View style={st.pendingPill}><Text style={st.pendingText}>PENDING</Text></View>
            </View>
          </View>

          <View style={st.readyInsight}>
            <View style={st.readyInsightIcon}><Sparkle c={C.tertiary} s={18} /></View>
            <View>
              <Text style={st.readyInsightKicker}>AI Insight</Text>
              <Text style={st.readyInsightText}>Saving you ₹45/mo</Text>
            </View>
          </View>
        </View>

        <Text style={st.readyTitle}>
          Ready to{'\n'}<Text style={st.readyTitleAccent}>Split?</Text>
        </Text>
        <Text style={st.subtitle}>
          Join 15k+ splitters and take control of your shared finances today.
        </Text>
        <Dots active={3} />
      </View>

      <View style={st.footer}>
        <Text style={st.tagline}>SPLIT SMARTER • SPEND WISER • PAY INSTANTLY</Text>
        <TouchableOpacity style={[st.btn, st.btnDark]} onPress={onGetStarted} activeOpacity={0.9}>
          <Text style={st.btnTextDark}>Get Started</Text>
          <Text style={st.arrowDark}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.loginBtn} onPress={onLogin} activeOpacity={0.85}>
          <Text style={st.loginText}>
            Already have an account? <Text style={st.loginStrong}>Log In</Text>
          </Text>
        </TouchableOpacity>
        <View style={st.trustRow}>
          <View style={st.trustItem}><Shield c={C.onSurface} s={15} /><Text style={st.trustText}>BANK-GRADE SECURITY</Text></View>
          <View style={st.trustDivider} />
          <View style={st.trustItem}><Bolt c={C.onSurface} s={15} /><Text style={st.trustText}>INSTANT TRANSFERS</Text></View>
        </View>
        <View style={st.home} />
      </View>
    </ScrollView>
  );
}

/* ───────────────────────── Screen ───────────────────────── */

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);

  const goTo = (i: number) => scrollRef.current?.scrollTo({ x: width * i, animated: true });
  const skip = () => navigation.replace('Register');
  const getStarted = () => navigation.replace('Register');
  const login = () => navigation.replace('Login');

  return (
    <LinearGradient colors={['#EAF4FC', '#F4F8FD', '#F9F9FC']} style={st.flex}>
      <SafeAreaView style={st.flex} edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          <SlideSplit onSkip={skip} onContinue={() => goTo(1)} />
          <SlideSpend onSkip={skip} onContinue={() => goTo(2)} />
          <SlideScan onSkip={skip} onContinue={() => goTo(3)} />
          <SlideReady onGetStarted={getStarted} onLogin={login} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const st = StyleSheet.create({
  flex: { flex: 1 },
  page: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },

  // top bar
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 },
  wordmark: { fontSize: 22, fontFamily: 'Inter_700Bold', color: C.primary, letterSpacing: -0.4 },
  skipTop: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: C.onSurfaceVariant, letterSpacing: 0.6 },

  // titles
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: C.onSurface, textAlign: 'center', letterSpacing: -0.4, marginTop: 40 },
  subtitle: { fontSize: 16, lineHeight: 24, fontFamily: 'Inter_400Regular', color: C.onSurfaceVariant, textAlign: 'center', marginTop: 12, maxWidth: 300 },

  // footer
  footer: { paddingTop: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginBottom: 20 },
  dot: { height: 6, width: 6, borderRadius: 3, backgroundColor: C.outlineVariant },
  dotActive: { width: 26, backgroundColor: C.primary },

  btn: { height: 58, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnLight: {
    backgroundColor: C.primaryContainer,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 4,
  },
  btnTextLight: { color: C.onPrimaryContainer, fontSize: 17, fontFamily: 'Inter_700Bold' },
  arrowLight: { color: C.onPrimaryContainer, fontSize: 18, fontFamily: 'Inter_700Bold' },
  btnDark: {
    height: 62, backgroundColor: C.primary,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.32, shadowRadius: 18, elevation: 8,
  },
  btnTextDark: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' },
  arrowDark: { color: '#FFFFFF', fontSize: 19, fontFamily: 'Inter_700Bold' },
  home: { width: 130, height: 4, borderRadius: 2, backgroundColor: 'rgba(26,28,30,0.12)', alignSelf: 'center', marginTop: 14, marginBottom: 4 },

  // shared rows
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowGap6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kicker: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, color: C.onSurfaceVariant },

  /* slide 1 */
  medallionWrap: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  glassRing: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.12, shadowRadius: 30, elevation: 4,
  },
  innerCircle: {
    width: 232, height: 232, borderRadius: 116, overflow: 'hidden',
    borderWidth: 4, borderColor: '#FFFFFF',
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 28, elevation: 8,
  },
  innerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floatPill: {
    position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: C.primaryContainer, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9,
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 14, elevation: 6,
  },
  floatPillWhite: {
    position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 1, borderColor: 'rgba(0,101,142,0.08)',
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 14, elevation: 6,
  },
  pillTopRight: { top: 26, right: 2 },
  pillBottomLeft: { bottom: 38, left: 0 },
  pillTextDark: { fontSize: 12, fontFamily: 'Inter_700Bold', color: C.onPrimaryContainer, letterSpacing: 0.3 },
  pillTextPrimary: { fontSize: 12, fontFamily: 'Inter_700Bold', color: C.primary, letterSpacing: 0.3 },

  /* slide 2 */
  spendWrap: { width: '100%', maxWidth: 320, alignItems: 'center', justifyContent: 'center' },
  spendGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(127,205,255,0.22)' },
  spendCard: {
    width: '100%', backgroundColor: C.glass, borderRadius: 28, padding: 20,
    borderWidth: 1, borderColor: C.glassBorder,
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 6,
  },
  spendAmount: { fontSize: 30, fontFamily: 'Inter_700Bold', color: C.onSurface, marginTop: 3, letterSpacing: -0.6 },
  trendBox: { backgroundColor: C.primaryContainer, borderRadius: 12, padding: 8 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 92, gap: 8, marginTop: 18 },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dayText: { flex: 1, textAlign: 'center', fontSize: 10, fontFamily: 'Inter_500Medium', color: C.onSurfaceVariant, letterSpacing: 0.6 },
  dayActive: { color: C.primary, fontFamily: 'Inter_700Bold' },

  insightChip: {
    position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.glass, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: C.glassBorder,
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 7,
  },
  chipTopRight: { top: -16, right: -6 },
  insightIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.tertiaryContainer, alignItems: 'center', justifyContent: 'center' },
  insightKicker: { fontSize: 9, fontFamily: 'Inter_700Bold', color: C.tertiary, letterSpacing: 0.4 },
  insightText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: C.onSurface, marginTop: 1 },

  diningChip: {
    position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: C.glass, borderRadius: 22, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: C.glassBorder,
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 6,
  },
  chipBottomLeft: { bottom: -18, left: -4 },
  diningText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: C.onSurfaceVariant },

  /* slide 3 */
  scanWrap: { width: '100%', alignItems: 'center', justifyContent: 'center', height: 388 },
  phone: {
    width: 204, height: 372, borderRadius: 42, borderWidth: 8, borderColor: C.onSurface,
    backgroundColor: C.surfaceHigh, overflow: 'hidden',
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.24, shadowRadius: 30, elevation: 10,
  },
  phoneScreen: { flex: 1, backgroundColor: '#FFFFFF', padding: 12 },
  phoneTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  phoneHandle: { width: 44, height: 4, borderRadius: 2, backgroundColor: C.surfaceVariant },
  viewport: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.outlineVariant },
  viewportFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  receipt: {
    width: 92, backgroundColor: '#FFFFFF', borderRadius: 6, paddingVertical: 14, paddingHorizontal: 12,
    gap: 7, transform: [{ rotate: '-8deg' }],
    shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 6,
  },
  rLine: { height: 4, borderRadius: 2, backgroundColor: '#C9CDD2' },
  detect: { position: 'absolute', left: 14, right: 14, height: 26, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(0,101,142,0.5)', backgroundColor: 'rgba(0,101,142,0.12)' },
  scanBeam: {
    position: 'absolute', left: 0, right: 0, top: '46%', height: 3, backgroundColor: C.primary,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 8, elevation: 4,
  },
  notif: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.secondaryContainer, borderRadius: 12, padding: 10, marginTop: 10 },
  nLine: { height: 6, borderRadius: 3, backgroundColor: 'rgba(80,102,109,0.35)' },

  glassCard: {
    position: 'absolute', backgroundColor: C.glass, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: C.glassBorder,
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 8,
  },
  upiCard: { right: 0, top: 70, width: 122 },
  glassKicker: { fontSize: 10, fontFamily: 'Inter_700Bold', color: C.onSurfaceVariant, letterSpacing: 0.6 },
  upiBar: { height: 7, borderRadius: 4, backgroundColor: C.primaryContainer, marginTop: 9 },
  ocrCard: { left: 0, bottom: 84, width: 134, transform: [{ rotate: '-5deg' }] },
  ocrIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.tertiaryFixed, alignItems: 'center', justifyContent: 'center' },
  ocrKicker: { fontSize: 10, fontFamily: 'Inter_700Bold', color: C.tertiary, letterSpacing: 0.3 },
  ocrText: { fontSize: 10, fontFamily: 'Inter_400Regular', color: C.onSurfaceVariant, marginTop: 8 },

  /* slide 4 */
  brandHeader: { alignItems: 'center', paddingTop: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  brandTile: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  brandWord: { fontSize: 26, fontFamily: 'Inter_700Bold', color: C.primary, letterSpacing: -0.5 },
  brandTag: { fontSize: 11, fontFamily: 'Inter_700Bold', color: C.outline, letterSpacing: 2.4 },

  readyWrap: { width: '100%', maxWidth: 300, height: 270, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  readyShadowCard: { position: 'absolute', width: '92%', height: '92%', borderRadius: 36, opacity: 0.14, transform: [{ rotate: '3deg' }] },
  readyCard: {
    width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 36, padding: 22,
    justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', transform: [{ rotate: '-3deg' }],
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.16, shadowRadius: 30, elevation: 8,
  },
  barPh: { height: 12, borderRadius: 6, backgroundColor: C.surfaceVariant },
  chipPh: { width: 46, height: 30, borderRadius: 10, backgroundColor: 'rgba(0,101,142,0.18)' },
  splitArea: { justifyContent: 'center', paddingVertical: 8 },
  track: { height: 8, borderRadius: 4, backgroundColor: C.surfaceVariant },
  trackFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '65%', borderRadius: 4, backgroundColor: C.primary },
  trackAva: { position: 'absolute', top: -10 },
  plusAva: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primaryContainer, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  plusText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: C.onPrimaryContainer },
  groupLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: C.outline, letterSpacing: 0.4 },
  groupTotal: { fontSize: 26, fontFamily: 'Inter_700Bold', color: C.onSurface, marginTop: 3, letterSpacing: -0.6 },
  pendingPill: { backgroundColor: C.secondaryContainer, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  pendingText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: C.onSecondaryContainer, letterSpacing: 0.5 },
  readyInsight: {
    position: 'absolute', bottom: -10, right: -4, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.outlineVariant,
    shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 8,
  },
  readyInsightIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.tertiaryContainer, alignItems: 'center', justifyContent: 'center' },
  readyInsightKicker: { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.outline },
  readyInsightText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: C.onSurface },

  readyTitle: { fontSize: 44, lineHeight: 48, fontFamily: 'Inter_700Bold', color: C.onSurface, textAlign: 'center', letterSpacing: -1, marginTop: 28 },
  readyTitleAccent: { color: C.primary, fontStyle: 'italic', fontFamily: 'Inter_700Bold' },

  tagline: { fontSize: 11, fontFamily: 'Inter_700Bold', color: C.outline, textAlign: 'center', letterSpacing: 1, marginBottom: 14 },
  loginBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  loginText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: C.primary },
  loginStrong: { fontFamily: 'Inter_700Bold', textDecorationLine: 'underline' },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 6, opacity: 0.45 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { fontSize: 9, fontFamily: 'Inter_700Bold', color: C.onSurface, letterSpacing: 1 },
  trustDivider: { width: 1, height: 16, backgroundColor: C.outline },
});
