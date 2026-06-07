import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { toast } = useToastStore();
  const [name, setName] = useState(user?.name ?? '');
  const [upiId, setUpiId] = useState((user as any)?.upi_id ?? '');

  const handleSave = () => {
    if (!name.trim()) { toast('Name cannot be empty', 'error'); return; }
    // TODO: wire up to profile update API when endpoint is available
    toast('Profile updated', 'success');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Edit Profile</Text>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Full name</Text>
            <TextInput style={s.fieldInput} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#9CA3AF" />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Email</Text>
            <View style={[s.fieldInput, s.readOnly]}><Text style={s.readOnlyText}>{user?.email}</Text></View>
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>UPI ID</Text>
            <TextInput style={s.fieldInput} value={upiId} onChangeText={setUpiId} placeholder="yourname@upi" placeholderTextColor="#9CA3AF" autoCapitalize="none" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#111827' },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  saveBtn: { backgroundColor: '#1B4332', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  fieldInput: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  readOnly: { backgroundColor: '#F9FAFB' },
  readOnlyText: { fontSize: 15, color: '#9CA3AF' },
});
