import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Rect, Path, Circle, G, Defs, Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

const { width } = Dimensions.get('window');

// Ocean Breeze (light, pre-auth) palette — kept consistent with Splash/Login/Register.
const C = {
  grad: ['#DCEEFB', '#EAF4FC', '#F9F9FC'] as const,
  primary: '#00658E',
  primaryLite: '#0093C4',
  container: '#7FCDFF',
  tertiary: '#4552C3',
  ink: '#16344A',
  sub: '#5A6B78',
  muted: '#8B98A4',
  card: '#FFFFFF',
  cardBorder: '#E7EEF4',
  track: '#E8EEF3',
  surfaceLow: '#F3F6F9',
};

const AVATARS = ['#00658E', '#4552C3', '#0093C4', '#7FCDFF'];
const INITIALS = ['A', 'R', 'S', 'M'];

function AvatarStack({ n = 4 }: { n?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {AVATARS.slice(0, n).map((bg, i) => (
        <View
          key={i}
          style={[
            st.avatar,
            { backgroundColor: bg, marginLeft: i === 0 ? 0 : -10 },
          ]}
        >
          <Text style={st.avatarText}>{INITIALS[i]}</Text>
        </View>
      ))}
    </View>
  );
}

/* ───────────────────────── Slide visuals ───────────────────────── */

function HeroSplit() {
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={220} height={210} viewBox="0 0 220 210">
        <Defs>
          <SvgLinearGradient id="med" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0093C4" />
            <Stop offset="1" stopColor="#00658E" />
          </SvgLinearGradient>
        </Defs>
        <Circle cx="110" cy="105" r="90" fill="#7FCDFF" opacity={0.2} />
        <Circle cx="110" cy="105" r="66" fill="url(#med)" />
        {/* group huddle glyph */}
        <G fill="#FFFFFF">
          <Circle cx="83" cy="98" r="11" />
          <Rect x="66" y="113" width="34" height="26" rx="13" />
          <Circle cx="137" cy="98" r="11" />
          <Rect x="120" y="113" width="34" height="26" rx="13" />
          <Circle cx="110" cy="90" r="16" />
          <Rect x="88" y="110" width="44" height="32" rx="16" />
        </G>
        {/* orbiting accents */}
        <Circle cx="110" cy="16" r="13" fill="#4552C3" stroke="#FFFFFF" strokeWidth="3" />
        <Circle cx="195" cy="122" r="11" fill="#0093C4" stroke="#FFFFFF" strokeWidth="3" />
        <Circle cx="28" cy="135" r="11" fill="#7FCDFF" stroke="#FFFFFF" strokeWidth="3" />
      </Svg>
      <View style={st.heroPill}>
        <AvatarStack n={4} />
        <Text style={st.heroPillText}>Splitting with 4 friends</Text>
      </View>
    </View>
  );
}

function HeroSpend() {
  return (
    <View style={st.spendCard}>
      <View style={st.rowBetween}>
        <View>
          <Text style={st.kicker}>THIS MONTH</Text>
          <Text style={st.spendAmount}>₹2,840.00</Text>
        </View>
        <View style={st.trendPill}>
          <Text style={st.trendText}>↓ 12%</Text>
        </View>
      </View>

      <Svg width="100%" height={90} viewBox="0 0 300 100" style={{ marginTop: 14 }}>
        <Defs>
          <SvgLinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#00658E" stopOpacity={0.28} />
            <Stop offset="1" stopColor="#00658E" stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M0 70 L50 48 L100 58 L150 34 L200 46 L250 26 L300 38 L300 100 L0 100 Z"
          fill="url(#area)"
        />
        <Path
          d="M0 70 L50 48 L100 58 L150 34 L200 46 L250 26 L300 38"
          stroke="#00658E"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="250" cy="26" r="5" fill="#00658E" stroke="#FFFFFF" strokeWidth="2" />
      </Svg>

      <View style={st.legendRow}>
        {([['Food', '#00658E'], ['Travel', '#4552C3'], ['Bills', '#7FCDFF']] as const).map(
          ([label, color]) => (
            <View key={label} style={st.legendItem}>
              <View style={[st.legendDot, { backgroundColor: color }]} />
              <Text style={st.legendText}>{label}</Text>
            </View>
          ),
        )}
      </View>
    </View>
  );
}

function HeroScan() {
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={210} height={220} viewBox="0 0 210 220">
        <Circle cx="105" cy="110" r="92" fill="#7FCDFF" opacity={0.18} />
        {/* phone */}
        <Rect x="62" y="26" width="86" height="168" rx="20" fill="#FFFFFF" stroke="#CFE4F2" strokeWidth="2" />
        {/* receipt */}
        <Rect x="80" y="50" width="50" height="92" rx="6" fill="#F3F6F9" stroke="#E2E2E5" strokeWidth="1.5" />
        <Path
          d="M88 66 H122 M88 78 H122 M88 90 H114 M88 102 H122 M88 114 H110"
          stroke="#B9C7D2"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* scan beam */}
        <Rect x="68" y="86" width="74" height="18" rx="6" fill="#00658E" opacity={0.12} />
        <Rect x="68" y="92" width="74" height="6" rx="3" fill="#00658E" opacity={0.9} />
        {/* sparkle */}
        <Path d="M150 54 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#4552C3" />
      </Svg>
    </View>
  );
}

