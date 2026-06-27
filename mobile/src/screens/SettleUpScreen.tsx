import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, Linking, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { balancesAPI } from '../services/api/balancesAPI';
import { getAPIErrorMessage } from '../services/api/errorMessage';
import { useToastStore } from '../state/toastStore';
import { useTheme } from '../theme/useTheme';
import { formatCurrency } from '../utils/upi';

type C = ReturnType<typeof useTheme>['colors'];

function avatarInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

const PAYMENT_METHODS = [
  { id: 'gpay', label: 'GPay', emoji: '🟢', package: 'com.google.android.apps.nbu.paisa.user', iosScheme: 'gpay' },
  { id: 'phonepe', label: 'PhonePe', emoji: '💜', package: 'com.phonepe.app', iosScheme: 'phonepe' },
  { id: 'paytm', label: 'Paytm', emoji: '🔵', package: 'net.one97.paytm', iosScheme: 'paytmmp' },
  { id: 'cash', label: 'Cash', emoji: '💵', package: null, iosScheme: null },
  { id: 'other', label: 'Other', emoji: '💳', package: null, iosScheme: null },
];

export const SettleUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createStyles(colors);

  const userId: string = params?.userId;
  const friendName: string = params?.friendName ?? 'Friend';
  const groupId: string | undefined = params?.groupId;
  const presetAmount: number | undefined = params?.amount;

  const { data: balanceData } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const friendBalance = (balanceData as any)?.balances?.find((b: any) => b.user.id === userId);
  const balance = friendBalance?.balance ?? 0;
  // Fall back to the params (group members aren't always in the overall balances list).
  const friend = friendBalance?.user ?? (userId
    ? { id: userId, name: friendName, avatar_color: '#0F4B70', upi_id: undefined }
    : undefined);

  const [amount, setAmount] = useState(
    presetAmount != null ? String(presetAmount) : ''
  );
  // Prefill the amount from the loaded balance once (when no explicit amount was passed).
  const didInitAmount = useRef(presetAmount != null);
  useEffect(() => {
    if (didInitAmount.current) return;
    if (friendBalance) {
      setAmount(Math.abs(friendBalance.balance).toFixed(2));
      didInitAmount.current = true;
    }
  }, [friendBalance]);
  const [notes, setNotes] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [activeMethod, setActiveMethod] = useState('gpay');
  const [settled, setSettled] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => balancesAPI.createSettlement({
      to_user_id: userId,
      amount: parseFloat(amount),
      group_id: groupId || undefined,
      notes: notes.trim() || undefined,
      upi_transaction_id: upiTxnId.trim() || undefined,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-balances'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      setSettled(data);
    },
    onError: (err) => toast(getAPIErrorMessage(err, 'Failed to record settlement'), 'error'),
  });

  const amt = parseFloat(amount);
  const isValid = !isNaN(amt) && amt > 0;

  const openUpiApp = async () => {
    const method = PAYMENT_METHODS.find((m) => m.id === activeMethod);
    if (!method?.iosScheme && !method?.package) return;
    const upiLink = `upi://pay?pa=${friend?.upi_id ?? ''}&pn=${encodeURIComponent(friendName)}&am=${amt.toFixed(2)}&cu=INR`;
    const canOpen = await Linking.canOpenURL(upiLink);
    if (canOpen) {
      Linking.openURL(upiLink);
    } else {
      Alert.alert('App not found', `Please install ${method.label} to use this payment method.`);
    }
  };

  // ─── Success View ──────────────────────────────────────────────────────────
  if (settled) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successWrap}>
          <View style={s.successIcon}><Text style={{ fontSize: 52 }}>✅</Text></View>
          <Text style={s.successTitle}>Payment Recorded!</Text>
          <Text style={s.successSub}>
            You settled {formatCurrency(settled.amount)} with {friendName}
          </Text>
          {settled.qr_code && (
            <Image
              source={{ uri: `data:image/png;base64,${settled.qr_code}` }}
              style={s.qrImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const upiCapableMethod = ['gpay', 'phonepe', 'paytm'].includes(activeMethod);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Settle Up</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Friend card */}
          <View style={s.friendCard}>
            <View style={[s.avatar, { backgroundColor: friend?.avatar_color ?? '#0F4B70' }]}>
              <Text style={s.avatarText}>{avatarInitials(friendName)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.friendName}>{friendName}</Text>
              {Math.abs(balance) > 0.01 && (
                <Text style={[s.balanceLabel, { color: balance > 0 ? '#16A34A' : '#DC2626' }]}>
                  {balance > 0
                    ? `${friendName.split(' ')[0]} owes you ${formatCurrency(Math.abs(balance))}`
                    : `You owe ${formatCurrency(Math.abs(balance))}`}
                </Text>
              )}
            </View>
          </View>

          {/* AI suggestion card */}
          <View style={s.aiCard}>
            <Text style={s.aiEmoji}>💡</Text>
            <Text style={s.aiText}>Settle in 1 payment to close all outstanding balances</Text>
          </View>

          {/* Payment method tabs */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Pay via</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.methodTabs}>
                {PAYMENT_METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[s.methodTab, activeMethod === m.id && s.methodTabActive]}
                    onPress={() => setActiveMethod(m.id)}
                  >
                    <Text style={s.methodEmoji}>{m.emoji}</Text>
                    <Text style={[s.methodLabel, activeMethod === m.id && s.methodLabelActive]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Amount */}
          <View style={s.amountCard}>
            <Text style={s.currencySymbol}>₹</Text>
            <TextInput
              style={s.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>

          {/* Open in app button */}
          {upiCapableMethod && friend?.upi_id && (
            <TouchableOpacity style={s.openAppBtn} onPress={openUpiApp}>
              <Text style={s.openAppText}>
                Open in {PAYMENT_METHODS.find((m) => m.id === activeMethod)?.label} →
              </Text>
            </TouchableOpacity>
          )}
          {upiCapableMethod && !friend?.upi_id && (
            <View style={s.noUpiNote}>
              <Text style={s.noUpiText}>⚠️ {friendName.split(' ')[0]} hasn't added a UPI ID yet</Text>
            </View>
          )}

          <View style={s.fieldRow}>
            <View style={[s.field, { flex: 1, marginRight: 8 }]}>
              <Text style={s.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={s.fieldInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Cash payment"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldLabel}>UPI Txn ID</Text>
              <TextInput
                style={s.fieldInput}
                value={upiTxnId}
                onChangeText={setUpiTxnId}
                placeholder="Optional"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[s.submitBtn, (!isValid || mutation.isPending) && { opacity: 0.5 }]}
            onPress={() => mutation.mutate()}
            disabled={!isValid || mutation.isPending}
          >
            <Text style={s.submitBtnText}>
              {mutation.isPending ? 'Recording…' : 'Record Settlement'}
            </Text>
          </TouchableOpacity>
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
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    friendCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 14, marginBottom: 12 },
    avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    friendName: { fontSize: 16, fontWeight: '700', color: c.text },
    balanceLabel: { fontSize: 13, marginTop: 2 },
    aiCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.successBg, borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: c.successBorder },
    aiEmoji: { fontSize: 20 },
    aiText: { flex: 1, fontSize: 13, color: c.successText, fontWeight: '600' },
    field: { marginBottom: 14 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: c.sectionLabel, marginBottom: 6 },
    fieldInput: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text },
    fieldRow: { flexDirection: 'row', marginBottom: 0 },
    methodTabs: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
    methodTab: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, borderColor: c.cardBorder, backgroundColor: c.card, minWidth: 70 },
    methodTabActive: { borderColor: '#0F4B70', backgroundColor: '#E8F3FA' },
    methodEmoji: { fontSize: 20, marginBottom: 4 },
    methodLabel: { fontSize: 11, fontWeight: '600', color: c.textSub },
    methodLabelActive: { color: '#0F4B70' },
    amountCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F4B70', borderRadius: 20, padding: 24, marginBottom: 14 },
    currencySymbol: { fontSize: 32, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginRight: 4 },
    amountInput: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', minWidth: 120, textAlign: 'center' },
    openAppBtn: { backgroundColor: c.successBg, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: c.successBorder },
    openAppText: { fontSize: 15, fontWeight: '700', color: '#0F4B70' },
    noUpiNote: { backgroundColor: c.warningBg, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: c.warningBorder },
    noUpiText: { fontSize: 13, color: c.warningText, fontWeight: '600' },
    submitBtn: { backgroundColor: '#0F4B70', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    // Success
    successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    successIcon: { marginBottom: 16 },
    successTitle: { fontSize: 24, fontWeight: '800', color: c.text, marginBottom: 8, fontFamily: 'PlusJakartaSans_700Bold' },
    successSub: { fontSize: 15, color: c.textSub, textAlign: 'center', marginBottom: 24 },
    qrImage: { width: 200, height: 200, marginBottom: 24 },
    doneBtn: { backgroundColor: '#0F4B70', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center' },
    doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}
