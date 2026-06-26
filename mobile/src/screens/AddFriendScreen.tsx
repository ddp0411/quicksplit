import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { friendsAPI, type UserMini } from '../services/api/friendsAPI';
import { useToastStore } from '../state/toastStore';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

function avatarInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

type TabType = 'email' | 'qr';

export const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();

  const { colors } = useTheme();
  const s = createStyles(colors);
  const [activeTab, setActiveTab] = useState<TabType>('email');
  const [query, setQuery] = useState(params?.scannedEmail ?? '');
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['user-search', query],
    queryFn: () => friendsAPI.searchUsers(query),
    enabled: query.trim().length >= 2,
  });

  const sendMutation = useMutation({
    mutationFn: (email: string) => friendsAPI.addFriend(email),
    onSuccess: (_, email) => {
      setSent((prev) => new Set([...prev, email]));
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast('Friend request sent!', 'success');
    },
    onError: () => toast('Could not send request', 'error'),
  });

  const requestCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCode = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setActiveTab('email');
    setQuery(data);
    toast(`Found: ${data}`, 'success');
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Add Friend</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab row */}
      <View style={s.tabRow}>
        {[{ id: 'email', label: '✉️ Email' }, { id: 'qr', label: '📷 Scan QR' }].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[s.tab, activeTab === t.id && s.tabActive]}
            onPress={() => { setActiveTab(t.id as TabType); setScanned(false); }}
          >
            <Text style={[s.tabLabel, activeTab === t.id && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Email tab */}
      {activeTab === 'email' && (
        <>
          <View style={s.searchWrap}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or email…"
              placeholderTextColor="#9CA3AF"
              autoFocus={!params?.scannedEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {isFetching && <ActivityIndicator size="small" color="#0F4B70" />}
          </View>

          {query.trim().length > 0 && query.trim().length < 2 && (
            <Text style={s.hint}>Type at least 2 characters to search</Text>
          )}

          <FlatList
            data={results as UserMini[]}
            keyExtractor={(item) => item.id}
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
        </>
      )}

      {/* QR Scan tab */}
      {activeTab === 'qr' && (
        <View style={{ flex: 1 }}>
          {hasPermission === null && (
            <View style={s.permBox}>
              <Text style={s.permText}>Camera needed to scan friend QR codes</Text>
              <TouchableOpacity style={s.permBtn} onPress={requestCamera}>
                <Text style={s.permBtnText}>Allow Camera</Text>
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
                <Text style={s.scanHint}>Scan a friend's QuickSplit QR code</Text>
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

function createStyles(c: C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: c.text },
  title: { fontSize: 17, fontWeight: '700', color: c.text },
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: c.pillBg, borderRadius: 14, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: c.card },
  tabLabel: { fontSize: 14, fontWeight: '600', color: c.textMuted },
  tabLabelActive: { color: '#0F4B70' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderRadius: 14, borderWidth: 1, borderColor: c.inputBorder, marginHorizontal: 20, paddingHorizontal: 12, marginBottom: 8 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: c.text },
  hint: { paddingHorizontal: 24, fontSize: 12, color: c.textMuted, marginBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 14, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  userName: { fontSize: 14, fontWeight: '700', color: c.text },
  userEmail: { fontSize: 12, color: c.textSub, marginTop: 2 },
  addBtn: { backgroundColor: '#0F4B70', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnSent: { backgroundColor: '#E8F3FA', borderWidth: 1, borderColor: '#C4DFEF' },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  addBtnTextSent: { color: '#16A34A' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 14, color: c.textMuted },
  permBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  permText: { fontSize: 15, color: c.sectionLabel, textAlign: 'center', marginBottom: 20 },
  permBtn: { backgroundColor: '#0F4B70', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  permBtnText: { color: '#FFFFFF', fontWeight: '700' },
  scanOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 240, height: 240, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 16, marginBottom: 20 },
  scanHint: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  rescanBtn: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  rescanText: { fontWeight: '700', color: '#0F4B70' },
  });
}
