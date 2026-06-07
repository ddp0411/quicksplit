import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { expensesAPI, EXPENSE_CATEGORIES, type ExpenseCategory } from '../services/api/expensesAPI';
import { groupsAPI } from '../services/api/groupsAPI';
import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal' },
  { value: 'exact', label: 'Exact' },
  { value: 'percentage', label: '%' },
] as const;

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const { toast } = useToastStore();

  const preselectedGroupId: string | undefined = params?.groupId;

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage'>('equal');
  const [groupId, setGroupId] = useState<string>(preselectedGroupId ?? '');
  const [showGroups, setShowGroups] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsAPI.getGroups,
  });

  const mutation = useMutation({
    mutationFn: () => expensesAPI.createExpense({
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      paid_by_user_id: user!.id,
      split_type: splitType,
      date: new Date().toISOString().split('T')[0],
      group_id: groupId || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast('Expense added!', 'success');
      navigation.goBack();
    },
    onError: () => toast('Failed to add expense', 'error'),
  });

  const handleSubmit = () => {
    if (!description.trim()) { Alert.alert('Missing description', 'Please enter a description.'); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { Alert.alert('Invalid amount', 'Enter a valid amount.'); return; }
    mutation.mutate();
  };

  const selectedGroup = (groups as any[]).find(g => g.id === groupId);
  const selectedCat = EXPENSE_CATEGORIES.find(c => c.value === category)!;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Add Expense</Text>
          <TouchableOpacity
            style={[s.saveBtn, mutation.isPending && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            <Text style={s.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {/* Amount */}
          <View style={s.amountCard}>
            <Text style={s.currencySymbol}>₹</Text>
            <TextInput
              style={s.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#D1D5DB"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Description */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Description</Text>
            <TextInput
              style={s.fieldInput}
              value={description}
              onChangeText={setDescription}
              placeholder="What's this for?"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category picker */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Category</Text>
            <TouchableOpacity style={s.selector} onPress={() => setShowCategories(v => !v)}>
              <Text style={s.selectorText}>{selectedCat.emoji} {selectedCat.label}</Text>
              <Text style={s.selectorArrow}>{showCategories ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showCategories && (
              <View style={s.dropdown}>
                {EXPENSE_CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[s.dropItem, category === c.value && s.dropItemActive]}
                    onPress={() => { setCategory(c.value); setShowCategories(false); }}
                  >
                    <Text style={s.dropItemText}>{c.emoji} {c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Group picker */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Group (optional)</Text>
            <TouchableOpacity style={s.selector} onPress={() => setShowGroups(v => !v)}>
              <Text style={s.selectorText}>{selectedGroup ? selectedGroup.name : 'No group (personal)'}</Text>
              <Text style={s.selectorArrow}>{showGroups ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showGroups && (
              <View style={s.dropdown}>
                <TouchableOpacity
                  style={[s.dropItem, !groupId && s.dropItemActive]}
                  onPress={() => { setGroupId(''); setShowGroups(false); }}
                >
                  <Text style={s.dropItemText}>No group</Text>
                </TouchableOpacity>
                {(groups as any[]).map(g => (
                  <TouchableOpacity
                    key={g.id}
                    style={[s.dropItem, groupId === g.id && s.dropItemActive]}
                    onPress={() => { setGroupId(g.id); setShowGroups(false); }}
                  >
                    <Text style={s.dropItemText}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Split type */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Split type</Text>
            <View style={s.splitRow}>
              {SPLIT_TYPES.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[s.splitOption, splitType === t.value && s.splitOptionActive]}
                  onPress={() => setSplitType(t.value)}
                >
                  <Text style={[s.splitOptionText, splitType === t.value && s.splitOptionTextActive]}>
                    {t.label}
                  </Text>
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
  amountCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B4332', borderRadius: 20, padding: 24, marginBottom: 20 },
  currencySymbol: { fontSize: 32, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', minWidth: 120, textAlign: 'center' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  fieldInput: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  selector: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorText: { fontSize: 15, color: '#111827' },
  selectorArrow: { fontSize: 12, color: '#9CA3AF' },
  dropdown: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', marginTop: 4, overflow: 'hidden' },
  dropItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  dropItemActive: { backgroundColor: '#F0FDF4' },
  dropItemText: { fontSize: 14, color: '#111827' },
  splitRow: { flexDirection: 'row', gap: 8 },
  splitOption: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  splitOptionActive: { backgroundColor: '#F0FDF4', borderColor: '#1B4332' },
  splitOptionText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  splitOptionTextActive: { color: '#1B4332' },
});