function HeroReady() {
  return (
    <View style={st.readyCard}>
      <View style={st.ring}>
        <Svg width={150} height={150} viewBox="0 0 150 150">
          <Circle cx="75" cy="75" r="58" stroke="#E8EEF3" strokeWidth="12" fill="none" />
          <G transform="rotate(-90, 75, 75)">
            <Circle
              cx="75"
              cy="75"
              r="58"
              stroke="#00658E"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="309.8 364.4"
            />
          </G>
        </Svg>
        <View style={st.ringCenter}>
          <Text style={st.ringAmount}>₹1,240</Text>
          <Text style={st.ringLabel}>settled</Text>
        </View>
      </View>
      <View style={st.readyFoot}>
        <AvatarStack n={3} />
        <Text style={st.readyFootText}>85% of your trip is settled</Text>
      </View>
    </View>
  );
}

/* ───────────────────────── Slide content ───────────────────────── */

const SLIDES = [
  {
    key: 'split',
    Visual: HeroSplit,
    title: 'Split Smarter',
    subtitle:
      'Track and share expenses with friends, roommates, and travel buddies — no spreadsheets, no awkward reminders.',
  },
  {
    key: 'spend',
    Visual: HeroSpend,
    title: 'Spend Wiser',
    subtitle:
      'See exactly where your money goes with clear monthly insights and smart spending summaries.',
  },
  {
    key: 'scan',
    Visual: HeroScan,
    title: 'Scan & Settle',
    subtitle:
      'Snap a photo of any receipt and let our AI pull out every item, tax, and tip in seconds.',
  },
  {
    key: 'ready',
    Visual: HeroReady,
    title: 'Ready to Split?',
    subtitle: 'Join QuickSplit and start settling up the effortless way.',
  },
];

const LAST = SLIDES.length - 1;

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goNext = () => {
    const n = Math.min(index + 1, LAST);
    scrollRef.current?.scrollTo({ x: width * n, animated: true });
    setIndex(n);
  };

  return (
    <LinearGradient colors={C.grad} style={st.flex}>
      <SafeAreaView style={st.flex}>
        {/* Header */}
        <View style={st.header}>
          <Text style={st.wordmark}>
            Quick<Text style={{ color: C.primary }}>Split</Text>
          </Text>
          {index < LAST ? (
            <TouchableOpacity onPress={() => navigation.replace('Register')} hitSlop={10}>
              <Text style={st.skip}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Pager */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={st.flex}
        >
          {SLIDES.map(({ key, Visual, title, subtitle }) => (
            <View key={key} style={{ width }}>
              <ScrollView
                contentContainerStyle={st.slideInner}
                showsVerticalScrollIndicator={false}
              >
                <Visual />
                <Text style={st.title}>{title}</Text>
                <Text style={st.subtitle}>{subtitle}</Text>
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={st.footer}>
          <View style={st.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[st.dot, i === index && st.dotActive]} />
            ))}
          </View>

          {index < LAST ? (
            <TouchableOpacity style={st.primaryBtn} onPress={goNext} activeOpacity={0.9}>
              <Text style={st.primaryBtnText}>Continue</Text>
              <Text style={st.primaryBtnArrow}>→</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={st.primaryBtn}
                onPress={() => navigation.replace('Register')}
                activeOpacity={0.9}
              >
                <Text style={st.primaryBtnText}>Get Started Free</Text>
                <Text style={st.primaryBtnArrow}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={st.loginLink}
                onPress={() => navigation.replace('Login')}
                activeOpacity={0.85}
              >
                <Text style={st.loginLinkText}>
                  Already have an account? <Text style={st.loginLinkStrong}>Log in</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const st = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 4,
  },
  wordmark: { fontSize: 22, fontFamily: 'Inter_700Bold', color: C.ink, letterSpacing: -0.4 },
  skip: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.sub },

  slideInner: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: C.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 34,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: 'Inter_400Regular',
    color: C.sub,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },

  // shared
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_700Bold' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kicker: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1, color: C.muted },

  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#CFE4F2',
    borderRadius: 24,
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 7,
    marginTop: 4,
  },
  heroPillText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: C.ink },

  // spend card
  spendCard: {
    width: width - 60,
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    shadowColor: '#1A3A52',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  spendAmount: { fontSize: 28, fontFamily: 'Inter_700Bold', color: C.ink, marginTop: 2, letterSpacing: -0.5 },
  trendPill: { backgroundColor: '#E3F6EA', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  trendText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#16A34A' },
  legendRow: { flexDirection: 'row', gap: 18, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: C.sub },

  // ready card
  readyCard: {
    width: width - 60,
    backgroundColor: C.card,
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.cardBorder,
    shadowColor: '#1A3A52',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 5,
  },
  ring: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringAmount: { fontSize: 26, fontFamily: 'Inter_700Bold', color: C.ink, letterSpacing: -0.5 },
  ringLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: C.muted, marginTop: 1 },
  readyFoot: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  readyFootText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.sub },

  // footer
  footer: { paddingHorizontal: 26, paddingBottom: 12, paddingTop: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#B9D7EA' },
  dotActive: { width: 22, backgroundColor: C.primary },

  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#00658E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
  primaryBtnArrow: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },

  loginLink: { alignItems: 'center', marginTop: 14, paddingVertical: 4 },
  loginLinkText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.sub },
  loginLinkStrong: { fontFamily: 'Inter_700Bold', color: C.primary },
});
