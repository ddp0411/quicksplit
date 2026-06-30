import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { expensesAPI, EXPENSE_CATEGORIES } from '../services/api/expensesAPI';
import { ocrAPI } from '../services/api/ocrAPI';
import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢'] as const;

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const expenseId: string = params?.expenseId;
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const { toast } = useToastStore();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [commentText, setCommentText] = useState('');
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [myReactions, setMyReactions] = useState<Record<string, boolean>>({});
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => expensesAPI.getExpense(expenseId),
    enabled: !!expenseId,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['expense-comments', expenseId],
    queryFn: () => expensesAPI.getComments(expenseId),
    enabled: !!expenseId,
  });

  useEffect(() => {
    if (!expenseId) return;
    AsyncStorage.getItem(`qs-reactions-${expenseId}`).then((raw) => {
      if (raw) {
        const stored = JSON.parse(raw);
        setReactions(stored.counts ?? {});
        setMyReactions(stored.mine ?? {});
      }
    });
  }, [expenseId]);

  const toggleReaction = async (emoji: string) => {
    const alreadyReacted = myReactions[emoji];
    const newCounts = { ...reactions, [emoji]: Math.max(0, (reactions[emoji] ?? 0) + (alreadyReacted ? -1 : 1)) };
    const newMine = { ...myReactions, [emoji]: !alreadyReacted };
    setReactions(newCounts);
    setMyReactions(newMine);
    await AsyncStorage.setItem(`qs-reactions-${expenseId}`, JSON.stringify({ counts: newCounts, mine: newMine }));
  };

  const deleteMutation = useMutation({
    mutationFn: () => expensesAPI.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      toast('Expense deleted', 'success');
      navigation.goBack();
    },
    onError: () => toast('Failed to delete expense', 'error'),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => expensesAPI.addComment(expenseId, content),
    onSuccess: () => {
      setCommentText('');
      refetchComments();
    },
    onError: () => toast('Failed to post comment', 'error'),
  });

  const handleDelete = () => {
    Alert.alert('Delete expense', 'This will affect all balances. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const handleAttachReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;
    setUploadingReceipt(true);
    try {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append('image', { uri, type: 'image/jpeg', name: 'receipt.jpg' } as any);
      const ocr = await ocrAPI.uploadAndProcess(formData as any);
      await expensesAPI.updateExpense(expenseId, { notes: `[Receipt] ${ocr.text?.slice(0, 100) ?? 'Attached'}` });
      queryClient.invalidateQueries({ queryKey: ['expense', expenseId] });
      toast('Receipt attached!', 'success');
    } catch {
      toast('Could not attach receipt', 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const catInfo = EXPENSE_CATEGORIES.find(c => c.value === expense?.category);
  const isPayer = expense?.paid_by?.id === user?.id;
  const isOverdue = expense
    ? (new Date().getTime() - new Date(expense.date).getTime()) > 7 * 24 * 60 * 60 * 1000
      && expense.shares.some(s => !s.is_settled)
    : false;
  const perPerson = expense && expense.split_type === 'equal' && expense.shares.length > 1
    ? expense.amount / expense.shares.length
    : null;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Expense Detail</Text>
        {isPayer ? (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={s.deleteText}>Delete</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 48 }} />}
      </View>

      {isLoading || !expense ? (
        <View style={s.loading}><Text style={s.loadingText}>Loading…</Text></View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={60}>
          <ScrollView ref={scrollRef} contentContainerStyle={s.scroll}>
            {/* Hero */}
            <View style={s.hero}>
              <View style={s.heroIcon}>
                <Text style={{ fontSize: 32 }}>{catInfo?.emoji ?? '📦'}</Text>
              </View>
              <Text style={s.heroDesc}>{expense.description}</Text>
              <Text style={s.heroAmount}>{formatCurrency(expense.amount)}</Text>
              {perPerson && (
                <Text style={s.perPerson}>{formatCurrency(perPerson)} each</Text>
              )}
              <Text style={s.heroMeta}>
                {expense.paid_by.name} paid · {formatDate(expense.date)}
              </Text>
              <View style={s.badgeRow}>
                {isPayer && (
                  <View style={[s.badge, s.badgePaid]}><Text style={s.badgePaidText}>You paid</Text></View>
                )}
                {isOverdue && (
                  <View style={[s.badge, s.badgeOverdue]}><Text style={s.badgeOverdueText}>Overdue</Text></View>
                )}
                {expense.group_name && (
                  <View style={s.groupPill}>
                    <Text style={s.groupPillText}>🏠 {expense.group_name}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Emoji Reactions */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Reactions</Text>
              <View style={s.reactionsRow}>
                {REACTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[s.reactionBtn, myReactions[emoji] && s.reactionBtnActive]}
                    onPress={() => toggleReaction(emoji)}
                  >
                    <Text style={s.reactionEmoji}>{emoji}</Text>
                    {(reactions[emoji] ?? 0) > 0 && (
                      <Text style={s.reactionCount}>{reactions[emoji]}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Shares */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Split ({expense.shares.length} people)</Text>
              {expense.shares.map(share => (
                <View key={share.id} style={s.shareRow}>
                  <View style={[s.avatar, { backgroundColor: share.user.avatar_color }]}>
                    <Text style={s.avatarText}>{avatarInitials(share.user.name)}</Text>
                  </View>
                  <Text style={s.shareName}>{share.user.name}</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.shareAmount}>{formatCurrency(share.amount_owed)}</Text>
                    {share.is_settled ? (
                      <Text style={s.settled}>Settled ✓</Text>
                    ) : (
                      <Text style={s.unsettled}>Pending</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Receipt Attachment */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Receipt</Text>
              {expense.notes?.startsWith('[Receipt]') ? (
                <View style={s.receiptCard}>
                  <Text style={s.receiptEmoji}>🧾</Text>
                  <Text style={s.receiptText}>{expense.notes.replace('[Receipt] ', '')}</Text>
                </View>
              ) : (
                <TouchableOpacity style={s.attachBtn} onPress={handleAttachReceipt} disabled={uploadingReceipt}>
                  <Text style={s.attachBtnText}>{uploadingReceipt ? 'Uploading…' : '📎 Attach Receipt'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Notes */}
            {expense.notes && !expense.notes.startsWith('[Receipt]') ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Notes</Text>
                <Text style={s.notes}>{expense.notes}</Text>
              </View>
            ) : null}

            {/* Details */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Details</Text>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Split type</Text>
                <Text style={s.metaValue}>{expense.split_type}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Category</Text>
                <Text style={s.metaValue}>{catInfo?.label ?? expense.category}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Added by</Text>
                <Text style={s.metaValue}>{expense.created_by.name}</Text>
              </View>
            </View>

            {/* Comments */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Comments ({(comments as any[]).length})</Text>
              {(comments as any[]).length === 0 ? (
                <Text style={s.noComments}>No comments yet. Be the first!</Text>
              ) : (
                (comments as any[]).map((c: any) => (
                  <View key={c.id} style={s.commentRow}>
                    <View style={[s.avatar, { backgroundColor: c.user?.avatar_color ?? '#00658E' }]}>
                      <Text style={s.avatarText}>{avatarInitials(c.user?.name ?? 'U')}</Text>
                    </View>
                    <View style={s.commentBubble}>
                      <Text style={s.commentName}>{c.user?.name ?? 'User'}</Text>
                      <Text style={s.commentText}>{c.content}</Text>
                      <Text style={s.commentTime}>{formatDate(c.created_at)}</Text>
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 80 }} />
            </View>
          </ScrollView>

          {/* Comment Input */}
          <View style={s.commentInputWrap}>
            <TextInput
              style={s.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment…"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[s.sendBtn, (!commentText.trim() || commentMutation.isPending) && { opacity: 0.4 }]}
              onPress={() => commentText.trim() && commentMutation.mutate(commentText.trim())}
              disabled={!commentText.trim() || commentMutation.isPending}
            >
              <Text style={s.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: c.text },
  title: { fontSize: 17, fontWeight: '700', color: c.text },
  deleteText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: c.textMuted },
  scroll: { paddingBottom: 20 },
  hero: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder },
  heroIcon: { width: 68, height: 68, borderRadius: 20, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroDesc: { fontSize: 20, fontWeight: '800', color: c.text, textAlign: 'center', fontFamily: 'Inter_700Bold' },
  heroAmount: { fontSize: 32, fontWeight: '800', color: '#00658E', marginTop: 6 },
  perPerson: { fontSize: 14, fontWeight: '700', color: '#00658E', marginTop: 2 },
  heroMeta: { fontSize: 13, color: c.textSub, marginTop: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, justifyContent: 'center' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgePaid: { backgroundColor: '#E8F3FA', borderWidth: 1, borderColor: '#C4DFEF' },
  badgePaidText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  badgeOverdue: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  badgeOverdueText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  groupPill: { backgroundColor: '#E8F3FA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#C4DFEF' },
  groupPillText: { fontSize: 12, color: '#00658E', fontWeight: '600' },

  reactionsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  reactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'transparent' },
  reactionBtnActive: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  reactionEmoji: { fontSize: 18 },
  reactionCount: { fontSize: 13, fontWeight: '700', color: c.text },

  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: c.textSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 12, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  shareName: { flex: 1, fontSize: 14, fontWeight: '600', color: c.text },
  shareAmount: { fontSize: 14, fontWeight: '700', color: c.text },
  settled: { fontSize: 11, color: '#16A34A', marginTop: 2 },
  unsettled: { fontSize: 11, color: c.textMuted, marginTop: 2 },

  receiptCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: c.pillBg, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.cardBorder },
  receiptEmoji: { fontSize: 24, marginTop: 2 },
  receiptText: { flex: 1, fontSize: 13, color: c.sectionLabel, lineHeight: 18 },
  attachBtn: { backgroundColor: c.pillBg, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: c.cardBorder, borderStyle: 'dashed' },
  attachBtnText: { fontSize: 14, fontWeight: '700', color: '#00658E' },

  notes: { fontSize: 14, color: c.sectionLabel, backgroundColor: c.pillBg, borderRadius: 12, padding: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.pillBg },
  metaLabel: { fontSize: 14, color: c.textSub },
  metaValue: { fontSize: 14, fontWeight: '600', color: c.text, textTransform: 'capitalize' },

  noComments: { fontSize: 14, color: c.textMuted, textAlign: 'center', paddingVertical: 20 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  commentBubble: { flex: 1, backgroundColor: c.card, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: c.cardBorder },
  commentName: { fontSize: 12, fontWeight: '700', color: '#00658E', marginBottom: 3 },
  commentText: { fontSize: 13, color: c.sectionLabel, lineHeight: 18 },
  commentTime: { fontSize: 10, color: c.textMuted, marginTop: 4 },

  commentInputWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.cardBorder, backgroundColor: c.bg },
  commentInput: { flex: 1, backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: c.text, maxHeight: 80 },
  sendBtn: { backgroundColor: '#00658E', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  sendBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  });
}
