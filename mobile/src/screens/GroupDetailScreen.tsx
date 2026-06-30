import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl, TextInput, KeyboardAvoidingView,
  Platform, Modal, Alert, Share,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { groupsAPI } from '../services/api/groupsAPI';
import { expensesAPI, type ExpenseListItem, EXPENSE_CATEGORIES } from '../services/api/expensesAPI';
import { useUserStore } from '../state/userStore';
import { useToastStore } from '../state/toastStore';
import { formatCurrency } from '../utils/upi';
import { formatDate } from '../utils/helpers';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

const CATEGORY_MAP: Record<string, { emoji: string; gradientColors: string[] }> = {
  home:   { emoji: '🏠', gradientColors: ['#004C6C', '#00658E'] },
  trip:   { emoji: '✈️', gradientColors: ['#1E1B4B', '#3730A3'] },
  couple: { emoji: '💑', gradientColors: ['#831843', '#BE185D'] },
  work:   { emoji: '💼', gradientColors: ['#78350F', '#B45309'] },
  other:  { emoji: '🎉', gradientColors: ['#00658E', '#004C6C'] },
};

function avatarInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function expenseCategoryEmoji(cat: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === cat)?.emoji ?? '📦';
}

type TabType = 'expenses' | 'members' | 'chat';

