/**
 * Remaining screens — functional UI stubs with real navigation and content.
 * Each screen is fully navigable with proper headers and back buttons.
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Share, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

function BackHeader({ title }: { title: string }) {
  const navigation = useNavigation<any>();
  return (
    <View style={sh.header}>
      <TouchableOpacity style={sh.backBtn} onPress={() => navigation.goBack()}>
        <Text style={sh.backText}>←</Text>
      </TouchableOpacity>
      <Text style={sh.title}>{title}</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

const sh = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#111827' },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
});

// ─── Budget Dashboard ─────────────────────────────────────────────────────────
const BUDGET_CATS = [
  { label: 'Food & Drink', emoji: '🍔', spent: 3200, budget: 5000, color: '#FF6B35' },
  { label: 'Transport', emoji: '🚗', spent: 800, budget: 2000, color: '#6366F1' },
  { label: 'Entertainment', emoji: '🎬', spent: 1500, budget: 2000, color: '#EC4899' },
  { label: 'Utilities', emoji: '💡', spent: 2100, budget: 2500, color: '#10B981' },
  { label: 'Shopping', emoji: '🛍️', spent: 4800, budget: 4000, color: '#EF4444' },
];

export const BudgetDashboardScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="Budget Dashboard" />
    <ScrollView contentContainerStyle={rs.scroll}>
      <View style={rs.summaryCard}>
        <Text style={rs.summaryLabel}>This Month</Text>
        <Text style={rs.summaryAmount}>₹12,400</Text>
        <Text style={rs.summaryMeta}>of ₹15,500 budget</Text>
        <View style={rs.progressBar}>
          <View style={[rs.progressFill, { width: '80%', backgroundColor: '#FF6B35' }]} />
        </View>
      </View>
      {BUDGET_CATS.map(c => (
        <View key={c.label} style={rs.budgetRow}>
          <Text style={{ fontSize: 20, width: 32 }}>{c.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={rs.budgetRowTop}>
              <Text style={rs.budgetLabel}>{c.label}</Text>
              <Text style={rs.budgetAmt}>₹{c.spent.toLocaleString()} / ₹{c.budget.toLocaleString()}</Text>
            </View>
            <View style={rs.progressBar}>
              <View style={[rs.progressFill, { width: `${Math.min(100, (c.spent / c.budget) * 100)}%`, backgroundColor: c.color }]} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

// ─── Subscription Tracker ────────────────────────────────────────────────────
const SUBS = [
  { name: 'Netflix', emoji: '🎬', amount: 649, cycle: 'Monthly', next: 'Jul 15' },
  { name: 'Spotify', emoji: '🎵', amount: 119, cycle: 'Monthly', next: 'Jul 8' },
  { name: 'iCloud', emoji: '☁️', amount: 75, cycle: 'Monthly', next: 'Jul 1' },
  { name: 'GPT Plus', emoji: '🤖', amount: 1670, cycle: 'Monthly', next: 'Jul 20' },
];

export const SubscriptionTrackerScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="Subscriptions" />
    <ScrollView contentContainerStyle={rs.scroll}>
      <View style={rs.summaryCard}>
        <Text style={rs.summaryLabel}>Monthly total</Text>
        <Text style={rs.summaryAmount}>₹{SUBS.reduce((a, s) => a + s.amount, 0).toLocaleString()}</Text>
        <Text style={rs.summaryMeta}>{SUBS.length} active subscriptions</Text>
      </View>
      {SUBS.map(sub => (
        <View key={sub.name} style={rs.subRow}>
          <View style={rs.subIcon}><Text style={{ fontSize: 22 }}>{sub.emoji}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={rs.subName}>{sub.name}</Text>
            <Text style={rs.subMeta}>{sub.cycle} · Next: {sub.next}</Text>
          </View>
          <Text style={rs.subAmount}>₹{sub.amount}</Text>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

// ─── Spending Insights ───────────────────────────────────────────────────────
const INSIGHTS = [
  { label: 'Food & Drink', emoji: '🍔', pct: 42, color: '#FF6B35' },
  { label: 'Transport', emoji: '🚗', pct: 18, color: '#6366F1' },
  { label: 'Entertainment', emoji: '🎬', pct: 15, color: '#EC4899' },
  { label: 'Shopping', emoji: '🛍️', pct: 14, color: '#F59E0B' },
  { label: 'Other', emoji: '📦', pct: 11, color: '#9CA3AF' },
];

export const SpendingInsightsScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="Spending Insights" />
    <ScrollView contentContainerStyle={rs.scroll}>
      <View style={rs.summaryCard}>
        <Text style={rs.summaryLabel}>Total spent (30 days)</Text>
        <Text style={rs.summaryAmount}>₹18,240</Text>
        <Text style={[rs.summaryMeta, { color: '#DC2626' }]}>↑ 12% vs last month</Text>
      </View>
      {INSIGHTS.map(i => (
        <View key={i.label} style={rs.insightRow}>
          <Text style={{ fontSize: 20, width: 32 }}>{i.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={rs.budgetRowTop}>
              <Text style={rs.budgetLabel}>{i.label}</Text>
              <Text style={rs.budgetAmt}>{i.pct}%</Text>
            </View>
            <View style={rs.progressBar}>
              <View style={[rs.progressFill, { width: `${i.pct}%`, backgroundColor: i.color }]} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

// ─── Appearance Settings ─────────────────────────────────────────────────────
const THEMES = [
  { label: 'Light', emoji: '☀️' },
  { label: 'Dark', emoji: '🌙' },
  { label: 'System', emoji: '📱' },
] as const;

export const AppearanceSettingsScreen: React.FC = () => {
  const [selected, setSelected] = useState<string>('System');
  return (
    <SafeAreaView style={rs.safe}>
      <BackHeader title="Appearance" />
      <View style={rs.settingsSection}>
        <Text style={rs.settingsLabel}>Theme</Text>
        {THEMES.map(t => (
          <TouchableOpacity key={t.label} style={rs.settingsRow} onPress={() => setSelected(t.label)}>
            <Text style={rs.settingsEmoji}>{t.emoji}</Text>
            <Text style={rs.settingsRowLabel}>{t.label}</Text>
            <View style={[rs.radio, selected === t.label && rs.radioActive]}>
              {selected === t.label && <View style={rs.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ─── Notification Settings ───────────────────────────────────────────────────
export const NotificationSettingsScreen: React.FC = () => {
  const [push, setPush] = useState(true);
  const [expense, setExpense] = useState(true);
  const [settle, setSettle] = useState(true);
  const [weekly, setWeekly] = useState(false);
  return (
    <SafeAreaView style={rs.safe}>
      <BackHeader title="Notifications" />
      <View style={rs.settingsSection}>
        {[
          { label: 'Push notifications', value: push, set: setPush },
          { label: 'New expense added', value: expense, set: setExpense },
          { label: 'Settlement received', value: settle, set: setSettle },
          { label: 'Weekly spending summary', value: weekly, set: setWeekly },
        ].map(item => (
          <View key={item.label} style={rs.toggleRow}>
            <Text style={rs.toggleLabel}>{item.label}</Text>
            <Switch
              value={item.value}
              onValueChange={item.set}
              trackColor={{ true: '#1B4332', false: '#D1D5DB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ─── Security Settings ───────────────────────────────────────────────────────
export const SecuritySettingsScreen: React.FC = () => {
  const [biometrics, setBiometrics] = useState(false);
  return (
    <SafeAreaView style={rs.safe}>
      <BackHeader title="Security" />
      <View style={rs.settingsSection}>
        <View style={rs.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={rs.toggleLabel}>Face ID / Biometrics</Text>
            <Text style={rs.toggleSub}>Use biometrics to unlock the app</Text>
          </View>
          <Switch value={biometrics} onValueChange={setBiometrics} trackColor={{ true: '#1B4332', false: '#D1D5DB' }} thumbColor="#FFFFFF" />
        </View>
        <TouchableOpacity style={rs.settingsRow}>
          <Text style={rs.settingsEmoji}>🔑</Text>
          <Text style={rs.settingsRowLabel}>Change Password</Text>
          <Text style={rs.settingsArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rs.settingsRow}>
          <Text style={rs.settingsEmoji}>📱</Text>
          <Text style={rs.settingsRowLabel}>Active Sessions</Text>
          <Text style={rs.settingsArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Pro Upgrade ─────────────────────────────────────────────────────────────
const PRO_FEATURES = [
  '🤖 Unlimited AI assistant messages',
  '📊 Advanced spending insights',
  '♾️ Unlimited groups',
  '🔄 Smart subscription tracking',
  '📈 Budget forecasting',
  '🎨 Custom themes',
];

export const ProUpgradeScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="QuickSplit Pro" />
    <ScrollView contentContainerStyle={rs.scroll}>
      <View style={rs.proBanner}>
        <Text style={rs.proEmoji}>⚡</Text>
        <Text style={rs.proTitle}>Unlock the full experience</Text>
        <Text style={rs.proSub}>Everything you need to manage money smarter</Text>
      </View>
      {PRO_FEATURES.map(f => (
        <View key={f} style={rs.proFeature}>
          <Text style={rs.proFeatureText}>{f}</Text>
        </View>
      ))}
      <TouchableOpacity style={rs.proBtn}>
        <Text style={rs.proBtnText}>Upgrade · ₹199/month</Text>
      </TouchableOpacity>
      <Text style={rs.proDisclaimer}>Cancel anytime. Billed monthly.</Text>
    </ScrollView>
  </SafeAreaView>
);

// ─── Referral ────────────────────────────────────────────────────────────────
export const ReferralScreen: React.FC = () => {
  const { user } = require('../state/userStore').useUserStore();
  const code = `QS${(user?.id ?? 'XXXXX').slice(0, 6).toUpperCase()}`;
  const handleShare = () => Share.share({ message: `Join me on QuickSplit! Use code ${code} to get started. Download: https://quicksplit.app` });
  return (
    <SafeAreaView style={rs.safe}>
      <BackHeader title="Refer a Friend" />
      <ScrollView contentContainerStyle={rs.scroll}>
        <View style={rs.referCard}>
          <Text style={rs.referEmoji}>🎁</Text>
          <Text style={rs.referTitle}>Give ₹50, Get ₹50</Text>
          <Text style={rs.referSub}>When your friend signs up and adds their first expense</Text>
        </View>
        <View style={rs.codeBox}>
          <Text style={rs.codeLabel}>Your referral code</Text>
          <Text style={rs.code}>{code}</Text>
        </View>
        <TouchableOpacity style={rs.shareBtn} onPress={handleShare}>
          <Text style={rs.shareBtnText}>📤 Share Invite Link</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Import Splitwise ────────────────────────────────────────────────────────
export const ImportSplitwiseScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="Import from Splitwise" />
    <ScrollView contentContainerStyle={rs.scroll}>
      <View style={rs.importCard}>
        <Text style={rs.importEmoji}>📥</Text>
        <Text style={rs.importTitle}>Import your Splitwise data</Text>
        <Text style={rs.importSub}>Export your Splitwise data as a CSV and import it here to migrate your expense history.</Text>
      </View>
      <View style={rs.importSteps}>
        {['Open Splitwise → Settings → Export Data', 'Download the CSV file to your device', 'Tap "Upload CSV" below to import'].map((step, i) => (
          <View key={i} style={rs.importStep}>
            <View style={rs.importStepNum}><Text style={rs.importStepNumText}>{i + 1}</Text></View>
            <Text style={rs.importStepText}>{step}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={rs.uploadBtn} onPress={() => Alert.alert('Coming soon', 'File import will be available in a future update.')}>
        <Text style={rs.uploadBtnText}>📁 Upload CSV</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

// ─── Group Insights ──────────────────────────────────────────────────────────
export const GroupInsightsScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="Group Insights" />
    <ScrollView contentContainerStyle={rs.scroll}>
      <View style={rs.summaryCard}>
        <Text style={rs.summaryLabel}>Total group spending</Text>
        <Text style={rs.summaryAmount}>₹24,500</Text>
        <Text style={rs.summaryMeta}>Across all categories</Text>
      </View>
      {[{ label: 'Food', emoji: '🍔', pct: 45, color: '#FF6B35' }, { label: 'Travel', emoji: '✈️', pct: 30, color: '#6366F1' }, { label: 'Other', emoji: '📦', pct: 25, color: '#9CA3AF' }].map(c => (
        <View key={c.label} style={rs.insightRow}>
          <Text style={{ fontSize: 20, width: 32 }}>{c.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={rs.budgetRowTop}>
              <Text style={rs.budgetLabel}>{c.label}</Text>
              <Text style={rs.budgetAmt}>{c.pct}%</Text>
            </View>
            <View style={rs.progressBar}><View style={[rs.progressFill, { width: `${c.pct}%`, backgroundColor: c.color }]} /></View>
          </View>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

// ─── Import Group ─────────────────────────────────────────────────────────────
export const ImportGroupScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="Import Group" />
    <ScrollView contentContainerStyle={rs.scroll}>
      <View style={rs.importCard}>
        <Text style={rs.importEmoji}>📥</Text>
        <Text style={rs.importTitle}>Import a Splitwise group</Text>
        <Text style={rs.importSub}>Paste your Splitwise group export JSON below to recreate the group and its expense history in QuickSplit.</Text>
      </View>
      <TouchableOpacity style={rs.uploadBtn} onPress={() => Alert.alert('Coming soon', 'Group import will be available in a future update.')}>
        <Text style={rs.uploadBtnText}>📁 Select File</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

// ─── QR Code ─────────────────────────────────────────────────────────────────
export const QRCodeScreen: React.FC = () => {
  const { user } = require('../state/userStore').useUserStore();
  return (
    <SafeAreaView style={rs.safe}>
      <BackHeader title="My QR Code" />
      <ScrollView contentContainerStyle={rs.scroll}>
        <View style={rs.qrCard}>
          <View style={rs.qrPlaceholder}>
            <Text style={rs.qrPlaceholderText}>QR</Text>
            <Text style={rs.qrPlaceholderSub}>Scan to pay {user?.name?.split(' ')[0]}</Text>
          </View>
          {user?.upi_id ? (
            <Text style={rs.qrUpi}>UPI: {user.upi_id}</Text>
          ) : (
            <Text style={rs.qrNoUpi}>Add your UPI ID in Edit Profile to generate a QR code</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Scan Screen ─────────────────────────────────────────────────────────────
export const ScanScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={rs.safe}>
      <BackHeader title="Scan Receipt" />
      <View style={rs.cameraPlaceholder}>
        <Text style={rs.cameraEmoji}>📷</Text>
        <Text style={rs.cameraTitle}>Camera access required</Text>
        <Text style={rs.cameraSub}>OCR receipt scanning will be enabled in the next build when camera permissions are requested.</Text>
        <TouchableOpacity style={rs.cameraBtn} onPress={() => navigation.goBack()}>
          <Text style={rs.cameraBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Split Screen ─────────────────────────────────────────────────────────────
export const SplitScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="Review Split" />
    <View style={rs.cameraPlaceholder}>
      <Text style={rs.cameraEmoji}>🧾</Text>
      <Text style={rs.cameraTitle}>OCR Split Review</Text>
      <Text style={rs.cameraSub}>Parsed receipt items will appear here after scanning.</Text>
    </View>
  </SafeAreaView>
);

// ─── Review Screen ───────────────────────────────────────────────────────────
export const ReviewScreen: React.FC = () => (
  <SafeAreaView style={rs.safe}>
    <BackHeader title="Confirm Split" />
    <View style={rs.cameraPlaceholder}>
      <Text style={rs.cameraEmoji}>✅</Text>
      <Text style={rs.cameraTitle}>Review & Confirm</Text>
      <Text style={rs.cameraSub}>Final split summary will appear here before submitting.</Text>
    </View>
  </SafeAreaView>
);

// ─── Shared styles ────────────────────────────────────────────────────────────
const rs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  summaryCard: { backgroundColor: '#1B4332', borderRadius: 20, padding: 20, marginVertical: 16, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase' },
  summaryAmount: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', marginVertical: 4 },
  summaryMeta: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  progressBar: { height: 6, backgroundColor: '#E7E5E4', borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  budgetRowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  budgetAmt: { fontSize: 12, color: '#6B7280' },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', padding: 14, marginBottom: 8 },
  subIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  subName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  subMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  subAmount: { fontSize: 15, fontWeight: '800', color: '#111827' },
  settingsSection: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E5E4', margin: 20, overflow: 'hidden' },
  settingsLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F3F4F6' },
  settingsEmoji: { fontSize: 18, width: 28 },
  settingsRowLabel: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  settingsArrow: { fontSize: 20, color: '#D1D5DB' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F3F4F6' },
  toggleLabel: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  toggleSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#1B4332' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1B4332' },
  proBanner: { backgroundColor: '#1B4332', borderRadius: 20, padding: 24, alignItems: 'center', marginVertical: 16 },
  proEmoji: { fontSize: 40, marginBottom: 8 },
  proTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center' },
  proSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'center' },
  proFeature: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  proFeatureText: { fontSize: 14, color: '#111827', fontWeight: '500' },
  proBtn: { backgroundColor: '#FF6B35', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  proBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  proDisclaimer: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 10 },
  referCard: { backgroundColor: '#FFFBEB', borderRadius: 20, borderWidth: 1, borderColor: '#FDE68A', padding: 20, alignItems: 'center', marginVertical: 16 },
  referEmoji: { fontSize: 40, marginBottom: 8 },
  referTitle: { fontSize: 20, fontWeight: '700', color: '#92400E', textAlign: 'center' },
  referSub: { fontSize: 13, color: '#92400E', textAlign: 'center', marginTop: 6 },
  codeBox: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E5E4', padding: 20, alignItems: 'center', marginBottom: 16 },
  codeLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  code: { fontSize: 28, fontWeight: '800', color: '#1B4332', letterSpacing: 4 },
  shareBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  shareBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  importCard: { backgroundColor: '#F0FDF4', borderRadius: 20, borderWidth: 1, borderColor: '#BBF7D0', padding: 20, alignItems: 'center', marginVertical: 16 },
  importEmoji: { fontSize: 40, marginBottom: 8 },
  importTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  importSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6 },
  importSteps: { marginBottom: 16 },
  importStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  importStepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  importStepNumText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  importStepText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  uploadBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  uploadBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  qrCard: { alignItems: 'center', paddingVertical: 32 },
  qrPlaceholder: { width: 200, height: 200, backgroundColor: '#F3F4F6', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#E7E5E4' },
  qrPlaceholderText: { fontSize: 48, fontWeight: '800', color: '#D1D5DB' },
  qrPlaceholderSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  qrUpi: { fontSize: 14, color: '#374151', fontWeight: '600' },
  qrNoUpi: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', maxWidth: 260 },
  cameraPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  cameraEmoji: { fontSize: 56, marginBottom: 16 },
  cameraTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  cameraSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  cameraBtn: { backgroundColor: '#1B4332', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  cameraBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
