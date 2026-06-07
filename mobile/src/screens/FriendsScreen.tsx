import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { friendsAPI, type Friend } from '../services/api/friendsAPI';
import { formatCurrency } from '../utils/upi';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: friends = [], isLoading, refetch } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: friendsAPI.getRequests,
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
    const q = search.toLowerCase();
    return (friends as Friend[]).filter(f =>
      f.user.name.toLowerCase().includes(q) || f.user.email.toLowerCase().includes(q)
    );
  }, [friends, search]);

  const handleRemove = (f: Friend) => {
    Alert.alert(
      'Remove friend',
      `Remove ${f.user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMutation.mutate(String(f.user.id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Friends</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddFriend')}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search friends…"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Pending requests */}
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
              <TouchableOpacity
                style={s.acceptBtn}
                onPress={() => acceptMutation.mutate(Number(req.id))}
              >
                <Text style={s.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.friendship_id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#1B4332" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>👥</Text>
            <Text style={s.emptyTitle}>{search ? 'No results' : 'No friends yet'}</Text>
            <Text style={s.emptySub}>{search ? 'Try a different name' : 'Add friends to start splitting expenses'}</Text>
            {!search && (
              <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('AddFriend')}>
                <Text style={s.emptyBtnText}>Add a friend</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item: f }) => {
          const settled = Math.abs(f.balance) < 0.01;
          return (
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
                <View style={s.settledChip}>
                  <Text style={s.settledText}>Settled</Text>
                </View>
              ) : f.balance > 0 ? (
                <View style={s.owedChip}>
                  <Text style={s.owedText}>{formatCurrency(f.balance)}</Text>
                </View>
              ) : (
                <View style={s.oweChip}>
                  <Text style={s.oweText}>-{formatCurrency(Math.abs(f.balance))}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', fontFamily: 'PlayfairDisplay_700Bold' },
  addBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', marginHorizontal: 20, paddingHorizontal: 12, marginBottom: 12 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
  requestsBanner: { marginHorizontal: 20, backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  requestsLabel: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 10 },
  requestRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reqName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reqEmail: { fontSize: 12, color: '#6B7280' },
  acceptBtn: { backgroundColor: '#1B4332', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  acceptBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E5E4', padding: 14, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  friendName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  friendEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  settledChip: { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  settledText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  owedChip: { backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  owedText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  oweChip: { backgroundColor: '#FEF2F2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  oweText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 260, marginBottom: 20 },
  emptyBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
