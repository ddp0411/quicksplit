import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Generic stub for screens not yet implemented */
export function StubScreen({ title }: { title: string }) {
  const nav = useNavigation<any>();
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.emoji}>🚧</Text>
        <Text style={s.title}>{title}</Text>
        <Text style={s.sub}>This screen is coming soon</Text>
        <TouchableOpacity style={s.btn} onPress={() => nav.goBack()}>
          <Text style={s.btnText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  btn: { backgroundColor: '#1B4332', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#FFFFFF', fontWeight: '700' },
});