export const GroupDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const groupId: string = params?.groupId;
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const { toast } = useToastStore();

  const { colors } = useTheme();
  const s = createStyles(colors);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [chatMessage, setChatMessage] = useState('');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const chatListRef = useRef<FlatList>(null);

  const { data: group, isLoading: loadingGroup, refetch: refetchGroup } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsAPI.getGroup(groupId),
    enabled: !!groupId,
  });

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

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['group-chat', groupId],
    queryFn: () => groupsAPI.getGroupChat(groupId),
    enabled: !!groupId && activeTab === 'chat',
    refetchInterval: 10000,
  });

  // Refresh group + balances + expense list whenever the screen regains focus
  // (e.g. returning from AddExpense or SettleUp launched against this group).
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', { group_id: groupId }] });
    }, [queryClient, groupId])
  );

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => groupsAPI.sendGroupMessage(groupId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-chat', groupId] });
      setChatMessage('');
    },
    onError: () => toast('Failed to send message', 'error'),
  });

  const addMemberMutation = useMutation({
    mutationFn: (email: string) => groupsAPI.addMember(groupId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      setAddMemberEmail('');
      setShowAddMember(false);
      toast('Member added!', 'success');
    },
    onError: () => toast('User not found or already a member', 'error'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => groupsAPI.removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toast('Member removed', 'success');
    },
    onError: () => toast('Failed to remove member', 'error'),
  });

  const cat = group ? (CATEGORY_MAP[(group as any).category] ?? CATEGORY_MAP.other) : CATEGORY_MAP.other;
  const isAdmin = group ? (group as any).created_by?.id === user?.id : false;

  const handleInvite = async () => {
    try {
      await Share.share({ message: `Join my QuickSplit group "${(group as any)?.name}"! Download QuickSplit to split expenses easily.` });
    } catch { /* dismissed */ }
  };

  // Settle what the current user owes in this group. Uses the simplified debt graph
  // to pre-fill who to pay and how much; passes groupId so the settlement is scoped.
  const handleSettle = () => {
    const debts = (balances as any)?.simplified_debts ?? [];
    const myDebt = debts.find((d: any) => d.from_user?.id === user?.id);
    if (myDebt) {
      navigation.navigate('SettleUp', {
        userId: myDebt.to_user.id,
        friendName: myDebt.to_user.name,
        amount: myDebt.amount,
        groupId,
      });
    } else {
      toast('You have no outstanding balance to settle in this group', 'success');
    }
  };

  const handleRemoveMember = (member: any) => {
    if (!isAdmin) { toast('Only admins can remove members', 'error'); return; }
    Alert.alert('Remove member', `Remove ${member.user.name} from this group?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMemberMutation.mutate(member.user.id) },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      {/* Gradient Hero */}
      <LinearGradient colors={cat.gradientColors as [string, string]} style={s.hero}>
        <View style={s.heroTop}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.heroName} numberOfLines={1}>{(group as any)?.name ?? '…'}</Text>
            <Text style={s.heroCategory}>{cat.emoji} {(group as any)?.category ?? ''}</Text>
          </View>
        </View>

        {/* 5 Quick Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.actionsRow}>
          {[
            { emoji: '➕', label: 'Add', onPress: () => navigation.navigate('AddExpense', { groupId }) },
            { emoji: '💸', label: 'Settle', onPress: handleSettle },
            { emoji: '📊', label: 'Insights', onPress: () => navigation.navigate('GroupInsights', { groupId }) },
            { emoji: '💬', label: 'Chat', onPress: () => setActiveTab('chat') },
            { emoji: '🔗', label: 'Invite', onPress: handleInvite },
          ].map((action) => (
            <TouchableOpacity key={action.label} style={s.actionBtn} onPress={action.onPress}>
              <Text style={s.actionEmoji}>{action.emoji}</Text>
              <Text style={s.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Analytics mini card */}
        {balances && (
          <View style={s.analyticsCard}>
            {[
              { value: formatCurrency((balances as any).total_expenses), label: 'Total spent' },
              { value: String((group as any)?.members?.length ?? 0), label: 'Members' },
              { value: String((expenses as ExpenseListItem[]).length), label: 'Expenses' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={s.analyticDivider} />}
                <View style={s.analyticItem}>
                  <Text style={s.analyticValue}>{item.value}</Text>
                  <Text style={s.analyticLabel}>{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}
      </LinearGradient>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {(['expenses', 'members', 'chat'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabLabel, activeTab === tab && s.tabLabelActive]}>
              {tab === 'expenses' ? 'Expenses'
                : tab === 'members' ? `Members (${(group as any)?.members?.length ?? 0})`
                : 'Chat 💬'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Expenses Tab ── */}
      {activeTab === 'expenses' && (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={loadingGroup} onRefresh={refetchGroup} tintColor="#00658E" />}
        >
          {balances && (balances as any).simplified_debts?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Who owes who</Text>
              {(balances as any).simplified_debts.map((d: any, i: number) => (
                <View key={i} style={s.debtRow}>
                  <View style={[s.debtAvatar, { backgroundColor: d.from_user.avatar_color }]}>
                    <Text style={s.debtAvatarText}>{avatarInitials(d.from_user.name)}</Text>
                  </View>
                  <Text style={s.debtLabel}>
                    <Text style={{ fontWeight: '700' }}>{d.from_user.name.split(' ')[0]}</Text>
                    {' owes '}
                    <Text style={{ fontWeight: '700' }}>{d.to_user.name.split(' ')[0]}</Text>
                  </Text>
                  <Text style={s.debtAmount}>{formatCurrency(d.amount)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={s.section}>
            <Text style={s.sectionTitle}>Expenses ({(expenses as ExpenseListItem[]).length})</Text>
            {(expenses as ExpenseListItem[]).length === 0 ? (
              <View style={s.expEmpty}><Text style={s.expEmptyText}>No expenses yet. Add the first one!</Text></View>
            ) : (
              (expenses as ExpenseListItem[]).map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={s.expRow}
                  onPress={() => navigation.navigate('ExpenseDetail', { expenseId: e.id })}
                  activeOpacity={0.8}
                >
                  <View style={s.expIcon}>
                    <Text style={{ fontSize: 18 }}>{expenseCategoryEmoji(e.category)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.expDesc}>{e.description}</Text>
                    <Text style={s.expMeta}>{e.paid_by.name.split(' ')[0]} paid · {formatDate(e.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.expAmount}>{formatCurrency(e.amount)}</Text>
                    {e.your_share > 0 && <Text style={s.expShare}>your: {formatCurrency(e.your_share)}</Text>}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* ── Members Tab ── */}
      {activeTab === 'members' && (
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Members</Text>
              {isAdmin && (
                <TouchableOpacity style={s.addMemberBtn} onPress={() => setShowAddMember(true)}>
                  <Text style={s.addMemberText}>+ Add</Text>
                </TouchableOpacity>
              )}
            </View>
            {(group as any)?.members?.map((m: any) => (
              <View key={m.id} style={s.memberRow}>
                <View style={[s.memberAvatar, { backgroundColor: m.user.avatar_color }]}>
                  <Text style={s.memberAvatarText}>{avatarInitials(m.user.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{m.user.name}</Text>
                  <Text style={s.memberEmail}>{m.user.email}</Text>
                </View>
                {m.role === 'admin' && <View style={s.adminBadge}><Text style={s.adminText}>Admin</Text></View>}
                {isAdmin && m.user.id !== user?.id && (
                  <TouchableOpacity style={s.removeBtn} onPress={() => handleRemoveMember(m)}>
                    <Text style={s.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── Chat Tab ── */}
      {activeTab === 'chat' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            ref={chatListRef}
            data={chatMessages as any[]}
            keyExtractor={(item) => (item as any).id}
            contentContainerStyle={s.chatList}
            onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={s.chatEmpty}>
                <Text style={s.chatEmptyText}>No messages yet. Say hi! 👋</Text>
              </View>
            }
            renderItem={({ item: msg }) => {
              const isMe = (msg as any).user.id === user?.id;
              return (
                <View style={[s.bubbleWrap, isMe ? s.bubbleWrapMe : s.bubbleWrapThem]}>
                  {!isMe && (
                    <View style={[s.bubbleAvatar, { backgroundColor: (msg as any).user.avatar_color }]}>
                      <Text style={s.bubbleAvatarText}>{avatarInitials((msg as any).user.name)}</Text>
                    </View>
                  )}
                  <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
                    {!isMe && <Text style={s.bubbleSender}>{(msg as any).user.name.split(' ')[0]}</Text>}
                    <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>{(msg as any).content}</Text>
                    <Text style={[s.bubbleTime, isMe && s.bubbleTimeMe]}>
                      {new Date((msg as any).created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
          <View style={s.chatInput}>
            <TextInput
              style={s.chatTextInput}
              value={chatMessage}
              onChangeText={setChatMessage}
              placeholder="Type a message…"
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TouchableOpacity
              style={[s.sendBtn, (!chatMessage.trim() || sendMessageMutation.isPending) && { opacity: 0.5 }]}
              onPress={() => chatMessage.trim() && sendMessageMutation.mutate(chatMessage.trim())}
              disabled={!chatMessage.trim() || sendMessageMutation.isPending}
            >
              <Text style={s.sendBtnText}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Add Member Modal */}
      <Modal visible={showAddMember} transparent animationType="slide" onRequestClose={() => setShowAddMember(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Add Member</Text>
            <TextInput
              style={s.fieldInput}
              value={addMemberEmail}
              onChangeText={setAddMemberEmail}
              placeholder="Enter email address"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            <View style={s.modalBtnRow}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowAddMember(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalConfirmBtn, (!addMemberEmail.trim() || addMemberMutation.isPending) && { opacity: 0.5 }]}
                onPress={() => addMemberMutation.mutate(addMemberEmail.trim())}
                disabled={!addMemberEmail.trim() || addMemberMutation.isPending}
              >
                <Text style={s.modalConfirmText}>{addMemberMutation.isPending ? 'Adding…' : 'Add Member'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  hero: { paddingTop: Platform.OS === 'ios' ? 54 : 24, paddingBottom: 0 },
  heroTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#FFFFFF' },
  heroName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', fontFamily: 'Inter_700Bold' },
  heroCategory: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2, textTransform: 'capitalize' },
  actionsRow: { paddingLeft: 16, marginBottom: 12 },
  actionBtn: { alignItems: 'center', marginRight: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, minWidth: 64 },
  actionEmoji: { fontSize: 20, marginBottom: 4 },
  actionLabel: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  analyticsCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 16, borderRadius: 14, padding: 14, marginBottom: 0 },
  analyticItem: { flex: 1, alignItems: 'center' },
  analyticValue: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  analyticLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  analyticDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: c.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#00658E' },
  tabLabel: { fontSize: 12, fontWeight: '600', color: c.textMuted },
  tabLabelActive: { color: '#00658E' },
  scroll: { paddingBottom: 100 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: c.textSub, textTransform: 'uppercase', letterSpacing: 0.5 },
  addMemberBtn: { backgroundColor: '#00658E', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addMemberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  debtRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFBEB', borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A', padding: 12, marginBottom: 8 },
  debtAvatar: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  debtAvatarText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  debtLabel: { flex: 1, fontSize: 13, color: c.sectionLabel },
  debtAmount: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 12, marginBottom: 8 },
  expIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
  expDesc: { fontSize: 14, fontWeight: '700', color: c.text },
  expMeta: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  expAmount: { fontSize: 14, fontWeight: '800', color: c.text },
  expShare: { fontSize: 11, color: c.textSub, marginTop: 2 },
  expEmpty: { backgroundColor: c.pillBg, borderRadius: 14, padding: 20, alignItems: 'center' },
  expEmptyText: { fontSize: 14, color: c.textMuted },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: 12, marginBottom: 8 },
  memberAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  memberName: { fontSize: 14, fontWeight: '700', color: c.text },
  memberEmail: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  adminBadge: { backgroundColor: '#E8F3FA', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 },
  adminText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  removeBtn: { backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  removeBtnText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  chatList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  chatEmpty: { alignItems: 'center', paddingTop: 60 },
  chatEmptyText: { fontSize: 15, color: c.textMuted },
  bubbleWrap: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  bubbleWrapMe: { justifyContent: 'flex-end' },
  bubbleWrapThem: { justifyContent: 'flex-start' },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bubbleAvatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  bubble: { maxWidth: '72%', borderRadius: 16, padding: 12 },
  bubbleMe: { backgroundColor: '#00658E', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder, borderBottomLeftRadius: 4 },
  bubbleSender: { fontSize: 11, fontWeight: '700', color: c.textSub, marginBottom: 2 },
  bubbleText: { fontSize: 14, color: c.text, lineHeight: 20 },
  bubbleTextMe: { color: '#FFFFFF' },
  bubbleTime: { fontSize: 10, color: c.textMuted, marginTop: 4, textAlign: 'right' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)' },
  chatInput: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.cardBorder, backgroundColor: c.card },
  chatTextInput: { flex: 1, backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: c.text, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00658E', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  fieldInput: { backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text, marginBottom: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 16 },
  modalBtnRow: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: { flex: 1, backgroundColor: c.pillBg, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: c.sectionLabel },
  modalConfirmBtn: { flex: 1, backgroundColor: '#00658E', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  });
}
