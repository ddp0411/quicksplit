import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { friendsAPI, type UserMini } from '../services/api/friendsAPI';
import { useToastStore } from '../state/toastStore';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();
  const [query, setQuery] = useState('');
  const [sent, setSent] = useState<Set<string>>(new Set());

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['user-search', query],
    queryFn: () => friendsAPI.searchUsers(query),
    enabled: query.trim().length >= 2,
  });

  const sendMutation = useMutation({
    mutationFn: (email: string) => friendsAPI.addFriend(email),
    onSuccess: (_, email) => {
      setSent(prev => new Set([...prev, email]));
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast('Friend request sent!', 'success');
    },
    onError: () => toast('Could not send request', 'error'),
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Add Friend</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or email…"
          placeholderTextColor="#9CA3AF"
          autoFocus
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {isFetching && <ActivityIndicator size="small" color="#1B4332" />}
      </View>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <Text style={s.hint}>Type at least 2 characters to search</Text>
      )}

      <FlatList
        data={results as UserMini[]}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          query.trim().length >= 2 && !isFetching ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No users found for "{query}"</Text>
            </View>
          ) : null
        }
        renderItem={({ item: u }) => {
          const alreadySent = sent.has(u.email);
          return (
            <View style={s.userRow}>
              <View style={[s.avatar, { backgroundColor: u.avatar_color }]}>
                <Text style={s.avatarText}>{avatarInitials(u.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{u.name}</Text>
                <Text style={s.userEmail}>{u.email}</Text>
              </View>
              <TouchableOpacity
                style={[s.addBtn, alreadySent && s.addBtnSent]}
                disabled={alreadySent || sendMutation.isPending}
                onPress={() => sendMutation.mutate(u.email)}
              >
                <Text style={[s.addBtnText, alreadySent && s.addBtnTextSent]}>
                  {alreadySent ? 'Sent ✓' : '+ Add'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#111827' },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7E5E4', marginHorizontal: 20, paddingHorizontal: 12, marginBottom: 8 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
  hint: { paddingHorizontal: 24, fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E5E4', padding: 14, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  userName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  userEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  addBtn: { backgroundColor: '#1B4332', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnSent: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  addBtnTextSent: { color: '#16A34A' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
