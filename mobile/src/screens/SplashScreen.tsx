import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => navigation.replace('Onboarding'), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={[s.inner, { opacity, transform: [{ translateY }] }]}>
        <View style={s.logoBox}>
          <Text style={s.logoText}>Q</Text>
        </View>
        <Text style={s.appName}>QuickSplit</Text>
        <Text style={s.tagline}>Split Smart. Live More.</Text>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center' },
  inner: { alignItems: 'center' },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  logoText: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', fontFamily: 'PlayfairDisplay_700Bold' },
  appName: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', fontFamily: 'PlayfairDisplay_700Bold' },
  tagline: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 8, fontWeight: '500' },
});
