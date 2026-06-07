import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsAPI } from '../services/api/groupsAPI';
import { useToastStore } from '../state/toastStore';

const CATEGORIES = [
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'trip', label: 'Trip', emoji: '✈️' },
  { value: 'couple', label: 'Couple', emoji: '💑' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'other', label: 'Other', emoji: '🎉' },
] as const;

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('other');

  const mutation = useMutation({
    mutationFn: () => groupsAPI.createGroup({ name: name.trim(), description: description.trim(), category }),
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast('Group created!', 'success');
      navigation.replace('GroupDetail', { groupId: group.id });
    },
    onError: () => toast('Failed to create group', 'error'),
  });

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>New Group</Text>
          <TouchableOpacity
            style={[s.saveBtn, (!name.trim() || mutation.isPending) && { opacity: 0.5 }]}
            onPress={() => mutation.mutate()}
            disabled={!name.trim() || mutation.isPending}
          >
            <Text style={s.saveBtnText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Group name</Text>
            <TextInput
              style={s.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Goa Trip 2025"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Description (optional)</Text>
            <TextInput
              style={s.fieldInput}
              value={description}
              onChangeText={setDescription}
              placeholder="What's this group for?"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Category</Text>
            <View style={s.catGrid}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c.value}
                  style={[s.catItem, category === c.value && s.catItemActive]}
                  onPress={() => setCategory(c.value)}
                >
                  <Text style={s.catEmoji}>{c.emoji}</Text>
                  <Text style={[s.catLabel, category === c.value && s.catLabelActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  fieldInput: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catItem: { flex: 1, minWidth: '28%', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E7E5E4', paddingVertical: 14, alignItems: 'center', gap: 6 },
  catItemActive: { borderColor: '#1B4332', backgroundColor: '#F0FDF4' },
  catEmoji: { fontSize: 24 },
  catLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  catLabelActive: { color: '#1B4332' },
});
