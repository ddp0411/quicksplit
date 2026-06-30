import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useUserStore } from '../state/userStore';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Row({ icon, label, onPress, c, last }: { icon: React.ReactNode; label: string; onPress: () => void; c: C; last?: boolean }) {
  const rs = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15, borderTopWidth: last ? 0 : StyleSheet.hairlineWidth, borderTopColor: c.cardBorder },
    rowLabel: { flex: 1, fontSize: 15, color: c.text, fontWeight: '500', fontFamily: 'Inter_500Medium' },
    rowArrow: { fontSize: 20, color: c.textMuted },
  });
  return (
    <TouchableOpacity style={rs.row} onPress={onPress} activeOpacity={0.7}>
      <View style={{ width: 22, alignItems: 'center' }}>{icon}</View>
      <Text style={rs.rowLabel}>{label}</Text>
      <Text style={rs.rowArrow}>›</Text>
    </TouchableOpacity>
  );
}

export const AccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useUserStore();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const stroke = colors.textSub;

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={s.profileHead}>
          <View style={s.avatarWrap}>
            <View style={[s.avatar, { backgroundColor: user?.avatar_color ?? colors.primary }]}>
              <Text style={s.avatarText}>{avatarInitials(user?.name ?? 'U')}</Text>
            </View>
            <View style={s.statusDot} />
          </View>
          <Text style={s.userName}>{user?.name ?? '—'}</Text>
          <Text style={s.userEmail}>{user?.email ?? user?.phone_number ?? '—'}</Text>
          <TouchableOpacity style={s.memberChip} onPress={() => navigation.navigate('ProUpgrade')} activeOpacity={0.85}>
            <Text style={s.memberChipText}>Free Member · Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Referral earnings card */}
        <LinearGradient colors={[colors.primarySoft, colors.card]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.referralCard}>
          <Text style={s.referralLabel}>REFER & EARN</Text>
          <Text style={s.referralAmount}>₹0.00</Text>
          <Text style={s.referralSub}>Invite friends to start earning rewards</Text>
          <TouchableOpacity style={s.referralBtn} onPress={() => navigation.navigate('Referral')} activeOpacity={0.85}>
            <Text style={s.referralBtnText}>Invite friends →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick tiles */}
        <View style={s.tileRow}>
          <TouchableOpacity style={s.tile} onPress={() => navigation.navigate('QRCode')} activeOpacity={0.85}>
            <View style={[s.tileIcon, { backgroundColor: colors.pillBg }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="4" width="6" height="6" rx="1" stroke={colors.primary} strokeWidth="1.8" />
                <Rect x="14" y="4" width="6" height="6" rx="1" stroke={colors.primary} strokeWidth="1.8" />
                <Rect x="4" y="14" width="6" height="6" rx="1" stroke={colors.primary} strokeWidth="1.8" />
                <Path d="M14 14 h3 v3 M20 14 v6 M14 20 h3" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={s.tileLabel}>My QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.tile} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.85}>
            <View style={[s.tileIcon, { backgroundColor: colors.tertiaryContainer }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="3.4" stroke={colors.tertiary} strokeWidth="1.8" />
                <Path d="M5.5 20 c0-3.6 2.9-6.2 6.5-6.2 s6.5 2.6 6.5 6.2" stroke={colors.tertiary} strokeWidth="1.8" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={s.tileLabel}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Upgrade card */}
        <TouchableOpacity onPress={() => navigation.navigate('ProUpgrade')} activeOpacity={0.9}>
          <LinearGradient colors={['#0093C4', '#00658E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.proBanner}>
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <Path d="M12 3 L13.7 10.3 L21 12 L13.7 13.7 L12 21 L10.3 13.7 L3 12 L10.3 10.3 Z" fill="#FFFFFF" />
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={s.proTitle}>Upgrade to Pro</Text>
              <Text style={s.proSub}>AI insights, unlimited groups & more</Text>
            </View>
            <View style={s.proBadge}><Text style={s.proBadgeText}>FREE →</Text></View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Preferences */}
        <Text style={s.sectionLabel}>PREFERENCES</Text>
        <View style={s.section}>
          <Row c={colors} label="Appearance" onPress={() => navigation.navigate('AppearanceSettings')}
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.8" /><Path d="M12 3 a9 9 0 0 0 0 18 z" fill={stroke} /></Svg>} />
          <Row c={colors} label="Notifications" onPress={() => navigation.navigate('NotificationSettings')}
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M6 9 a6 6 0 0 1 12 0 c0 5 2 6 2 6 H4 s2-1 2-6" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" /><Path d="M10 20 a2 2 0 0 0 4 0" stroke={stroke} strokeWidth="1.8" /></Svg>} />
          <Row c={colors} label="Security & Password" onPress={() => navigation.navigate('SecuritySettings')} last
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M12 3 l7 3 v5 c0 5-3.5 8-7 9 c-3.5-1-7-4-7-9 V6 z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" /></Svg>} />
        </View>

        {/* System & privacy */}
        <Text style={s.sectionLabel}>SYSTEM & PRIVACY</Text>
        <View style={s.section}>
          <Row c={colors} label="Refer a Friend" onPress={() => navigation.navigate('Referral')}
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Rect x="4" y="9" width="16" height="11" rx="2" stroke={stroke} strokeWidth="1.8" /><Path d="M4 12 h16 M12 9 v11 M12 9 c-2-3-6-2-6 1 M12 9 c2-3 6-2 6 1" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /></Svg>} />
          <Row c={colors} label="Import from Splitwise" onPress={() => navigation.navigate('ImportSplitwise')} last
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M12 4 v10 M8 11 l4 3 4-3 M5 19 h14" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>} />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOut} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>QuickSplit AI · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },

    profileHead: { alignItems: 'center', paddingVertical: 12 },
    avatarWrap: { marginBottom: 12 },
    avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    statusDot: { position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: c.primaryContainer, borderWidth: 3, borderColor: c.bg },
    userName: { fontSize: 24, fontWeight: '700', color: c.text, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
    userEmail: { fontSize: 14, color: c.textSub, marginTop: 3, fontFamily: 'Inter_400Regular' },
    memberChip: { backgroundColor: c.primaryContainer, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12 },
    memberChipText: { fontSize: 12, fontWeight: '700', color: c.onPrimaryContainer, fontFamily: 'Inter_700Bold' },

    referralCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: c.cardBorder, marginTop: 18 },
    referralLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: c.textSub, fontFamily: 'Inter_700Bold' },
    referralAmount: { fontSize: 32, fontWeight: '700', color: c.primary, fontFamily: 'Inter_700Bold', letterSpacing: -1, marginTop: 4 },
    referralSub: { fontSize: 13, color: c.textMuted, marginTop: 4, fontFamily: 'Inter_400Regular' },
    referralBtn: { alignSelf: 'flex-start', marginTop: 12, backgroundColor: c.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    referralBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', fontFamily: 'Inter_700Bold' },

    tileRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
    tile: { flex: 1, backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder, padding: 16, alignItems: 'flex-start', gap: 10 },
    tileIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    tileLabel: { fontSize: 14, fontWeight: '600', color: c.text, fontFamily: 'Inter_600SemiBold' },

    proBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 18, marginTop: 16 },
    proTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Inter_700Bold' },
    proSub: { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 2, fontFamily: 'Inter_400Regular' },
    proBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
    proBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', fontFamily: 'Inter_700Bold' },

    sectionLabel: { fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 0.8, marginTop: 22, marginBottom: 8, marginLeft: 4, fontFamily: 'Inter_700Bold' },
    section: { backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder, overflow: 'hidden' },

    signOut: { marginTop: 24, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: c.errorBg, backgroundColor: c.card },
    signOutText: { fontSize: 15, fontWeight: '700', color: c.errorText, fontFamily: 'Inter_700Bold' },
    version: { fontSize: 12, color: c.textMuted, textAlign: 'center', marginTop: 18, fontFamily: 'Inter_400Regular' },
  });
}
