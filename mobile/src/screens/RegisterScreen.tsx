import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { getAPIErrorMessage } from '../services/api/errorMessage';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { register: registerUser, isRegistering, registerError } = useAuth();
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          {/* Logo */}
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

          <Field label="Full name" value={name} onChangeText={setName} placeholder="Rohan Mehta" autoCapitalize="words" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />

          {/* Password with toggle */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Password</Text>
            <View style={s.passwordWrap}>
              <TextInput
                style={{ flex: 1, fontSize: 15, paddingVertical: 14, paddingLeft: 16, color: '#111827' }}
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

          <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword}
            placeholder="Repeat password" secureTextEntry={!showPw} />

          {/* Terms */}
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
            <Text style={s.submitText}>
              {isRegistering ? 'Creating account…' : 'Create account'}
            </Text>
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

function Field({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, secureTextEntry,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any; autoCapitalize?: any; secureTextEntry?: boolean;
}) {
  return (
    <View style={s.fieldGroup}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
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
  heading: { fontSize: 28, fontWeight: '800', color: '#111827', fontFamily: 'PlayfairDisplay_700Bold' },
  subheading: { marginTop: 4, fontSize: 14, color: '#6B7280' },
  errorBox: {
    backgroundColor: '#FFF1F2', borderColor: '#FECACA', borderWidth: 1,
    borderRadius: 16, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E7E5E4', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    backgroundColor: '#FFFFFF', color: '#111827',
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E7E5E4', borderRadius: 16,
    backgroundColor: '#FFFFFF', paddingRight: 8,
  },
  eyeBtn: { padding: 8 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2,
    borderColor: '#E7E5E4', alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  termsText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 20 },
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
  footerText: { fontSize: 14, color: '#6B7280' },
  footerLink: { fontSize: 14, fontWeight: '700', color: '#1B4332' },
});
