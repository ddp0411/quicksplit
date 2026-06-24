import React, { useMemo, useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { friendsAPI, type Friend } from '../services/api/friendsAPI';
import { balancesAPI } from '../services/api/balancesAPI';
import { FilterSheet, type FilterOption } from '../components/FilterSheet';
import { SkeletonFriendRow } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency } from '../utils/upi';
import { useTheme } from '../theme/useTheme';
import { useToastStore } from '../state/toastStore';

type C = ReturnType<typeof useTheme>['colors'];

function avatarInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All friends', value: 'all' },
  { label: 'Outstanding', value: 'outstanding' },
  { label: 'They owe you', value: 'owe_you' },
  { label: 'You owe them', value: 'you_owe' },
];

function SwipeActions({
  f,
  onClose,
  onAdd,
  onSettle,
  onRemind,
  onRemove,
  c,
}: {
  f: Friend;
  onClose: () => void;
  onAdd: () => void;
  onSettle: () => void;
  onRemind: () => void;
  onRemove: () => void;
  c: ReturnType<typeof useTheme>['colors'];
}) {
  const s = createSwipeStyles(c);
  const actions = [
    { label: '➕', sublabel: 'Add', onPress: onAdd, bg: '#1B4332' },
    { label: '💸', sublabel: 'Settle', onPress: onSettle, bg: '#FF6B35' },
    { label: '🔔', sublabel: 'Remind', onPress: onRemind, bg: '#D97706' },
    { label: '✕', sublabel: 'Remove', onPress: onRemove, bg: '#DC2626' },
  ];
  return (
    <View style={s.actionsRow}>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.sublabel}
          style={[s.actionBtn, { backgroundColor: a.bg }]}
          onPress={() => { onClose(); a.onPress(); }}
        >
          <Text style={s.actionEmoji}>{a.label}</Text>
          <Text style={s.actionLabel}>{a.sublabel}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function createSwipeStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    actionsRow: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 8, borderRadius: 16, overflow: 'hidden' },
    actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, minWidth: 60 },
    actionEmoji: { fontSize: 16, marginBottom: 2 },
    actionLabel: { fontSize: 9, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  });
}

