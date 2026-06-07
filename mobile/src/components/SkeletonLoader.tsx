import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const usePulse = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return opacity;
};

export const SkeletonCard: React.FC<{ height?: number; marginBottom?: number }> = ({
  height = 80,
  marginBottom = 10,
}) => {
  const opacity = usePulse();
  return (
    <Animated.View style={[s.card, { height, marginBottom, opacity }]} />
  );
};

export const SkeletonRow: React.FC<{ width?: number | string; height?: number; marginBottom?: number }> = ({
  width = '100%',
  height = 16,
  marginBottom = 8,
}) => {
  const opacity = usePulse();
  return (
    <Animated.View style={[s.row, { width: width as any, height, marginBottom, opacity }]} />
  );
};

export const SkeletonFriendRow: React.FC = () => {
  const opacity = usePulse();
  return (
    <Animated.View style={[s.friendRow, { opacity }]}>
      <View style={s.avatar} />
      <View style={s.textGroup}>
        <View style={[s.line, { width: '55%' }]} />
        <View style={[s.line, { width: '35%', marginTop: 6 }]} />
      </View>
      <View style={s.chip} />
    </Animated.View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#E7E5E4', borderRadius: 16, width: '100%',
  },
  row: {
    backgroundColor: '#E7E5E4', borderRadius: 8,
  },
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1,
    borderColor: '#E7E5E4', padding: 14, marginBottom: 8,
  },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E7E5E4' },
  textGroup: { flex: 1 },
  line: { height: 13, backgroundColor: '#E7E5E4', borderRadius: 6 },
  chip: { width: 52, height: 24, backgroundColor: '#E7E5E4', borderRadius: 20 },
});
