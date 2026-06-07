import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { getAPIErrorMessage } from '../services/api/errorMessage';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const authError = getAPIErrorMessage(loginError, 'Invalid credentials. Please try again.');

  const handleSubmit = () => {
    if (!email.trim() || !password) return;
    login({ email: email.trim().toLowerCase(), password });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>Q</Text>
            </View>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>Sign in to your QuickSplit account</Text>
          </View>

          {/* Error */}
          {loginError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
                <Text style={{ fontSize: 16 }}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (isLoggingIn || !email || !password) && styles.disabled]}
            onPress={handleSubmit}
            disabled={isLoggingIn || !email || !password}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {isLoggingIn ? 'Signing in…' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign up free</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
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
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  forgotLink: { fontSize: 12, fontWeight: '700', color: '#1B4332' },
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
  submitBtn: {
    backgroundColor: '#FF6B35', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
  },
  disabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 14, color: '#6B7280' },
  footerLink: { fontSize: 14, fontWeight: '700', color: '#1B4332' },
});
