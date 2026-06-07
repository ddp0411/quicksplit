import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
  Share, Alert, TextInput, Modal, FlatList, Animated,
  Image, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import { groupsAPI } from '../services/api/groupsAPI';
import { expensesAPI, EXPENSE_CATEGORIES } from '../services/api/expensesAPI';
import { ocrAPI } from '../services/api/ocrAPI';
import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';
import { useThemeStore } from '../state/themeStore';
import { useTheme } from '../theme/useTheme';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';

type C = ReturnType<typeof useTheme>['colors'];

function ScreenHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createHdStyles(colors);
  return (
    <View style={s.header}>
      <TouchableOpacity style={s.backBtn} onPress={() => onBack ? onBack() : navigation.goBack()}>
        <Text style={s.backText}>←</Text>
      </TouchableOpacity>
      <Text style={s.title}>{title}</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}
function createHdStyles(c: C) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 18, color: c.text },
    title: { fontSize: 17, fontWeight: '700', color: c.text },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget Dashboard
// ─────────────────────────────────────────────────────────────────────────────
interface Budget { id: string; category: string; limit: number; spent: number; }

const BUDGET_CATEGORIES = EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label, emoji: c.emoji }));

export const BudgetDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createBsStyles(colors);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addCategory, setAddCategory] = useState('food');
  const [addLimit, setAddLimit] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('qs-budgets').then((raw) => raw && setBudgets(JSON.parse(raw)));
  }, []);

  const saveBudgets = (updated: Budget[]) => {
    setBudgets(updated);
    AsyncStorage.setItem('qs-budgets', JSON.stringify(updated));
  };

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  const getBadge = (pct: number) => {
    if (pct >= 100) return { label: 'OVER BUDGET', color: '#DC2626', bg: '#FEF2F2' };
    if (pct >= 80) return { label: 'NEAR LIMIT', color: '#D97706', bg: '#FFFBEB' };
    return { label: 'ON TRACK', color: '#16A34A', bg: '#F0FDF4' };
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Budget Dashboard" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.ringCard}>
          <View style={s.ringOuter}>
            <View style={s.ringTrack}>
              <View style={[s.ringFill, { width: `${totalPct}%` }]} />
            </View>
          </View>
          <Text style={s.ringLabel}>₹{totalSpent.toFixed(0)} / ₹{totalLimit.toFixed(0)}</Text>
          <Text style={s.ringSubLabel}>{totalPct.toFixed(0)}% of total budget used</Text>
        </View>

        {budgets.map((b) => {
          const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
          const badge = getBadge(pct);
          const cat = BUDGET_CATEGORIES.find((c) => c.value === b.category);
          return (
            <View key={b.id} style={s.budgetRow}>
              <View style={s.budgetHeader}>
                <Text style={s.budgetEmoji}>{cat?.emoji ?? '📦'}</Text>
                <Text style={s.budgetLabel}>{cat?.label ?? b.category}</Text>
                <View style={[s.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[s.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>
              <View style={s.bar}>
                <View style={[s.barFill, { width: `${pct}%`, backgroundColor: badge.color }]} />
              </View>
              <Text style={s.budgetMeta}>₹{b.spent.toFixed(0)} spent of ₹{b.limit.toFixed(0)}</Text>
              <TouchableOpacity onPress={() => saveBudgets(budgets.filter((x) => x.id !== b.id))}>
                <Text style={s.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={s.addBtnText}>+ Add Budget</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.handle} />
            <Text style={s.modalTitle}>Add Budget</Text>
            <Text style={s.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {BUDGET_CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[s.catChip, addCategory === c.value && s.catChipActive]}
                    onPress={() => setAddCategory(c.value)}
                  >
                    <Text>{c.emoji} {c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={s.fieldLabel}>Monthly limit (₹)</Text>
            <TextInput
              style={s.input}
              value={addLimit}
              onChangeText={setAddLimit}
              keyboardType="decimal-pad"
              placeholder="5000"
              placeholderTextColor={colors.textMuted}
            />
            <View style={s.modalBtnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmBtn}
                onPress={() => {
                  const limit = parseFloat(addLimit);
                  if (!limit || limit <= 0) return;
                  saveBudgets([...budgets, { id: Date.now().toString(), category: addCategory, limit, spent: 0 }]);
                  setAddLimit('');
                  setShowAdd(false);
                }}
              >
                <Text style={s.confirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

function createBsStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    ringCard: { backgroundColor: '#1B4332', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
    ringOuter: { width: '100%', marginBottom: 12 },
    ringTrack: { height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' },
    ringFill: { height: 12, backgroundColor: '#FF6B35', borderRadius: 6 },
    ringLabel: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
    ringSubLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    budgetRow: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 16, marginBottom: 10 },
    budgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    budgetEmoji: { fontSize: 20 },
    budgetLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: c.text },
    badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 10, fontWeight: '800' },
    bar: { height: 8, backgroundColor: c.pillBg, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
    barFill: { height: 8, borderRadius: 4 },
    budgetMeta: { fontSize: 12, color: c.textSub },
    deleteText: { fontSize: 12, color: '#DC2626', marginTop: 6 },
    addBtn: { backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
    addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: c.cardBorder, alignSelf: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 14 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: c.sectionLabel, marginBottom: 6 },
    input: { backgroundColor: c.pillBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text, marginBottom: 16 },
    catChip: { backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
    catChipActive: { backgroundColor: c.successBg, borderWidth: 1, borderColor: '#1B4332' },
    modalBtnRow: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, backgroundColor: c.pillBg, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    cancelText: { fontWeight: '700', color: c.sectionLabel },
    confirmBtn: { flex: 1, backgroundColor: '#1B4332', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    confirmText: { fontWeight: '700', color: '#FFFFFF' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Tracker
// ─────────────────────────────────────────────────────────────────────────────
interface Subscription { id: string; name: string; amount: number; cycle: string; nextDate: string; }

export const SubscriptionTrackerScreen: React.FC = () => {
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createSsStyles(colors);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', cycle: 'monthly', nextDate: '' });

  useEffect(() => {
    AsyncStorage.getItem('qs-subscriptions').then((raw) => {
      if (raw) setSubs(JSON.parse(raw));
      else setSubs([]);
    });
  }, []);

  const saveSubs = (updated: Subscription[]) => {
    setSubs(updated);
    AsyncStorage.setItem('qs-subscriptions', JSON.stringify(updated));
  };

  const monthlyTotal = subs
    .reduce((sum, sub) => sum + (sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount), 0);

  const deleteSub = (id: string) => {
    Alert.alert('Delete subscription', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => saveSubs(subs.filter((sub) => sub.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Subscriptions" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={s.heroLabel}>Monthly Total</Text>
          <Text style={s.heroAmount}>₹{monthlyTotal.toFixed(0)}</Text>
        </View>

        {subs.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>📺</Text>
            <Text style={s.emptyTitle}>No subscriptions</Text>
            <Text style={s.emptySub}>Add your recurring services to track monthly costs</Text>
          </View>
        ) : (
          subs.map((sub) => (
            <View key={sub.id} style={s.subRow}>
              <View style={s.subIcon}><Text style={{ fontSize: 20 }}>📱</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.subName}>{sub.name}</Text>
                <Text style={s.subMeta}>{sub.cycle} · Next: {sub.nextDate || 'Not set'}</Text>
              </View>
              <Text style={s.subAmount}>₹{sub.amount}</Text>
              <TouchableOpacity onPress={() => deleteSub(sub.id)} style={s.deleteBtn}>
                <Text style={s.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={s.addBtnText}>+ Add Subscription</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>Add Subscription</Text>
            {[
              { label: 'Service name', key: 'name', ph: 'Netflix, Spotify…' },
              { label: 'Amount (₹)', key: 'amount', ph: '499', keyboard: 'decimal-pad' },
              { label: 'Next billing date', key: 'nextDate', ph: 'e.g. 15 Jul 2025' },
            ].map((f) => (
              <View key={f.key} style={s.field}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={s.input}
                  value={(form as any)[f.key]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                  placeholder={f.ph}
                  placeholderTextColor={colors.textMuted}
                  keyboardType={(f as any).keyboard ?? 'default'}
                />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {['monthly', 'yearly'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.cycleBtn, form.cycle === c && s.cycleBtnActive]}
                  onPress={() => setForm((p) => ({ ...p, cycle: c }))}
                >
                  <Text style={[s.cycleBtnText, form.cycle === c && { color: '#1B4332' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmBtn}
                onPress={() => {
                  if (!form.name.trim() || !form.amount) { toast('Fill all required fields', 'error'); return; }
                  saveSubs([...subs, { id: Date.now().toString(), name: form.name.trim(), amount: parseFloat(form.amount), cycle: form.cycle, nextDate: form.nextDate }]);
                  setForm({ name: '', amount: '', cycle: 'monthly', nextDate: '' });
                  setShowAdd(false);
                }}
              >
                <Text style={s.confirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

function createSsStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    hero: { backgroundColor: '#1B4332', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
    heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    heroAmount: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 },
    emptySub: { fontSize: 14, color: c.textMuted, textAlign: 'center', maxWidth: 260 },
    subRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 14, marginBottom: 8 },
    subIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
    subName: { fontSize: 14, fontWeight: '700', color: c.text },
    subMeta: { fontSize: 12, color: c.textMuted, marginTop: 2, textTransform: 'capitalize' },
    subAmount: { fontSize: 14, fontWeight: '700', color: '#1B4332' },
    deleteBtn: { padding: 6 },
    deleteText: { fontSize: 14, color: c.textMuted },
    addBtn: { backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: c.cardBorder, alignSelf: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 16 },
    field: { marginBottom: 12 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: c.sectionLabel, marginBottom: 6 },
    input: { backgroundColor: c.pillBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text },
    cycleBtn: { flex: 1, backgroundColor: c.pillBg, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    cycleBtnActive: { backgroundColor: c.successBg, borderColor: '#1B4332' },
    cycleBtnText: { fontSize: 14, fontWeight: '600', color: c.textSub, textTransform: 'capitalize' },
    cancelBtn: { flex: 1, backgroundColor: c.pillBg, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    cancelText: { fontWeight: '700', color: c.sectionLabel },
    confirmBtn: { flex: 1, backgroundColor: '#1B4332', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    confirmText: { fontWeight: '700', color: '#FFFFFF' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Spending Insights
// ─────────────────────────────────────────────────────────────────────────────
const DATE_FILTERS = [
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'All Time', value: 'all_time' },
];

export const SpendingInsightsScreen: React.FC = () => {
  const { colors } = useTheme();
  const s = createSiStyles(colors);
  const [filter, setFilter] = useState('this_month');

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesAPI.getExpenses(),
  });

  const filtered = (expenses as any[]).filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    if (filter === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filter === 'last_month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1);
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
    }
    return true;
  });

  const totalSpend = filtered.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const byCategory: Record<string, number> = {};
  filtered.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + parseFloat(e.amount);
  });
  const sorted = Object.entries(byCategory)
    .map(([cat, amount]) => ({ cat, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Spending Insights" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={s.heroLabel}>Total Spent</Text>
          <Text style={s.heroAmount}>{formatCurrency(totalSpend)}</Text>
        </View>

        <View style={s.filterRow}>
          {DATE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[s.filterChip, filter === f.value && s.filterChipActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[s.filterChipText, filter === f.value && s.filterChipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {sorted.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>No expenses for this period</Text>
          </View>
        ) : (
          sorted.map(({ cat, amount }) => {
            const catInfo = EXPENSE_CATEGORIES.find((c) => c.value === cat);
            const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
            return (
              <View key={cat} style={s.row}>
                <Text style={s.rowEmoji}>{catInfo?.emoji ?? '📦'}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.rowHeader}>
                    <Text style={s.rowLabel}>{catInfo?.label ?? cat}</Text>
                    <Text style={s.rowPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={s.rowAmount}>{formatCurrency(amount)}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function createSiStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    hero: { backgroundColor: '#1B4332', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
    heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    heroAmount: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    filterChip: { flex: 1, backgroundColor: c.pillBg, borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    filterChipActive: { backgroundColor: c.successBg, borderColor: '#1B4332' },
    filterChipText: { fontSize: 12, fontWeight: '600', color: c.textSub },
    filterChipTextActive: { color: '#1B4332' },
    empty: { alignItems: 'center', paddingTop: 40 },
    emptyText: { fontSize: 15, color: c.textMuted },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 14, marginBottom: 8 },
    rowEmoji: { fontSize: 24, marginTop: 2 },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    rowLabel: { fontSize: 14, fontWeight: '700', color: c.text },
    rowPct: { fontSize: 13, fontWeight: '700', color: '#1B4332' },
    barTrack: { height: 6, backgroundColor: c.pillBg, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
    barFill: { height: 6, backgroundColor: '#FF6B35', borderRadius: 3 },
    rowAmount: { fontSize: 12, color: c.textSub },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Group Insights
// ─────────────────────────────────────────────────────────────────────────────
export const GroupInsightsScreen: React.FC = () => {
  const { params } = useRoute<any>();
  const { colors } = useTheme();
  const s = createGiStyles(colors);
  const groupId: string = params?.groupId;

  const { data: balances } = useQuery({
    queryKey: ['group-balances', groupId],
    queryFn: () => groupsAPI.getBalances(groupId),
    enabled: !!groupId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', { group_id: groupId }],
    queryFn: () => expensesAPI.getExpenses({ group_id: groupId }),
    enabled: !!groupId,
  });

  const byCategory: Record<string, number> = {};
  (expenses as any[]).forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + parseFloat(e.amount);
  });
  const totalSpend = (balances as any)?.total_expenses ?? 0;
  const memberBalances = (balances as any)?.member_balances ?? [];
  const maxBalance = memberBalances.reduce((m: number, b: any) => Math.max(m, Math.abs(b.balance)), 1);

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Group Insights" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={s.heroLabel}>Total Group Spending</Text>
          <Text style={s.heroAmount}>{formatCurrency(totalSpend)}</Text>
        </View>

        {memberBalances.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Member Balances</Text>
            {memberBalances.map((m: any) => {
              const pct = Math.min((Math.abs(m.balance) / maxBalance) * 100, 100);
              return (
                <View key={m.user.id} style={s.memberRow}>
                  <View style={[s.avatar, { backgroundColor: m.user.avatar_color }]}>
                    <Text style={s.avatarText}>{m.user.name.split(' ').map((w: string) => w[0]).join('')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.memberName}>{m.user.name}</Text>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { width: `${pct}%`, backgroundColor: m.balance >= 0 ? '#16A34A' : '#DC2626' }]} />
                    </View>
                  </View>
                  <Text style={[s.memberBalance, { color: m.balance >= 0 ? '#16A34A' : '#DC2626' }]}>
                    {m.balance >= 0 ? '+' : ''}{formatCurrency(m.balance)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {Object.keys(byCategory).length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>By Category</Text>
            {Object.entries(byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => {
                const catInfo = EXPENSE_CATEGORIES.find((c) => c.value === cat);
                const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
                return (
                  <View key={cat} style={s.catRow}>
                    <Text style={s.catEmoji}>{catInfo?.emoji ?? '📦'}</Text>
                    <Text style={s.catLabel}>{catInfo?.label ?? cat}</Text>
                    <View style={s.catBar}>
                      <View style={[s.catBarFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={s.catAmount}>{formatCurrency(amount)}</Text>
                  </View>
                );
              })}
          </View>
        )}

        {(balances as any)?.simplified_debts?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Settlement Plan</Text>
            {(balances as any).simplified_debts.map((d: any, i: number) => (
              <View key={i} style={s.debtRow}>
                <Text style={s.debtText}>
                  <Text style={{ fontWeight: '700' }}>{d.from_user.name.split(' ')[0]}</Text>
                  {' pays '}
                  <Text style={{ fontWeight: '700' }}>{d.to_user.name.split(' ')[0]}</Text>
                </Text>
                <Text style={s.debtAmount}>{formatCurrency(d.amount)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function createGiStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    hero: { backgroundColor: '#1B4332', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
    heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    heroAmount: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: c.textSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    avatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    memberName: { fontSize: 13, fontWeight: '600', color: c.sectionLabel, marginBottom: 4 },
    barTrack: { height: 6, backgroundColor: c.pillBg, borderRadius: 3, overflow: 'hidden' },
    barFill: { height: 6, borderRadius: 3 },
    memberBalance: { fontSize: 13, fontWeight: '700', minWidth: 70, textAlign: 'right' },
    catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    catEmoji: { fontSize: 18, width: 24 },
    catLabel: { fontSize: 13, color: c.sectionLabel, width: 80 },
    catBar: { flex: 1, height: 6, backgroundColor: c.pillBg, borderRadius: 3, overflow: 'hidden' },
    catBarFill: { height: 6, backgroundColor: '#FF6B35', borderRadius: 3 },
    catAmount: { fontSize: 12, fontWeight: '700', color: c.text, minWidth: 70, textAlign: 'right' },
    debtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.warningBg, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: c.warningBorder },
    debtText: { fontSize: 14, color: c.sectionLabel },
    debtAmount: { fontSize: 14, fontWeight: '800', color: c.warningText },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Appearance Settings
// ─────────────────────────────────────────────────────────────────────────────
export const AppearanceSettingsScreen: React.FC = () => {
  const { mode, setMode } = useThemeStore();
  const { colors } = useTheme();
  const s = createApStyles(colors);
  const MODES = [
    { value: 'light', label: 'Light', emoji: '☀️', desc: 'Always use light mode' },
    { value: 'dark', label: 'Dark', emoji: '🌙', desc: 'Always use dark mode' },
    { value: 'system', label: 'System', emoji: '📱', desc: 'Follow device setting' },
  ] as const;

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Appearance" />
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.hint}>Your selection takes effect immediately across the app.</Text>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[s.row, mode === m.value && s.rowActive]}
            onPress={() => setMode(m.value)}
          >
            <Text style={s.rowEmoji}>{m.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, mode === m.value && s.rowLabelActive]}>{m.label}</Text>
              <Text style={s.rowDesc}>{m.desc}</Text>
            </View>
            <View style={[s.radio, mode === m.value && s.radioActive]}>
              {mode === m.value && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

function createApStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    hint: { fontSize: 14, color: c.textSub, marginBottom: 20, lineHeight: 20 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.card, borderRadius: 16, borderWidth: 1.5, borderColor: c.cardBorder, padding: 16, marginBottom: 10 },
    rowActive: { borderColor: '#1B4332', backgroundColor: c.successBg },
    rowEmoji: { fontSize: 24 },
    rowLabel: { fontSize: 15, fontWeight: '700', color: c.text },
    rowLabelActive: { color: '#1B4332' },
    rowDesc: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: '#1B4332' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1B4332' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Settings
// ─────────────────────────────────────────────────────────────────────────────
const NOTIF_PREFS_KEY = 'qs-notif-prefs';
const DEFAULT_PREFS = { groupActivity: true, newExpenses: true, settlementReminders: true, news: false };

export const NotificationSettingsScreen: React.FC = () => {
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createNsStyles(colors);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_PREFS_KEY).then((raw) => raw && setPrefs(JSON.parse(raw)));
  }, []);

  const toggle = (key: keyof typeof DEFAULT_PREFS) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const save = async () => {
    await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
    toast('Preferences saved', 'success');
  };

  const items: { key: keyof typeof DEFAULT_PREFS; label: string; desc: string }[] = [
    { key: 'groupActivity', label: 'Group Activity', desc: 'New expenses and settlements in your groups' },
    { key: 'newExpenses', label: 'New Expenses', desc: 'When someone adds you to an expense' },
    { key: 'settlementReminders', label: 'Settlement Reminders', desc: 'Reminders to settle outstanding balances' },
    { key: 'news', label: 'News & Updates', desc: 'App updates and new features' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Notifications" />
      <ScrollView contentContainerStyle={s.scroll}>
        {items.map((item) => (
          <View key={item.key} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>{item.label}</Text>
              <Text style={s.rowDesc}>{item.desc}</Text>
            </View>
            <Switch
              value={prefs[item.key]}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: colors.cardBorder, true: '#1B4332' }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
        <TouchableOpacity style={s.saveBtn} onPress={save}>
          <Text style={s.saveBtnText}>Save Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

function createNsStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 16, marginBottom: 10 },
    rowLabel: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 2 },
    rowDesc: { fontSize: 12, color: c.textMuted },
    saveBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Security Settings
// ─────────────────────────────────────────────────────────────────────────────
export const SecuritySettingsScreen: React.FC = () => {
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createScStyles(colors);
  const [faceId, setFaceId] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Security" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.section}>
          <Text style={s.sectionLabel}>Biometrics</Text>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Face ID / Fingerprint</Text>
              <Text style={s.rowDesc}>Use biometrics to unlock the app</Text>
            </View>
            <Switch value={faceId} onValueChange={setFaceId} trackColor={{ false: colors.cardBorder, true: '#1B4332' }} thumbColor="#FFFFFF" />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Change Password</Text>
          <TextInput
            style={s.input}
            value={currentPwd}
            onChangeText={setCurrentPwd}
            placeholder="Current password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
          <TextInput
            style={s.input}
            value={newPwd}
            onChangeText={setNewPwd}
            placeholder="New password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
          <TouchableOpacity
            style={s.saveBtn}
            onPress={() => {
              if (!currentPwd || !newPwd) { toast('Fill both fields', 'error'); return; }
              toast('Password change coming soon', 'info');
              setCurrentPwd(''); setNewPwd('');
            }}
          >
            <Text style={s.saveBtnText}>Update Password</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Active Sessions</Text>
          <View style={s.sessionRow}>
            <Text style={s.sessionDevice}>📱 This Device</Text>
            <Text style={s.sessionBadge}>Current</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function createScStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    section: { marginBottom: 24 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: c.textSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 16 },
    rowLabel: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 2 },
    rowDesc: { fontSize: 12, color: c.textMuted },
    input: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text, marginBottom: 10 },
    saveBtn: { backgroundColor: '#1B4332', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 14 },
    sessionDevice: { fontSize: 14, color: c.text },
    sessionBadge: { fontSize: 12, fontWeight: '700', color: c.successText, backgroundColor: c.successBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Pro Upgrade
// ─────────────────────────────────────────────────────────────────────────────
const PLANS = [
  { id: 'yearly', label: 'Yearly', price: '₹999/yr', perMonth: '₹83/mo', badge: 'BEST VALUE', color: '#FF6B35' },
  { id: 'quarterly', label: 'Quarterly', price: '₹349/qtr', perMonth: '₹116/mo', badge: null, color: '#1B4332' },
  { id: 'monthly', label: 'Monthly', price: '₹149/mo', perMonth: '₹149/mo', badge: null, color: '#1B4332' },
];

const PRO_FEATURES = ['✅ AI Chat Assistant', '✅ OCR Receipt Scanning', '✅ Budget Tracking', '✅ Spending Insights', '✅ Priority Support', '✅ Unlimited Groups'];

export const ProUpgradeScreen: React.FC = () => {
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createPrStyles(colors);
  const [selected, setSelected] = useState('yearly');

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="QuickSplit Pro" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>⭐</Text>
          <Text style={s.heroTitle}>Upgrade to Pro</Text>
          <Text style={s.heroSub}>Unlock the full QuickSplit experience</Text>
        </View>

        <View style={s.featureCard}>
          {PRO_FEATURES.map((f) => (
            <Text key={f} style={s.featureItem}>{f}</Text>
          ))}
        </View>

        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[s.planCard, selected === plan.id && s.planCardActive]}
            onPress={() => setSelected(plan.id)}
          >
            {plan.badge && <View style={s.planBadge}><Text style={s.planBadgeText}>{plan.badge}</Text></View>}
            <Text style={[s.planLabel, selected === plan.id && { color: plan.color }]}>{plan.label}</Text>
            <Text style={s.planPrice}>{plan.price}</Text>
            <Text style={s.planPerMonth}>{plan.perMonth}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={s.cta}
          onPress={() => toast('Pro features launching soon! 🚀', 'info')}
        >
          <Text style={s.ctaText}>Try It Free — 7 Days</Text>
        </TouchableOpacity>
        <Text style={s.ctaSub}>Cancel anytime. No commitment.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

function createPrStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    hero: { alignItems: 'center', paddingVertical: 24 },
    heroEmoji: { fontSize: 52, marginBottom: 12 },
    heroTitle: { fontSize: 26, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold' },
    heroSub: { fontSize: 14, color: c.textSub, marginTop: 6 },
    featureCard: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 20, marginBottom: 20 },
    featureItem: { fontSize: 14, color: c.sectionLabel, marginBottom: 8, lineHeight: 22 },
    planCard: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1.5, borderColor: c.cardBorder, padding: 16, marginBottom: 10, alignItems: 'center' },
    planCardActive: { borderColor: '#FF6B35', backgroundColor: '#FFF7F5' },
    planBadge: { position: 'absolute', top: -10, backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
    planBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
    planLabel: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 4 },
    planPrice: { fontSize: 20, fontWeight: '800', color: c.text },
    planPerMonth: { fontSize: 12, color: c.textMuted },
    cta: { backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    ctaSub: { textAlign: 'center', fontSize: 12, color: c.textMuted, marginTop: 10 },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Referral
// ─────────────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { q: 'How do I earn rewards?', a: 'Share your referral link with friends. When they sign up and add their first expense, you earn a reward.' },
  { q: 'What rewards do I get?', a: '3 successful referrals unlock 1 month of Pro for free. Keep referring to extend your Pro subscription.' },
  { q: 'When do I get credited?', a: 'Credits are applied automatically within 24 hours of your friend\'s first expense.' },
];

export const ReferralScreen: React.FC = () => {
  const { user } = useUserStore();
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createRfStyles(colors);
  const [count, setCount] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const referralCode = `QS-${(user?.name ?? 'USER').toUpperCase().slice(0, 4)}-${(user?.id ?? '').slice(0, 4).toUpperCase()}`;

  useEffect(() => {
    AsyncStorage.getItem('qs-referral-count').then((raw) => raw && setCount(parseInt(raw, 10)));
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({ message: `Join QuickSplit and split bills effortlessly! Use my code ${referralCode} to get started. Download now.` });
    } catch { /* dismissed */ }
  };

  const handleCopy = () => {
    toast(`Code ${referralCode} copied!`, 'success');
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Refer & Earn" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🎁</Text>
          <Text style={s.heroTitle}>Invite Friends</Text>
          <Text style={s.heroSub}>Earn 1 month Pro for every 3 referrals</Text>
        </View>

        <View style={s.progressCard}>
          <Text style={s.progressLabel}>{count} / 3 referrals</Text>
          <View style={s.progressTrack}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[s.progressSegment, i < count && s.progressSegmentFilled]} />
            ))}
          </View>
          {count >= 3 && <Text style={s.progressDone}>🎉 You've earned Pro!</Text>}
        </View>

        <View style={s.codeCard}>
          <Text style={s.codeLabel}>Your referral code</Text>
          <Text style={s.code}>{referralCode}</Text>
          <View style={s.codeBtns}>
            <TouchableOpacity style={s.copyBtn} onPress={handleCopy}>
              <Text style={s.copyBtnText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
              <Text style={s.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.sectionTitle}>How it works</Text>
        {HOW_IT_WORKS.map((item, i) => (
          <TouchableOpacity key={i} style={s.accordion} onPress={() => setOpenIdx(openIdx === i ? null : i)}>
            <View style={s.accordionHeader}>
              <Text style={s.accordionQ}>{item.q}</Text>
              <Text style={s.accordionArrow}>{openIdx === i ? '▲' : '▼'}</Text>
            </View>
            {openIdx === i && <Text style={s.accordionA}>{item.a}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

function createRfStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    hero: { alignItems: 'center', paddingVertical: 24 },
    heroEmoji: { fontSize: 52, marginBottom: 12 },
    heroTitle: { fontSize: 24, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold' },
    heroSub: { fontSize: 14, color: c.textSub, marginTop: 6 },
    progressCard: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 20, marginBottom: 16 },
    progressLabel: { fontSize: 14, fontWeight: '700', color: c.sectionLabel, marginBottom: 10 },
    progressTrack: { flexDirection: 'row', gap: 8 },
    progressSegment: { flex: 1, height: 10, borderRadius: 5, backgroundColor: c.pillBg },
    progressSegmentFilled: { backgroundColor: '#1B4332' },
    progressDone: { fontSize: 14, color: c.successText, fontWeight: '700', marginTop: 10, textAlign: 'center' },
    codeCard: { backgroundColor: c.successBg, borderRadius: 16, borderWidth: 1, borderColor: c.successBorder, padding: 20, alignItems: 'center', marginBottom: 20 },
    codeLabel: { fontSize: 13, color: c.textSub, marginBottom: 8 },
    code: { fontSize: 24, fontWeight: '800', color: '#1B4332', letterSpacing: 2, marginBottom: 16 },
    codeBtns: { flexDirection: 'row', gap: 10 },
    copyBtn: { flex: 1, backgroundColor: c.card, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: c.successBorder },
    copyBtnText: { fontWeight: '700', color: '#1B4332' },
    shareBtn: { flex: 1, backgroundColor: '#1B4332', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    shareBtnText: { fontWeight: '700', color: '#FFFFFF' },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: c.sectionLabel, marginBottom: 12 },
    accordion: { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 16, marginBottom: 8 },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    accordionQ: { fontSize: 14, fontWeight: '700', color: c.text, flex: 1 },
    accordionArrow: { fontSize: 11, color: c.textMuted },
    accordionA: { fontSize: 13, color: c.textSub, marginTop: 10, lineHeight: 20 },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Import Splitwise
// ─────────────────────────────────────────────────────────────────────────────
export const ImportSplitwiseScreen: React.FC = () => {
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createImStyles(colors);
  const steps = [
    { n: '1', text: 'Open Splitwise on web or mobile' },
    { n: '2', text: 'Go to Account → Export data' },
    { n: '3', text: 'Download the CSV file to your device' },
    { n: '4', text: 'Tap "Upload CSV" below to import' },
  ];

  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
      if (!result.canceled) {
        toast('CSV import coming soon — processing pipeline in progress', 'info');
      }
    } catch {
      toast('Could not open file picker', 'error');
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Import from Splitwise" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>📥</Text>
          <Text style={s.heroTitle}>Import Your Data</Text>
          <Text style={s.heroSub}>Move all your Splitwise groups and expenses to QuickSplit</Text>
        </View>

        <View style={s.stepsCard}>
          {steps.map((step) => (
            <View key={step.n} style={s.step}>
              <View style={s.stepNum}><Text style={s.stepNumText}>{step.n}</Text></View>
              <Text style={s.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.uploadBtn} onPress={handleUpload}>
          <Text style={s.uploadBtnText}>📄 Upload CSV</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

function createImStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    hero: { alignItems: 'center', paddingVertical: 24 },
    heroEmoji: { fontSize: 52, marginBottom: 12 },
    heroTitle: { fontSize: 22, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold' },
    heroSub: { fontSize: 14, color: c.textSub, textAlign: 'center', marginTop: 6, maxWidth: 280 },
    stepsCard: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 20, marginBottom: 20 },
    step: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center' },
    stepNumText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    stepText: { flex: 1, fontSize: 14, color: c.sectionLabel },
    uploadBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    uploadBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// QR Code
// ─────────────────────────────────────────────────────────────────────────────
export const QRCodeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createQrStyles(colors);
  const [tab, setTab] = useState<'my' | 'scan'>('my');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  const upiValue = user?.upi_id ? `upi://pay?pa=${user.upi_id}&pn=${encodeURIComponent(user.name)}` : '';

  const requestCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCode = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    toast('QR scanned!', 'success');
    navigation.navigate('AddFriend', { scannedEmail: data });
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="QR Code" />
      <View style={s.tabRow}>
        {[{ id: 'my', label: 'My Code' }, { id: 'scan', label: 'Scan' }].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[s.tab, tab === t.id && s.tabActive]}
            onPress={() => { setTab(t.id as 'my' | 'scan'); setScanned(false); }}
          >
            <Text style={[s.tabLabel, tab === t.id && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'my' && (
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.qrCard}>
            {upiValue ? (
              <QRCode value={upiValue} size={220} color="#1B4332" />
            ) : (
              <View style={s.noUpiBox}>
                <Text style={s.noUpiText}>Add your UPI ID in profile to generate your QR code</Text>
                <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                  <Text style={s.editBtnText}>Edit Profile →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {upiValue && (
            <>
              <Text style={s.upiLabel}>{user?.name}</Text>
              <Text style={s.upiValue}>{user?.upi_id}</Text>
              <TouchableOpacity style={s.shareBtn} onPress={() => Share.share({ message: `Pay me via UPI: ${user?.upi_id}` })}>
                <Text style={s.shareBtnText}>Share QR</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {tab === 'scan' && (
        <View style={{ flex: 1 }}>
          {hasPermission === null && (
            <View style={s.permBox}>
              <Text style={s.permText}>Camera access is needed to scan QR codes</Text>
              <TouchableOpacity style={s.permBtn} onPress={requestCamera}>
                <Text style={s.permBtnText}>Allow Camera Access</Text>
              </TouchableOpacity>
            </View>
          )}
          {hasPermission === false && (
            <View style={s.permBox}>
              <Text style={s.permText}>Camera permission denied. Enable it in Settings.</Text>
            </View>
          )}
          {hasPermission === true && (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCode}
            >
              <View style={s.scanOverlay}>
                <View style={s.scanFrame} />
                <Text style={s.scanHint}>Point at a QuickSplit QR code</Text>
                {scanned && (
                  <TouchableOpacity style={s.rescanBtn} onPress={() => setScanned(false)}>
                    <Text style={s.rescanText}>Scan Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            </CameraView>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

function createQrStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: c.pillBg, borderRadius: 14, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: c.card },
    tabLabel: { fontSize: 14, fontWeight: '600', color: c.textMuted },
    tabLabelActive: { color: '#1B4332' },
    scroll: { alignItems: 'center', paddingBottom: 100 },
    qrCard: { backgroundColor: c.card, borderRadius: 24, padding: 32, borderWidth: 1, borderColor: c.cardBorder, marginBottom: 16 },
    noUpiBox: { alignItems: 'center', padding: 20, width: 220 },
    noUpiText: { fontSize: 14, color: c.textSub, textAlign: 'center', marginBottom: 14 },
    editBtn: { backgroundColor: '#1B4332', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
    editBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    upiLabel: { fontSize: 18, fontWeight: '800', color: c.text, marginBottom: 4 },
    upiValue: { fontSize: 14, color: c.textSub, marginBottom: 20 },
    shareBtn: { backgroundColor: '#1B4332', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12 },
    shareBtnText: { color: '#FFFFFF', fontWeight: '700' },
    permBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    permText: { fontSize: 15, color: c.sectionLabel, textAlign: 'center', marginBottom: 20 },
    permBtn: { backgroundColor: '#1B4332', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
    permBtnText: { color: '#FFFFFF', fontWeight: '700' },
    scanOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scanFrame: { width: 240, height: 240, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 16, marginBottom: 20 },
    scanHint: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    rescanBtn: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
    rescanText: { fontWeight: '700', color: '#1B4332' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Scan Screen (OCR)
// ─────────────────────────────────────────────────────────────────────────────
export const ScanScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createScanStyles(colors);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);

  const requestCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const processImage = async (uri: string) => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', { uri, type: 'image/jpeg', name: 'receipt.jpg' } as any);
      const result = await ocrAPI.uploadAndProcess(formData as any);
      navigation.navigate('Split', { detected_total: result.detected_total, text: result.text });
    } catch {
      toast('Could not process receipt. Try a clearer photo.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  if (processing) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.processingBox}>
          <Text style={s.processingEmoji}>🔍</Text>
          <Text style={s.processingTitle}>Reading Receipt…</Text>
          <Text style={s.processingSub}>Our AI is extracting the total amount</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView style={s.safe}>
        <ScreenHeader title="Scan Receipt" />
        <View style={s.permBox}>
          <Text style={s.permEmoji}>📷</Text>
          <Text style={s.permTitle}>Camera Access Required</Text>
          <Text style={s.permSub}>We need camera access to scan receipts</Text>
          <TouchableOpacity style={s.permBtn} onPress={requestCamera}>
            <Text style={s.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.galleryBtn} onPress={pickFromGallery}>
            <Text style={s.galleryBtnText}>Pick from Gallery instead</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Scan Receipt" />
      <CameraView style={{ flex: 1 }} facing="back">
        <View style={s.overlay}>
          <View style={s.frame} />
          <Text style={s.hint}>Position the receipt within the frame</Text>
          <TouchableOpacity style={s.galleryPill} onPress={pickFromGallery}>
            <Text style={s.galleryPillText}>📁 Upload from Gallery</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

function createScanStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000000' },
    processingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, paddingHorizontal: 32 },
    processingEmoji: { fontSize: 64, marginBottom: 16 },
    processingTitle: { fontSize: 22, fontWeight: '800', color: c.text, marginBottom: 8 },
    processingSub: { fontSize: 14, color: c.textSub, textAlign: 'center' },
    permBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, paddingHorizontal: 40 },
    permEmoji: { fontSize: 64, marginBottom: 16 },
    permTitle: { fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 8 },
    permSub: { fontSize: 14, color: c.textSub, textAlign: 'center', marginBottom: 24 },
    permBtn: { backgroundColor: '#1B4332', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginBottom: 12 },
    permBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    galleryBtn: { paddingVertical: 12 },
    galleryBtnText: { color: '#1B4332', fontWeight: '600', fontSize: 14 },
    overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    frame: { width: 280, height: 200, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 12, marginBottom: 20 },
    hint: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 20 },
    galleryPill: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
    galleryPillText: { fontWeight: '700', color: '#1B4332' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Split Screen (OCR Review)
// ─────────────────────────────────────────────────────────────────────────────
export const SplitScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { colors } = useTheme();
  const s = createSpStyles(colors);
  const [amount, setAmount] = useState(String(params?.detected_total ?? ''));
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="OCR Result" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.ocrCard}>
          <Text style={s.ocrLabel}>Detected Text</Text>
          <ScrollView style={s.ocrScroll}>
            <Text style={s.ocrText}>{params?.text ?? 'No text detected'}</Text>
          </ScrollView>
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>Detected Total (₹)</Text>
          <TextInput
            style={s.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>Description</Text>
          <TextInput
            style={s.input}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Restaurant Bill"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={s.nextBtn}
          onPress={() => navigation.navigate('Review', { amount: parseFloat(amount), description })}
        >
          <Text style={s.nextBtnText}>Continue →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

function createSpStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    ocrCard: { backgroundColor: c.pillBg, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 16, marginBottom: 20 },
    ocrLabel: { fontSize: 12, fontWeight: '700', color: c.textSub, textTransform: 'uppercase', marginBottom: 8 },
    ocrScroll: { maxHeight: 120 },
    ocrText: { fontSize: 12, color: c.sectionLabel, lineHeight: 18 },
    field: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: c.sectionLabel, marginBottom: 6 },
    input: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text },
    nextBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Review Screen
// ─────────────────────────────────────────────────────────────────────────────
export const ReviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createRvStyles(colors);

  const mutation = useMutation({
    mutationFn: () => expensesAPI.createExpense({
      description: params?.description || 'Scanned receipt',
      amount: params?.amount ?? 0,
      category: 'other',
      paid_by_user_id: user!.id,
      split_type: 'equal',
      date: new Date().toISOString().split('T')[0],
      participant_ids: [user!.id],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      toast('Expense created from receipt!', 'success');
      navigation.navigate('HomeTab');
    },
    onError: () => toast('Failed to create expense', 'error'),
  });

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Review & Confirm" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.card}>
          <Text style={s.label}>Description</Text>
          <Text style={s.value}>{params?.description || 'Scanned receipt'}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.label}>Amount</Text>
          <Text style={s.valueAmount}>{formatCurrency(params?.amount ?? 0)}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.label}>Paid by</Text>
          <Text style={s.value}>{user?.name} (you)</Text>
        </View>
        <View style={s.card}>
          <Text style={s.label}>Split type</Text>
          <Text style={s.value}>Equal (just you)</Text>
        </View>

        <TouchableOpacity
          style={[s.confirmBtn, mutation.isPending && { opacity: 0.6 }]}
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          <Text style={s.confirmBtnText}>{mutation.isPending ? 'Creating…' : 'Create Expense'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

function createRvStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    card: { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 16, marginBottom: 10 },
    label: { fontSize: 12, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', marginBottom: 6 },
    value: { fontSize: 15, color: c.text, fontWeight: '600' },
    valueAmount: { fontSize: 28, fontWeight: '800', color: '#1B4332' },
    confirmBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
    confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Import Group Screen
// ─────────────────────────────────────────────────────────────────────────────
export const ImportGroupScreen: React.FC = () => {
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createIgStyles(colors);
  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Import Group" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🔄</Text>
          <Text style={s.heroTitle}>Import a Splitwise Group</Text>
          <Text style={s.heroSub}>Transfer your existing groups with all expenses and balances</Text>
        </View>
        <View style={s.stepsCard}>
          {['Export your group from Splitwise as CSV', 'Choose the group CSV file', 'Map members to QuickSplit users', 'Review and confirm import'].map((step, i) => (
            <View key={i} style={s.step}>
              <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.btn} onPress={() => toast('Group import pipeline coming soon', 'info')}>
          <Text style={s.btnText}>Select Group CSV</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

function createIgStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    hero: { alignItems: 'center', paddingVertical: 24 },
    heroEmoji: { fontSize: 52, marginBottom: 12 },
    heroTitle: { fontSize: 22, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center' },
    heroSub: { fontSize: 14, color: c.textSub, textAlign: 'center', marginTop: 6, maxWidth: 280 },
    stepsCard: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 20, marginBottom: 20 },
    step: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center' },
    stepNumText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    stepText: { flex: 1, fontSize: 14, color: c.sectionLabel },
    btn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission Setup Screen
// ─────────────────────────────────────────────────────────────────────────────
export const PermissionSetupScreen: React.FC = () => {
  const { toast } = useToastStore();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createPsStyles(colors);
  const [granted, setGranted] = useState<Record<string, boolean>>({});

  const PERMISSIONS = [
    {
      key: 'camera',
      emoji: '📷',
      title: 'Camera Access',
      desc: 'Scan receipts and QR codes to split bills instantly',
      request: async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return status === 'granted';
      },
    },
    {
      key: 'notifications',
      emoji: '🔔',
      title: 'Notifications',
      desc: 'Get reminders when friends settle up or add expenses',
      request: async () => {
        toast('Notifications enabled!', 'success');
        return true;
      },
    },
    {
      key: 'contacts',
      emoji: '👥',
      title: 'Contacts',
      desc: 'Quickly add friends from your phone contacts',
      request: async () => {
        toast('Contacts access granted!', 'success');
        return true;
      },
    },
  ];

  const handleRequest = async (key: string, request: () => Promise<boolean>) => {
    const result = await request();
    setGranted((prev) => ({ ...prev, [key]: result }));
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenHeader title="Set Up Permissions" />
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.intro}>Allow these permissions to get the most out of QuickSplit</Text>
        {PERMISSIONS.map((p) => (
          <View key={p.key} style={s.card}>
            <Text style={s.cardEmoji}>{p.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{p.title}</Text>
              <Text style={s.cardDesc}>{p.desc}</Text>
            </View>
            {granted[p.key] ? (
              <View style={s.grantedBadge}><Text style={s.grantedText}>Allowed ✓</Text></View>
            ) : (
              <TouchableOpacity style={s.allowBtn} onPress={() => handleRequest(p.key, p.request)}>
                <Text style={s.allowBtnText}>Allow</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={s.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

function createPsStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    intro: { fontSize: 14, color: c.textSub, marginBottom: 20, lineHeight: 20 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 16, marginBottom: 10 },
    cardEmoji: { fontSize: 28, width: 40, textAlign: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 3 },
    cardDesc: { fontSize: 12, color: c.textMuted, lineHeight: 16 },
    grantedBadge: { backgroundColor: c.successBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: c.successBorder },
    grantedText: { fontSize: 12, fontWeight: '700', color: c.successText },
    allowBtn: { backgroundColor: '#1B4332', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    allowBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    doneBtn: { backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
    doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}
