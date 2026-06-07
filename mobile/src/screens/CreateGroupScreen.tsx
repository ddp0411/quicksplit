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
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

const CATEGORIES = [
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'trip', label: 'Trip', emoji: '✈️' },
  { value: 'couple', label: 'Couple', emoji: '💑' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'other', label: 'Other', emoji: '🎉' },
] as const;

const SPLIT_METHODS = [
  { value: 'equal', label: 'Equal Split', desc: 'Everyone pays the same amount', emoji: '⚖️' },
  { value: 'proportional', label: 'Proportional', desc: 'Based on income or usage', emoji: '📊' },
  { value: 'custom', label: 'Custom', desc: 'Set amounts per expense', emoji: '✏️' },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const STEPS = ['Details', 'Members', 'Settings'];

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();

  const [step, setStep] = useState(0);

  // Step 1
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('other');

  // Step 2
  const [emailInput, setEmailInput] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>([]);

  // Step 3
  const [splitMethod, setSplitMethod] = useState('equal');

  const mutation = useMutation({
    mutationFn: () => groupsAPI.createGroup({
      name: name.trim(),
      description: description.trim(),
      category,
      member_emails: memberEmails.length > 0 ? memberEmails : undefined,
    }),
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast('Group created!', 'success');
      navigation.replace('GroupDetail', { groupId: (group as any).id });
    },
    onError: () => toast('Failed to create group', 'error'),
  });

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!isValidEmail(email)) { toast('Enter a valid email address', 'error'); return; }
    if (memberEmails.includes(email)) { toast('Already added', 'error'); return; }
    setMemberEmails((prev) => [...prev, email]);
    setEmailInput('');
  };

  const removeEmail = (email: string) => {
    setMemberEmails((prev) => prev.filter((e) => e !== email));
  };

  const canAdvance = step === 0 ? !!name.trim() : true;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => step === 0 ? navigation.goBack() : setStep((p) => p - 1)}>
            <Text style={s.backText}>{step === 0 ? '←' : '‹'}</Text>
          </TouchableOpacity>
          <Text style={s.title}>New Group</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Step indicator */}
        <View style={s.stepRow}>
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <View style={s.stepItem}>
                <View style={[s.stepDot, i <= step && s.stepDotActive]}>
                  <Text style={[s.stepNum, i <= step && s.stepNumActive]}>{i + 1}</Text>
                </View>
                <Text style={[s.stepLabel, i <= step && s.stepLabelActive]}>{label}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[s.stepLine, i < step && s.stepLineActive]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* ── Step 1: Details ── */}
          {step === 0 && (
            <>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Group name *</Text>
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
                  {CATEGORIES.map((c) => (
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
            </>
          )}

          {/* ── Step 2: Members ── */}
          {step === 1 && (
            <>
              <Text style={s.stepHint}>Add friends by email. They'll be invited to join.</Text>
              <View style={s.emailRow}>
                <TextInput
                  style={[s.fieldInput, { flex: 1 }]}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholder="friend@example.com"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onSubmitEditing={addEmail}
                  returnKeyType="done"
                />
                <TouchableOpacity style={s.addBtn} onPress={addEmail}>
                  <Text style={s.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              {memberEmails.length === 0 ? (
                <View style={s.emptyNote}>
                  <Text style={s.emptyNoteText}>No members added yet — you can also add members after creating the group.</Text>
                </View>
              ) : (
                <View style={s.chipWrap}>
                  {memberEmails.map((email) => (
                    <View key={email} style={s.chip}>
                      <Text style={s.chipText}>{email}</Text>
                      <TouchableOpacity onPress={() => removeEmail(email)}>
                        <Text style={s.chipX}> ×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ── Step 3: Settings ── */}
          {step === 2 && (
            <>
              <Text style={s.stepHint}>Choose a default split method for this group.</Text>
              {SPLIT_METHODS.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[s.methodCard, splitMethod === m.value && s.methodCardActive]}
                  onPress={() => setSplitMethod(m.value)}
                >
                  <Text style={s.methodEmoji}>{m.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.methodLabel, splitMethod === m.value && s.methodLabelActive]}>{m.label}</Text>
                    <Text style={s.methodDesc}>{m.desc}</Text>
                  </View>
                  <View style={[s.radio, splitMethod === m.value && s.radioActive]}>
                    {splitMethod === m.value && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={s.footer}>
          {step < 2 ? (
            <TouchableOpacity
              style={[s.nextBtn, !canAdvance && { opacity: 0.5 }]}
              onPress={() => setStep((p) => p + 1)}
              disabled={!canAdvance}
            >
              <Text style={s.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.nextBtn, (!name.trim() || mutation.isPending) && { opacity: 0.5 }]}
              onPress={() => mutation.mutate()}
              disabled={!name.trim() || mutation.isPending}
            >
              <Text style={s.nextBtnText}>{mutation.isPending ? 'Creating…' : 'Create Group'}</Text>
            </TouchableOpacity>
          )}
        </View>
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
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 20 },
  stepItem: { alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDotActive: { backgroundColor: '#1B4332' },
  stepNum: { fontSize: 13, fontWeight: '700', color: c.textMuted },
  stepNumActive: { color: '#FFFFFF' },
  stepLabel: { fontSize: 11, color: c.textMuted, fontWeight: '600' },
  stepLabelActive: { color: '#1B4332' },
  stepLine: { flex: 1, height: 2, backgroundColor: c.cardBorder, marginHorizontal: 4, marginBottom: 18 },
  stepLineActive: { backgroundColor: '#1B4332' },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  stepHint: { fontSize: 14, color: c.textSub, marginBottom: 20, lineHeight: 20 },
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: c.sectionLabel, marginBottom: 8 },
  fieldInput: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catItem: { flex: 1, minWidth: '28%', backgroundColor: c.card, borderRadius: 14, borderWidth: 1.5, borderColor: c.cardBorder, paddingVertical: 14, alignItems: 'center', gap: 6 },
  catItemActive: { borderColor: '#1B4332', backgroundColor: '#F0FDF4' },
  catEmoji: { fontSize: 24 },
  catLabel: { fontSize: 12, fontWeight: '600', color: c.textSub },
  catLabelActive: { color: '#1B4332' },
  emailRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  addBtn: { backgroundColor: '#1B4332', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center' },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  emptyNote: { backgroundColor: c.pillBg, borderRadius: 14, padding: 16 },
  emptyNoteText: { fontSize: 14, color: c.textMuted, textAlign: 'center', lineHeight: 20 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#BBF7D0' },
  chipText: { fontSize: 13, color: '#166534', fontWeight: '500' },
  chipX: { fontSize: 16, color: '#16A34A', fontWeight: '700' },
  methodCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.card, borderRadius: 16, borderWidth: 1.5, borderColor: c.cardBorder, padding: 16, marginBottom: 10 },
  methodCardActive: { borderColor: '#1B4332', backgroundColor: '#F0FDF4' },
  methodEmoji: { fontSize: 24 },
  methodLabel: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 2 },
  methodLabelActive: { color: '#1B4332' },
  methodDesc: { fontSize: 12, color: c.textSub },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#1B4332' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1B4332' },
  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.cardBorder },
  nextBtn: { backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}