export const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { toast } = useToastStore();
  const s = createStyles(colors);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const swipeRefs = useRef<Record<string, Swipeable | null>>({});

  const { data: friends = [], isLoading, refetch } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: friendsAPI.getRequests,
  });

  const { data: balanceData } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => friendsAPI.acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => friendsAPI.removeFriend(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  });

  const filtered = useMemo(() => {
    let list = friends as Friend[];
    const q = search.toLowerCase();
    if (q) list = list.filter((f) => f.user.name.toLowerCase().includes(q) || f.user.email.toLowerCase().includes(q));
    if (filter === 'outstanding') list = list.filter((f) => Math.abs(f.balance) > 0.01);
    else if (filter === 'owe_you') list = list.filter((f) => f.balance > 0.01);
    else if (filter === 'you_owe') list = list.filter((f) => f.balance < -0.01);
    return list;
  }, [friends, search, filter]);

  const handleRemove = (f: Friend) => {
    Alert.alert('Remove friend', `Remove ${f.user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMutation.mutate(String(f.user.id)) },
    ]);
  };

  const totalOwedToYou = (balanceData as any)?.total_owed_to_you ?? 0;
  const totalYouOwe = (balanceData as any)?.total_you_owe ?? 0;
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <View style={s.topBarSide} />
        <Text style={s.title}>Friends</Text>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('AddFriend')}>
          <Text style={s.iconBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchRow}>
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search friends"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={[s.filterSquare, filter !== 'all' && s.filterSquareActive]}
          onPress={() => setShowFilter(true)}
          activeOpacity={0.8}
        >
          <Text style={[s.filterSquareText, filter !== 'all' && s.filterSquareTextActive]}>≡</Text>
          {filter !== 'all' && <View style={s.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Balance summary chips */}
      {(totalOwedToYou > 0.01 || totalYouOwe > 0.01) && (
        <View style={s.balanceSummary}>
          {totalOwedToYou > 0.01 && (
            <View style={s.summaryChip}>
              <Text style={s.summaryLabel}>You're owed</Text>
              <Text style={s.summaryValue}>{formatCurrency(totalOwedToYou)}</Text>
            </View>
          )}
          {totalYouOwe > 0.01 && (
            <View style={[s.summaryChip, s.summaryChipRed]}>
              <Text style={[s.summaryLabel, { color: '#DC2626' }]}>You owe</Text>
              <Text style={[s.summaryValue, { color: '#DC2626' }]}>{formatCurrency(totalYouOwe)}</Text>
            </View>
          )}
        </View>
      )}

      {(requests as any[]).length > 0 && (
        <View style={s.requestsBanner}>
          <Text style={s.requestsLabel}>Pending requests ({(requests as any[]).length})</Text>
          {(requests as any[]).map((req: any) => (
            <View key={req.id} style={s.requestRow}>
              <View style={[s.avatar, { backgroundColor: req.from_user?.avatar_color ?? '#1B4332' }]}>
                <Text style={s.avatarText}>{avatarInitials(req.from_user?.name ?? 'U')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.reqName}>{req.from_user?.name}</Text>
                <Text style={s.reqEmail}>{req.from_user?.email}</Text>
              </View>
              <TouchableOpacity style={s.acceptBtn} onPress={() => acceptMutation.mutate(Number(req.id))}>
                <Text style={s.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {isLoading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          {[1, 2, 3, 4].map((i) => <SkeletonFriendRow key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.friendship_id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#1B4332" />}
          ListEmptyComponent={
            <EmptyState
              icon={search || filter !== 'all' ? '🔍' : '👥'}
              title={search || filter !== 'all' ? 'No results' : 'No friends yet'}
              subtitle={search ? 'Try a different name' : filter !== 'all' ? 'No friends match this filter' : 'Add friends to start splitting expenses'}
              actionLabel={!search && filter === 'all' ? 'Add a friend' : undefined}
              onAction={!search && filter === 'all' ? () => navigation.navigate('AddFriend') : undefined}
            />
          }
          renderItem={({ item: f }) => {
            const settled = Math.abs(f.balance) < 0.01;
            const key = String(f.friendship_id);
            const closeSwipe = () => swipeRefs.current[key]?.close();
            return (
              <Swipeable
                ref={(ref) => { swipeRefs.current[key] = ref; }}
                overshootRight={false}
                friction={2}
                renderRightActions={() => (
                  <SwipeActions
                    f={f}
                    onClose={closeSwipe}
                    onAdd={() => navigation.navigate('AddExpense', { userId: f.user.id, friendName: f.user.name })}
                    onSettle={() => navigation.navigate('SettleUp', { userId: f.user.id, friendName: f.user.name })}
                    onRemind={() => toast(`Reminder sent to ${f.user.name.split(' ')[0]}`, 'success')}
                    onRemove={() => handleRemove(f)}
                    c={colors}
                  />
                )}
              >
                <TouchableOpacity
                  style={s.friendRow}
                  onPress={() => navigation.navigate('FriendDetail', { userId: f.user.id })}
                  activeOpacity={0.8}
                >
                  <View style={[s.avatar, { backgroundColor: f.user.avatar_color }]}>
                    <Text style={s.avatarText}>{avatarInitials(f.user.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.friendName}>{f.user.name}</Text>
                    <Text style={s.friendEmail}>{f.user.email}</Text>
                  </View>
                  {settled ? (
                    <View style={s.settledChip}><Text style={s.settledText}>Settled</Text></View>
                  ) : f.balance > 0 ? (
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={s.owedText}>+{formatCurrency(f.balance)}</Text>
                      <View style={s.actionChipGreen}>
                        <Text style={s.actionChipGreenText}>Owes you</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={s.oweText}>-{formatCurrency(Math.abs(f.balance))}</Text>
                      <View style={s.actionChipRed}>
                        <Text style={s.actionChipRedText}>You owe</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </Swipeable>
            );
          }}
        />
      )}

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter Friends"
        options={FILTER_OPTIONS}
        selected={filter}
        onSelect={setFilter}
      />
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  topBarSide: { width: 38 },
  title: { fontSize: 22, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center', shadowColor: '#1B4332', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.24, shadowRadius: 10, elevation: 5 },
  iconBtnText: { color: '#FFFFFF', fontSize: 24, lineHeight: 26, fontWeight: '300' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginTop: 8, marginBottom: 12 },
  filterSquare: { width: 48, height: 46, borderRadius: 15, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.inputBorder, alignItems: 'center', justifyContent: 'center' },
  filterSquareActive: { backgroundColor: '#F0FDF4', borderColor: '#1B4332' },
  filterSquareText: { color: c.sectionLabel, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  filterSquareTextActive: { color: '#1B4332' },
  filterDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B35' },
  balanceSummary: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 10 },
  summaryChip: { flex: 1, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  summaryChipRed: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: '#16A34A', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '800', color: '#16A34A' },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderRadius: 15, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 12 },
  searchIcon: { fontSize: 18, marginRight: 8, color: c.textMuted },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: c.text },
  requestsBanner: { marginHorizontal: 20, backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  requestsLabel: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 10 },
  requestRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reqName: { fontSize: 14, fontWeight: '600', color: c.text },
  reqEmail: { fontSize: 12, color: c.textSub },
  acceptBtn: { backgroundColor: '#1B4332', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  acceptBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder, padding: 14, marginBottom: 10, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  friendName: { fontSize: 14, fontWeight: '700', color: c.text },
  friendEmail: { fontSize: 12, color: c.textSub, marginTop: 2 },
  settledChip: { backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  settledText: { fontSize: 11, fontWeight: '700', color: c.textSub },
  owedText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  oweText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  actionChipGreen: { backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#BBF7D0' },
  actionChipGreenText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  actionChipRed: { backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#FECACA' },
  actionChipRedText: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: c.textSub, textAlign: 'center', maxWidth: 260, marginBottom: 20 },
  emptyBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  });
}
