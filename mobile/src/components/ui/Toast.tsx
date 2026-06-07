import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const STYLES: Record<ToastType, { bg: string; icon: string; text: string; border: string }> = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', text: '#166534' },
  warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', text: '#92400e' },
  error:   { bg: '#fef2f2', border: '#fecaca', icon: '✕',  text: '#991b1b' },
  info:    { bg: '#ecfdf5', border: '#a7f3d0', icon: 'ℹ️', text: '#065f46' },
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const s = STYLES[toast.type];
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: s.bg, borderColor: s.border, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.icon}>{s.icon}</Text>
      <Text style={[styles.message, { color: s.text }]}>{toast.message}</Text>
      <Pressable onPress={() => onDismiss(toast.id)} style={styles.close}>
        <Text style={{ color: s.text, fontSize: 14, fontWeight: '700' }}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

export const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => (
  <View style={styles.container} pointerEvents="box-none">
    {toasts.map(t => (
      <Toast key={t.id} toast={t} onDismiss={onDismiss} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: { fontSize: 16 },
  message: { flex: 1, fontSize: 13, fontWeight: '600' },
  close: { padding: 4 },
});
