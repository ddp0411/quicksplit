import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Modal,
  FlatList, Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { expensesAPI, EXPENSE_CATEGORIES, type ExpenseCategory } from '../services/api/expensesAPI';
import { groupsAPI } from '../services/api/groupsAPI';
import { friendsAPI } from '../services/api/friendsAPI';
import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

interface UserMini {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
}

function avatarInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal' },
  { value: 'exact', label: 'Exact' },
  { value: 'percentage', label: '%' },
  { value: 'shares', label: 'Shares' },
] as const;

type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

const RECURRING_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

// ─── Date Picker Modal ────────────────────────────────────────────────────────
function DatePickerModal({
  visible, value, onConfirm, onClose,
}: {
  visible: boolean; value: string; onConfirm: (date: string) => void; onClose: () => void;
}) {
  const { colors } = useTheme();
  const parsed = new Date(value + 'T00:00:00');
  const [day, setDay] = useState(String(parsed.getDate()).padStart(2, '0'));
  const [month, setMonth] = useState(String(parsed.getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(parsed.getFullYear()));

  const handleConfirm = () => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (isNaN(d) || isNaN(m) || isNaN(y) || d < 1 || d > 31 || m < 1 || m > 12 || y < 2000) {
      Alert.alert('Invalid date', 'Please enter a valid date.');
      return;
    }
    onConfirm(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    onClose();
  };

  if (!visible) return null;
  const ds = createDateStyles(colors);
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={ds.overlay}>
        <View style={ds.box}>
          <Text style={ds.title}>Select Date</Text>
          <View style={ds.row}>
            {[{ label: 'Day', val: day, set: setDay, max: 2, ph: 'DD' },
              { label: 'Month', val: month, set: setMonth, max: 2, ph: 'MM' },
              { label: 'Year', val: year, set: setYear, max: 4, ph: 'YYYY' }].map((col) => (
              <View key={col.label} style={ds.col}>
                <Text style={ds.colLabel}>{col.label}</Text>
                <TextInput
                  style={ds.input}
                  value={col.val}
                  onChangeText={col.set}
                  keyboardType="number-pad"
                  maxLength={col.max}
                  placeholder={col.ph}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>
          <View style={ds.btnRow}>
            <TouchableOpacity style={ds.cancelBtn} onPress={onClose}>
              <Text style={ds.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ds.confirmBtn} onPress={handleConfirm}>
              <Text style={ds.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createDateStyles(c: C) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    box: { backgroundColor: c.card, borderRadius: 20, padding: 24, width: '85%' },
    title: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 20, textAlign: 'center' },
    row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    col: { flex: 1, alignItems: 'center' },
    colLabel: { fontSize: 12, fontWeight: '600', color: c.textSub, marginBottom: 8 },
    input: {
      width: '100%', backgroundColor: c.pillBg, borderRadius: 12,
      paddingVertical: 10, paddingHorizontal: 8, fontSize: 18,
      fontWeight: '700', color: c.text, textAlign: 'center',
    },
    btnRow: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, backgroundColor: c.pillBg, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    cancelText: { fontSize: 14, fontWeight: '700', color: c.sectionLabel },
    confirmBtn: { flex: 1, backgroundColor: '#1B4332', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    confirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  });
}

// ─── User Picker Modal ────────────────────────────────────────────────────────
function UserPickerModal({
  visible, title, users, selected, multiSelect, onConfirm, onClose,
}: {
  visible: boolean; title: string; users: UserMini[];
  selected: string[]; multiSelect: boolean;
  onConfirm: (ids: string[]) => void; onClose: () => void;
}) {
  const { colors } = useTheme();
  const [localSelected, setLocalSelected] = useState<string[]>(selected);

  const toggle = (id: string) => {
    if (!multiSelect) { setLocalSelected([id]); return; }
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!visible) return null;
  const up = createPickerStyles(colors);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={up.overlay}>
        <View style={up.sheet}>
          <View style={up.handle} />
          <Text style={up.title}>{title}</Text>
          <FlatList
            data={users}
            keyExtractor={(u) => u.id}
            style={{ maxHeight: 320 }}
            renderItem={({ item: u }) => {
              const sel = localSelected.includes(u.id);
              return (
                <TouchableOpacity style={up.row} onPress={() => toggle(u.id)} activeOpacity={0.7}>
                  <View style={[up.avatar, { backgroundColor: u.avatar_color || '#1B4332' }]}>
                    <Text style={up.avatarText}>{avatarInitials(u.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={up.name}>{u.name}</Text>
                    <Text style={up.email}>{u.email}</Text>
                  </View>
                  <View style={[up.check, sel && up.checkActive]}>
                    {sel && <Text style={up.checkMark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <View style={up.btnRow}>
            <TouchableOpacity style={up.cancelBtn} onPress={onClose}>
              <Text style={up.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={up.confirmBtn}
              onPress={() => { onConfirm(localSelected); onClose(); }}
            >
              <Text style={up.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createPickerStyles(c: C) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
    },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: c.cardBorder, alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 14 },
    row: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder,
    },
    avatar: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    name: { fontSize: 14, fontWeight: '700', color: c.text },
    email: { fontSize: 12, color: c.textMuted, marginTop: 1 },
    check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center' },
    checkActive: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
    checkMark: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    cancelBtn: { flex: 1, backgroundColor: c.pillBg, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    cancelText: { fontSize: 14, fontWeight: '700', color: c.sectionLabel },
    confirmBtn: { flex: 1, backgroundColor: '#1B4332', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    confirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  });
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createStyles(colors);

  const preselectedGroupId: string | undefined = params?.groupId;
  const today = new Date().toISOString().split('T')[0];

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [groupId, setGroupId] = useState<string>(preselectedGroupId ?? '');
  const [showGroups, setShowGroups] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [date, setDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('monthly');

  const [paidBy, setPaidBy] = useState<UserMini>({
    id: user!.id, name: user!.name, email: user!.email,
    avatar_color: user!.avatar_color ?? '#1B4332',
  });
  const [participants, setParticipants] = useState<string[]>([user!.id]);
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, string>>({});

  const [showPaidByPicker, setShowPaidByPicker] = useState(false);
  const [showParticipantPicker, setShowParticipantPicker] = useState(false);

  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: groupsAPI.getGroups });

  const { data: groupDetail } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsAPI.getGroup(groupId),
    enabled: !!groupId,
  });

  const { data: friendsData = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const availableUsers: UserMini[] = useMemo(() => {
    if (groupId && groupDetail) {
      return (groupDetail as any).members.map((m: any) => m.user);
    }
    const friendUsers: UserMini[] = (friendsData as any[]).map((f: any) => f.user);
    const allIds = new Set(friendUsers.map((u) => u.id));
    if (!allIds.has(user!.id)) {
      friendUsers.unshift({ id: user!.id, name: user!.name, email: user!.email, avatar_color: user!.avatar_color ?? '#1B4332' });
    }
    return friendUsers;
  }, [groupId, groupDetail, friendsData, user]);

  const selectedGroup = (groups as any[]).find((g) => g.id === groupId);
  const selectedCat = EXPENSE_CATEGORIES.find((c) => c.value === category)!;
  const participantUsers = useMemo(
    () => availableUsers.filter((u) => participants.includes(u.id)),
    [availableUsers, participants]
  );

  const mutation = useMutation({
    mutationFn: () => {
      const amt = parseFloat(amount);
      const payload: any = {
        description: description.trim(),
        amount: amt,
        category,
        paid_by_user_id: paidBy.id,
        split_type: splitType,
        date,
        notes: notes.trim() || undefined,
        group_id: groupId || undefined,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? recurringFreq : undefined,
      };
      if (splitType === 'equal') {
        payload.participant_ids = participants;
      } else {
        payload.shares = participantUsers.map((u) => ({
          user_id: u.id,
          value: parseFloat(
            (splitType === 'exact' ? exactAmounts : splitType === 'percentage' ? percentages : shares)[u.id] || (splitType === 'shares' ? '1' : '0')
          ),
        }));
      }
      return expensesAPI.createExpense(payload);
    },
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
    if (participants.length === 0) { Alert.alert('No participants', 'Add at least one participant.'); return; }
    mutation.mutate();
  };

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
            <Text style={s.saveBtnText}>{mutation.isPending ? '…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
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
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Category */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Category</Text>
            <TouchableOpacity style={s.selector} onPress={() => setShowCategories((v) => !v)}>
              <Text style={s.selectorText}>{selectedCat.emoji} {selectedCat.label}</Text>
              <Text style={s.selectorArrow}>{showCategories ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showCategories && (
              <View style={s.dropdown}>
                {EXPENSE_CATEGORIES.map((c) => (
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

          {/* Group */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Group (optional)</Text>
            <TouchableOpacity style={s.selector} onPress={() => setShowGroups((v) => !v)}>
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
                {(groups as any[]).map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[s.dropItem, groupId === g.id && s.dropItemActive]}
                    onPress={() => { setGroupId(g.id); setShowGroups(false); setParticipants([user!.id]); }}
                  >
                    <Text style={s.dropItemText}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Paid By */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Paid by</Text>
            <TouchableOpacity
              style={s.selector}
              onPress={() => setShowPaidByPicker(true)}
              disabled={availableUsers.length <= 1}
            >
              <View style={[s.miniAvatar, { backgroundColor: paidBy.avatar_color || '#1B4332' }]}>
                <Text style={s.miniAvatarText}>{avatarInitials(paidBy.name)}</Text>
              </View>
              <Text style={[s.selectorText, { flex: 1, marginLeft: 8 }]}>{paidBy.name}</Text>
              {availableUsers.length > 1 && <Text style={s.selectorArrow}>▼</Text>}
            </TouchableOpacity>
          </View>

          {/* Participants */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Split with</Text>
            <View style={s.chipsWrap}>
              {participantUsers.map((u) => (
                <View key={u.id} style={s.chip}>
                  <Text style={s.chipText}>{u.name.split(' ')[0]}</Text>
                  <TouchableOpacity onPress={() => setParticipants((prev) => prev.filter((id) => id !== u.id))}>
                    <Text style={s.chipX}> ×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={s.addChip} onPress={() => setShowParticipantPicker(true)}>
                <Text style={s.addChipText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Split type */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Split type</Text>
            <View style={s.splitRow}>
              {SPLIT_TYPES.map((t) => (
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

          {/* Per-participant value inputs */}
          {(splitType !== 'equal') && participantUsers.length > 0 && (
            <View style={s.field}>
              <Text style={s.fieldLabel}>
                {splitType === 'exact' ? 'Exact amounts (₹)' : splitType === 'percentage' ? 'Percentages (%)' : 'Shares (units)'}
              </Text>
              {participantUsers.map((u) => {
                const valMap = splitType === 'exact' ? exactAmounts : splitType === 'percentage' ? percentages : shares;
                const setFn = splitType === 'exact' ? setExactAmounts : splitType === 'percentage' ? setPercentages : setShares;
                return (
                  <View key={u.id} style={s.splitInputRow}>
                    <Text style={s.splitInputLabel}>{u.name.split(' ')[0]}</Text>
                    <TextInput
                      style={s.splitInput}
                      value={valMap[u.id] ?? (splitType === 'shares' ? '1' : '')}
                      onChangeText={(v) => setFn((prev) => ({ ...prev, [u.id]: v }))}
                      keyboardType="decimal-pad"
                      placeholder={splitType === 'shares' ? '1' : '0'}
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                );
              })}
            </View>
          )}

          {/* Date */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Date</Text>
            <TouchableOpacity style={s.selector} onPress={() => setShowDatePicker(true)}>
              <Text style={s.selectorText}>📅 {formatDateDisplay(date)}</Text>
              <Text style={s.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={[s.fieldInput, { minHeight: 60, textAlignVertical: 'top', paddingTop: 12 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes…"
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>

          {/* Recurring */}
          <View style={s.field}>
            <View style={s.switchRow}>
              <Text style={s.fieldLabel}>Recurring expense</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: colors.cardBorder, true: '#1B4332' }}
                thumbColor="#FFFFFF"
              />
            </View>
            {isRecurring && (
              <View style={[s.splitRow, { marginTop: 8 }]}>
                {RECURRING_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[s.splitOption, recurringFreq === opt.value && s.splitOptionActive]}
                    onPress={() => setRecurringFreq(opt.value)}
                  >
                    <Text style={[s.splitOptionText, recurringFreq === opt.value && s.splitOptionTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={showDatePicker}
        value={date}
        onConfirm={setDate}
        onClose={() => setShowDatePicker(false)}
      />
      <UserPickerModal
        visible={showPaidByPicker}
        title="Who paid?"
        users={availableUsers}
        selected={[paidBy.id]}
        multiSelect={false}
        onConfirm={(ids) => {
          const u = availableUsers.find((x) => x.id === ids[0]);
          if (u) setPaidBy(u);
        }}
        onClose={() => setShowPaidByPicker(false)}
      />
      <UserPickerModal
        visible={showParticipantPicker}
        title="Split with…"
        users={availableUsers}
        selected={participants}
        multiSelect
        onConfirm={setParticipants}
        onClose={() => setShowParticipantPicker(false)}
      />
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
    saveBtn: { backgroundColor: '#1B4332', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
    saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    scroll: { paddingHorizontal: 20, paddingBottom: 120 },
    amountCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B4332', borderRadius: 20, padding: 24, marginBottom: 20 },
    currencySymbol: { fontSize: 32, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginRight: 4 },
    amountInput: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', minWidth: 120, textAlign: 'center' },
    field: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: c.sectionLabel, marginBottom: 6 },
    fieldInput: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text },
    selector: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    selectorText: { fontSize: 15, color: c.text },
    selectorArrow: { fontSize: 12, color: c.textMuted },
    dropdown: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, marginTop: 4, overflow: 'hidden' },
    dropItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder },
    dropItemActive: { backgroundColor: c.successBg },
    dropItemText: { fontSize: 14, color: c.text },
    miniAvatar: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    miniAvatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#BBF7D0' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#166534' },
    chipX: { fontSize: 16, color: '#16A34A', fontWeight: '700' },
    addChip: { backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: c.cardBorder },
    addChipText: { fontSize: 13, color: c.textSub, fontWeight: '600' },
    splitRow: { flexDirection: 'row', gap: 8 },
    splitOption: { flex: 1, backgroundColor: c.pillBg, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    splitOptionActive: { backgroundColor: '#F0FDF4', borderColor: '#1B4332' },
    splitOptionText: { fontSize: 14, fontWeight: '600', color: c.textSub },
    splitOptionTextActive: { color: '#1B4332' },
    splitInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    splitInputLabel: { fontSize: 14, color: c.sectionLabel, flex: 1 },
    splitInput: { backgroundColor: c.inputBg, borderRadius: 10, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: c.text, width: 100, textAlign: 'right' },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  });
}
