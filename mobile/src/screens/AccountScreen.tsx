import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../state/userStore';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Row({ emoji, label, onPress, danger }: { emoji: string; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.rowEmoji}>{emoji}</Text>
      <Text style={[s.rowLabel, danger && { color: '#DC2626' }]}>{label}</Text>
      {!danger && <Text style={s.rowArrow}>›</Text>}
    </TouchableOpacity>
  );
}

export const AccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={[s.avatar, { backgroundColor: user?.avatar_color ?? '#1B4332' }]}>
            <Text style={s.avatarText}>{avatarInitials(user?.name ?? 'U')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name ?? '—'}</Text>
            <Text style={s.userEmail}>{user?.email ?? '—'}</Text>
            {user?.upi_id ? <Text style={s.upiId}>UPI: {user.upi_id}</Text> : null}
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Pro banner */}
        <TouchableOpacity style={s.proBanner} onPress={() => navigation.navigate('ProUpgrade')} activeOpacity={0.85}>
          <Text style={s.proEmoji}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.proTitle}>Upgrade to Pro</Text>
            <Text style={s.proSub}>AI insights, unlimited groups & more</Text>
          </View>
          <View style={s.proBadge}><Text style={s.proBadgeText}>FREE →</Text></View>
        </TouchableOpacity>

        {/* Settings section */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Profile</Text>
          <Row emoji="🪪" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <Row emoji="📱" label="My QR Code" onPress={() => navigation.navigate('QRCode')} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Preferences</Text>
          <Row emoji="🎨" label="Appearance" onPress={() => navigation.navigate('AppearanceSettings')} />
          <Row emoji="🔔" label="Notifications" onPress={() => navigation.navigate('NotificationSettings')} />
          <Row emoji="🔒" label="Security" onPress={() => navigation.navigate('SecuritySettings')} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>More</Text>
          <Row emoji="🎁" label="Refer a Friend" onPress={() => navigation.navigate('Referral')} />
          <Row emoji="📥" label="Import from Splitwise" onPress={() => navigation.navigate('ImportSplitwise')} />
        </View>

        <View style={s.section}>
          <Row emoji="🚪" label="Sign Out" onPress={handleLogout} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', fontFamily: 'PlayfairDisplay_700Bold' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E7E5E4', padding: 16, marginBottom: 12, marginTop: 8 },
  avatar: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  userName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  userEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  upiId: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  editBtn: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  proBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1B4332', borderRadius: 16, padding: 16, marginBottom: 16 },
  proEmoji: { fontSize: 24 },
  proTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  proSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  proBadge: { backgroundColor: '#FF6B35', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  proBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E5E4', marginBottom: 12, overflow: 'hidden' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F3F4F6' },
  rowEmoji: { fontSize: 18, width: 28 },
  rowLabel: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  rowArrow: { fontSize: 20, color: '#D1D5DB' },
});
