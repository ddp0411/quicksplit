import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { useAuth } from '../hooks/useAuth';
import { getAPIErrorMessage } from '../services/api/errorMessage';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

function BrandGlyph() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="13" rx="3" stroke="#FFFFFF" strokeWidth="1.8" />
      <Path d="M3 10 H21" stroke="#FFFFFF" strokeWidth="1.8" />
      <Circle cx="16.5" cy="14.5" r="1.5" fill="#FFFFFF" />
    </Svg>
  );
}

function createStyles(c: C) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 28 },
    logoSection: { alignItems: 'center', marginBottom: 22 },
    logoBox: {
      width: 60, height: 60, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      shadowColor: '#00658E', shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32, shadowRadius: 20, elevation: 8,
    },
    heading: { fontSize: 28, fontWeight: '700', color: c.text, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
    subheading: { marginTop: 6, fontSize: 14, color: c.textSub, fontFamily: 'Inter_400Regular' },
    card: {
      backgroundColor: c.card, borderRadius: 24, padding: 22,
      borderWidth: 1, borderColor: c.cardBorder,
      shadowColor: '#1A3A52', shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08, shadowRadius: 28, elevation: 5,
    },
    errorBox: {
      backgroundColor: c.errorBg, borderColor: '#FFB4AB', borderWidth: 1,
      borderRadius: 14, padding: 12, marginBottom: 16,
    },
    errorText: { color: c.errorText, fontSize: 13, fontWeight: '600' },
    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: c.text, marginBottom: 7, fontFamily: 'Inter_600SemiBold' },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
    forgotLink: { fontSize: 12, fontWeight: '700', color: c.primary, fontFamily: 'Inter_700Bold' },
    inputWrap: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      borderRadius: 14, paddingHorizontal: 14,
      backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.inputBorder,
    },
    inputText: { flex: 1, fontSize: 15, paddingVertical: 14, color: c.text, fontFamily: 'Inter_400Regular' },
    eyeBtn: { padding: 6 },
    submitBtn: {
      backgroundColor: c.primary, borderRadius: 14,
      paddingVertical: 16, alignItems: 'center', marginTop: 8,
      shadowColor: '#00658E', shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3, shadowRadius: 18, elevation: 6,
    },
    disabled: { opacity: 0.55 },
    submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
    footerText: { fontSize: 14, color: c.textSub, fontFamily: 'Inter_400Regular' },
    footerLink: { fontSize: 14, fontWeight: '700', color: c.primary, fontFamily: 'Inter_700Bold' },
  });
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, isLoggingIn, loginError } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const authError = getAPIErrorMessage(loginError, 'Invalid credentials. Please try again.');

  const handleSubmit = () => {
    if (!identifier.trim() || !password) return;
    login({ identifier: identifier.trim(), password });
  };

  return (
    <LinearGradient colors={['#DCEEFB', '#EAF4FC', '#F9F9FC']} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.logoSection}>
              <LinearGradient colors={['#0093C4', '#00658E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
                <BrandGlyph />
              </LinearGradient>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.subheading}>Sign in to your QuickSplit account</Text>
            </View>

            <View style={styles.card}>
              {loginError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email or phone number</Text>
                <View style={styles.inputWrap}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={colors.textMuted} strokeWidth="1.6" />
                    <Path d="M4 7 L12 13 L20 7" stroke={colors.textMuted} strokeWidth="1.6" strokeLinecap="round" />
                  </Svg>
                  <TextInput
                    style={styles.inputText}
                    value={identifier}
                    onChangeText={setIdentifier}
                    placeholder="you@example.com or 9876543210"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrap}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Rect x="5" y="11" width="14" height="9" rx="2" stroke={colors.textMuted} strokeWidth="1.6" />
                    <Path d="M8 11 V8 a4 4 0 0 1 8 0 v3" stroke={colors.textMuted} strokeWidth="1.6" />
                  </Svg>
                  <TextInput
                    style={styles.inputText}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPw}
                  />
                  <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
                    <Text style={{ fontSize: 16 }}>{showPw ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, (isLoggingIn || !identifier || !password) && styles.disabled]}
                onPress={handleSubmit}
                disabled={isLoggingIn || !identifier || !password}
                activeOpacity={0.85}
              >
                <Text style={styles.submitText}>{isLoggingIn ? 'Signing in…' : 'Sign in'}</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Sign up free</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};
