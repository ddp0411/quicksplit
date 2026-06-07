import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { getAPIErrorMessage } from '../services/api/errorMessage';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

function createStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
    logoSection: { alignItems: 'center', marginBottom: 28 },
    logoBox: {
      width: 56, height: 56, borderRadius: 16,
      backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center',
      marginBottom: 14,
      shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
    },
    logoText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', fontFamily: 'PlayfairDisplay_700Bold' },
    heading: { fontSize: 28, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold' },
    subheading: { marginTop: 4, fontSize: 14, color: c.textSub },
    errorBox: {
      backgroundColor: '#FFF1F2', borderColor: '#FECACA', borderWidth: 1,
      borderRadius: 16, padding: 12, marginBottom: 16,
    },
    errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 6 },
    input: {
      borderWidth: 1.5, borderColor: c.inputBorder, borderRadius: 16,
      paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
      backgroundColor: c.inputBg, color: c.text,
    },
    passwordWrap: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: c.inputBorder, borderRadius: 16,
      backgroundColor: c.inputBg, paddingRight: 8,
    },
    passwordInputText: { flex: 1, fontSize: 15, paddingVertical: 14, paddingLeft: 16, color: c.text },
    eyeBtn: { padding: 8 },
    termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18 },
    checkbox: {
      width: 20, height: 20, borderRadius: 6, borderWidth: 2,
      borderColor: c.inputBorder, alignItems: 'center', justifyContent: 'center',
      marginTop: 2,
    },
    checkboxChecked: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
    termsText: { flex: 1, fontSize: 13, color: c.textSub, lineHeight: 20 },
    termsLink: { color: '#1B4332', fontWeight: '700' },
    submitBtn: {
      backgroundColor: '#FF6B35', borderRadius: 16,
      paddingVertical: 16, alignItems: 'center',
      shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
    },
    disabled: { opacity: 0.6 },
    submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { fontSize: 14, color: c.textSub },
    footerLink: { fontSize: 14, fontWeight: '700', color: '#1B4332' },
  });
}

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [name, setName] = useState('');
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
    if (!email.trim().includes('@')) { setLocalError('Enter a valid email'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return; }
    if (!agree) { setLocalError('Please accept the terms to continue'); return; }
    registerUser({ name: name.trim(), email: email.trim().toLowerCase(), password });
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.logoSection}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>Q</Text>
            </View>
            <Text style={s.heading}>Create account</Text>
            <Text style={s.subheading}>Start splitting expenses for free</Text>
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Full name</Text>
            <TextInput style={s.input} value={name} onChangeText={setName}
              placeholder="Rohan Mehta" placeholderTextColor="#9CA3AF" autoCapitalize="words" autoCorrect={false} />
          </View>

          {/* Email */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail}
              placeholder="you@example.com" placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
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
              placeholder="Repeat password" placeholderTextColor="#9CA3AF"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
