import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';
import { authAPI } from '../services/api/authAPI';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

const AVATAR_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
];

function avatarInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser, token } = useUserStore();
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createStyles(colors);

  const [name, setName] = useState(user?.name ?? '');
  const [upiId, setUpiId] = useState(user?.upi_id ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color ?? AVATAR_COLORS[3]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast('Name cannot be empty', 'error'); return; }
    setSaving(true);
    try {
      const updated = await authAPI.updateProfile({
        name: name.trim(),
        upi_id: upiId.trim() || undefined,
        avatar_color: avatarColor,
        phone_number: phoneNumber.trim() || undefined,
      });
      setUser({ ...user!, ...updated }, token!);
      toast('Profile updated', 'success');
      navigation.goBack();
    } catch {
      toast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Edit Profile</Text>
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? '…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {/* Avatar preview */}
          <View style={s.avatarSection}>
            <View style={[s.avatarPreview, { backgroundColor: avatarColor }]}>
              <Text style={s.avatarInitials}>{avatarInitials(name || user?.name || 'U')}</Text>
            </View>
            <Text style={s.avatarHint}>Tap a color to change your avatar</Text>
          </View>

          {/* Color picker */}
          <View style={s.colorGrid}>
            {AVATAR_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[s.colorDot, { backgroundColor: color }, avatarColor === color && s.colorDotActive]}
                onPress={() => setAvatarColor(color)}
              >
                {avatarColor === color && <Text style={s.colorCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Full name</Text>
            <TextInput
              style={s.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Email</Text>
            <View style={[s.fieldInput, s.readOnly]}>
              <Text style={s.readOnlyText}>{user?.email}</Text>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>UPI ID</Text>
            <TextInput
              style={s.fieldInput}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@upi"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Phone Number</Text>
            <TextInput
              style={s.fieldInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+91 98765 43210"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: c.text },
  title: { fontSize: 17, fontWeight: '700', color: c.text },
  saveBtn: { backgroundColor: '#0466C8', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarPreview: { width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarInitials: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  avatarHint: { fontSize: 13, color: c.textMuted },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 },
  colorDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: c.text, borderWidth: 3 },
  colorCheck: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: c.sectionLabel, marginBottom: 6 },
  fieldInput: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text },
  readOnly: { backgroundColor: c.pillBg },
  readOnlyText: { fontSize: 15, color: c.textMuted },
  });
}
