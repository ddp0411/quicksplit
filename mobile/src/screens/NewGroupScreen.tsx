import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

interface Option {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  screen: string;
}

const OPTIONS: Option[] = [
  {
    key: 'manual',
    emoji: '✏️',
    title: 'Create manually',
    desc: 'Set a name, add members by email and pick a split method.',
    screen: 'CreateGroup',
  },
  {
    key: 'import',
    emoji: '📥',
    title: 'Import from Splitwise',
    desc: 'Upload a Splitwise CSV export — group and all its expenses come across.',
    screen: 'ImportGroup',
  },
];

export const NewGroupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>New Group</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.lead}>How would you like to start?</Text>

        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={s.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(opt.screen)}
          >
            <View style={s.iconTile}>
              <Text style={s.iconText}>{opt.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{opt.title}</Text>
              <Text style={s.cardDesc}>{opt.desc}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
    lead: { fontSize: 15, color: c.textSub, marginBottom: 20 },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder,
      padding: 18, marginBottom: 14,
    },
    iconTile: { width: 52, height: 52, borderRadius: 16, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
    iconText: { fontSize: 26 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 4, fontFamily: 'Inter_700Bold' },
    cardDesc: { fontSize: 13, color: c.textSub, lineHeight: 18 },
    chevron: { fontSize: 26, color: c.textMuted, fontWeight: '300' },
  });
}
