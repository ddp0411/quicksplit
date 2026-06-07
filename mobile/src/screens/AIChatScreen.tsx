import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { aiAPI, type AIChatMessage } from '../services/api/aiAPI';

export const AIChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m your QuickSplit AI. Ask me anything about your expenses, balances, or how to split costs.' },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const mutation = useMutation({
    mutationFn: (msgs: AIChatMessage[]) => aiAPI.chat(msgs),
    onSuccess: (reply) => {
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || mutation.isPending) return;
    const newMessages: AIChatMessage[] = [...messages, { role: 'user', content: text }];
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
        <View>
          <Text style={s.title}>AI Assistant</Text>
          <Text style={s.sub}>Powered by Claude</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={s.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: msg }) => (
            <View style={[s.bubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
              {msg.role === 'assistant' && <Text style={s.aiLabel}>🤖</Text>}
              <Text style={[s.bubbleText, msg.role === 'user' ? s.userBubbleText : s.aiBubbleText]}>
                {msg.content}
              </Text>
            </View>
          )}
          ListFooterComponent={mutation.isPending ? (
            <View style={[s.bubble, s.aiBubble]}>
              <Text style={s.aiLabel}>🤖</Text>
              <ActivityIndicator size="small" color="#1B4332" />
            </View>
          ) : null}
        />

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything…"
            placeholderTextColor="#9CA3AF"
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || mutation.isPending) && { opacity: 0.4 }]}
            onPress={handleSend}
            disabled={!input.trim() || mutation.isPending}
          >
            <Text style={s.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E5E4' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#111827' },
  title: { fontSize: 17, fontWeight: '700', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  list: { padding: 16, paddingBottom: 8 },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiBubble: { alignSelf: 'flex-start' },
  aiLabel: { fontSize: 20, marginBottom: 2 },
  bubbleText: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, lineHeight: 20 },
  userBubbleText: { backgroundColor: '#1B4332', color: '#FFFFFF' },
  aiBubbleText: { backgroundColor: '#FFFFFF', color: '#111827', borderWidth: 1, borderColor: '#E7E5E4' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E7E5E4', backgroundColor: '#FFFFFF' },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#111827', maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
