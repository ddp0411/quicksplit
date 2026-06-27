import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({ icon, title, subtitle, actionLabel, onAction }) => {
  const { colors: c } = useTheme();
  const s = createStyles(c);
  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <Text style={s.icon}>{icon}</Text>
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={s.btn} onPress={onAction}>
          <Text style={s.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
    container: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    iconWrap: {
      width: 80, height: 80, borderRadius: 24,
      backgroundColor: c.pillBg,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 1.5, borderColor: c.cardBorder,
    },
    icon: { fontSize: 36 },
    title: { fontSize: 18, fontWeight: '800', color: c.text, textAlign: 'center', marginBottom: 6, fontFamily: 'PlusJakartaSans_700Bold' },
    subtitle: { fontSize: 14, color: c.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20, maxWidth: 240 },
    btn: { backgroundColor: '#0466C8', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
    btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  });
}
