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
    logoSection: { alignItems: 'center', marginBottom: 20 },
    logoBox: {
      width: 60, height: 60, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center', marginBottom: 14,
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
    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: c.text, marginBottom: 7, fontFamily: 'Inter_600SemiBold' },
    input: {
      borderWidth: 1, borderColor: c.inputBorder, borderRadius: 14,
      paddingHorizontal: 14, paddingVertical: 14, fontSize: 15,
      backgroundColor: c.inputBg, color: c.text, fontFamily: 'Inter_400Regular',
    },
    passwordWrap: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1, borderColor: c.inputBorder, borderRadius: 14,
      backgroundColor: c.inputBg, paddingRight: 8,
    },
    passwordInputText: { flex: 1, fontSize: 15, paddingVertical: 14, paddingLeft: 14, color: c.text, fontFamily: 'Inter_400Regular' },
    eyeBtn: { padding: 8 },
    termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18, marginTop: 4 },
    checkbox: {
      width: 20, height: 20, borderRadius: 6, borderWidth: 2,
      borderColor: c.inputBorder, alignItems: 'center', justifyContent: 'center',
      marginTop: 2,
    },
    checkboxChecked: { backgroundColor: c.primary, borderColor: c.primary },
    termsText: { flex: 1, fontSize: 13, color: c.textSub, lineHeight: 20, fontFamily: 'Inter_400Regular' },
    termsLink: { color: c.primary, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    submitBtn: {
      backgroundColor: c.primary, borderRadius: 14,
      paddingVertical: 16, alignItems: 'center',
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

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [localError, setLocalError] = useState('');

  const authError = getAPIErrorMessage(registerError, 'Registration failed. Please try again.');
  const error = localError || (registerError ? authError : '');

  const handleSubmit = () => {
    setLocalError('');
    if (!name.trim()) { setLocalError('Please enter your name'); return; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { setLocalError('Enter a valid 10-digit mobile number (must start with 6–9)'); return; }
    if (email.trim() && !email.trim().includes('@')) { setLocalError('Enter a valid email address'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return; }
    if (!agree) { setLocalError('Please accept the terms to continue'); return; }
    registerUser({
      phone_number: phone.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase() || undefined,
      password,
    });
  };

  return (
    <LinearGradient colors={['#DCEEFB', '#EAF4FC', '#F9F9FC']} style={s.flex}>
      <SafeAreaView style={s.flex}>
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
            <View style={s.logoSection}>
              <LinearGradient colors={['#0093C4', '#00658E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logoBox}>
                <BrandGlyph />
              </LinearGradient>
              <Text style={s.heading}>Create account</Text>
              <Text style={s.subheading}>Start splitting expenses for free</Text>
            </View>

            <View style={s.card}>
              {error ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Name */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Full name</Text>
                <TextInput style={s.input} value={name} onChangeText={setName}
                  placeholder="Rohan Mehta" placeholderTextColor={colors.textMuted} autoCapitalize="words" autoCorrect={false} />
              </View>

              {/* Phone number */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Phone number</Text>
                <TextInput style={s.input} value={phone} onChangeText={setPhone}
                  placeholder="10-digit mobile number" placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad" maxLength={10} autoCorrect={false} />
              </View>

              {/* Email (optional) */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Email <Text style={{ color: colors.textMuted, fontWeight: '400' }}>(optional)</Text></Text>
                <TextInput style={s.input} value={email} onChangeText={setEmail}
                  placeholder="you@example.com" placeholderTextColor={colors.textMuted}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>

              {/* Password */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Password</Text>
                <View style={s.passwordWrap}>
                  <TextInput
                    style={s.passwordInputText}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPw}
                  />
                  <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
                    <Text>{showPw ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm password */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Confirm password</Text>
                <TextInput style={s.input} value={confirmPassword} onChangeText={setConfirmPassword}
                  placeholder="Repeat password" placeholderTextColor={colors.textMuted}
                  autoCapitalize="none" autoCorrect={false} secureTextEntry={!showPw} />
              </View>

              <TouchableOpacity style={s.termsRow} onPress={() => setAgree(v => !v)} activeOpacity={0.7}>
                <View style={[s.checkbox, agree && s.checkboxChecked]}>
                  {agree && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text>}
                </View>
                <Text style={s.termsText}>
                  I agree to the{' '}
                  <Text style={s.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={s.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.submitBtn, isRegistering && s.disabled]}
                onPress={handleSubmit}
                disabled={isRegistering}
                activeOpacity={0.85}
              >
                <Text style={s.submitText}>{isRegistering ? 'Creating account…' : 'Create account'}</Text>
              </TouchableOpacity>

              <View style={s.footer}>
                <Text style={s.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={s.footerLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};
