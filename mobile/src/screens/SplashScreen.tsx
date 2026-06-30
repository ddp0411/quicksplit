import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

// QuickSplit mark — a wallet / receipt-card glyph (matches the Stitch splash icon tile).
function BrandGlyph() {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="13" rx="3" stroke="#FFFFFF" strokeWidth="1.8" />
      <Path d="M3 10 H21" stroke="#FFFFFF" strokeWidth="1.8" />
      <Circle cx="16.5" cy="14.5" r="1.6" fill="#FFFFFF" />
    </Svg>
  );
}

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1900,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
    const t = setTimeout(() => navigation.replace('Onboarding'), 2000);
    return () => clearTimeout(t);
  }, []);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] });

  return (
    <LinearGradient colors={['#DCEEFB', '#EAF4FC', '#F9F9FC']} style={s.container}>
      <View style={s.fill} />

      <Animated.View style={[s.inner, { opacity, transform: [{ translateY }] }]}>
        <LinearGradient
          colors={['#0093C4', '#00658E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.logoBox}
        >
          <BrandGlyph />
        </LinearGradient>
        <Text style={s.appName}>QuickSplit</Text>
        <Text style={s.tagline}>Effortless bill splitting powered by{'\n'}intelligent automation.</Text>
      </Animated.View>

      <View style={s.bottom}>
        <Text style={s.initLabel}>INITIALISING AI CORE</Text>
        <View style={s.track}>
          <Animated.View style={[s.bar, { width: barWidth }]} />
        </View>
        <Text style={s.footer}>Securely managed by QuickSplit Financial Systems</Text>
      </View>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  fill: { flex: 1 },
  inner: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#00658E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    color: '#16344A',
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#5A6B78',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  bottom: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 36 },
  initLabel: {
    color: '#6B7B88',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 14,
  },
  track: {
    width: 150,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,101,142,0.15)',
    overflow: 'hidden',
    marginBottom: 28,
  },
  bar: { height: 3, borderRadius: 2, backgroundColor: '#00658E' },
  footer: { color: '#8B98A4', fontSize: 11, fontFamily: 'Inter_400Regular' },
});
