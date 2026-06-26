import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { aiAPI, type AIChatMessage } from '../services/api/aiAPI';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];

const SUGGESTION_CHIPS = [
  'What do I owe?',
  'Summarize this month',
  'Who owes me most?',
  'Split ₹1200 with 3 people',
];

function TypingIndicator() {
  const { colors } = useTheme();
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 200),
        ])
      ).start();
    });
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.cardBorder }}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted }, { transform: [{ translateY: dot }] }]} />
      ))}
    </View>
  );
}

export const AIChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m your QuickSplit AI. Ask me anything about your expenses, balances, or how to split costs.' },
  ]);
  const [input, setInput] = useState('');
  const [aiStatus, setAiStatus] = useState<'idle' | 'online' | 'unavailable'>('idle');
  const listRef = useRef<FlatList>(null);

  const mutation = useMutation({
    mutationFn: (msgs: AIChatMessage[]) => aiAPI.chat(msgs),
    onSuccess: (reply) => {
      setAiStatus('online');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: () => {
      setAiStatus('unavailable');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble right now. Please try again in a moment.' }]);
    },
  });

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || mutation.isPending) return;
    const newMessages: AIChatMessage[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    mutation.mutate(newMessages);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.title}>AI Assistant</Text>
          <View style={s.statusRow}>
            <View style={[s.statusDot, aiStatus === 'online' ? s.statusOnline : aiStatus === 'unavailable' ? s.statusUnavailable : s.statusIdle]} />
            <Text style={s.statusText}>
              {aiStatus === 'online' ? 'Online' : aiStatus === 'unavailable' ? 'Unavailable' : 'Powered by Claude'}
            </Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={s.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: msg }) => (
            <View style={[s.bubbleWrap, msg.role === 'user' ? s.userWrap : s.aiWrap]}>
              {msg.role === 'assistant' && (
                <View style={s.aiAvatar}><Text style={{ fontSize: 14 }}>🤖</Text></View>
              )}
              <Text style={[s.bubbleText, msg.role === 'user' ? s.userBubbleText : s.aiBubbleText]}>
                {msg.content}
              </Text>
            </View>
          )}
          ListFooterComponent={mutation.isPending ? (
            <View style={[s.bubbleWrap, s.aiWrap]}>
              <View style={s.aiAvatar}><Text style={{ fontSize: 14 }}>🤖</Text></View>
              <TypingIndicator />
            </View>
          ) : null}
        />

        {/* Suggestion chips */}
        {messages.length <= 1 && !mutation.isPending && (
          <View style={s.chipsRow}>
            {SUGGESTION_CHIPS.map((chip) => (
              <TouchableOpacity key={chip} style={s.chip} onPress={() => handleSend(chip)}>
                <Text style={s.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything…"
            placeholderTextColor="#9CA3AF"
            multiline
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || mutation.isPending) && { opacity: 0.4 }]}
            onPress={() => handleSend()}
            disabled={!input.trim() || mutation.isPending}
          >
            <Text style={s.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.cardBorder },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.pillBg, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: c.text },
  headerCenter: { alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: c.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusOnline: { backgroundColor: '#16A34A' },
  statusUnavailable: { backgroundColor: '#9CA3AF' },
  statusIdle: { backgroundColor: '#D1D5DB' },
  statusText: { fontSize: 11, color: c.textMuted },
  list: { padding: 16, paddingBottom: 8 },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12, maxWidth: '85%' },
  userWrap: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiWrap: { alignSelf: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F3FA', alignItems: 'center', justifyContent: 'center' },
  bubbleText: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, lineHeight: 20 },
  userBubbleText: { backgroundColor: '#0F4B70', color: '#FFFFFF' },
  aiBubbleText: { backgroundColor: c.card, color: c.text, borderWidth: 1, borderColor: c.cardBorder },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { backgroundColor: '#E8F3FA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#C4DFEF' },
  chipText: { fontSize: 13, color: '#0F4B70', fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.cardBorder, backgroundColor: c.card },
  input: { flex: 1, backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: c.text, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F4B70', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  });
}
