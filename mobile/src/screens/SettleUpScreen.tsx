import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { balancesAPI } from '../services/api/balancesAPI';
import { useToastStore } from '../state/toastStore';
import { formatCurrency } from '../utils/upi';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const SettleUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();

  const userId: string = params?.userId;
  const friendName: string = params?.friendName ?? 'Friend';

  const { data: balanceData } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const friendBalance = balanceData?.balances.find(b => b.user.id === userId);
  const balance = friendBalance?.balance ?? 0;
  const friend = friendBalance?.user;

  const [amount, setAmount] = useState(Math.abs(balance).toFixed(2));
  const [notes, setNotes] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');

  const mutation = useMutation({
    mutationFn: () => balancesAPI.createSettlement({
      to_user_id: userId,
      amount: parseFloat(amount),
      notes: notes.trim() || undefined,
      upi_transaction_id: upiTxnId.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast(`Settled up with ${friendName}!`, 'success');
      navigation.goBack();
    },
    onError: () => toast('Failed to record settlement', 'error'),
  });

  const amt = parseFloat(amount);
  const isValid = !isNaN(amt) && amt > 0;

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

        <ScrollView contentContainerStyle={s.scroll}>
          {/* Friend card */}
          <View style={s.friendCard}>
            <View style={[s.avatar, { backgroundColor: friend?.avatar_color ?? '#1B4332' }]}>
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

          <View style={s.field}>
            <Text style={s.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={s.fieldInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Cash payment"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>UPI Transaction ID (optional)</Text>
            <TextInput
              style={s.fieldInput}
              value={upiTxnId}
              onChangeText={setUpiTxnId}
              placeholder="e.g. UPI ref number"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[s.submitBtn, (!isValid || mutation.isPending) && { opacity: 0.5 }]}
            onPress={() => mutation.mutate()}
            disabled={!isValid || mutation.isPending}
          >
            <Text style={s.submitBtnText}>
              {mutation.isPending ? 'Recording…' : `Record Settlement`}
            </Text>
          </TouchableOpacity>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  friendCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E5E4', padding: 14, marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  friendName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  balanceLabel: { fontSize: 13, marginTop: 2 },
  amountCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B4332', borderRadius: 20, padding: 24, marginBottom: 20 },
  currencySymbol: { fontSize: 32, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', minWidth: 120, textAlign: 'center' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  fieldInput: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  submitBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
